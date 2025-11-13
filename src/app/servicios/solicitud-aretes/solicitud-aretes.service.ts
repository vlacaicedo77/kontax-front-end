import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
// Importamos modelos
import { SolicitudAretes } from '../../modelos/solicitud-aretes.modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudAretesService {

  solicitud: SolicitudAretes;

  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método para registrar una solicitud.
  registrarSolicitudAretes(solicitud: SolicitudAretes) {
    const url = environment.URL_SERVICIOS + 'solicitudes_aretes/';
    return this.http.post(url, solicitud).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método que permite obtener las solicitudes de aretes oficiales
  obtenerSolicitudesAretes(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'solicitudes_aretes';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método para tramitar una solicitud
  tramitarSolicitud(solicitud: SolicitudAretes){
    const url = environment.URL_SERVICIOS + 'solicitudes_aretes/' + solicitud.idSolicitudesAretes;
    return this.http.patch(url, solicitud).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para consultar una solicitud
  consultarEstadisticasValidaciones(idUsuario: number){
    const url = environment.URL_SERVICIOS + 'estadisticas_validaciones_aretes/' + idUsuario;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }
}