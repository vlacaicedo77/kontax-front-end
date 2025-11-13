import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

// Importamos modelos: área.
import { Area } from '../../modelos/area.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  area: Area;

  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método para registrar una Explotacion Pecuaria.
  registrarExplotacionPecuaria(area: Area) {
    const url = environment.URL_SERVICIOS + 'explotaciones_pecuarias/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para registrar un Centro de Faenamiento
  registrarCentroFaenamiento(area: Area) {
    const url = environment.URL_SERVICIOS + 'centros_faenamiento/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para registrar una Feria de Comercialización.
  registrarFeriaComercializacion(area: Area) {
    const url = environment.URL_SERVICIOS + 'ferias_comercializacion/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para registrar una Feria de Exposición.
  registrarFeriaExposicion(area: Area) {
    const url = environment.URL_SERVICIOS + 'ferias_exposicicion/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para registrar un Comercio de Identificadores
  registrarComercioIdentificadores(area: Area) {
    const url = environment.URL_SERVICIOS + 'comercios_identificadores/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para registrar un Centro de Hospedaje
  registrarCentroHospedaje(area: Area) {
    const url = environment.URL_SERVICIOS + 'centros_hospedaje/';
    return this.http.post(url, area).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }
  
  // Método que permite obtener las áreas
  obtenerAreasPorIdSitio(idSitio: number) {
    const url = environment.URL_SERVICIOS + 'areas_por_id_sitio/' + idSitio;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp.resultado;
      })
    );
  }
  // Método que permite obtener áreas por filtro.
  obtenerAreasPorFiltro(parametros: {}){
    const url = environment.URL_SERVICIOS + 'areas_parametros';
    return this.http.get( url, {params: parametros} )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      } )
    );
  }

  /**
   * Actualizar estado del área 0 ó 1
   */
   actualizarEstadoArea(parametros: any){
    //console.log(parametros);
    const url = `${environment.URL_SERVICIOS}actualizar_estado_area/${parametros.idArea}`;
    return this.http.post(url , null,  { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que permite obtener áreas por el id de sitio en modo consulta
  consultaAreas(idSitio: number) {
    return [
      {
      "nombre":"Área de producción lechera 1", 
      "superficieHa":500, 
      "actividadPrincipal":"Producción lechera", 
      "tipoArea":"Explotación pecuaria bovina",
    },
    {
      "nombre":"Área de acopio lechero 1", 
      "superficieHa":10, 
      "actividadPrincipal":"N/A", 
      "tipoArea":"Centro de acopio",
    }
  ];  
  }

}