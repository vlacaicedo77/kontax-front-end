import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SolicitudCorreccionCatastroBovino } from '../../modelos/solicitud-correccion-catastro-bovino.modelo';
import { map } from 'rxjs/operators';
import { observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudCorreccionCatastroService {

  constructor(
    private http: HttpClient
  ) { }

  // Método que permite registrar una nueva solicitud de corrección de catastro bovino
  nuevaSolicitudCorreccionCatastro(solicitudCorreccionCatastroBovino: SolicitudCorreccionCatastroBovino){
    const url = environment.URL_SERVICIOS + 'solicitud_correccion_catastro';
    return this.http.post( url,  solicitudCorreccionCatastroBovino).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }
  // Método que obtiene las solicitudes de correción de catastro bovino
  obtenerSolicitudesCorreccionesCatastro( parametros: {} ) {
    const url = environment.URL_SERVICIOS + 'solicitud_correccion_catastro';
    return this.http.get( url , {params: parametros} ).pipe(
      map ( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que rechaza la solicitud de correción.
  rechazarSolicitudCorreccionCatastro(identificador: number, observacionParametro: string){
    const url = environment.URL_SERVICIOS + 'rechazar_solicitud_correccion_catastro/' + identificador;
    return this.http.patch( url, { observacion: observacionParametro} )
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  // Método que autoriza la solicitud de corrección de catastro.
  aprobarSolicitudCorreccionCatastro(identificador: number, observacionParametro: string) {
    const url = environment.URL_SERVICIOS + 'aprobar_solicitud_correccion_catastro/' + identificador;
    return this.http.patch(url, { observacion: observacionParametro} )
    .pipe( map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
