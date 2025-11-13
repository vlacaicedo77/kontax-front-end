import { Injectable } from '@angular/core';
import { EstadoDocumento } from '../../modelos/estado-documento.modelo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoDocumentoService {

  private estadosDocumentos: EstadoDocumento[] = [];

  constructor(
    private http: HttpClient
  ) { }

  // Método que obtiene los estados de los documentos
  obtenerEstadosDocumentos(): Observable<any> {
    if ( this.estadosDocumentos.length > 0 ) {
      return new Observable( observador => {
        observador.next(this.estadosDocumentos);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/estadosDocumentos';
    return this.http.get(url).pipe(
      map( (respuesta: any) => {
        this.estadosDocumentos = respuesta.resultado;
        return respuesta.resultado;
      })
    );
  }


}
