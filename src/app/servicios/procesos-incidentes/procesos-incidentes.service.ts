import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcesosIncidentesService {

  public response;

  constructor(public http: HttpClient) { 

  }

  public getProcesosIncidentes(): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/procesosIncidentes';
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

}
