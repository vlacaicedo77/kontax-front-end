import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FiguraPersonaService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene las figuras de las personas
   */
  obtenerFigurasPersonas(){
    const url = `${environment.URL_SERVICIOS}catalogos/figurasPersonas`;
    return this.http.get(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
