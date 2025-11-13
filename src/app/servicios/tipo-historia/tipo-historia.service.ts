import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Importamos la URL del request para los servicios
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoHistoriaService {

  public response;

  constructor(public http: HttpClient) { 
   }

  // Método que permite obtener el catálogo de tipos de Historias
  getTiposHistoria(): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/tiposHistorias';
    return this.http.get(url).pipe(
      map((resp: any) =>  {
        return resp.resultado;
      })
    );
  }
}