import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BovinoVacunadoService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Permite obtener los bovinos vacunados para ser usados en movilización.
   * @param parametros 
   */
  obtenerBovinosVacunados(parametros: any){
    const url = `${environment.URL_SERVICIOS}bovinos_vacunados`;
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Permite obtener los bovinos vacunados para ser usados en movilización.
   * @param parametros 
   */
  obtenerBovinosVacunadosTotal(parametros: any){
    const url = `${environment.URL_SERVICIOS}wsm_cantidad_bovinos_disponibles`;
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Permite obtener cantidad de bovinos disponibles para ser usados en movilización.
   * @param parametros 
   */
   obtenerBovinosVacunadosWs(parametros: any){
    const url = `${environment.URL_SERVICIOS}wsm_bovinos_vacunados`;
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Permite obtener cantidad de bovinos disponibles para ser usados en movilización.
   * @param parametros 
   */
   obtenerBovinosVacunadosWsDominio(parametros: any){
    const url = `${environment.URL_SERVICIOS}wsm_bovinos_vacunados_dominio`;
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado; 
      })
    );
  }

}
