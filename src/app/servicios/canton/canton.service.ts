import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { observable, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Canton } from '../../modelos/canton.modelo';

@Injectable({
  providedIn: 'root'
})
export class CantonService {

  public response;

  private idProvincia: number;
  private cantones: Canton[] = [];

  constructor(public http: HttpClient) { 
    this.idProvincia = 0;
   }

  // Método que permite obtener los cantones por el id de la provincia.
  getCantonesPorProvincia(idProvincia: number): Observable<any> {
    if ( idProvincia === this.idProvincia && this.cantones.length > 0) {
      return new Observable( observador => {
        observador.next(this.cantones);
        observador.complete();
      });
    }
    this.idProvincia = idProvincia;
    const url = environment.URL_SERVICIOS + 'catalogos/cantones&idProvincia=' + idProvincia;
    return this.http.get(url).pipe(
      map((resp: any) =>  {
        this.cantones = resp.resultado;
        return resp.resultado;
      })
    );
  }
}
