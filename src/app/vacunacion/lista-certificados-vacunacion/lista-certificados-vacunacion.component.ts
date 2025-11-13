import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import Swal from 'sweetalert2';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { CertificadoVacunacion } from '../../modelos/certificado-vacunacion.modelo';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';

@Component({
  selector: 'app-lista-certificados-vacunacion',
  templateUrl: './lista-certificados-vacunacion.component.html',
  styleUrls: ['./lista-certificados-vacunacion.component.css']
})
export class ListaCertificadosVacunacionComponent implements OnInit {

  formularioFaseVacunacion: FormGroup;
  listaFasesVacunaciones: FaseVacunacion[];
  usuarioBrigadistaActual: Usuario;
  listaDigitadorasOficinas: PersonaOficina[];
  operadoraVacunacion: OperadoraVacunacion;
  personaOficinaSeleccionada: PersonaOficina = null;
  listaCertificadosUnicosVacunacion: CertificadoVacunacion[] = [];
  nombrePDF: string = 'documento';
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioPersonaOficina: PersonaOficinaService,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService,
    private servicioVisorPdf: VisorPdfService
  ) { 
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioFaseVacunacion();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.usuarioBrigadistaActual = this.servicioUsuario.usuarioExterno;
      this.obtenerCertificadosVacunaciones({
        idUsuarioDigitador: this.usuarioBrigadistaActual.idUsuario,
        idFaseVacunacion: '2',
        INICIO: this.inicio,
        LIMITE: this.fin
      });
      this.obtenerFasesVacunacion();
    }
  }

  /**
   * Inicializa el formulario para la fase de vacunación
   */
  inicializarFormularioFaseVacunacion(){
    this.formularioFaseVacunacion = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_vacunacion: new FormControl(null, Validators.required)
    });
  }

  /**
   * Obtiene la lista de fasesde vacunación habilitadas
   */
  obtenerFasesVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Fases de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaFasesVacunaciones = [];
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( (fases: FaseVacunacion[]) => {
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Busca el personal y oficinas
   */
  cambioFaseVacunacion(){
    this.obtenerPersonalOficina();
    this.formularioFaseVacunacion.controls.oficina_vacunacion.setValue(null);
  }
  
  /**
   * Obtiene la lista de oficinas por digitadoras
   */
  obtenerPersonalOficina(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Fases de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaDigitadorasOficinas = [];
    this.servicioPersonaOficina.obtenerPersonalDeOficina({
      idFaseVacunacion: this.formularioFaseVacunacion.value.fase_vacunacion,
      idUsuarioExternoPersona: this.usuarioBrigadistaActual.idUsuario,
      codigoTipoPersona: 'DIG'
    })
    .subscribe( (personalOficinas: PersonaOficina[]) => {
      this.listaDigitadorasOficinas = personalOficinas;
      Swal.close();
    });
  }

  /**
   * Busca los certificados de vacunación y la operadora de vacunación relacionada
   */
  cambioOficina(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.operadoraVacunacion = null;
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion({
      idFaseVacunacion: this.formularioFaseVacunacion.value.fase_vacunacion,
      idOperadora: this.personaOficinaSeleccionada.idOperadora
    })
    .subscribe( (listaOperadoras: OperadoraVacunacion[]) => {
      if ( listaOperadoras.length > 0 ){
        this.operadoraVacunacion = listaOperadoras[0];
      }
      Swal.close();
      this.obtenerCertificadosVacunaciones({

      });
    });
  }

  /**
   * Permite consultar los certificados de vacunación emitidos por una oficina.
   * @param parametros 
   */
  obtenerCertificadosVacunaciones(parametros: any){
    this.listaCertificadosUnicosVacunacion = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando certificados de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoVacunacion.obtenerCertificadosVacunaciones(parametros)
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosUnicosVacunacion = certificados;
      //console.log('Certificados registraods: ', this.listaCertificadosUnicosVacunacion);
      Swal.close();
    });
  }

  /**
   * Descargar certificado de vacunación en PDF
   * @param id 
   */
  descargarCertificadoVacunacion(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando certificado de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoVacunacion.obtenerPdfCertificadoUnicoVacunacion(id, false)
    .subscribe( (respuesta: any) => {
      this.nombrePDF = respuesta.nombreArchivo;
      this.servicioVisorPdf.establecerArchivoDesdeBase64( respuesta.contenido );
      this.servicioVisorPdf.abrir();
      Swal.close();
      console.log(respuesta);
    });
  }
  /**
   * Obtenemos la página anterior
   */
  anterior(){
    this.inicio = this.inicio - this.rango;
    this.obtenerCertificadosVacunaciones({
      idUsuarioDigitador: this.usuarioBrigadistaActual.idUsuario,
      idFaseVacunacion: '2',
      INICIO: this.inicio,
      LIMITE: this.fin
    });
  }
  /**
   * Obtenemos la página siguiente
   */
  siguiente(){
    this.inicio = this.inicio + this.rango;
    this.obtenerCertificadosVacunaciones({
      idUsuarioDigitador: this.usuarioBrigadistaActual.idUsuario,
      idFaseVacunacion: '2',
      INICIO: this.inicio,
      LIMITE: this.fin
    });
  }


}
