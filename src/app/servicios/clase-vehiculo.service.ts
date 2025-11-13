import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ClaseVehiculoService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene las clases de vehículos
   */
  obtenerClaseVehiculo(){
    const url = `${environment.URL_SERVICIOS}catalogos/clasesVehiculos`;
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
