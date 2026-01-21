import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { showWarning, showError } from '../../config/alertas';
// Servicios
import { AutenticacionService } from './autenticacion.service';
import { SesionVerificacionService } from './sesion-verificacion.service';
import { AlertaSesionService } from './alerta-sesion.service';

@Injectable()
export class InterceptorAutenticacion implements HttpInterceptor {

    constructor(
        private enrutador: Router,
        private autenticacionService: AutenticacionService,
        private sesionVerificacionService: SesionVerificacionService,
        private alertaSesionService: AlertaSesionService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.autenticacionService.obtenerToken();

        if (token) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + token),
            });

            return next.handle(cloned).pipe(
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {

                        const nuevoToken = event.headers.get('X-New-Access-Token');
                        if (nuevoToken) {
                            this.autenticacionService.actualizarToken(nuevoToken);
                        }

                        if (event.status == 204) {
                            showError('Error', 'No se ha podido encontrar en el servidor el recurso solicitado.');
                        } else {
                            if (req.responseType == 'json') {
                                if (event.body.hasOwnProperty('estado') &&
                                    (event.body.hasOwnProperty('resultado') || event.body.hasOwnProperty('mensaje'))) {
                                    return event;
                                } else {
                                    showError('Error', '¡Upsss! Ha ocurrido un error inesperado');
                                }
                            } else {
                                return event;
                            }
                        }
                    }
                    return event;
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        return this.manejarError401(error, req);
                    } else if (error.status === 403) {
                        return this.manejarError403(error);
                    } else {
                        return this.manejarErrorGeneral(error);
                    }
                })
            );
        } else {
            return next.handle(req).pipe(
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        // Para login exitoso
                        const nuevoToken = event.headers.get('X-New-Access-Token');
                        if (nuevoToken) {
                            this.autenticacionService.actualizarToken(nuevoToken);
                        }

                        if (event.body.hasOwnProperty('estado') &&
                            (event.body.hasOwnProperty('resultado') || event.body.hasOwnProperty('mensaje'))) {
                            return event;
                        } else {
                            showError('Error', '¡Upsss! Ha ocurrido un error inesperado');
                        }
                    }
                    return event;
                }),
                catchError((error: HttpErrorResponse) => {
                    return this.manejarErrorGeneral(error);
                })
            );
        }
    }

    /**
    * Maneja errores 401 - No autorizado
    */
    private manejarError401(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
        const mensajeError = this.extraerMensajeError(error);

        // Para logout, no mostrar alerta
        const esLogout = req.method === 'DELETE' && req.url.includes('tokens/');

        if (esLogout) {
            this.autenticacionService.limpiarSesion();
            return throwError(this.crearErrorPersonalizado(error, mensajeError));
        }

        // CASO ESPECIAL: Error de login (petición a tokens)
        if (req.url.includes('tokens')) {
            return throwError(this.crearErrorPersonalizado(error, mensajeError));
        }

        // Para otros endpoints 401, verificar tipo de error
        if (this.esErrorSesionCerrada(mensajeError)) {
            this.manejarSesionCerrada();
            return throwError(this.crearErrorPersonalizado(error, mensajeError));
        }
        else if (this.esErrorTokenExpirado(mensajeError)) {
            this.manejarTokenExpirado();
            return throwError(this.crearErrorPersonalizado(error, mensajeError));
        }
        else {
            return throwError(this.crearErrorPersonalizado(error, mensajeError));
        }
    }

    /**
     * Maneja sesión cerrada desde otro dispositivo
     */
    private manejarSesionCerrada(): void {
        // Si ya hay una alerta activa, no hacer nada
        if (this.alertaSesionService.tieneAlertaActiva()) {
            return;
        }

        // Mostrar alerta a través del servicio (evita duplicados)
        this.alertaSesionService.mostrarAlertaSesion(
            '¡Hey, cuidado!',
            'Hemos detectado un inicio de sesión desde otro dispositivo. Por ello, tu sesión actual ha finalizado.',
            'sesionCerrada',
            () => {
                this.eliminarSesionAutomaticamente();
            }
        );
    }

    /**
 * Maneja token expirado - CON LÓGICA MEJORADA
 */
    private manejarTokenExpirado(): void {
        // Verificar si el token realmente expiró o si fue renovado
        const tokenActual = localStorage.getItem('token');

        // Si ya hay una alerta activa, no hacer nada
        if (this.alertaSesionService.tieneAlertaActiva()) {
            return;
        }

        // Si no se pudo refrescar, mostrar alerta
        this.alertaSesionService.mostrarAlertaSesion(
            '¡Hey, advertencia!',
            'Por inactividad, tu sesión ha finalizado, inicia sesión nuevamente para continuar.',
            'tokenExpirado',
            () => {
                this.eliminarSesionAutomaticamente();
            }
        );
    }

    /**
     * Elimina la sesión automáticamente
     */
    private eliminarSesionAutomaticamente(): void {
        // 1. Detener verificación periódica
        this.sesionVerificacionService.forzarDetencion();
        // 2. Intentar logout en servidor (no bloqueante)
        this.intentarLogoutEnServidor();
        // 3. Limpiar sesión local inmediatamente
        this.autenticacionService.limpiarSesion();
        // 4. Redirigir a home
        this.enrutador.navigate(['/home']);
    }

    /**
     * Intenta hacer logout en el servidor (no bloqueante)
     */
    private intentarLogoutEnServidor(): void {
        const idUsuario = localStorage.getItem('idUsuario');
        const token = localStorage.getItem('token');

        if (!idUsuario || !token) {
            return;
        }

        const url = `${environment.URL_SERVICIOS}tokens/${idUsuario}`;

        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        }).catch(() => {
            // Ignorar errores
        });
    }

    /**
     * Maneja errores 403 - Prohibido
     */
    private manejarError403(error: HttpErrorResponse): Observable<never> {
        const mensajeError = this.extraerMensajeError(error);

        showWarning(
            '¡Hey, advertencia!',
            'La sesión ha expirado o no es válida, por favor vuelve a autenticarte.');

        this.autenticacionService.limpiarSesion();
        this.enrutador.navigate(['/home']);

        return throwError(this.crearErrorPersonalizado(error, mensajeError));
    }

    /**
     * Maneja errores generales
     */
    private manejarErrorGeneral(error: HttpErrorResponse): Observable<never> {
        const mensaje = this.extraerMensajeError(error);

        if (error.status !== 401 && error.status !== 403) {
            showError('Error', mensaje);
        }

        return throwError(this.crearErrorPersonalizado(error, mensaje));
    }

    /**
     * Extrae el mensaje de error del response
     */
    private extraerMensajeError(error: HttpErrorResponse): string {
        if (error.error && error.error.mensaje) {
            return error.error.mensaje;
        }

        if (error.error && typeof error.error === 'string') {
            try {
                const parsed = JSON.parse(error.error);
                if (parsed.mensaje) {
                    return parsed.mensaje;
                }
            } catch (e) {
                return error.error;
            }
        }

        if (error.message) {
            return error.message;
        }

        return '¡Upsss! Ha ocurrido un error inesperado';
    }

    /**
     * Crea un objeto de error personalizado
     */
    private crearErrorPersonalizado(error: HttpErrorResponse, mensaje: string): any {
        return {
            status: error.status,
            mensaje: mensaje,
            error: error.error,
            url: error.url,
            name: error.name,
            message: error.message,
            headers: error.headers,
            statusText: error.statusText,
            ok: error.ok,
            type: error.type
        };
    }

    /**
     * Verifica si el mensaje de error indica que la sesión fue cerrada desde otro dispositivo
     */
    private esErrorSesionCerrada(mensaje: string): boolean {
        return mensaje.includes('Sesión cerrada desde otro dispositivo') ||
            mensaje.includes('Sesión no encontrada') ||
            mensaje.includes('Token no contiene información de sesión');
    }

    /**
     * Verifica si el mensaje indica token expirado
     * EXCLUYENDO aquellos casos donde la sesión aún es válida
     */
    private esErrorTokenExpirado(mensaje: string): boolean {
        return mensaje.includes('JWT Token Expirado') &&
            !mensaje.includes('Sesión cerrada por inactividad');
    }
}