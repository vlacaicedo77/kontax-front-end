import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ThrowStmt } from '@angular/compiler';
import { RegistroSitioModalService } from './servicios/registro-sitio-modal.service';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Provincia } from '../../modelos/provincia.modelo';
import { ProvinciaService } from '../../servicios/provincia/provincia.service';
import Swal from 'sweetalert2';
import { CantonService } from '../../servicios/canton/canton.service';
import { Canton } from '../../modelos/canton.modelo';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';
import { TipoPropiedadService } from '../../servicios/tipo-propiedad/tipo-propiedad.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Sitio } from '../../modelos/sitio.modelo';
import { SitioService } from '../../servicios/sitio/sitio.service';

@Component({
  selector: 'app-registro-sitio-modal',
  templateUrl: './registro-sitio-modal.component.html',
  styleUrls: ['./registro-sitio-modal.component.css']
})
export class RegistroSitioModalComponent implements OnInit {

  formularioSitio: FormGroup;
  listaUsuariosExternos: UsuarioExterno[];
  listaProvincias: Provincia[];
  listaCantones: Canton[];
  listaParroquias: Parroquia[];
  listaTiposPropiedades = [];

  constructor(
    public servicioRegistroSitioModal: RegistroSitioModalService,
    private servicioProvincia: ProvinciaService,
    private servicioCanton: CantonService,
    private servicioParroquia: ParroquiaService,
    private servicioTipoPropiedad: TipoPropiedadService,
    private servicioUsuario: UsuarioService,
    private servicioSitio: SitioService
  ) {
   }

  ngOnInit(): void {
    this.listaUsuariosExternos = [];
    this.inicializarFormulario();
    this.obtenerProvincias();
    this.obtenerTiposPropiedades();
  }

  /**
   * Inicializa el formulario
   */
  inicializarFormulario(){
    console.log('Inicializar formulario');
    this.formularioSitio = new FormGroup({
      ci_ruc: new FormControl(null),
      usuario_externo: new FormControl(null, Validators.required),
      nombre_predio: new FormControl(null, Validators.required),
      superficie: new FormControl(null, Validators.required),
      pais: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      canton: new FormControl(null, Validators.required),
      parroquia: new FormControl(null, Validators.required),
      codigo_predial: new FormControl(null),
      calle_principal: new FormControl(null, Validators.required),
      interseccion: new FormControl(null, Validators.required),
      numeracion: new FormControl(null, Validators.required),
      referencia: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
      latitud: new FormControl(null, Validators.required),
      longitud: new FormControl(null, Validators.required),
      tipo_propiedad: new FormControl(null, Validators.required)
    });
    this.formularioSitio.controls.pais.setValue(19);
    this.formularioSitio.controls.latitud.setValue(-1.831239);
    this.formularioSitio.controls.longitud.setValue(-78.18340);
  }
  /**
   * Cierra el panel
   */
  cerrarPanel(){
    this.formularioSitio.reset();
    this.servicioRegistroSitioModal.cerrar();
  }

  /**
   * Agrega un nuevo sitio
   */
  registrarSitio(){
    this.formularioSitio.markAllAsTouched();
    if ( this.formularioSitio.invalid ) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando el nuevo predio',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    const sitio = new Sitio();
    sitio.idUsuariosExternos = this.formularioSitio.value.usuario_externo;
    sitio.nombre = this.formularioSitio.value.nombre_predio;
    sitio.superficieHa = this.formularioSitio.value.superficie;
    sitio.idPais = this.formularioSitio.value.pais;
    sitio.idProvincia = this.formularioSitio.value.provincia;
    sitio.idCanton = this.formularioSitio.value.canton;
    sitio.idParroquia = this.formularioSitio.value.parroquia;
    sitio.callePrincipal = this.formularioSitio.value.calle_principal;
    sitio.interseccion = this.formularioSitio.value.interseccion;
    sitio.numeracion = this.formularioSitio.value.numeracion;
    sitio.referencia = this.formularioSitio.value.referencia;
    sitio.telefono = this.formularioSitio.value.telefono;
    sitio.latitud = this.formularioSitio.value.latitud;
    sitio.longitud = this.formularioSitio.value.longitud;
    sitio.idTipoPropiedad = this.formularioSitio.value.tipo_propiedad;
    if (this.formularioSitio.value.codigo_predial){
      sitio.codigoPredial = this.formularioSitio.value.codigo_predial;
    }
    console.log(sitio);
    this.servicioSitio.registrarSitio(sitio)
    .subscribe( (respuesta: any) => {
      this.formularioSitio.reset();
      // console.log(respuesta);
      Swal.fire('Éxito', 'El predio fue registrado correctamente', 'success');
    });
    this.formularioSitio.controls.latitud.setValue(-1.831239);
    this.formularioSitio.controls.longitud.setValue(-78.18340);
  }

  /**
   * Permite buscar un ciudadano
   */
  buscarCiudadano(){
    if ( !this.formularioSitio.value.ci_ruc ) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información del ciudadano.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.consultarUsuarioExternoFiltros({
      numeroIdentificacion: this.formularioSitio.value.ci_ruc
    })
    .subscribe( (respuesta) => {
      console.log('Usuarios: ', respuesta);
      if (respuesta.resultado) {
        this.listaUsuariosExternos = respuesta.resultado;
      }
      Swal.close();
    });
  }

  /**
   * Obtiene las provincias
   */
  obtenerProvincias(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando provincias',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.listaProvincias = [];
    this.servicioProvincia.getProvinciasPorPais(this.formularioSitio.value.pais)
    .subscribe( (respuesta: any) => {
      this.listaProvincias = respuesta;
      Swal.close();
    });
    this.formularioSitio.controls.canton.setValue(null);
    this.listaCantones = [];
    this.formularioSitio.controls.parroquia.setValue(null);
    this.listaParroquias = [];
  }

  /**
   * Busca los cantones de la provincia seleccionada.
   */
  cambioProvincia(){
    this.obtenerCantones();
  }

  /**
   * Obtiene la lista de cantones de una provincia
   */
  obtenerCantones(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando cantones',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.listaCantones = [];
    this.servicioCanton.getCantonesPorProvincia(this.formularioSitio.value.provincia)
    .subscribe( (cantones: any) => {
      this.listaCantones = cantones;
      Swal.close();
    });
  }

  /**
   * Se ejecuta cuando se cambia de cantón
   */
  cambioCanton(){
    this.obtenerParroquias();
    this.formularioSitio.controls.parroquia.setValue(null);
  }

  /**
   * Obtiene la lista de parroquias de un cantón
   */
  obtenerParroquias(){
    this.listaParroquias = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando cantones',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioParroquia.getParroquiasPorCanton(this.formularioSitio.value.canton)
    .subscribe( (respuesta) => {
      this.listaParroquias = respuesta;
      Swal.close();
    });
  }

  obtenerTiposPropiedades(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando tipos de propiedades',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioTipoPropiedad.getTiposPropiedad()
    .subscribe( respuesta => {
      this.listaTiposPropiedades = respuesta;
      Swal.close();
    });
  }

}
