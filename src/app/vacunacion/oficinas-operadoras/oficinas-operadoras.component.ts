import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { timeInterval } from 'rxjs/operators';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OficinaService } from '../../servicios/oficina.service';
import { Oficina } from '../../modelos/oficina.modelo';
import { Canton } from '../../modelos/canton.modelo';
import { CantonService } from '../../servicios/canton/canton.service';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';

@Component({
  selector: 'app-oficinas-operadoras',
  templateUrl: './oficinas-operadoras.component.html',
  styles: [
  ]
})
export class OficinasOperadorasComponent implements OnInit {

  panelOficinaNueva: Boolean;
  fasesVacunaciones: FaseVacunacion[];
  formularioFaseVacunacion: FormGroup;
  formularioOficina: FormGroup;
  listasOficinas: Oficina[];
  listaCantones: Canton[];
  listaParroquias: Parroquia[];
  private usuarioExterno: Usuario;
  private operadoraVacunacion: OperadoraVacunacion;  

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioOperadora: OperadoraVacunacionService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioOficina: OficinaService,
    private servicioCanton: CantonService,
    private servicioParroquia: ParroquiaService
  ) { }

  ngOnInit(): void {
    this.panelOficinaNueva = false;
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioFaseVacunacion();
    this.inicializarFormularioOficina();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.usuarioExterno = this.servicioUsuario.usuarioExterno;
      this.obtenerFasesVacunaciones();
    }
  }

  /**
   * Inicializa el formulario de fase de vacunación.
   */
  inicializarFormularioFaseVacunacion(){
    this.formularioFaseVacunacion = new FormGroup({
      fase_vacunacion: new FormControl(null,Validators.required)
    });
  }
  /**
   * Inicializa el formulario de la oficina
   */
  inicializarFormularioOficina(){
    this.formularioOficina = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      descripcion: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      canton: new FormControl(null, Validators.required),
      parroquia: new FormControl(null, Validators.required),
      calle_principal: new FormControl(null, Validators.required),
      interseccion: new FormControl(null, Validators.required),
      referencia: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
    });
  }

  /**
   * Obtiene las fases de vacunaciones habilitadas.
   */
  obtenerFasesVacunaciones(){
    this.fasesVacunaciones = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    }).subscribe( ( fases: FaseVacunacion[]) => {
      this.fasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Obtenemos la operadora de vacunación asociada.
   */
  cambioFaseVacunacion(){
    this.operadoraVacunacion = null;
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOperadora.obtenerOperadorasVacunacion({
      idFaseVacunacion: this.formularioFaseVacunacion.value.fase_vacunacion,
      idUsuarioExterno:this.usuarioExterno.idUsuario,
      codigoEstadoRegistro: 'HAB'
    })
    .subscribe( (operadoras: OperadoraVacunacion[]) => {
      if ( operadoras.length > 0 ) {
        this.operadoraVacunacion = operadoras[0];
        this.obtenerOficinas();
        Swal.close();
      } else {
        Swal.fire('Error', 'La operadora no se encuentra habilitada.' , 'error');
      }
    });
  }

  /**
   * Obtiene la operadora de la fase de vacunación.
   * @param parametros 
   */
  obtenerOperadora(parametros : any){
    this.servicioOperadora.obtenerOperadorasVacunacion(parametros)
    .subscribe( (operadoras: OperadoraVacunacion[]) => {
      if( operadoras.length > 0 ){
        this.operadoraVacunacion = operadoras[0];
        this.obtenerOficinas();
      }
    });
  }
  
  /**
   * Permite agregar una oficina de la operadora de vacunación
   */
  agregarOficina(){
    this.formularioFaseVacunacion.markAllAsTouched();
    if ( this.formularioFaseVacunacion.invalid ) {
      Swal.fire('Error', 'Seleccione una fase de vacunación.', 'error');
      return;
    }
    this.panelOficinaNueva = true;
    this.obtenerCantones();
    this.formularioOficina.controls.provincia.setValue(this.operadoraVacunacion.idProvincia);
  }

  /**
   * Obtiene las oficinas relacionadas a esta operadora de vacunación.
   */
  obtenerOficinas(){
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando oficinas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listasOficinas = [];
    this.servicioOficina.obtenerOficinas({
      //codigoOficina: 'O-VAC',
      idOperadora: this.operadoraVacunacion.idOperadora,
      //idUsuariosExternos: this.operadoraVacunacion.idUsuarioExterno,
      idProvincia: this.operadoraVacunacion.idProvincia,
      idFaseVacunacion: this.operadoraVacunacion.idFaseVacunacion
    })
    .subscribe( (oficinas: Oficina[]) => {
      this.listasOficinas = oficinas;
      console.log(this.listasOficinas);
      Swal.close();
    });
  }

  /**
   * Agrega una nueva oficina a la operadora
   */
  registrarNuevaOficina(){
    this.formularioOficina.markAllAsTouched();
    if (this.formularioOficina.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores.', 'error');
      return;
    }
    const oficina = new Oficina();
    oficina.nombre = this.formularioOficina.value.nombre;
    oficina.descripcion = this.formularioOficina.value.descripcion;
    oficina.callePrincipal = this.formularioOficina.value.calle_principal;
    oficina.interseccion = this.formularioOficina.value.interseccion;
    oficina.referencia = this.formularioOficina.value.referencia;
    oficina.telefono = this.formularioOficina.value.telefono;
    oficina.email = this.formularioOficina.value.email;
    oficina.idOperadora = this.operadoraVacunacion.idOperadora;
    oficina.idUsuariosExternos = this.usuarioExterno.idUsuario;
    oficina.idProvincia = this.formularioOficina.value.provincia;
    oficina.idCanton = this.formularioOficina.value.canton;
    oficina.idParroquia = this.formularioOficina.value.parroquia;
    oficina.idFaseVacunacion = this.formularioFaseVacunacion.value.fase_vacunacion;
    this.listasOficinas.forEach( (item: Oficina) => {
      if (item.codigoOficina === 'O-POV'){
        oficina.idOficinaSuperior = item.idOficina;
      }
    });
    this.servicioOficina.crearOficinaOperadora(oficina)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se agregó correctamente la oficina.',
        'success'
      ).then( () => {
        this.formularioOficina.reset();
        this.obtenerOficinas();
        this.cerrarPanel();
      });
    });

  }
  /**
   * Cierra el panel para agregar una nueva oficina
   */
  cerrarPanel(){
    this.panelOficinaNueva = false;
    this.formularioOficina.reset();
    this.listaParroquias = [];
    this.listaCantones = [];
  }

  obtenerCantones(){
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando cantones.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioCanton.getCantonesPorProvincia(this.operadoraVacunacion.idProvincia)
    .subscribe( ( cantones: Canton[] ) => {
      this.listaCantones = cantones;
      Swal.close();
    });
  }

  /**
   * Buscamos las parroquias cuando se cambia de cantón
   */
  cambioCanton(){
    this.formularioOficina.controls.parroquia.reset(null);
    this.listaParroquias = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando cantones.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioParroquia.getParroquiasPorCanton(this.formularioOficina.value.canton)
    .subscribe( (parroquias: Parroquia[]) => {
      this.listaParroquias = parroquias;
      Swal.close();
    });

  }

}
