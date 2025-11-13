import { Injectable } from '@angular/core';
import { PasoSolicitudArete } from '../../modelos/paso-solicitud-arete.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PasosSolicitudesAretesService {

  private pasoSolicitudArete: PasoSolicitudArete[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene el catálogo de pasos de las solicitudes
  obtenerFasesSolicitudes(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.pasoSolicitudArete.length > 0) {
      return new Observable(observador => {
        observador.next(this.pasoSolicitudArete);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/pasosSolicitudesAretes`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.pasoSolicitudArete = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}
