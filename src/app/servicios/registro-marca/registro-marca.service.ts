import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Importamos modelo: registro-marca.
import { RegistroMarca } from 'src/app/modelos/registro-marca.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroMarcaService {

  registroMarca: RegistroMarca;

  // Constructor de la clase
  constructor(
    public http: HttpClient
  ) { }

  // Método para registrar un Sitio
  crearRegistroMarca(registroMarca: RegistroMarca) {
    const url = environment.URL_SERVICIOS + 'registros_marcas/';
    return this.http.post(url, registroMarca).pipe(
      map( resp => resp )
    );
  }

  // Método para actualizar un sitio
  actualizarRegistroMarca(registroMarca: RegistroMarca){
    const url = environment.URL_SERVICIOS + 'registros_marcas/';
    return this.http.patch(url, registroMarca).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para cargar el archivo de imagen de una marca
  cargarImagenMarca(nombreArchivo: string, archivo){
    const url = environment.URL_SERVICIOS + 'imagenes_marcas/' + nombreArchivo;
    return this.http.post(url, archivo).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para descargar el archivo de imagen de una marca
  descargarImagenMarca(nombreArchivo: string){
  const httpOptions = {
  responseType: 'blob' as 'json'};
  const url = environment.URL_SERVICIOS + 'imagenes_marcas/' + nombreArchivo;

  return this.http.get(url, httpOptions);

}

  // Método que permite obtener un registro de marca por su id
  consultarRegistroMarcaPorId(idRegistro: number) {
    const url = environment.URL_SERVICIOS + 'registros_marcas/' + idRegistro;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener registros de marca por varios filtros.
  consultarRegistrosMarcasPorFiltros(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'registros_marcas';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener registros de marca en formato reporte por varios filtros.
  consultarReporteRegistrosMarcasPorFiltros(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'reporte_marcas';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }
}
