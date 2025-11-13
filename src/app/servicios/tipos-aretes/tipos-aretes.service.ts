import { Injectable } from '@angular/core';
import { TipoArete } from '../../modelos/tipo-arete.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposAretesService {

  private tipoArete: TipoArete[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene el catálogo de tipos de aretes
  obtenerTiposAretes(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.tipoArete.length > 0) {
      return new Observable(observador => {
        observador.next(this.tipoArete);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/tiposAretes`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.tipoArete = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}
