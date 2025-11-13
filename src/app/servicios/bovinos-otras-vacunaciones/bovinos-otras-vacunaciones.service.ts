import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
// Importamos modelo
import { BovinosOtrasVacunaciones } from '../../modelos/bovinos-otras-vacunaciones.modelo';

@Injectable({
  providedIn: 'root'
})
export class BovinosOtrasVacunacionesService {

  constructor(public http: HttpClient) { }

  // Método para registrar otras vacunaciones
  registrarVacunacion(proveedor: BovinosOtrasVacunaciones) {
    const url = environment.URL_SERVICIOS + 'otras_vacunas/';
    return this.http.post(url, proveedor).pipe(
      map(resp => resp)
    );
  }

  // Método que permite obtener los registros de otras vacunaciones
  obtenerOtrasvacunaciones(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'otras_vacunas';
    return this.http.get(url, { params: parametros }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite la eliminación lógica de otras vacunaciones
  eliminarVacunacion(identificador: number) {
    const url = `${environment.URL_SERVICIOS}otras_vacunas/${identificador}`;
    return this.http.delete(url)
      .pipe(
        map((respuesta: any) => {
          return respuesta.resultado;
        })
      );
  }

}