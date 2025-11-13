import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioPdfService {

  constructor(
    public http: HttpClient
  ) { }
  // Método para cargar el archivo de confirmación de entrega
  cargarDocumentoPdf(nombreArchivo: string, archivo){
    const url = environment.URL_SERVICIOS + 'documento_productor_avicola/' + nombreArchivo;
    return this.http.post(url, archivo).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para descargar el archivo de confirmación de entrega
  descargarDocumentoPdfXNombre(nombreArchivo: string) {
    const httpOptions = {
    responseType: 'blob' as 'json'};
    const url = environment.URL_SERVICIOS + 'documento_productor_avicola/' + nombreArchivo;
    console.log("url_:",url, "httpOptions_:",httpOptions);
    return this.http.get(url, httpOptions);
  }
}
