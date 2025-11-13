
import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
//Servicios
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';

@Component({
  selector: 'app-certificados-movilizacion-recibidos',
  templateUrl: './certificados-movilizacion-recibidos.component.html',
  styleUrls: ['./certificados-movilizacion-recibidos.component.css']
})
export class CertificadosMovilizacionRecibidosComponent implements OnInit {

  formulario: FormGroup;
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaProductores: UsuarioExterno[] = [];
  listaUsuariosCca: UsuarioExterno[] = [];

  inicio: number;
  fin: number;
  rango: number;

  formularioBusqueda: FormGroup;

  // Variables auxiliares
  usuarioActual: number;
  numeroCzpm: string = '';


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
    this.incializarFormularioBusqueda();
    /*if ( this.servicioUsuario.usuarioExterno ) {
      this.obtenerCertificadosMovilizacion({
        idPropietarioSitioDestino: this.servicioUsuario.usuarioExterno.idUsuario,
        INICIO: this.inicio,
        LIMITE: this.fin
      });
    }*/
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  incializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      numero_certificado: new FormControl(null, Validators.required)
    });
  }

  /**
   * Inicializa el formulario
   */
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
      if(this.listaCertificadosMovilizacion.length > 0)
      {
      this.numeroCzpm = certificados[0].codigo;
      }
      Swal.close();
    });

  }

  cambioProductor(){
    this.inicio = 0;
    this.fin = this.rango;
    this.listaCertificadosMovilizacion = [];
    if ( this.formulario.value.propietario_animales) {
      this.obtenerCertificadosMovilizacion({
        idPropietarioSitioDestino: this.formulario.value.propietario_animales,
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
      confirmButtonText: 'Sí, ¡Confirmar!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Confirmando Certificado de Movilización...',
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
            idPropietarioSitioDestino: this.servicioUsuario.usuarioExterno.idUsuario,
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
      confirmButtonText: 'Sí, ¡Anular!',
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
      parametros.idPropietarioSitioDestino = this.formulario.value.propietario_animales;
    }
    if ( this.servicioUsuario.usuarioExterno ) {
      parametros.idPropietarioSitioDestino = this.servicioUsuario.usuarioExterno.idUsuario;
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
    this.servicioCertificadoMovilizacion.obtenerPdfCertificadoMovilizacion(id, false)
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
      idPropietarioSitioDestino: this.servicioUsuario.usuarioExterno.idUsuario,
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
      idPropietarioSitioDestino: this.servicioUsuario.usuarioExterno.idUsuario,
      INICIO: this.inicio,
      LIMITE: this.fin
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
          Swal.fire('Éxito', 'CZPM-M N° '+this.numeroCzpm+ ' > '+accionTexto.toLocaleUpperCase(), 'success');
          this.listaCertificadosMovilizacion = [];
          this.formularioBusqueda.reset();
        });
      }
    });
  }

  /**
   * Buscar certificado de movilización
   */
  /*buscarCertificado2(){
    this.listaCertificadosMovilizacion = [];
    this.formularioBusqueda.markAllAsTouched();
    if ( this.formularioBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores.', 'error');
      return;
    }
    this.inicio = 0;
    this.fin = this.rango;

    this.formularioBusqueda.controls.numero_certificado.setValue(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));

    this.obtenerCertificadosMovilizacion({
      idPropietarioSitioDestino: this.servicioUsuario.usuarioExterno.idUsuario,
      codigo: `%${this.formularioBusqueda.value.numero_certificado}%`
    });
    //console.log(this.formularioBusqueda.value.numero_certificado.replace(/'/g, '-'));
  }*/


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
      idPropietarioSitioDestino: this.usuarioActual,
      codigo: `%${this.formularioBusqueda.value.numero_certificado}%`
      });

      Swal.close();
    });
  }

}
