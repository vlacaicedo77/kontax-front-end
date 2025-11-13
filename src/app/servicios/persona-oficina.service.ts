import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { PersonaOficina } from '../modelos/persona-oficina.modelo';

@Injectable({
  providedIn: 'root'
})
export class PersonaOficinaService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene el personal de una oficina de la operadora de vacunación.
   * @param parametros 
   */
  obtenerPersonalDeOficina( parametros: any ){
    const url = `${environment.URL_SERVICIOS}personal_oficinas`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Asigna a una persona a una oficina de la operadora de vacunación.
   * @param personaOficina 
   */
  agregarPersonalAOficina( personaOficina: PersonaOficina ) {
    const url = `${environment.URL_SERVICIOS}personal_oficinas`;
    return this.http.post(url, personaOficina)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Quita a una persona de una oficina de la operadora de vacunación.
   * @param identificador 
   */
  quitarPersonaDeOficina(identificador: number) {
    const url = `${environment.URL_SERVICIOS}personal_oficinas/${identificador}`;
    return this.http.delete(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }


}
