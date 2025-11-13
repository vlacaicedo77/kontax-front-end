import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

// Importamos modelo: historia-bovino.
import { HistoriaBovino } from 'src/app/modelos/historia-bovino.modelo';

@Injectable({
  providedIn: 'root'
})
export class HistoriaBovinoService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene las historias de bovinos enviando varios parámetros
  obtenerHistoriaBovinoPorFiltro(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'historia_bovino';
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => respuesta.resultado )
    );
  }

  // Método para registrar un Sitio
  crearHistoriaBovino(historiaBovino: HistoriaBovino) {
    const url = environment.URL_SERVICIOS + 'historia_bovino/';
    return this.http.post(url, historiaBovino).pipe(
      map( resp => resp )
    );
  }
}
