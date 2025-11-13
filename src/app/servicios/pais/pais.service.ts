import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../response';

// Importamos la URL del request para los servicios
import { environment } from 'src/environments/environment';
import { Pais } from '../../modelos/pais.modelo';

@Injectable({
  providedIn: 'root'
})
export class PaisService {

  public response;

  private paises: Pais[] = [];

  constructor(public http: HttpClient) { }

  public getPaises(): Observable<any> {
    if (this.paises.length > 0) {
      return new Observable( observador => {
        observador.next(this.paises);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/paises';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        this.paises = respuesta.resultado;
        return respuesta.resultado;
      })
    );
  }

  // Método que obtiene el catálogo de estados de solicitudes
  obtenerPaisesParametros(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.paises.length > 0) {
      return new Observable(observador => {
        observador.next(this.paises);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/paises`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.paises = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }
}

