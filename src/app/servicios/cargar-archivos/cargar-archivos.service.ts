import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Importamos modelo: sitio.
import { Sitio } from 'src/app/modelos/sitio.modelo';
import { CertificacionSitio } from 'src/app/modelos/certificacion-sitio.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SitioService {

  sitio: Sitio;

  // Constructor de la clase
  constructor(
    public http: HttpClient
  ) { }

  // Método para registrar un Sitio
  registrarSitio(sitio: Sitio) {
    const url = environment.URL_SERVICIOS + 'sitios/';
    return this.http.post(url, sitio).pipe(
      map( resp => resp )
    );
  }

  // Método para actualizar un sitio
  actualizarSitio(sitio: Sitio){
    const url = environment.URL_SERVICIOS + 'sitios/' + sitio.idSitio;
    return this.http.patch(url, sitio).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para cargar el archivo de confirmación de entrega
  cargarDocumentoPropiedad(nombreArchivo: string, archivo){
    const url = environment.URL_SERVICIOS + 'documento_propiedad_predio/' + nombreArchivo;
    return this.http.post(url, archivo).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para descargar el archivo de confirmación de entrega
  descargarDocumentoPropiedad(nombreArchivo: string) {
  const httpOptions = {
  responseType: 'blob' as 'json'};
  const url = environment.URL_SERVICIOS + 'documento_propiedad_predio/' + nombreArchivo;

  return this.http.get(url, httpOptions);

}

  // Método para registrar una Certificación de un Sitio
  registrarCertificacionSitio(certificacionSitio: CertificacionSitio) {
    const url = environment.URL_SERVICIOS + 'certificaciones_sitios/';
    return this.http.post(url, certificacionSitio).pipe(
      map( resp => resp )
    );
  }

  // Método que permite obtener los sitios por el id de usuario.
  obtenerSitiosPorIdUsuario(idUsuario) {
    const url = environment.URL_SERVICIOS + 'filtrar_sitios';
    return this.http.get(url, { params: {idUsuariosExternos : idUsuario}}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por su id
  consultarSitioPorId(idSitio: number) {
    const url = environment.URL_SERVICIOS + 'sitios/' + idSitio;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por el número de identificación del usuario.
  consultarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacionUsuario) {
    const url = environment.URL_SERVICIOS + 'filtrar_sitios';
    return this.http.get(url, { params: {numeroIdentificacionUsuario : numeroIdentificacionUsuario}}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por varios filtros.
  consultarSitiosPorFiltros(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'filtrar_sitios';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

// Método que permite obtener un sitio por su id en modo consulta
  consultaSitioReporte(idSitio: number) {
    const url = environment.URL_SERVICIOS + 'reportes_sitios/' + idSitio;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener un sitio por su id en modo consulta
  consultaSitioReporteFiltros(filtros: {}) {
    const url = environment.URL_SERVICIOS + 'reportes_sitios/';
    return this.http.get(url, { params : filtros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método genérico que permite filtrar los sitios dado varios parámetros.
  filtrarSitios(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'filtrar_sitios';
    return this.http.get(url, { params: parametros }).pipe(
      map( (respuesta: any) =>  {
        return respuesta.resultado;
      })
    );
  }

  // Método que permite obtener los centros de faenamiento registrados por el usuario en el sistema GUIA
  consultarCentrosFaenamientoGUIAPorNumeroIdentificacionUsuario(numeroIdentificacion: string) {
    const url = environment.URL_SERVICIOS + 'centros_faenamiento_guia/'+numeroIdentificacion;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener las ferias de exposición registradas por el usuario en el sistema GUIA
  consultarFeriasExposicionGUIAPorNumeroIdentificacionUsuario(numeroIdentificacion: string) {
    const url = environment.URL_SERVICIOS + 'ferias_exposicion_guia/'+numeroIdentificacion;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener las ferias de comercialización registradas por el usuario en el sistema GUIA
  consultarFeriasComercializacionGUIAPorNumeroIdentificacionUsuario(numeroIdentificacion: string) {
    const url = environment.URL_SERVICIOS + 'ferias_comercializacion_guia/'+numeroIdentificacion;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

}
