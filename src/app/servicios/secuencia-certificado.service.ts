import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecuenciaCertificadoService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que consulta las secuencias de los certificados de vacunación
  obtenerSecuenciasCertificados(parametros: any){
    const url = environment.URL_SERVICIOS + 'secuencia_certificado';
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que asigna la secuencias a una oficina
  asignarSecuenciaOficina(datos: any){
    const url = environment.URL_SERVICIOS + 'asignar_numeracion_oficina';
    return this.http.patch(url,datos)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Marca la secuencia como anulada
   * @param idSecuencia 
   */
  marcarSecuenciaAnulada(idSecuencia: number){
    const url = `${environment.URL_SERVICIOS}marcar_anulado/${idSecuencia}`;
    return this.http.patch(url, {})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  /**
   * Marca la secuencia como peridida
   * @param idSecuencia 
   */
  marcarSecuenciaPerdida(idSecuencia: number){
    const url = `${environment.URL_SERVICIOS}marcar_perdido/${idSecuencia}`;
    return this.http.patch(url, {})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  /**
   * Marca la secuencia como dañada o deteriorada
   * @param idSecuencia 
   */
  marcarSecuenciaDeteriorada(idSecuencia: number){
    const url = `${environment.URL_SERVICIOS}marcar_deteriorado/${idSecuencia}`;
    return this.http.patch(url, {})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
