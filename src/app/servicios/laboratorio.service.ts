import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene los laboratorios en base a parámetros
   * @param parametros 
   */
  obtenerLaboratorios(parametros: any){
    const url = `${environment.URL_SERVICIOS}laboratorios`;
    return this.http.get(url,{params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
