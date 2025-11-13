import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoActividadTransporteService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene el catálogo de tipos de actividades de transporte
   */
  obtenerTiposActividadesTransportes(){
    const url = `${environment.URL_SERVICIOS}catalogos/tiposActividadesTransportes`;
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
