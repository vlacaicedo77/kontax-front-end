import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Vehiculo } from '../../modelos/vehiculo.modelo';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  constructor( private http: HttpClient) { }

  // Método que permite obtener vehículos por filtro.
  obtenerVehiculosPorFiltro(parametros: any){
    const url = environment.URL_SERVICIOS + 'vehiculos';
    return this.http.get(url, { params: parametros })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Crea un vehículo
   * @param vehiculo 
   */
  crearVehiculo(vehiculo: Vehiculo){
    const url = `${environment.URL_SERVICIOS}vehiculos`;
    return this.http.post(url, vehiculo )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Habilita un vehículo
   * @param id 
   */
  habilitarVehiculo(id: number){
    const url = `${environment.URL_SERVICIOS}habilitar_vehiculo/${id}`;
    return this.http.patch(url, {} )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Deshabilita el vehículo
   * @param id 
   */
  deshabilitarVehiculo(id: number){
    const url = `${environment.URL_SERVICIOS}deshabilitar_vehiculo/${id}`;
    return this.http.patch(url, {} )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
