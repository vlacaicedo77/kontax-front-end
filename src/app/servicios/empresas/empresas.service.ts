import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
// Importamos modelo: Empresas
import { Empresas } from '../../modelos/empresas.modelo';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {

  constructor(public http: HttpClient) { }


  // Método que permite obtener los proveedores de aretes
  consultarEmpresas(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'empresas';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método para registrar un proveedor de aretes oficiales
  registrarEmpresas(modelo: Empresas) {
    const url = environment.URL_SERVICIOS + 'empresas/';
    return this.http.post(url, modelo).pipe(
      map( resp => resp )
    );
  }

  // Método para actualizar proveedores de aretes
  actualizarProveedor(modelo: Empresas){
    const url = environment.URL_SERVICIOS + 'proveedores_aretes/' + modelo.idEmpresa;
    return this.http.patch(url, modelo).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

  // Método para cargar el certificado digital (.p12)
  cargarCertificadoDigital(ruc: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('certificado', archivo);
    formData.append('ruc', ruc); // Enviar el RUC para identificar el archivo

    const url = `${environment.URL_SERVICIOS}archivo_certificado_digital`;
    return this.http.post(url, formData).pipe(
      map((resp: any) => resp)
    );
  }

  // Método para eliminar el certificado digital
  eliminarCertificadoDigital(ruc: string): Observable<any> {
    const url = `${environment.URL_SERVICIOS}archivo_certificado_digital/${ruc}`;
    return this.http.delete(url).pipe(
      map((resp: any) => resp)
    );
  }

  // Método para verificar si existe certificado (opcional)
  verificarCertificadoDigital(ruc: string): Observable<{ existe: boolean }> {
    const url = `${environment.URL_SERVICIOS}verificar_certificado/${ruc}`;
    return this.http.get<{ existe: boolean }>(url);
  }

  // Método para actualizar estado en la BD (boolean)
  actualizarEstadoCertificado(ruc: string, tieneCertificado: boolean): Observable<any> {
    const url = `${environment.URL_SERVICIOS}actualizar_estado_certificado`;
    const datos = {
      ruc: ruc,
      tiene_certificado: tieneCertificado
    };
    return this.http.put(url, datos);
  }

}