import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PopupGeneralService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene parámetros del pop up general
  obtenerPopupGeneral(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'catalogos/popupGeneral';
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
