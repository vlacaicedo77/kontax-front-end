import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaxonomiaService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Permite consultar todas las taxonomías
   */
  obtenerTaxonomias(){
    const url = `${environment.URL_SERVICIOS}catalogos/taxonomias`;
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
