import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedorIdentificadorService {

  constructor(public http: HttpClient) { }

  // Método que permite obtener los proveedores de identificacion
  getProveedores() {
    const url = environment.URL_SERVICIOS + 'proveedores_identificacion';
    return this.http.get(url).pipe(
      map((resp: any) =>  {
          return resp.resultado;
      } )
    );
  }
}