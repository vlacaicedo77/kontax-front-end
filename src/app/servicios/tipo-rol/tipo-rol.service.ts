import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoRolService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene los tipos de roles de usuarios
  obtenerTiposRoles(parametros: {}){
    const url = environment.URL_SERVICIOS + 'tipos_roles';
    return this.http.get(url, {params: parametros}).pipe(
      map((respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
