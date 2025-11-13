import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { TipoEmisionCertificado } from '../../modelos/tipo-emision-certificado.modelo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoEmisionCertificadoService {

  private tiposEmisionesCertificados: TipoEmisionCertificado[] = [];

  constructor( private http: HttpClient ) { }

  obtenerTiposEmisionesCertificados(): Observable<any> {
    if (this.tiposEmisionesCertificados.length > 0) {
      return new Observable( observador => {
        observador.next(this.tiposEmisionesCertificados);
        observador.complete();
      });
    }
    const url = environment.URL_SERVICIOS + 'catalogos/tiposEmisionesCertificados';
    return this.http.get(url).pipe(
      map( (respuesta: any) => respuesta.resultado )
    );
  }
}
