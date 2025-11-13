import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Zona } from '../modelos/zona.modelo';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { ZonaOperadora } from '../modelos/zona-operadora.modelo';
import { Cobertura } from '../modelos/cobertura.modelo';


@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  constructor(
    private http: HttpClient
  ) { }

  // Obtiene zonas para coberturas
  obtenerZonas(parametros: any){
    const url = `${environment.URL_SERVICIOS}zonas`;
    return this.http.get(url,{
      params: parametros
    })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  // Crea una zona para cobertura
  crearZona( zona: Zona){
    const url = `${environment.URL_SERVICIOS}zonas`;
    return this.http.post(url, zona)
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );
  }

  // Obtiene las operadoras pertenecientes a las zonas
  obtenerZonaOperadora(parametros: any) {
    const url = `${environment.URL_SERVICIOS}zonas_operadoras`;
    return this.http.get(url,{
      params: parametros
    })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Agrega una operadora a una zona
  crearZonaOperadora(operadora: ZonaOperadora) {
    const url = `${environment.URL_SERVICIOS}zonas_operadoras`;
    return this.http.post(url, operadora)
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Método que elimina una operadora de una zona
   * @param idZonaOperadora 
   */
  eliminarZonaOperadora(idZonaOperadora: number){
    const url = `${environment.URL_SERVICIOS}zonas_operadoras/${idZonaOperadora}`;
    return this.http.delete(url).pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );

  }

  /**
   * Método que crea una cobertura
   * @param cobertura 
   */
  crearCobertura(cobertura: Cobertura){
    const url = `${environment.URL_SERVICIOS}coberturas`;
    return this.http.post(url,cobertura)
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );
  }

  // Obtiene las coberturas
  obtenerCoberturas(parametros: any){
    const url = `${environment.URL_SERVICIOS}coberturas`;
    return this.http.get(url,{
      params: parametros
    })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  /**
   * Método que elimina una cobertura.
   * @param idCobertura 
   */
  eliminarCobertura(idCobertura: number){
    const url = `${environment.URL_SERVICIOS}coberturas/${idCobertura}`;
    return this.http.delete(url).pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
    );
  }



}
