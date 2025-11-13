import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CriteriosIncidentesService {

  public response;

  constructor(public http: HttpClient) { 

  }

  public getCriteriosIncidentes(): Observable<any> {
    const url = environment.URL_SERVICIOS + 'catalogos/criteriosIncidentes';
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }
}
