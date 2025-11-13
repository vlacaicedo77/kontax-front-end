import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposPersonalService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene el personal del catálogo
   */
  obtenerTiposPersonal(){
    const url = `${environment.URL_SERVICIOS}catalogos/tiposPersonal`;
    return this.http.get(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
