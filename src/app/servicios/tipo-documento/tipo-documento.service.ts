import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TipoDocumento } from '../../modelos/tipo-documento.modelo';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {

  private tiposDocumentos: TipoDocumento[] =  [];

  constructor(
    private http: HttpClient
  ) { }

  obtenerTiposDocumentos() {
    
  }
}
