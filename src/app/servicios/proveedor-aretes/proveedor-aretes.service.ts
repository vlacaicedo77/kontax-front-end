import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// Importamos modelo: ProveedoresAretes.
import { ProveedoresAretes } from 'src/app/modelos/proveedores-aretes.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProveedorAretesService {

  constructor(public http: HttpClient) { }

  // Método para registrar un proveedor de aretes oficiales
  registrarProveedorAretes(proveedor: ProveedoresAretes) {
    const url = environment.URL_SERVICIOS + 'proveedores_aretes/';
    return this.http.post(url, proveedor).pipe(
      map( resp => resp )
    );
  }

  // Método que permite obtener los proveedores de aretes
  obtenerProveedorAretes(parametros: {}) {
    const url = environment.URL_SERVICIOS + 'proveedores_aretes';
    return this.http.get(url, { params: parametros}).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método para actualizar proveedores de aretes
  actualizarProveedor(proveedor: ProveedoresAretes){
    const url = environment.URL_SERVICIOS + 'proveedores_aretes/' + proveedor.idProveedoresAretes;
    return this.http.patch(url, proveedor).pipe(
      map( (resp: any) => {
        return resp;
      } )
    );
  }

}