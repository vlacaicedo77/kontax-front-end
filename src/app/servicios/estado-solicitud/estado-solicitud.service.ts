import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EstadoSolicitud } from '../../modelos/estado-solicitud.modelo';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoSolicitudService {

  private estadoSolicitud: EstadoSolicitud[] = [];

  constructor(public http: HttpClient) { }

  public getEstadosSolicitud() {
    const url = environment.URL_SERVICIOS + 'catalogos/estadosSolicitudes';
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta;
      })
    );
  }

  // Método que obtiene el catálogo de estados de solicitudes
  obtenerEstadosSolicitudes(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.estadoSolicitud.length > 0) {
      return new Observable(observador => {
        observador.next(this.estadoSolicitud);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/estadosSolicitudes`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.estadoSolicitud = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}

