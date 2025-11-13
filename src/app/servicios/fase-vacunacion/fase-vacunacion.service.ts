import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaseVacunacionService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que permite crear una nueva fase de vacunación.
  nuevaFaseVacunacion(faseVacunacion: FaseVacunacion) {
    const url = environment.URL_SERVICIOS + 'fase_vacunacion';
    return this.http.post(url, faseVacunacion).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que obtiene las fases de vacunacion por filtros.
  obtenerFasesVacunacion(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'fase_vacunacion';
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que permite finalizar la fase de vacunación.
  finalizarFaseVacunacion(idenficador: number){
    const url = environment.URL_SERVICIOS + `finalizar_fase_vacunacion/${idenficador}`;
    return this.http.patch(url, {}).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Actualizar la fase de vacunación.
  actualizarFaseVacunación(faseVacunacion: FaseVacunacion) {
    const url = environment.URL_SERVICIOS + 'fase_vacunacion';
    return this.http.patch(url, faseVacunacion).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
