import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CoberturaOficina } from '../modelos/cobertura-oficina.modelo';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoberturaOficinaService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Agrega una cobertura a una oficina de la operadora
   * @param coberturaOficina 
   */
  agregarCoberturaAOficina (coberturaOficina: CoberturaOficina) {
    const url = `${environment.URL_SERVICIOS}coberturas_oficinas`;
    return this.http.post(url, coberturaOficina)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene las coberturas de una oficina de vacunación
   * @param parametros 
   */
  obtenerCoberturasDeOficina( parametros: any ) {
    const url = `${environment.URL_SERVICIOS}coberturas_oficinas`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Quita a una cobertura de una oficina
   * @param identificador 
   */
  quitarCoberturaDeOficina(identificador: number) {
    const url = `${environment.URL_SERVICIOS}coberturas_oficinas/${identificador}`;
    return this.http.delete(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
