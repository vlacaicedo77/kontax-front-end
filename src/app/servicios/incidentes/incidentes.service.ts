import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Importamos modelo: sitio.
import { Incidente } from 'src/app/modelos/incidente.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IncidentesService {

  // Constructor de la clase
  constructor(
    public http: HttpClient
  ) { }

  // Método para registrar un incidente
  registrarIncidente(incidente: Incidente) {
    const url = environment.URL_SERVICIOS + 'incidentes/';
    return this.http.post(url, incidente).pipe(
      map( resp => resp )
    );
  }

  // Método para actualizar un incidente
  actualizarIncidente(incidente: Incidente){
    const url = environment.URL_SERVICIOS + 'incidentes/';
    return this.http.patch(url, incidente).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método que permite obtener los sitios por el id de usuario.
  obtenerIncidentes(idIncidente : number, parametros: {}) {
    const url = environment.URL_SERVICIOS + 'incidentes/' + idIncidente;
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }
}
