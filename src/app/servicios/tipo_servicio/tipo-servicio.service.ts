import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoServicioService {

  constructor(
    public http: HttpClient
  ) { }
  // Método que permite obtener los tipos de servicios de los catálogos.
  obtenerTiposServicios() {
    const url = environment.URL_SERVICIOS + 'catalogos/tiposServicios';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
