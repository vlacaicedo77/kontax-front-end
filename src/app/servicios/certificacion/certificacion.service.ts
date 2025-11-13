import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificacionService {

  constructor(public http: HttpClient)
  { }

 // Método que permite obtener los sitios por el id de usuario.
getCertificaciones() {
  const url = environment.URL_SERVICIOS + 'catalogos/tiposCertificaciones';
  return this.http.get(url).pipe(
    map((resp: any) =>  {
        return resp.resultado;
    } )
  );
}
}
