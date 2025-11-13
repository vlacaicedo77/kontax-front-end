import { Injectable } from '@angular/core';
import { TiposProveedoresAretes } from '../../modelos/tipos-proveedores-aretes.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposProveedoresAretesService {

  private tiposProveedoresAretes: TiposProveedoresAretes[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene el catálogo de tipos de proveedores de aretes oficiales
  obtenerTiposProveedoresAretes(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.tiposProveedoresAretes.length > 0) {
      return new Observable(observador => {
        observador.next(this.tiposProveedoresAretes);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/tiposProveedoresAretes`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.tiposProveedoresAretes = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}
