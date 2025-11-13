import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(
    public http: HttpClient
  ) { }

  // Método que permite obtener las categorías de los catálogos.
  obtenerCategorias() {
    const url = environment.URL_SERVICIOS + 'catalogos/categorias';
    return this.http.get(url).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
