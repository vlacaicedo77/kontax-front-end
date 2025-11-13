import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OficinaInterna } from '../../modelos/oficina-interna.modelo';

@Injectable({
  providedIn: 'root'
})
export class OficinaInternaService {

  public response;

  private oficinas: OficinaInterna[] = [];

  constructor(public http: HttpClient) { 

  }

  // Método que permite obtener oficinas por el id de la provincia .
  public getOficinasInternasPorProvincia(idProvincia: number): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/oficinas_internas&idProvincia=' + idProvincia;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

  // Método que permite obtener oficinas por su id
  public getOficinasInternasPorId(idOficina: number): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/oficinas_internas&idOficina=' + idOficina;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

  public getOficinasInternas(): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/oficinas_internas';
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

  public getSolicitudesOficina(idOficina : number): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/oficinas_internas';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }


}