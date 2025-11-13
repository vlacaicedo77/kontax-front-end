import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudGenericoService {

  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método para consultar el reporte de solicitudes pendientes de asignar
  consultarSolicitudesPendientesAsignar(filtros : {}){
    const url = environment.URL_SERVICIOS + 'reporte_solicitudes_por_asignar/';
    return this.http.get(url,{params: filtros}).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para consultar el reporte de solicitudes reasignables
  consultarSolicitudesReasignables(filtros : {}){
    const url = environment.URL_SERVICIOS + 'reporte_solicitudes_reasignables/';
    return this.http.get(url,{params: filtros}).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }
}
