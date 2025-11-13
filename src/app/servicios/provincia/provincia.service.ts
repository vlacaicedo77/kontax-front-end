import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Provincia } from '../../modelos/provincia.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  public response;

  private idPais: number;
  private provincias: Provincia[] = [];

  constructor(public http: HttpClient) {
    this.idPais = 0;
   }

  // Método que permite obtener provincias por el id del pais.
  getProvinciasPorPais(idPais: number): Observable<any> {
    if ( idPais === this.idPais && this.provincias.length > 0) {
      return new Observable( observador => {
        observador.next(this.provincias);
        observador.complete();
      });
    }
    this.idPais = idPais;
    const url = environment.URL_SERVICIOS + 'catalogos/provincias&idPais=' + idPais;
    return this.http.get(url).pipe(
      map((resp: any) => {
        this.provincias = resp.resultado;
        return resp.resultado;
      })
    );
  }
}
