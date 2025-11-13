import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DinardapService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que permite consultar los datos demográficos dado la cédula de ciudadanía
  obtenerDatosDemograficos(ci: string) {
    //const url = `${environment.URL_SERVICIOS}datos_demograficos/${ci}`;
    const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=datos_demograficos/${ci}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }
  // Método que permite consultar los títulos universitarios de una persona
  obtenerTitulosUniversitarios(ci: string) {
    const url = `${environment.URL_SERVICIOS}titulos_universitarios/${ci}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }
  // Método que permite consultar la actividad económica de una persona
  obtenerActividadEconomica(ruc: string) {
    const url = `${environment.URL_SERVICIOS}actividad_economica/${ruc}`;
    //const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=actividad_economica/${ruc}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }
  // Método que permite consultar las ubicaciones de una persona
  obtenerUbicacionesSri(ruc: string) {
    //const url = `${environment.URL_SERVICIOS}ubicaciones_sri/${ruc}`;
    const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=ubicaciones_sri/${ruc}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }
  // Método que permite obtener el RUC del contribuyente
  obtenerRucContribuyente(ruc: string) {
    //const url = `${environment.URL_SERVICIOS}ruc_contribuyente/${ruc}`;
    const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=ruc_contribuyente/${ruc}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
   * Método que obtiene el representante legal de un contribuyente
   * @param ruc 
   * @returns 
   */
  obtenerRepresentanteLegal(ruc: string) {
    //const url = `${environment.URL_SERVICIOS}ruc_representante_legal/${ruc}`;
    const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=ruc_representante_legal/${ruc}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
   * Permite obtener el correo electrónico de un contribuyente
   * @param ruc 
   * @returns 
   */
  obtenerCorreoElectronicoContribuyente(ruc: string) {
    //const url = `${environment.URL_SERVICIOS}email_contribuyente/${ruc}`;
    const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=email_contribuyente/${ruc}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
   * Obtiene la placa de un vehículo
   * @param placa 
   * @returns 
   */
  obtenerMarcaVehiculo(placa: string) {
    placa = placa.toUpperCase();
    //const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=vehiculo_ant/${placa}`;
    const url = `${environment.URL_SERVICIOS}vehiculo_ant/${placa}`;
    return this.http.get(url, {
      params: {
        tipoConsulta: 'PLACA'
      }
    }).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
   * Obtiene los datos de la matrícula del vehículo
   * @param placa 
   */
  obtenerMatriculaVehiculo(placa: string) {
    placa = placa.toUpperCase();
    const url = `${environment.URL_SERVICIOS}matricula_ant/${placa}`;
    //const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=matricula_ant/${placa}`;
    return this.http.get(url, {
      params: {
        tipoConsulta: 'PLACA'
      }
    }).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
   * Obtiene los datos de licencia de una persona
   * @param cedula 
   */
  obtenerDatosLicencia(cedula: string) {
    const url = `${environment.URL_SERVICIOS}datos_licencia/${cedula}`;
    //const url = `https://sifae.agrocalidad.gob.ec/SIFAEBack/index.php?ruta=datos_licencia/${cedula}`;
    return this.http.get(url).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      }
      )
    );
  }

  /**
 * Obtiene la IP Pública del cliente
 */
  obtenerIpCliente() {
    const url = `${environment.URL_SERVICIOS}ip_cliente`; 
    return this.http.get(url).pipe(
      map((respuesta: any) => respuesta.resultado)
    );
  }

}