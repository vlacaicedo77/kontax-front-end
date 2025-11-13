import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class TipoOperadoraService {

  constructor(
    private http: HttpClient
  ) { }

  obtenerTiposOperadoras(){
    const url = `${environment.URL_SERVICIOS}catalogos/tiposOperadoras`;
    return this.http.get(url).pipe(
      map((resp: any) =>  {
        return resp.resultado;
      })
    );

  }
}
