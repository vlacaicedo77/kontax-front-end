import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { param } from 'jquery';


@Injectable({
  providedIn: 'root'
})
export class CertificadoMovilizacionService {

  constructor(private http: HttpClient) { }

  /**
   * Método que permite registrar un nuevo certificado de movilización.
   * @param csmi 
   * @returns 
   */
  registrarNuevoCSMI(csmi: CertificadoMovilizacion){
    const url = environment.URL_SERVICIOS + 'certificado_movilizacion';
    return this.http.post(url , csmi)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Confirma el certificado de movilización
   * @param id 
   */
  confimarCertificadoMovilizacion(identificador: number){
    const url = `${environment.URL_SERVICIOS}confirmar_certificado_movilizacion/${identificador}`;
    return this.http.post(url , null)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  /**
   * Anular certificado de movilización
   * @param identificador 
   * @returns 
   */
  anularCertificadoMovilizacion(identificador: number){
    const url = `${environment.URL_SERVICIOS}anular_certificado_movilizacion/${identificador}`;
    return this.http.post(url , null)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Confirma el certificado de movilización
   * @param id 
   */
   autorizarCertificadoMovilizacion(identificador: number){
    const url = `${environment.URL_SERVICIOS}autorizar_certificado_movilizacion/${identificador}`;
    return this.http.post(url , null)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Establece en tránsito el certificado de movilización
   * @param identificador 
   * @returns 
   */
  actualizarEstadoCertificadoMovilizacion(parametros: any){
    //console.log(parametros);
    const url = `${environment.URL_SERVICIOS}actualizar_estado_certificado_movilizacion/${parametros.idCertificadoMovilizacion}`;
    return this.http.post(url , null,  { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene el PDF en base 64 del Certificado Sanitario de Movilización Interna
   */
  obtenerPdfCertificadoMovilizacion(identificador: number, reimpresion: boolean = false){
    let parametros: any = {};
    if (reimpresion) {
      parametros = {
        accion: 'RI'
      };
    }

    const url = `${environment.URL_SERVICIOS}certificadoMovilizacion/${identificador}`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene los Certificados de Movilización 
   * @param parametros 
   */
  obtenerCertificadosMovilizacion(parametros: any){
    //console.log(parametros);
    const url = `${environment.URL_SERVICIOS}certificado_movilizacion`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene los Certificados de Movilización 
   * @param parametros 
   */
   obtenerCertificadosMovilizacionFechas(parametros: any){
    //console.log(parametros);
    const url = `${environment.URL_SERVICIOS}certificado_movilizacion_fechas`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene los Certificados de Movilización 
   * @param parametros 
   */
   obtenerCertificadosMovilizacionTicket(parametros: any){
    const url = `${environment.URL_SERVICIOS}detalle_certificado_movilizacion_ticket`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
