import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MedioTransporte } from '../../modelos/medio-transporte.modelo';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MediosTransportesService {

  private mediosTransportes: MedioTransporte[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene los médios de transporte.
  obtenerMediosTransportes(): Observable<any>{
    if (this.mediosTransportes.length > 0) {
      return new Observable( observador => {
        observador.next(this.mediosTransportes);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/mediosTransportes';
    return this.http.get(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
