import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Importamos la URL del request para los servicios
import { environment } from 'src/environments/environment';
import { Parroquia } from '../../modelos/parroquia.modelo';

@Injectable({
  providedIn: 'root'
})
export class ParroquiaService {

  public response;

  private idCanton: number;
  private parroquias: Parroquia[] = [];

  constructor(public http: HttpClient) { 
    this.idCanton = 0;
   }

  // Método que permite obtener parroquias por el id del canton.
  getParroquiasPorCanton(idCanton: number): Observable<any> {
    if ( idCanton === this.idCanton && this.parroquias.length > 0) {
      return new Observable( observador => {
        observador.next(this.parroquias);
        observador.complete();
      });
    }
    this.idCanton = idCanton;
    const url = environment.URL_SERVICIOS + 'catalogos/parroquias&idCanton=' + idCanton;
    return this.http.get(url).pipe(
      map((resp: any) =>  {
        this.parroquias = resp.resultado;
        return resp.resultado;
      })
    );
  }
}