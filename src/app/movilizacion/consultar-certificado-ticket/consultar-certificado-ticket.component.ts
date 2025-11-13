import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CertificadoMovilizacion } from 'src/app/modelos/certificado_movilizacion.modelo';
import Swal from 'sweetalert2';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { DetalleCertificadoMovilizacion } from 'src/app/modelos/detalle-certificado-movilizacion.modelo';

@Component({
  selector: 'app-consultar-certificado-ticket',
  templateUrl: './consultar-certificado-ticket.component.html',
  styleUrls: ['./consultar-certificado-ticket.component.css']
})
export class ConsultarCertificadoTicketComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  // Bovinos por Ticket
  CertificadoTicket: DetalleCertificadoMovilizacion[] = [];

  constructor(
    private servicioScript: ScriptsService,
    private servicioCertificadoMovilizacion: CertificadoMovilizacionService,
    private servicioVisorPdf: VisorPdfService,
    private certificadoMovilizacionServicio: CertificadoMovilizacionService,
    public servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioBusqueda();
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      numero_certificado: new FormControl(null, Validators.required)
    });
  }

  /**
   * Buscar certificado de movilización
   * @returns 
   */
  buscarCertificado(){
    this.listaCertificadosMovilizacion = [];
    this.formularioBusqueda.markAllAsTouched();
    if ( this.formularioBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores.', 'error');
      return;
    }
    //this.obtenerCertificadosMovilizacion();
    this.obtenerCertificadoTicket();
  }

  /**
   * Permite obtener los certificados de movilización que concuerden
   */
  obtenerCertificadosMovilizacion(){
    Swal.fire({
      title: 'Buscando Certificados de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this.formularioBusqueda.controls.numero_certificado.setValue(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));

    this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacion({
      codigo: `%${this.formularioBusqueda.value.numero_certificado}%`
    })
    .subscribe( (certificados: CertificadoMovilizacion[]) => {
      this.listaCertificadosMovilizacion = certificados;
      console.log(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));
      Swal.close();
    });
  }

  /**
   * Obtenemos CZPM de un bovino
   */
   obtenerCertificadoTicket(){
    this.CertificadoTicket = [];
    
    Swal.fire({
      title: 'Buscando Certificado de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.certificadoMovilizacionServicio.obtenerCertificadosMovilizacionTicket({
      idBovino: this.formularioBusqueda.value.numero_certificado.trim()
    })
    .subscribe( ( infoTicket: DetalleCertificadoMovilizacion[]) => {
      this.CertificadoTicket = infoTicket;
      Swal.close();
      this.formularioBusqueda.controls.numero_certificado.setValue(null);
    });
  }


  /**
   * Autoriza la salida del certificado de movilización
   * @param id 
   */
  autorizarSalida(id: number){
    Swal.fire({
      title: 'Autorizar salida de Certificado de Movilización',
      text: '¿Desea autorizar el Certificado de Movilización?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡Confirmar!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Autorizando Certificado de Movilización...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioCertificadoMovilizacion.autorizarCertificadoMovilizacion(id)
        .subscribe( (respuesta: any) => {
          Swal.fire('Éxito', 'Certificado de Movilización fue autorizado correctamente.', 'success');
          this.listaCertificadosMovilizacion = [];
          this.formularioBusqueda.reset();
        });
      }
    });
  }

  /**
   * Anula el certificado de movilización
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
          this.listaCertificadosMovilizacion = [];
          this.formularioBusqueda.reset();
        });
      }
    });
  }

  /**
   * Descarga el certificado de movilización original
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
    this.servicioCertificadoMovilizacion.obtenerPdfCertificadoMovilizacion(id, false)
    .subscribe( (resp: any) => {
      console.log(resp);
      Swal.close();
      this.servicioVisorPdf.establecerArchivoDesdeBase64(resp.contenido);
      this.servicioVisorPdf.abrir();
    });
  }

}
