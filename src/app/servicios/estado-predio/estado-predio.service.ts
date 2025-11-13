import { Injectable } from '@angular/core';
import { EstadoPredio } from '../../modelos/estado-predio.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoPredioService {

  private estadosPredios: EstadoPredio[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene los estados de los documentos
  obtenerEstadosPredios(): Observable<any> {
    if ( this.estadosPredios.length > 0 ) {
      return new Observable( observador => {
        observador.next(this.estadosPredios);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/estadosPredios';
    return this.http.get(url).pipe(
      map( (respuesta: any) => {
        this.estadosPredios = respuesta.resultado;
        return respuesta.resultado;
      })
    );
  }


}
