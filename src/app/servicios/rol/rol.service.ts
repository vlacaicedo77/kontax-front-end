import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Rol } from '../../modelos/rol.modelo';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene los roles de usuario
  obtenerRoles(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'roles';
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que crea un nuevo rol de usuario
  crearRol(rol: Rol) {
    const url = environment.URL_SERVICIOS + 'roles';
    return this.http.post(url, rol).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
