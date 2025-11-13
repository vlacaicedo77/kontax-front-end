import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoPeriodoValidezService {

  constructor(private http: HttpClient) { }

  // Método que obtiene los tipos de periodos de validez
  obtenerTiposPeriodosValidez(){
    const url = environment.URL_SERVICIOS + 'catalogos/tiposPeriodosValidez';
    return this.http.get(url)
    .pipe(
      map( (respuesta: any)  => respuesta.resultado )
    );
  }

}
