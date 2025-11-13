import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
// Importamos modelos: notificacion.
import { Notificacion } from '../../modelos/notificacion.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NotificacionService {

  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método que permite consultar notificaciones por filtro
  consultarNotificacionesExternosFiltros(filtros :{}) {
    const url = environment.URL_SERVICIOS + 'notificaciones_externos/';
    return this.http.get<[]>(url, {params : filtros}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite consultar notificaciones por filtro
  consultarNotificacionesInternosFiltros(filtros :{}) {
    const url = environment.URL_SERVICIOS + 'notificaciones_internos/';
    return this.http.get<[]>(url, {params : filtros}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  //  Método que permite crear notificaciones a externos
  registrarNotificacionExterno(notificacion : Notificacion) {
    const url = environment.URL_SERVICIOS + 'notificaciones_externos/';
    return this.http.post(url, notificacion).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  //  Método que permite crear notificaciones a internos
  registrarNotificacionInterno(notificacion : Notificacion) {
    const url = environment.URL_SERVICIOS + 'notificaciones_internos/';
    return this.http.post(url, notificacion).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite actualizar notificaciones a externos
  actualizarNotificacionExterno(notificacion : Notificacion) {
    const url = environment.URL_SERVICIOS + 'notificaciones_externos/';
    return this.http.patch<[]>(url, notificacion).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  // Método que permite actualizar notificaciones a internos
  actualizarNotificacionInterno(notificacion : Notificacion) {
    const url = environment.URL_SERVICIOS + 'notificaciones_internos/';
    return this.http.patch<[]>(url, notificacion).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
}
