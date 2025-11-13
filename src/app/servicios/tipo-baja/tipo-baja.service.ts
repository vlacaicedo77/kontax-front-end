import { Injectable } from '@angular/core';
import { TipoBaja } from '../../modelos/tipo-baja.modelo';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoBajaService {

  private tiposBajas: TipoBaja[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Obtiene los tipos de bajas
  obtenerTiposBajas(): Observable<any> {
    if (this.tiposBajas.length > 0) {
      return new Observable( observador => {
        observador.next(this.tiposBajas);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/tiposBajas';
    return this.http.get(url).pipe(
      map( (respuesta: any) => {
        this.tiposBajas = respuesta.resultado;
        return respuesta.resultado;
      })
    );

  }

}
