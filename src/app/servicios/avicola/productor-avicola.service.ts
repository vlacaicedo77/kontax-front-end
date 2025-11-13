import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Importamos modelo: AvicolaIncubadoraComercializador.
import { AvicolaIncubadoraComercializador } from 'src/app/modelos/modelos-avicola/avicola-incubadora-comercializador.modelo';
import { DocumentosAdjuntos } from 'src/app/modelos/modelos-avicola/documentos-adjuntos.modelo';
import { FiltroProductorAvicola } from 'src/app/modelos/modelos-avicola/filtro-porductor-avicola.modelo';
import { environment } from '../../../environments/environment';
import { ResultadoInspeccion } from 'src/app/modelos/modelos-avicola/resultado-inspeccion.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProductorAvicolaService {

  avicolaIncubadoraComercializador: AvicolaIncubadoraComercializador;
  documentosAdjuntos: DocumentosAdjuntos;
  filtroProductorAvicola: FiltroProductorAvicola;
  resultadoInspeccion: ResultadoInspeccion;
  constructor(
    public http: HttpClient
  ) { }
  // Método para registrar un Sitio
  registrarAvicolaIncubadoraComercializador(avicolaIncubadoraComercializador: AvicolaIncubadoraComercializador) {
    const url = environment.URL_SERVICIOS + 'productor-avicola/';
    return this.http.post(url, avicolaIncubadoraComercializador).pipe(
      map( resp => resp )
    );
    
  }

  // Método que permite obtener los sitios por su id
  getListaProductorAvicola(tipo: any[]) {
    const url = environment.URL_SERVICIOS + 'lista-registros-productor/' + tipo;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por su id
  getDatosRegistroProductorAvicola() {
    const url = environment.URL_SERVICIOS + 'obtener-datos-registros-productor-exel/';
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por su id
  getObtenerRegistroProductor(codigo: number) {
    const url = environment.URL_SERVICIOS + 'obtener-registro-productor/' + codigo;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite los registros de productores por filtros
  getListaProductorAvicolaXFiltros(filtroProductorAvicola: FiltroProductorAvicola) {
    const filtroJson = JSON.stringify(filtroProductorAvicola);
    const url = environment.URL_SERVICIOS + 'lista-registros-productor-filtros/' + filtroJson;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );

  }

  // Método que permite obtener los sitios por su id
  getObtenerRegistroProductorXIdRegistro(codigo: number) {
    const url = environment.URL_SERVICIOS + 'obtener-registro-productor-id/' + codigo;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método para registrar un Sitio
  registrarResultadoInspeccion(resultadoInspeccion: ResultadoInspeccion) {
    const url = environment.URL_SERVICIOS + 'resultado-inspeccion/';
    return this.http.post(url, resultadoInspeccion).pipe(
      map( resp => resp )
    );
    
  }

  // Método que permite los registros de productores por filtros
  getListaHistorialInspecciones(codigo: number) {
    const url = environment.URL_SERVICIOS + 'obtener-historial-inspecciones/' + codigo;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite los registros de productores por filtros
  getDatosOperador(codigo: number) {
    const url = environment.URL_SERVICIOS + 'obtener-datos-operador-id/' + codigo;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por su id
  getDatosFuncionario(provincia: string) {
    const url = environment.URL_SERVICIOS + 'obtener-funcionarios/' + provincia;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  // Método para registrar un Sitio
  registrarEstadoProductor(objEstadoProductor: any) {
    const url = environment.URL_SERVICIOS + 'cambiar-estado-registro/';
    return this.http.post(url, objEstadoProductor).pipe(
      map( (resp: any) =>  {
        console.log("respuestaServicioooo_:",resp);
        return resp;
      })
    );
  }

  // Método que permite obtener los sitios por su id
  getDatosLugarFuncionario(cedula: string) {
    const url = environment.URL_SERVICIOS + 'obtener-lugar-funcionario/' + cedula;
    return this.http.get(url).pipe(
      map( (resp: any) =>  {
        return resp;
      })
    );
  }

  /**
   * Obtiene el PDF en base 64 del Certificado Sanitario de Movilización Interna
   */
  obtenerPdfCertificadoAvicola(objetoProductor: [], reimpresion: boolean = false){
    let parametros: any = {};
    if (reimpresion) {
      parametros = {
        accion: 'RI'
      };
    }else{
      parametros = objetoProductor;
    }

    const url = `${environment.URL_SERVICIOS}certificadoAvicola/`;
    return this.http.get(url, { params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta;
      })
    );
  }
  
   /**
   * Obtiene el PDF en base 64 del Certificado Sanitario de Movilización Interna
   */
   obtenerPdfCertificadoAvicolaPDF(objetoProductor: { id: number, rutaArchivo: string }, reimpresion: boolean = false) {
    let parametros: any = {};
    if (reimpresion) {
      parametros = {
        accion: 'RI'
      };
    } else {
      parametros = objetoProductor;
    }
  
    const url = `${environment.URL_SERVICIOS}recuperarCertificadoAvicola/`;
    return this.http.get(url, { params: parametros })
      .pipe(
        map((respuesta: any) => {
          return respuesta;
        })
      );
  }
  

  // 
  // Método para registrar un Sitio
  registrarRutaDocumento(documentosAdjuntos: DocumentosAdjuntos) {
    const url = environment.URL_SERVICIOS + 'ruta-documento/';
    return this.http.post(url, documentosAdjuntos).pipe(
      map( (resp: any) =>  {
        console.log("respuestaServicioRutaDocumento_:",resp);
        return resp;
      })
    );
  }
}
