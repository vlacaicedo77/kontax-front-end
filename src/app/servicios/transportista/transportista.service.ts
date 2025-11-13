import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Transportista } from '../../modelos/transportista.modelo';

@Injectable({
  providedIn: 'root'
})
export class TransportistaService {

  constructor( private http: HttpClient) { }

  /**
   * Obtiene los transportias
   */
  obtenerTransportistasPorFiltro(parametros: any) {
    const url = `${environment.URL_SERVICIOS}transportistas`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      } )
    );
  }

  /**
   * Registra un nuevo transportista
   * @param item 
   */
  registrarTransportista(item: Transportista){
    const url = `${environment.URL_SERVICIOS}transportistas`;
    return this.http.post(url, item )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
