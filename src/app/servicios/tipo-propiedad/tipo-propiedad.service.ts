import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoPropiedadService {

  public response; 

  constructor(public http: HttpClient) 
  { }


  // Método que permite obtener los tipos de propiedad
  getTiposPropiedad() {
    const url = environment.URL_SERVICIOS + 'catalogos/tiposPropiedades';
    return this.http.get(url).pipe(
      map((resp: any) =>  {
          return resp.resultado;
      } )
    );
  }
}
