import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterrogantesService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene las interrogantes para el CUV
   */
  obtenerCatalogoInterrogantes(){
    const url = `${environment.URL_SERVICIOS}catalogos/interrogantes`;
    return this.http.get(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene las interrogantes asignadas a una fase de vacunación
   * @param parametros 
   */
  obtenerInterrotantesDeFaseVacunacion(parametros: any){
    const url = `${environment.URL_SERVICIOS}interrogantes_fases_vacunaciones`;
    return this.http.get(url,{params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
