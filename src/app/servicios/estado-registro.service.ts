import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoRegistroService {

  constructor(
    private http: HttpClient
  ) { }

  obtenerEstadosRegistros(){
    const url = `${environment.URL_SERVICIOS}catalogos/estadosRegistros`;
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
