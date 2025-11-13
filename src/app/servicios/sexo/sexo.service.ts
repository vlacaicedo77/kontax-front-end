import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SexoService {

  constructor(
    public http: HttpClient
  ) { }
  
  // Método que permite obtener los sexos de los catálogos.
  obtenerSexos() {
    const url = environment.URL_SERVICIOS + 'catalogos/sexos';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
}
