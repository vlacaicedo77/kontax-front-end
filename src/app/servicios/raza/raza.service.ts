import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaService {

  constructor(
    public http: HttpClient
  ) { }

  obtenerRazas() {
    const url = environment.URL_SERVICIOS + 'catalogos/razas';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
