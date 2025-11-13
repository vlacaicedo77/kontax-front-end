import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Oficina } from '../modelos/oficina.modelo';

@Injectable({
  providedIn: 'root'
})
export class OficinaService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que consulta las oficinas
  obtenerOficinas( parametros: any) {
    const url = environment.URL_SERVICIOS + 'oficinas';
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Asinga un técnico a una oficina
  asignarTecnicoAOficina(oficina: Oficina) {
    const url = `${environment.URL_SERVICIOS}asignar_tecnico_oficina`;
    return this.http.patch(url, oficina)
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Crea una oficina para la operadora
   * @param oficina 
   */
  crearOficinaOperadora(oficina: Oficina){
    const url = `${environment.URL_SERVICIOS}oficinas_operadoras`;
    return this.http.post(url, oficina)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }


}
