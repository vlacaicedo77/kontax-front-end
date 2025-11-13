import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoteService {

  constructor(
    private http: HttpClient
  ) { }

  obtenerLotes(parametros: any) {
    const url = `${environment.URL_SERVICIOS}lotes`;
    return this.http.get(url,{params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }


}
