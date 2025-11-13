import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PurezaService {

  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  obtenerPurezas() {
    const url = environment.URL_SERVICIOS + 'catalogos/purezas';
    return this.http.get( url ).pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

}
