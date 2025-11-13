import { Injectable } from '@angular/core';
import { HttpRequest,HttpHandler,HttpInterceptor, HttpEvent,
HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';

@Injectable()
export class InterceptorAutenticacion implements HttpInterceptor {
    constructor(
    private enrutador: Router
    ){}
    
    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem("token");
        //console.log ("Token obtenida:" + token);
        //Validar que envíe el token solamente al servidor de la aplicación.
        if (token/* && req.url.search(URL_SERVIDOR)>=0*/) {
            const cloned = req.clone({
            headers: req.headers.set("Authorization","Bearer " + token),
            //url: req.url.replace("http://", "https://")
            });
            return next.handle(cloned).pipe(
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) 
                    {
                        if(event.status == 204)
                        {
                            //console.log('Error: Recurso no encontrado en el servidor');
                            Swal.fire('Error', 'No se ha podido encontrar en el servidor el recurso solicitado.' , 'error');
                        }
                        else
                        {
                            if(req.responseType == 'json')
                            {
                                if (event.body.hasOwnProperty('estado') &&  (event.body.hasOwnProperty('resultado') || event.body.hasOwnProperty('mensaje')) ) 
                                {
                                    return event;
                                }
                                else
                                {
                                    console.log('Error: La respuesta no tiene el formato adecuado');
                                    Swal.fire('Error', '¡Upsss! Ha ocurrido un error inesperado' , 'error');
                                }
                            }
                            else
                            {
                                return event;
                            }
                        }
                    }
                    else
                    {
                        return event;
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    Swal.fire('Error', `¡Upsss! Ha ocurrido un error inesperado <br/> ${error.error?.mensaje}` , 'error');
                    //console.log(error.error.text); // Descomentar solo para debug
                    console.log('Error: ' + error.message);
                    //Error de la JWT
                    if(error.status == 403)
                    {
                        console.log('Error: Error 403, enviado cuando el Token JWT no es válido o está expirado.');
                        Swal.fire('Aviso', 'La sesión ha expirado o no es válida, por favor vuelva a autenticarse al sistema.' , 'error');
                        this.enrutador.navigate(['/login']);
                    }
                    return [];
                })
                );
        }
        else {
            return next.handle(req).pipe(
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse)
                    {
                        if ( event.body.hasOwnProperty('estado') && 
                        (event.body.hasOwnProperty('resultado') || event.body.hasOwnProperty('mensaje')) ) 
                        {
                            return event;
                        }
                        else
                        {
                            console.log('Error: La respuesta no tiene el formato adecuado');
                            Swal.fire('Error', '¡Upsss! Ha ocurrido un error inesperado' , 'error');
                        }
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    Swal.fire('Error', '¡Upsss! Ha ocurrido un error inesperado' , 'error');
                    //console.log(error.error.text); // Descomentar solo para debug
                    console.log('Error: ' + error.message);
                    return [];
                })
                );
        }
    }
}