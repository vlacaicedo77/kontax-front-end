import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposAreasService {

  constructor( private http: HttpClient) { }

  // Método que obtiene los tipos de áreas.
  obtenerTiposAreas(){
    const url = environment.URL_SERVICIOS + 'catalogos/tiposAreas';
    return this.http.get(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
