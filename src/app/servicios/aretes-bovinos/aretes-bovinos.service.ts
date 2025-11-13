import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { BajaArete } from '../../modelos/baja-arete.modelo';
import { AreteBovino } from 'src/app/modelos/arete-bovino.modelo';

@Injectable({
  providedIn: 'root'
})
export class AretesBovinosService {

  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método que permite obtener los aretes oficiales
  obtenerAretes(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'aretes_bovinos';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite registrar la baja de un bovino.
  registrarBajaArete(bajaArete: BajaArete) {
    const url = environment.URL_SERVICIOS + 'baja_arete';
    return this.http.post(url, bajaArete).pipe(
      map ( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método para actualizar info de aretes oficiales
  actualizarArete(aretesOficiales: AreteBovino) {
    const url = environment.URL_SERVICIOS + 'aretes_bovinos/' + aretesOficiales.idAretesBovinos;
    return this.http.patch(url, aretesOficiales).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para tranferir aretes oficiales
  transferirAretes(datosTransferencia: any){
    const url = `${environment.URL_SERVICIOS}aretes_bovinos`;
    return this.http.post(url, datosTransferencia).pipe(
      map ( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  
}
