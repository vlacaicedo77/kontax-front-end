import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PersonalOperadora } from '../../modelos/personal-operadora.modelo';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import Swal from 'sweetalert2';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { PersonalOperadoraService } from '../../servicios/personal-operadora.service';
import { CrearUsuarioExternoService } from '../../usuarios-externos/crear-usuario-externo/servicios/crear-usuario-externo.service';
import { TipoPersona } from '../../modelos/tipo-persona.modelo';
import { TiposPersonalService } from '../../servicios/tipos-personal.service';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Usuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-personal-operadora',
  templateUrl: './personal-operadora.component.html',
  styles: [
  ]
})
export class PersonalOperadoraComponent implements OnInit {

  usuarioExterno: Usuario;
  panelPersonal: boolean;
  formularioFaseVacunacion: FormGroup;
  formularioPersonal: FormGroup;
  listaDigitadores: PersonalOperadora[];
  listaBrigadistas: PersonalOperadora[];
  listaFasesVacunaciones: FaseVacunacion[];
  listaUsuariosExternos: UsuarioExterno[];
  operadora: OperadoraVacunacion;
  listaTipoPersonas: TipoPersona[];
  mostrarCorreo: boolean = false;

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioUsuario: UsuarioService,
    private servicioOperadora: OperadoraVacunacionService,
    private servicioPersonalOperadora: PersonalOperadoraService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
    private servicioTipoPersona: TiposPersonalService
  ) { }

  ngOnInit(): void {
    this.panelPersonal = false;
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioFaseVacunacion();
    this.inicializarFormularioPersonal();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.usuarioExterno = this.servicioUsuario.usuarioExterno;
      this.obtenerFasesVacunaciones();
      this.obtenerTiposPersonal();
      //this.servicioCrearUsuario.notificacion
      //.subscribe( ( respuesta ) => {
      //  console.log('Se recibe respuesta', respuesta);
      //});
    }
  }

  /**
   * Inicializa el formulario para la fase de vacunación
   */
  inicializarFormularioFaseVacunacion(){
    this.formularioFaseVacunacion = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required)
    });
  }
  inicializarFormularioPersonal(){
    this.formularioPersonal = new FormGroup({
      ci: new FormControl(null),
      id_usuario_externo: new FormControl(null, Validators.required),
      id_operadora: new FormControl(null, Validators.required),
      id_fase_vacunacion: new FormControl(null, Validators.required),
      id_tipo_persona: new FormControl(null, Validators.required)
    });
  }
  /**
   * Obtiene las fases de vacunaciones activas
   */
  obtenerFasesVacunaciones(){
    this.listaFasesVacunaciones = [];
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
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Obtenemos la operadora de vacunacion.
   */
  cambioFaseVacunacion(){
    this.obtenerOperadoraVacunacion({
      idUsuarioExterno: this.usuarioExterno.idUsuario,
      idFaseVacunacion: this.formularioFaseVacunacion.value.fase_vacunacion,
      codigoEstadoRegistro: 'HAB'
    });
  }

  /**
   * Obtiene la operadora de vacunación del usuario actual
   * @param parametros 
   */
  obtenerOperadoraVacunacion(parametros: any) {
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOperadora.obtenerOperadorasVacunacion(parametros)
    .subscribe( (operadoras: OperadoraVacunacion[]) => {
      if( operadoras.length > 0 ){
        this.operadora = operadoras[0];
        Swal.close();
        this.obtenerDigitadoras({
          idFaseVacunacion: this.operadora.idFaseVacunacion,
          idOperadora: this.operadora.idOperadora,
          codigoTipoPersona: 'DIG',
          estado: 1
        });
        this.obtenerBrigadistas({
          idFaseVacunacion: this.operadora.idFaseVacunacion,
          idOperadora: this.operadora.idOperadora,
          codigoTipoPersona: 'BRIG',
          estado: 1
        });
      } else {
        Swal.fire('Error', 'La operadora no se encuentra habilitada.' , 'error');
      }
    });
  }

  /**
   * Obtiene las digitadoras pertenecientes a la operadora
   * @param parametros 
   */
  obtenerDigitadoras(parametros: any){
    this.listaDigitadores = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonalOperadora.obtenerPersonalOperadora(parametros)
    .subscribe( (digitadoras: PersonalOperadora[]) => {
      this.listaDigitadores = digitadoras;
      Swal.close();
    });
  }
  /**
   * Obtiene los brigadistas pertenecientes a la operadora
   * @param parametros 
   */
  obtenerBrigadistas(parametros: any){
    this.listaBrigadistas = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonalOperadora.obtenerPersonalOperadora(parametros)
    .subscribe( (brigadistas: PersonalOperadora[]) => {
      this.listaBrigadistas = brigadistas;
      Swal.close();
    });
  }

  /**
   * Permite abrir el panel de búsqueda para agregar un personal
   */
  agregarPersonal(){
    this.formularioFaseVacunacion.markAllAsTouched();
    if ( this.formularioFaseVacunacion.invalid ) {
      Swal.fire('Error', 'Seleccione una fase de vacunación.', 'error');
      return;
    }
    this.panelPersonal = true;
    this.formularioPersonal.reset();
    this.formularioPersonal.controls.id_operadora.setValue(this.operadora.idOperadora);
    this.formularioPersonal.controls.id_fase_vacunacion.setValue(this.formularioFaseVacunacion.value.fase_vacunacion);
    console.log(this.formularioPersonal);
    //id_usuario_externo
    //id_tipo_persona
  }

  /**
   * Eliminar al digitador
   * @param id 
   */
  eliminarDigitador(id: number){
    Swal.fire({
      title: '¿Está seguro que desea eliminar al digitador?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Eliminando registro.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioPersonalOperadora.quitarPersonalOperadora(id)
        .subscribe( (respuesta: any) => {
          console.log(respuesta);
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente al digitador.',
            'success'
          ).then(() => {
            this.obtenerDigitadoras({
              idFaseVacunacion: this.operadora.idFaseVacunacion,
              idOperadora: this.operadora.idOperadora,
              codigoTipoPersona: 'DIG',
              estado: 1
            });
          });
        });

      }
    });

  }

  /**
   * Eliminar a un brigadista
   * @param id 
   */
  eliminarBrigadista(id: number){
    Swal.fire({
      title: '¿Está seguro que desea eliminar al brigadista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Eliminando registro.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioPersonalOperadora.quitarPersonalOperadora(id)
        .subscribe( (respuesta: any) => {
          console.log(respuesta);
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente al brigadista.',
            'success'
          ).then(() => {
            this.obtenerBrigadistas({
              idFaseVacunacion: this.operadora.idFaseVacunacion,
              idOperadora: this.operadora.idOperadora,
              codigoTipoPersona: 'BRIG',
              estado: 1
            });
          });
        });

      }
    });
    
  }

  /**
   * Permite registrar un personal a la operadora.
   */
  registrarPersonal(){
    console.log('Formulario: ', this.formularioPersonal);
    this.formularioPersonal.markAllAsTouched();
    if ( this.formularioPersonal.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores.', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando al personal.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const personal = new PersonalOperadora();
    personal.idOperadora = this.operadora.idOperadora;
    personal.idUsuarioExterno = this.formularioPersonal.value.id_usuario_externo;
    personal.idFaseVacunacion = this.formularioPersonal.value.id_fase_vacunacion;
    personal.idTipoPersona = this.formularioPersonal.value.id_tipo_persona;
    this.servicioPersonalOperadora.agregarPersonalOperadora(personal)
    .subscribe( (respuesta: any) => {
      this.formularioPersonal.controls.id_tipo_persona.setValue(null);
      this.formularioPersonal.controls.id_usuario_externo.setValue(null);
      Swal.fire(
        'Éxito',
        'Se agregó correctamente al personal.',
        'success'
      ).then(() => {
        this.listaUsuariosExternos = [];
        this.obtenerDigitadoras({
          idFaseVacunacion: this.operadora.idFaseVacunacion,
          idOperadora: this.operadora.idOperadora,
          codigoTipoPersona: 'DIG',
          estado: 1
        });
        this.obtenerBrigadistas({
          idFaseVacunacion: this.operadora.idFaseVacunacion,
          idOperadora: this.operadora.idOperadora,
          codigoTipoPersona: 'BRIG',
          estado: 1
        });
      });
    });

  }
  /**
   * Cierra el panel de agregar 
   */
  cerrarPanel(){
    this.formularioPersonal.reset();
    this.panelPersonal = false;
  }

  obtenerTiposPersonal(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioTipoPersona.obtenerTiposPersonal()
    .subscribe( (tiposPersonas: TipoPersona[]) => {
      this.listaTipoPersonas = tiposPersonas;
      Swal.close();
    });
  }
  /**
   * Abre el panel para crear un nuevo ciudadano
   */
  agregarCiudadano(){
    this.mostrarCorreo = false;
    if ( this.formularioPersonal.value.id_tipo_persona ) {
      this.listaTipoPersonas.forEach( (item: TipoPersona) => {
        if ( Number(this.formularioPersonal.value.id_tipo_persona) === item.idTipoPersona && item.codigo === 'DIG' && item.grupo === 'OP-V' ) {
          this.mostrarCorreo = true;
        }
      });
      console.log(this.listaTipoPersonas);
      this.servicioCrearUsuario.abrir();
      this.servicioCrearUsuario.notificacion.subscribe( (respuesta: any) => {
        console.log('Respuesta', respuesta);
      });
    } else {
      Swal.fire('Error', 'Seleccione el tipo de personal Brigadista/Digitadora', 'error');
    }
  }
  /**
   * Llama al servicio para buscar un usuario externo en la base de datos.
   */
  buscarUsuarioExterno(ci: string){
    this.listaUsuariosExternos = [];
    if ( ci.length === 0) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    })
    .subscribe( (resp: any) => {
      this.listaUsuariosExternos = resp;
      console.log(resp);
      Swal.close();
    });
  }

}
