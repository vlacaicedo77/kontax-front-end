import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertaSesionService } from './alerta-sesion.service';

@Injectable({
  providedIn: 'root'
})
export class SesionVerificacionService {

  private intervaloVerificacion: any;
  private estaVerificando = false;
  private ultimaVerificacion: Date | null = null;
  private verificacionDetenida = false;
  private readonly INTERVALO_VERIFICACION = 5 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
    private alertaSesionService: AlertaSesionService
  ) { }

  /**
 * Inicia la verificación periódica de la sesión
 */
  iniciarVerificacionPeriodica(): void {
    this.detenerVerificacionPeriodica();
    this.verificacionDetenida = false;

    if (!this.sesionIniciada()) {
      return;
    }

    console.log(`Iniciando verificación periódica cada ${this.INTERVALO_VERIFICACION / 60000} minutos`);

    // Primera verificación inmediata
    this.verificarSesion();
    this.intervaloVerificacion = this.ngZone.runOutsideAngular(() => {
      return setInterval(() => {
        if (this.verificacionDetenida) {
          this.detenerVerificacionPeriodica();
          return;
        }
        this.ngZone.run(() => {
          this.verificarSesion();
        });
      }, this.INTERVALO_VERIFICACION);
    });

    this.configurarEventosVisibilidad();
  }

  /**
   * Elimina la sesión cuando se detecta expiración
   */
  private eliminarSesionPorExpiracion(tipo: 'sesionCerrada' | 'tokenExpirado'): void {
    this.forzarDetencion();

    const idUsuario = localStorage.getItem('idUsuario');
    const token = localStorage.getItem('token');

    // Intentar logout en servidor
    if (idUsuario && token) {
      const url = environment.URL_SERVICIOS + 'tokens/' + idUsuario;

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

    // Limpiar localmente
    this.limpiarSesionLocal();
    // Ejecutar dentro de NgZone para la navegación
    this.ngZone.run(() => {
      this.mostrarAlertaAutomatica(tipo);
    });
  }

  detenerVerificacionPeriodica(): void {
    if (this.intervaloVerificacion) {
      clearInterval(this.intervaloVerificacion);
      this.intervaloVerificacion = null;
    }

    this.removerEventosVisibilidad();
  }

  private configurarEventosVisibilidad(): void {
    document.addEventListener('visibilitychange', this.verificarAlVolverVisible.bind(this));
    window.addEventListener('focus', this.verificarAlVolverVisible.bind(this));
  }

  private removerEventosVisibilidad(): void {
    document.removeEventListener('visibilitychange', this.verificarAlVolverVisible.bind(this));
    window.removeEventListener('focus', this.verificarAlVolverVisible.bind(this));
  }

  private verificarAlVolverVisible(): void {
    if (!document.hidden && this.sesionIniciada()) {
      this.verificarSesion();
    }
  }

  /**
   * Verifica si la sesión sigue activa en el servidor
   */
  public verificarSesion(): void {
    if (this.estaVerificando || this.verificacionDetenida) {
      return;
    }

    if (!this.sesionIniciada()) {
      this.detenerVerificacionPeriodica();
      return;
    }

    // Verificar token local primero
    const expiracion = localStorage.getItem('expiracion');
    if (expiracion) {
      try {
        const expiraEn = JSON.parse(expiracion);
        const ahora = new Date().getTime();
        if (ahora > expiraEn) {
          this.detenerVerificacionPeriodica();
          this.eliminarSesionPorExpiracion('tokenExpirado');
          return;
        }
      } catch (e) {
        // Ignorar error de parsing
      }
    }

    const ahora = new Date();
    if (this.ultimaVerificacion &&
      (ahora.getTime() - this.ultimaVerificacion.getTime()) < 30000) {
      return;
    }

    this.estaVerificando = true;
    const url = environment.URL_SERVICIOS + 'ping';

    this.http.get(url, { observe: 'response' }).subscribe({
      next: (response) => {
        this.estaVerificando = false;
        this.ultimaVerificacion = new Date();
      },
      error: (error) => {
        this.estaVerificando = false;
        this.ultimaVerificacion = new Date();

        if (error.status === 401) {
          const mensaje = error.error?.mensaje || error.message || '';

          if (this.esErrorSesionCerrada(mensaje)) {
            this.eliminarSesionPorExpiracion('sesionCerrada');
          } else if (this.esErrorTokenExpirado(mensaje)) {
            this.eliminarSesionPorExpiracion('tokenExpirado');
          }
        }
      }
    });
  }

  /**
 * Muestra alerta informativa con mensajes originales
 */
  private mostrarAlertaAutomatica(tipo: 'sesionCerrada' | 'tokenExpirado'): void {
    const alertaCallback = () => {
      this.ngZone.run(() => {
        this.router.navigate(['/home']);
      });
    };

    if (tipo === 'sesionCerrada') {
      this.alertaSesionService.mostrarAlertaSesion(
        '¡Hey, cuidado!',
        'Hemos detectado un inicio de sesión desde otro dispositivo. Por ello, tu sesión actual ha finalizado.',
        'sesionCerrada',
        alertaCallback
      );
    } else {
      this.alertaSesionService.mostrarAlertaSesion(
        '¡Hey, advertencia!',
        'Por inactividad, tu sesión ha finalizado, inicia sesión nuevamente para continuar.',
        'tokenExpirado',
        alertaCallback
      );
    }
  }

  /**
   * Verifica si hay sesión iniciada
   */
  private sesionIniciada(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token.length > 5;
  }

  /**
   * Limpia la sesión local
   */
  private limpiarSesionLocal(): void {
    localStorage.removeItem('numeroIdentificacion');
    localStorage.removeItem('token');
    localStorage.removeItem('expiracion');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('menu');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('idSesion');
    localStorage.removeItem('sesionActivaAnterior');
  }

  private esErrorSesionCerrada(mensaje: string): boolean {
    const mensajesSesionCerrada = [
      'Sesión cerrada desde otro dispositivo',
      'Sesión no encontrada',
      'Token no contiene información de sesión'
    ];

    return mensajesSesionCerrada.some(msg =>
      mensaje.toLowerCase().includes(msg.toLowerCase())
    );
  }

  private esErrorTokenExpirado(mensaje: string): boolean {
    const mensajesTokenExpirado = [
      'JWT Token Expirado',
      'Token expirado'
    ];

    return mensajesTokenExpirado.some(msg =>
      mensaje.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * Verifica si el servicio está activo
   */
  public estaActivo(): boolean {
    return this.intervaloVerificacion !== null;
  }

  /**
   * Método público para forzar detención desde otros servicios
   */
  forzarDetencion(): void {
    this.verificacionDetenida = true;
    this.detenerVerificacionPeriodica();
    this.estaVerificando = false;
  }
}