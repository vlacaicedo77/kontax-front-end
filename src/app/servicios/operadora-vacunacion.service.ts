import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OperadoraVacunacionService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que crea una nueva operadora de vacunación
  crearOperadoraVacunacion(operadoraVacunacion: any){
    const url = `${environment.URL_SERVICIOS}operadora_vacunacion`;
    return this.http.post(url, operadoraVacunacion)
    .pipe(
      map( (respuesta: any ) => {
        return respuesta.resultado;
      })
      );
  }

  // Método que obtiene las operadoras de vacunación
  obtenerOperadorasVacunacion(parametros: any){
    const url = `${environment.URL_SERVICIOS}operadoras_vacunaciones`;
    return this.http.get(url,{
      params: parametros
    })
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  // Método que habilita a una operadora de vacunación
  habilitarOperadoraVacunacion(idOperadora: number){
    const url = `${environment.URL_SERVICIOS}habilitar_operadora/${idOperadora}`;
    return this.http.patch(url, {}).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
    
  }

}
