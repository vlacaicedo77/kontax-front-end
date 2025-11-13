import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { PersonalOperadora } from '../modelos/personal-operadora.modelo';

@Injectable({
  providedIn: 'root'
})
export class PersonalOperadoraService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Consulta el personal de la operadora
   * @param parametros 
   */
  obtenerPersonalOperadora(parametros: any){
    const url = `${environment.URL_SERVICIOS}personal_operadoras`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Agrega un personal a la operadora
   * @param personal 
   */
  agregarPersonalOperadora(personal: PersonalOperadora) {
    const url = `${environment.URL_SERVICIOS}personal_operadoras`;
    return this.http.post(url, personal)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Quita a un ciudadano de la operadora
   * @param identificador 
   */
  quitarPersonalOperadora (identificador: number) {
    const url = `${environment.URL_SERVICIOS}personal_operadoras/${identificador}`;
    return this.http.delete(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
