import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CostoVacunaService {

  private propiedadesCatalogo: any [] = [];

  constructor(public http: HttpClient) { }

  // Método que obtiene el catálogo de estados de solicitudes
  obtenerCatalogo(parametros?: any): Observable<any> {
    // Si no hay parámetros y ya se tienen datos cacheados, retornarlos directamente
    if (!parametros && this.propiedadesCatalogo.length > 0) {
      return new Observable(observador => {
        observador.next(this.propiedadesCatalogo);
        observador.complete();
      });
    }
    // Construir la URL con los parámetros opcionales
    const url = `${environment.URL_SERVICIOS}catalogos/costoVacuna`;
    return this.http.get(url, { params: parametros }).pipe(
      map((respuesta: any) => {
        // Actualizar el cache solo si no se usaron parámetros
        if (!parametros) {
          this.propiedadesCatalogo = respuesta.resultado;
        }
        return respuesta.resultado;
      })
    );
  }

}

