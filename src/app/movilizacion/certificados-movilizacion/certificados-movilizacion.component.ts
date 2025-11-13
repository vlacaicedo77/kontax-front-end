import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import Swal from 'sweetalert2';
import { FormGroup, FormControl } from '@angular/forms';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';

@Component({
  selector: 'app-certificados-movilizacion',
  templateUrl: './certificados-movilizacion.component.html',
  styleUrls: ['./certificados-movilizacion.component.css']
})
export class CertificadosMovilizacionComponent implements OnInit {

  formulario: FormGroup;
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaProductores: UsuarioExterno[] = [];

  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    public servicioUsuario: UsuarioService,
    private servicioCertificadoMovilizacion: CertificadoMovilizacionService,
    private servicioVisorPdf: VisorPdfService
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    /*if ( this.servicioUsuario.usuarioExterno ) {
      this.obtenerCertificadosMovilizacion({
        idProductor: this.servicioUsuario.usuarioExterno.idUsuario,
        INICIO: this.inicio,
        LIMITE: this.fin
      });
    }*/
  }

  inicializarFormulario(){
    this.formulario = new FormGroup({
      propietario_animales: new FormControl(null),
      ci: new FormControl(null)
    });
  }

  obtenerCertificadosMovilizacion( parametros: any ){
    this.listaCertificadosMovilizacion = [];
    Swal.fire({
      title: 'Buscando Certificados de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacion(parametros)
    .subscribe( (certificados: CertificadoMovilizacion[]) => {
      this.listaCertificadosMovilizacion = certificados;
      Swal.close();
    });

  }

  cambioProductor(){
    this.listaCertificadosMovilizacion = [];
    if ( this.formulario.value.propietario_animales) {
      this.obtenerCertificadosMovilizacion({
        idProductor: this.formulario.value.propietario_animales,
        INICIO: this.inicio,
        LIMITE: this.fin
      });
    }
  }

  buscarProductores(){
    this.formulario.controls.propietario_animales.setValue(null);
    this.listaProductores = [];
    if ( this.formulario.value.ci ) {
      if ( this.formulario.value.ci.length) {
        Swal.fire({
          title: 'Buscando Productores...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioUsuario.filtrarUsuariosExternos({
          numeroIdentificacion: this.formulario.value.ci
        }).subscribe( (usuarios: UsuarioExterno[]) => {
          this.listaProductores = usuarios;
          Swal.close();
        });
      } else {
        Swal.fire('Error', 'Ingrese el RUC o CI de un productor.','error');
      }
    } else {
      Swal.fire('Error', 'Ingrese el RUC o CI de un productor.','error');
    }
  }

  /**
   * Se confirma un Certificado de Movilización
   * @param id 
   */
  confirmarCertificado(id: number){
    Swal.fire({
      title: 'Confirmar Certificado de Movilización',
      text: '¿Desea confirmar el Certificado de Movilización?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡Confirmar!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Confirmando Certificado de Movilizació...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioCertificadoMovilizacion.confimarCertificadoMovilizacion(id)
        .subscribe( (respuesta: any) => {
          Swal.fire('Éxito', 'Certificado de Movilización Confirmado correctamente.', 'success');
          this.obtenerCertificadosMovilizacion({
            idProductor: this.servicioUsuario.usuarioExterno.idUsuario,
            INICIO: this.inicio,
            LIMITE: this.fin
          });
        });
      }
    });

  }
  /**
   * Anula un Certificado de Movilización
   * @param id 
   */
  anularCertificado(id: number){
    Swal.fire({
      title: 'Anular Certificado de Movilización',
      text: '¿Desea anular el Certificado de Movilización?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡Anular!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Anulando Certificado de Movilización...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioCertificadoMovilizacion.anularCertificadoMovilizacion(id)
        .subscribe( (respuesta: any) => {
          Swal.fire('Éxito', 'Certificado de Movilización Anulado correctamente.', 'success');
        });
      }
    });
  }

  recargarCertificadosMovilizacion(){
    const parametros: any = {};
    if ( this.formulario.value.propietario_animales) {
      parametros.idProductor = this.formulario.value.propietario_animales;
    }
    if ( this.servicioUsuario.usuarioExterno ) {
      parametros.idProductor = this.servicioUsuario.usuarioExterno.idUsuario;
    }
    this.obtenerCertificadosMovilizacion(parametros);
  }

  /**
   * Muestra el panel para visualizar el Certificado de Movilización
   * @param id 
   */
  descargarCertificadoMovilizacion(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando el Certificado de Movilización.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoMovilizacion.obtenerPdfCertificadoMovilizacion(id, true)
    .subscribe( (resp: any) => {
      console.log(resp);
      Swal.close();
      this.servicioVisorPdf.establecerArchivoDesdeBase64(resp.contenido);
      this.servicioVisorPdf.abrir();
    });
  }

  /**
   * Obtenemos la página anterior
   */
  anterior(){
    this.inicio = this.inicio - this.rango;
    this.obtenerCertificadosMovilizacion({
      idProductor: this.servicioUsuario.usuarioExterno.idUsuario,
      INICIO: this.inicio,
      LIMITE: this.fin
    });
  }
  /**
   * Obtenemos la página siguiente
   */
  siguiente(){
    this.inicio = this.inicio + this.rango;
    this.obtenerCertificadosMovilizacion({
      idProductor: this.servicioUsuario.usuarioExterno.idUsuario,
      INICIO: this.inicio,
      LIMITE: this.fin
    });
  }

}
