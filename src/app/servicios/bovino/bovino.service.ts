import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

// Importamos el modelo para bovino
import { Bovino } from '../../modelos/bovino.modelo';
import { BajaBovino } from '../../modelos/baja-bovino.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BovinoService {

  bovino: Bovino;

  // Constructor de la clase.
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Método que registra un bovino por nacimiento.
  registrarBovinoDescarte(bovino: Bovino) {
    const url = environment.URL_SERVICIOS + 'nacimiento_bovino';
    return this.http.post( url, bovino ).pipe(
      map( (respuesta: any) => {
        return respuesta;
      })
    );
  }
  // Método que obtiene los bovinos por filtro.
  obtenerBovinosPorFiltro(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'bovinos';
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que obtiene los bovinos por filtro con su mensaje de respuesta.
  obtenerBovinosPorFiltroResp(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'bovinos';
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta;
      })
    );
  }

// Método que permite registrar la baja de un bovino.
  registrarBajaBovino(bajaBovino: BajaBovino) {
    const url = environment.URL_SERVICIOS + 'baja_bovino';
    return this.http.post(url, bajaBovino).pipe(
      map ( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Transfiere el dominio de uno o varios bovinos
   */
  transferirDominio(datosTransferencia: any){
    const url = `${environment.URL_SERVICIOS}transferir_dominio`;
    return this.http.post(url, datosTransferencia).pipe(
      map ( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que permite confirmar el catastro por parte del productor
  confirmarCatastroBovino(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'confirmar_catastro';
    return this.http.post( url, parametros ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Filtra bovinos con todos los detalles
   * @param parametros 
   */
  filtrarBovinos(parametros: any){
    const url = `${environment.URL_SERVICIOS}filtrar_bovinos`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Filtra bovinos con todos los detalles
   * @param parametros 
   */
   filtrarBovinosTicket(parametros: any){
    const url = `${environment.URL_SERVICIOS}ws_bovinos_ticket`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Filtra bovinos con todos los detalles
   * @param parametros 
   */
   obtenerBovinosNacimientos(parametros: any){
    const url = `${environment.URL_SERVICIOS}ws_bovinos_nacimientos`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Habilita un bovino
   * @param id 
   */
  habilitarBovino(id: number){
    const url = `${environment.URL_SERVICIOS}habilitar_bovino/${id}`;
    return this.http.patch( url, {}).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Deshabilita un bovino
   */
  deshabilitarBovino(id: number){
    const url = `${environment.URL_SERVICIOS}deshabilitar_bovino/${id}`;
    return this.http.patch( url, {}).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

   // Método que obtiene la información del dashboard de usuarios internos
   obtenerDashboardInterno() {
    const url = environment.URL_SERVICIOS + 'dashboard_interno';
    return this.http.get( url, { } ).pipe(
      map( (respuesta: any) => {
        return respuesta;
      })
    );
  }

  /**
   * Filtra animales con todos los detalles
   * @param parametros 
   */
  filtrarAnimales(parametros: any){
    const url = `${environment.URL_SERVICIOS}catastro_animales`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Filtra animales con todos los detalles
   * @param parametros 
   */
  filtrarAnimalesMovilizacion(parametros: any){
    const url = `${environment.URL_SERVICIOS}catastro_animales_movilizacion`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método para actualizar proveedores de aretes
  actualizarDatosAnimal(bovino: Bovino){
    const url = environment.URL_SERVICIOS + 'bovinos/' + bovino.idBovino;
    return this.http.patch(url, bovino).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para consultar una solicitud
  consultarEstadisticasNacimientos(idSitio: number){
    const url = environment.URL_SERVICIOS + 'estadisticas_validaciones_nacimientos/' + idSitio;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  /**
   * Filtra animales con todos los detalles
   * @param parametros 
   */
  filtrarAnimalesMovilizacionFerias(parametros: any){
    const url = `${environment.URL_SERVICIOS}catastro_animales_movilizacion_ferias`;
    return this.http.get( url, { params: parametros } ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Permite obtener animales del catastro, tanto vacunados como no vacunados.
   * @param parametros 
   */
  obtenerTotalesCatastroAnimales(parametros: any){
    const url = `${environment.URL_SERVICIOS}totales_catastro_animales`;
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
