import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
// Importamos modelos
import { SolicitudReareteo } from '../../modelos/solicitud-reareteo.modelo';
import { TramiteSolicitud } from '../../modelos/tramite-solicitud.modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudReareteoService {

  solicitud: SolicitudReareteo;

  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método para registrar una solicitud.
  registrarSolicitud(solicitud: SolicitudReareteo) {
    const url = environment.URL_SERVICIOS + 'solicitudes_reareteo/';
    return this.http.post(url, solicitud).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

   // Método para tramitar una solicitud
   tramitarSolicitud(tramite: TramiteSolicitud){
    const url = environment.URL_SERVICIOS + 'solicitudes_reareteo/' + tramite.idSolicitud;
    return this.http.patch(url, tramite).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );

  }
  // Método para consultar el detalle de una solicitud
  consultarDetalleSolicitud(idSolicitud: number){
    const url = environment.URL_SERVICIOS + 'detalle_solicitud_reareteo/' + idSolicitud;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

    // Método para cargar el archivo de confirmación de entrega
    cargarConfirmacionEntrega(nombreArchivo: string, archivo){
      const url = environment.URL_SERVICIOS + 'confirmacion_entrega_reareteo/' + nombreArchivo;
      return this.http.post(url, archivo).pipe(
        map( (resp: any) => {
          return resp;
        } )
      );
    }

  // Método para consultar el reporte de solicitudes de reareteo
  consultarReporteSolicitudes(idSolicitante,idResponsable,solicitante,responsable,idEstado,tipoRolResponsable) {
    let filtros = '';
    if(idSolicitante !== null && idSolicitante !== undefined && idSolicitante !== "")
      filtros += '&identificacionSolicitante=' + idSolicitante;
    if(idResponsable !== null && idResponsable !== undefined && idResponsable !== "")
      filtros += '&identificacionResponsable=' + idResponsable;
    if(solicitante !== null && solicitante !== undefined && solicitante !== "")
      filtros += '&solicitante=' + solicitante;
    if(responsable !== null && responsable !== undefined && responsable !== "")
      filtros += '&responsable=' + responsable;
    if(idEstado !== null && idEstado !== undefined && idEstado !== "")
      filtros += '&idEstado=' + idEstado;
    if(tipoRolResponsable !== null && tipoRolResponsable !== undefined && tipoRolResponsable !== "")
      filtros += '&tipoRolResponsable=' + tipoRolResponsable;

    const url = environment.URL_SERVICIOS + 'solicitudes_reareteo/' + filtros;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }
}
