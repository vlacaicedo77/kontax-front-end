import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VisorPdfService } from 'src/app/general/visor-pdf/servicio/visor-pdf.service';
import { CertificadoMovilizacion } from 'src/app/modelos/certificado_movilizacion.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
//Servicio
import { CertificadoMovilizacionService } from 'src/app/servicios/certificado-movilizacion/certificado-movilizacion.service';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autorizar-movilizacion-centros',
  templateUrl: './autorizar-movilizacion-centros.component.html',
  styleUrls: ['./autorizar-movilizacion-centros.component.css']
})
export class AutorizarMovilizacionCentrosComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaUsuariosCca: UsuarioExterno[] = [];

  inicio: number;
  fin: number;
  rango: number;

  // Variables auxiliares
  usuarioActual: number;
  numeroCzpm: string = '';

  constructor(
    private servicioScript: ScriptsService,
    private servicioCertificadoMovilizacion: CertificadoMovilizacionService,
    private servicioVisorPdf: VisorPdfService,
    public servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioBusqueda();
    //this.obtenerCertificadosMovilizacion({});
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
  buscarCertificado2(){
    this.listaCertificadosMovilizacion = [];
    this.formularioBusqueda.markAllAsTouched();
    if ( this.formularioBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores.', 'error');
      return;
    }

    this.formularioBusqueda.controls.numero_certificado.setValue(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));

    this.obtenerCertificadosMovilizacion({
      codigo: `%${this.formularioBusqueda.value.numero_certificado}%`
    });

    console.log(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));
  }

  /**
   * Permite obtener los certificados de movilización que concuerden
   */
  obtenerCertificadosMovilizacion2(parametros: any){
    Swal.fire({
      title: 'Buscando Certificados de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    parametros.idProductor = this.servicioUsuario.usuarioExterno.idUsuario;
    this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacion(parametros)
    .subscribe( (certificados: CertificadoMovilizacion[]) => {
      this.listaCertificadosMovilizacion = certificados;
      Swal.close();
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
      if(this.listaCertificadosMovilizacion.length > 0)
      {
      this.numeroCzpm = certificados[0].codigo;
      }
      Swal.close();
    });
  }

  /**
   * Buscar certificado de movilización
   */
   buscarCertificado(){
    this.listaCertificadosMovilizacion = [];
    this.formularioBusqueda.markAllAsTouched();
    if ( this.formularioBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores.', 'error');
      return;
    }
    this.inicio = 0;
    this.fin = this.rango;

    this.servicioUsuario.filtrarUsuariosCca({
      idUsuariosExternos: this.servicioUsuario.usuarioExterno.idUsuario,
      bandera: 'idUsuario'
    })
    .subscribe( (usuarios: UsuarioExterno[]) => {
      this.listaUsuariosCca = usuarios;

      if(usuarios.length >0)
      {
        const idUsuarioCca = new UsuarioExterno();
        this.listaUsuariosCca.forEach( (item: UsuarioExterno) => {
        idUsuarioCca.idUsuariosExternosCca = item.idUsuariosExternosCca;
        });

      // En caso de que exista, se asigna el Id del usuario del CCA como usuario actual
        this.usuarioActual = idUsuarioCca.idUsuariosExternosCca;
      }else
      {
        this.usuarioActual = this.servicioUsuario.usuarioExterno.idUsuario;
      }

      this.formularioBusqueda.controls.numero_certificado.setValue(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));

    this.obtenerCertificadosMovilizacion({
      idProductor: this.usuarioActual,
      codigo: `%${this.formularioBusqueda.value.numero_certificado}%`
      });

      Swal.close();
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
   * Actualiza el estado de un certificado de movilización
   * @param id 
   * @param accion
   */
   actualizarEstado(id: number, accion: string){

    let certificado = new CertificadoMovilizacion();
    certificado.idCertificadoMovilizacion = id;
    //certificado.usuarioEstado = localStorage.getItem('identificacion');
    var accionTexto = "";

  switch(accion)
  {
    case 'Confirmar': { 
      certificado.idEstadoDocumento="6";
      accionTexto = "confirmado";
      break; 
   }
    case 'Autorizar': { 
      certificado.idEstadoDocumento="7";
      accionTexto = "autorizado";
      break; 
   }
   case 'Anular': { 
    certificado.idEstadoDocumento="9";
    accionTexto = "anulado";
    break; 
  }
   default: { 
      break; 
   } 
  }

  //let numeroCzpm = this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-');
  //Mensaje de confirmación
Swal.fire({
  title: '¿'+accion.toLocaleUpperCase()+' CZPM-M N° '+this.numeroCzpm+'?',
  text: "¡Esta acción no podrá revertirse!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí, ¡ '+accion.toLocaleLowerCase()+' !',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Actualizando estado del CZPM-M...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
         this.servicioCertificadoMovilizacion.actualizarEstadoCertificadoMovilizacion(certificado)
        .subscribe( (respuesta: any) => {
          Swal.fire('Éxito', 'CZPM-M N° '+this.numeroCzpm+ ' - '+accionTexto.toLocaleUpperCase(), 'success');
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
  //anularCertificado(id: number){
  //  Swal.fire({
  //    title: 'Anular Certificado de Movilización',
  //    text: '¿Desea anular el Certificado de Movilización?',
  //    icon: 'warning',
  //    showCancelButton: true,
  //    confirmButtonColor: '#3085d6',
  //    cancelButtonColor: '#d33',
  //    confirmButtonText: 'Si, ¡Anular!',
  //    cancelButtonText: 'No'
  //  }).then((result) => {
  //    if (result.isConfirmed) {
  //      Swal.fire({
  //        title: 'Anulando Certificado de Movilización...',
  //        confirmButtonText: '',
  //        allowOutsideClick: false,
  //        onBeforeOpen: () => {
  //          Swal.showLoading();
  //        }
  //      });
  //      this.servicioCertificadoMovilizacion.anularCertificadoMovilizacion(id)
  //      .subscribe( (respuesta: any) => {
  //        Swal.fire('Éxito', 'Certificado de Movilización Anulado correctamente.', 'success');
  //        this.listaCertificadosMovilizacion = [];
  //        this.formularioBusqueda.reset();
  //      });
  //    }
  //  });
  //}

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
