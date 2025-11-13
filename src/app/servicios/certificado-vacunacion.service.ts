import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { CertificadoVacunacion } from '../modelos/certificado-vacunacion.modelo';

@Injectable({
  providedIn: 'root'
})
export class CertificadoVacunacionService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene los certificados de vacunación registrados
   * @param parametros 
   */
  obtenerCertificadosVacunaciones(parametros: any) {
    const url = `${environment.URL_SERVICIOS}certificados_unicos_vacunaciones`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Obtiene los certificados de vacunación registrados
   * @param parametros 
   */
   obtenerCertificadosVacunacionesDosis(parametros: any) {
    const url = `${environment.URL_SERVICIOS}certificados_unicos_vacunaciones_dosis_aplicadas`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Registra un certificado de vacunación
   */
  registrarCertificadoVacunacion(certificado: CertificadoVacunacion) {
    const url = `${environment.URL_SERVICIOS}certificados_unicos_vacunaciones`;
    return this.http.post(url,certificado)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
     );
  }

  /**
   * Obtiene el PDF en base64 del Certificado de Vacunación
   * @param identificador 
   */
  obtenerPdfCertificadoUnicoVacunacion(identificador: number, reimpresion: boolean = false){
    let parametros: any = {};
    if ( reimpresion) {
      parametros = {
        accion: 'RI'
      };
    }
    const url = `${environment.URL_SERVICIOS}certificadoUnicoVacunacion/${identificador}`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Elimina un certificado de vacunación
   * @param identificado 
   */
  eliminarCertificadoVacunacion(identificador: number){
    const url = `${environment.URL_SERVICIOS}certificados_unicos_vacunaciones/${identificador}`;
    return this.http.delete(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
     );
  }

}
