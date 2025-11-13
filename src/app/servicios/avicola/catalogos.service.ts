import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CatalogoAvicola } from '../../modelos/modelos-avicola/catalogo-avicola.modelo';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  public response;

  private tipo: string;

  private catalogoAvicola: CatalogoAvicola[] = [];

  constructor(public http: HttpClient) {
    this.tipo = '';
  }

  // Método que permite obtener provincias por el id del pais.
  getFinalidadProductor(tipo: string): Observable<any> {
    if ( tipo === this.tipo && this.catalogoAvicola.length > 0) {
      return new Observable( observador => {
        observador.next(this.catalogoAvicola);
        observador.complete();
      });
    }
    this.tipo = tipo;
    const url = environment.URL_SERVICIOS + 'catalogos/catalogoAvicola&tipo=' + tipo;
    return this.http.get(url).pipe(
      map((resp: any) => {
        this.catalogoAvicola = resp.resultado;
        return resp.resultado;
      })
    );
  }

  // Método que permite obtener provincias por el id del pais.
  getClasificacionProductor(tipo: string): Observable<any> {
    if ( tipo === this.tipo && this.catalogoAvicola.length > 0) {
      return new Observable( observador => {
        observador.next(this.catalogoAvicola);
        observador.complete();
      });
    }
    this.tipo = tipo;
    const url = environment.URL_SERVICIOS + 'catalogos/catalogoAvicola&tipo=' + tipo;
    return this.http.get(url).pipe(
      map((resp: any) => {
        this.catalogoAvicola = resp.resultado;
        return resp.resultado;
      })
    );
  }

  // Método que permite obtener provincias por el id del pais.
  getProductosProductor(tipo: string): Observable<any> {
    if ( tipo === this.tipo && this.catalogoAvicola.length > 0) {
      return new Observable( observador => {
        observador.next(this.catalogoAvicola);
        observador.complete();
      });
    }
    this.tipo = tipo;
    const url = environment.URL_SERVICIOS + 'catalogos/catalogoAvicola&tipo=' + tipo;
    return this.http.get(url).pipe(
      map((resp: any) => {
        this.catalogoAvicola = resp.resultado;
        return resp.resultado;
      })
    );
  }

  // Método que permite obtener provincias por el id del pais.
  getMotivo(tipo: string): Observable<any> {
    if ( tipo === this.tipo && this.catalogoAvicola.length > 0) {
      return new Observable( observador => {
        observador.next(this.catalogoAvicola);
        observador.complete();
      });
    }
    this.tipo = tipo;
    const url = environment.URL_SERVICIOS + 'catalogos/catalogoAvicola&tipo=' + tipo;
    return this.http.get(url).pipe(
      map((resp: any) => {
        this.catalogoAvicola = resp.resultado;
        return resp.resultado;
      })
    );
  }


}
