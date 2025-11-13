import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

// Importamos modelos: área.
import { IdentificadorBovino } from '../../modelos/identificador-bovino.modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdentificadorBovinoService {

  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método para registrar un Comercio de Identificadores
  actualizarIdentificador(identificador: IdentificadorBovino) {
    const url = environment.URL_SERVICIOS + 'identificadores_bovinos/' + identificador.idIdentificador;
    return this.http.patch(url, identificador).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }


  // Método que permite obtener los identificadores disponibles de un usuario
  obtenerIdentificadoresDisponiblesPorUsuario(idUsuario: number) {
    const url = environment.URL_SERVICIOS + 'identificadores_bovinos&idEstado=3&idUsuarioActual=' + idUsuario;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite obtener los identificadores activos de un usuario
  obtenerIdentificadoresActivosPorUsuario(idUsuario: number) {
    const url = environment.URL_SERVICIOS + 'identificadores_bovinos&idEstado=4&idUsuarioActual=' + idUsuario;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite obtener los identificadores sin usar de un usuario
  obtenerIdentificadoresSinUsarPorUsuario(idUsuario: number) {
    const url = environment.URL_SERVICIOS + 'identificadores_bovinos&idEstado=3&idUsuarioActual=' + idUsuario;
    return this.http.get(url).pipe(
      map( (resp: any) => {
        return resp;
      })
    );
  }
}
