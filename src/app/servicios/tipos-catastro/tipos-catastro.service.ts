import { Injectable } from '@angular/core';
import { TipoCatastro } from '../../modelos/tipo-catastro.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposCatastroService {

  private tipoCatastro: TipoCatastro[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene el catálogo de tipos de catastro
  obtenerTiposCatastro(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.tipoCatastro.length > 0) {
      return new Observable(observador => {
        observador.next(this.tipoCatastro);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/tiposCatastro`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.tipoCatastro = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}
