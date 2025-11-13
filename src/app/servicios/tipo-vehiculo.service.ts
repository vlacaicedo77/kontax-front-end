import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoVehiculoService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene los tipos de vehículos
   */
  obtenerTipoVehiculo(){
    const url = `${environment.URL_SERVICIOS}catalogos/tiposVehiculos`;
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
