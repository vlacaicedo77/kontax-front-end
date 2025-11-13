import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { Oficina } from '../../modelos/oficina.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import Swal from 'sweetalert2';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { OficinaService } from '../../servicios/oficina.service';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import { PersonalOperadora } from '../../modelos/personal-operadora.modelo';
import { PersonalOperadoraService } from '../../servicios/personal-operadora.service';
import { ZonaOperadora } from '../../modelos/zona-operadora.modelo';
import { ZonaService } from '../../servicios/zona.service';
import { Cobertura } from '../../modelos/cobertura.modelo';
import { CoberturaOficina } from '../../modelos/cobertura-oficina.modelo';
import { CoberturaOficinaService } from '../../servicios/cobertura-oficina.service';

@Component({
  selector: 'app-personal-oficina-operadora',
  templateUrl: './personal-oficina-operadora.component.html',
  styles: [
  ]
})
export class PersonalOficinaOperadoraComponent implements OnInit {

  formularioFaseOperadora: FormGroup;
  listaFasesVacunaciones: FaseVacunacion[];
  listaOficinasOperadoras: Oficina[];
  usuarioExterno: Usuario;
  operadoraVacunacion?: OperadoraVacunacion;
  oficinaSeleccionada?: Oficina;
  listaBrigadistasDeOficina: PersonaOficina[];
  listaDigitadoresDeOficina: PersonaOficina[];
  listaBrigadistasDeOperadora: PersonalOperadora[];
  listaDigitadoresDeOperadora: PersonalOperadora[];
  formularioDigitadora: FormGroup;
  formularioBrigadista: FormGroup;
  formularioZonaCobertura: FormGroup;
  listaZonasOperadoras: ZonaOperadora[];
  listaCoberturasOperadoras: Cobertura[];
  listaCoberturasOficinas: CoberturaOficina[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioOficina: OficinaService,
    private servicioPersonaOficina: PersonaOficinaService,
    private servicioPersonalOperadora: PersonalOperadoraService,
    private servicioZona: ZonaService,
    private servicioCoberturaOficina: CoberturaOficinaService
  ) { }

  ngOnInit(): void {
    this.oficinaSeleccionada = null;
    this.inicializarFormularioFaseOperadora();
    this.inicializarFormularioBrigadista();
    this.inicializarFormularioDigitador();
    this.inicializarFormularioZonaCobertura();
    this.servicioScript.inicializarScripts();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.usuarioExterno = this.servicioUsuario.usuarioExterno;
      this.obtenerFasesVacunaciones();
    }
  }

  /**
   * Inicializa el formulario para la zona de cobertura.
   */
  inicializarFormularioZonaCobertura(){
    this.formularioZonaCobertura = new FormGroup({
      zona_operadora: new FormControl(null, Validators.required),
      cobertura_operadora: new FormControl(null, Validators.required)
    });
  }
  /**
   * Inicializa el formulario de la fase de vacunación y operadora de vacunación
   */
  inicializarFormularioFaseOperadora(){
    this.formularioFaseOperadora = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_operadora: new FormControl(null, Validators.required)
    });
  }

  /**
   * Inicializa el formulario para agregar un digitador a la oficina.
   */
  inicializarFormularioDigitador(){
    this.formularioDigitadora = new FormGroup({
      digitadora: new FormControl(null, Validators.required)
    });
  }
  /**
   * Inicializa el formulario para agregar un brigadisa a la oficina.
   */
  inicializarFormularioBrigadista(){
    this.formularioBrigadista = new FormGroup({
      brigadista: new FormControl(null, Validators.required)
    });
  }

  /**
   * Obtiene las fases de vacunaciones activas
   */
  obtenerFasesVacunaciones(){
    this.listaFasesVacunaciones = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Fases de Vacunación.',
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
   * Obtenemos la operadora de vacunación y la lista de oficinas de la operadora
   */
  cambioFaseVacunacion(){
    this.obtenerOperadoraVacunacion({
      idUsuarioExterno: this.usuarioExterno.idUsuario,
      idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
      codigoEstadoRegistro: 'HAB'
    });
  }

  /**
   * Obtiene la información de la operadora de vacunación.
   * @param parametros 
   */
  obtenerOperadoraVacunacion( parametros: any ){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion(parametros)
    .subscribe( (operadoras: OperadoraVacunacion[]) => {
      if ( operadoras.length > 0 ) {
        this.operadoraVacunacion = operadoras[0];
        // Obtenemos las oficinas
        Swal.close();
        // Obtener las oficinas
        this.obtenerOficinasDeOperadora({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          codigoEstadoRegistro: 'HAB',
          idProvincia: this.operadoraVacunacion.idProvincia
        });
        // Obtener los brigadistas y digitadores de la operadora
        this.obtenerDigitadoresDeOperadora({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          codigoTipoPersona: 'DIG',
          estado: 1
        });
        // Obtenemos los brigadistas
        this.obtenerBrigadistaDeOperadora({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          codigoTipoPersona: 'BRIG',
          estado: 1
        });
        // Obtenemos la zonas de cobertura por operadora y fase
        this.obtenerZonaOperadora({
          idProvincia: this.operadoraVacunacion.idProvincia,
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          estado: 1
        });
      } else {
        Swal.fire('Error', 'La operadora no se encuentra habilitada.' , 'error');
      }
    });
  }

  /**
   * Obtiene las oficinas de vacunación de la operadora
   */
  obtenerOficinasDeOperadora(parametros: any){
    this.listaOficinasOperadoras = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando oficinas de la operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficina.obtenerOficinas(parametros)
    .subscribe( (oficinas: Oficina[]) => {
      this.listaOficinasOperadoras = oficinas;
      Swal.close();
    });
  }

  /**
   * Obtenemos los brigadistas y los digitadores asignados a la oficina.
   */
  cambioOficina(){
    if ( this.oficinaSeleccionada ) {
      this.obtenerDigitadoresDeOficina({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          idOficina: this.oficinaSeleccionada.idOficina,
          codigoTipoPersona: 'DIG',
          estado: 1
      });
      this.obtenerBrigadistasDeOficina({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          idOficina: this.oficinaSeleccionada.idOficina,
          codigoTipoPersona: 'BRIG',
          estado: 1
      });
      this.obtenerCoberturasOficinas();
      this.formularioZonaCobertura.controls.cobertura_operadora.setValue(null);
      // Obtenemos las coberturas si la zona fue seleccionada
      if (this.formularioZonaCobertura.value.zona_operadora === null){
        return;
      }
      this.obtenerCoberturasOperadoras({
        idZona: this.formularioZonaCobertura.value.zona_operadora,
        estado: 1,
        idProvincia: this.oficinaSeleccionada.idProvincia,
        idCanton: this.oficinaSeleccionada.idCanton,
        idParroquia: this.oficinaSeleccionada.idParroquia,
      });
    }
  }

  /**
   * Obtiene a los brigadistas de una operadora
   * @param parametros 
   */
  obtenerBrigadistaDeOperadora(parametros: any){
    this.listaBrigadistasDeOperadora = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de los brigadistas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonalOperadora.obtenerPersonalOperadora(parametros)
    .subscribe( (brigadistas: PersonalOperadora[]) => {
      this.listaBrigadistasDeOperadora = brigadistas;
      Swal.close();
    });
  }

  /**
   * Obtiene a los digitadores de una operadora
   * @param parametros 
   */
  obtenerDigitadoresDeOperadora(parametros: any){
    this.listaDigitadoresDeOperadora = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de los digitadores.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonalOperadora.obtenerPersonalOperadora(parametros)
    .subscribe( (digitadoras: PersonalOperadora[]) => {
      this.listaDigitadoresDeOperadora = digitadoras;
      Swal.close();
    });
  }

  /**
   * Obtiene el listado de los brigadistas de una oficina.
   * @param parametros 
   */
  obtenerBrigadistasDeOficina(parametros: any){
    this.listaBrigadistasDeOficina = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando la lista de brigadistas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonaOficina.obtenerPersonalDeOficina(parametros)
    .subscribe( (brigadistas: PersonaOficina[]) => {
      this.listaBrigadistasDeOficina = brigadistas;
      Swal.close();
    });
  }

  /**
   * Obtiene el listado de los digitadores de una oficina.
   * @param parametros 
   */
  obtenerDigitadoresDeOficina(parametros: any) {
    this.listaDigitadoresDeOficina = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando la lista de digitadores.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonaOficina.obtenerPersonalDeOficina(parametros)
    .subscribe( (digitadores: PersonaOficina[]) => {
      this.listaDigitadoresDeOficina = digitadores;
      Swal.close();
    });

  }

  /**
   * Elimina a un digitador de la oficina
   * @param identificador 
   */
  eliminarDigitador(identificador: number){
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
          text: 'Eliminando digitador.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioPersonaOficina.quitarPersonaDeOficina(identificador)
        .subscribe( (respuesta: any) => {
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente al digitador.',
            'success'
          ).then(() => {
            this.obtenerDigitadoresDeOficina({
              idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
              idOperadora: this.operadoraVacunacion.idOperadora,
              idOficina: this.oficinaSeleccionada.idOficina,
              codigoTipoPersona: 'DIG',
              estado: 1
            });
          });
        });
      }
    });
  }

  /**
   * Elimina a un brigadista de la oficina
   * @param identificador 
   */
  eliminarBrigadista(identificador: number){
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
          text: 'Eliminando brigadista.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioPersonaOficina.quitarPersonaDeOficina(identificador)
        .subscribe( (respuesta: any) => {
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente al brigadista.',
            'success'
          ).then(() => {
            this.obtenerBrigadistasDeOficina({
              idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
              idOperadora: this.operadoraVacunacion.idOperadora,
              idOficina: this.oficinaSeleccionada.idOficina,
              codigoTipoPersona: 'BRIG',
              estado: 1
            });
          });
        });
      }
    });
  }

  /**
   * Elimina cobertura de oficina
   * @param identificador 
   */
  eliminarCoberturaOficina(identificador: number){
    Swal.fire({
      title: '¿Está seguro que desea eliminar la cobertura de la oficina?',
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
        this.servicioCoberturaOficina.quitarCoberturaDeOficina(identificador)
        .subscribe( (respuesta: any) => {
          console.log(respuesta);
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente la cobertura de la oficina.',
            'success'
          ).then(() => {
            this.obtenerCoberturasOficinas();
          });
        });

      }
    });
  }

  /**
   * Agrega un digitador a la oficina
   */
  agregarDigitador(){
    this.formularioDigitadora.markAllAsTouched();
    if ( this.formularioDigitadora.invalid ) {
      Swal.fire('Error', 'Seleccione una digitador de la lista.', 'error');
      return;
    }
    if ( this.oficinaSeleccionada === null ) {
      Swal.fire('Error', 'Seleccione una oficina de la lista de oficinas registradas.', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Agregando digitadora a la oficina.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const oficinaPersona = new PersonaOficina();
    oficinaPersona.idOficina = this.oficinaSeleccionada.idOficina;
    oficinaPersona.idFaseVacunacion = this.formularioFaseOperadora.value.fase_vacunacion;
    oficinaPersona.idOperadora = this.operadoraVacunacion.idOperadora;
    oficinaPersona.idPersonaOperadora = this.formularioDigitadora.value.digitadora;
    this.servicioPersonaOficina.agregarPersonalAOficina(oficinaPersona)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se agregó correctamente al digitador.',
        'success'
      ).then(() => {
        this.formularioDigitadora.reset();
        this.obtenerDigitadoresDeOficina({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          idOficina: this.oficinaSeleccionada.idOficina,
          codigoTipoPersona: 'DIG',
          estado: 1
        });
      });
    });

  }
  /**
   * Agrega un brigadista a la oficina
   */
  agregarBrigadista(){
    this.formularioBrigadista.markAllAsTouched();
    if ( this.formularioBrigadista.invalid ) {
      Swal.fire('Error', 'Seleccione una brigadista de la lista.', 'error');
      return;
    }
    if ( this.oficinaSeleccionada === null ) {
      Swal.fire('Error', 'Seleccione una oficina de la lista de oficinas registradas.', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Agregando brigadista a la oficina.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const personaOficina = new PersonaOficina();
    personaOficina.idOficina = this.oficinaSeleccionada.idOficina;
    personaOficina.idFaseVacunacion = this.formularioFaseOperadora.value.fase_vacunacion;
    personaOficina.idOperadora = this.operadoraVacunacion.idOperadora;
    personaOficina.idPersonaOperadora = this.formularioBrigadista.value.brigadista;
    this.servicioPersonaOficina.agregarPersonalAOficina(personaOficina)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se agregó correctamente al brigadista.',
        'success'
      ).then(() => {
        this.formularioBrigadista.reset();
        this.obtenerBrigadistasDeOficina({
          idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
          idOperadora: this.operadoraVacunacion.idOperadora,
          idOficina: this.oficinaSeleccionada.idOficina,
          codigoTipoPersona: 'BRIG',
          estado: 1
        });
      });
    });
  }

  /**
   * Agrega una cobertura a una oficina
   */
  agregarCoberturaAOficina(){
    this.formularioZonaCobertura.markAllAsTouched();
    if ( this.formularioZonaCobertura.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores.', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Agregando cobertura.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const coberturaOficina = new CoberturaOficina();
    coberturaOficina.idFaseVacunacion = this.formularioFaseOperadora.value.fase_vacunacion;
    coberturaOficina.idOperadora = this.operadoraVacunacion.idOperadora;
    coberturaOficina.idOficina = this.oficinaSeleccionada.idOficina;
    coberturaOficina.idCobertura = this.formularioZonaCobertura.value.cobertura_operadora;
    this.servicioCoberturaOficina.agregarCoberturaAOficina(coberturaOficina)
    .subscribe( (respuesta: any) => {
      this.formularioZonaCobertura.reset();
      this.listaCoberturasOperadoras = [];
      Swal.fire(
        'Éxito',
        'Se agregó correctamente la cobertura.',
        'success'
      );
      this.obtenerCoberturasOficinas();
    });

  }

  /**
   * Obtenemos las zonas disponibles para la operadora
   * @param parametros 
   */
  obtenerZonaOperadora(parametros: any){
    this.listaZonasOperadoras = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Obteniendo información de zonas asignadas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioZona.obtenerZonaOperadora(parametros)
    .subscribe( (zonasOperadoras: ZonaOperadora[]) => {
      this.listaZonasOperadoras = zonasOperadoras;
      Swal.close();
    });
  }

  /**
   * Obtener coberturas de las operadoras
   * @param parametros
   */
  obtenerCoberturasOperadoras(parametros: any) {
    this.listaCoberturasOperadoras = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Obteniendo información de las coberturas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioZona.obtenerCoberturas(parametros)
    .subscribe( (listaCoberturas: Cobertura[]) => {
      this.listaCoberturasOperadoras = listaCoberturas;
      Swal.close();
    });

  }
  /**
   * Obtenemos las coberturas de la operadora si la oficina fue seleccionada.
   */
  cambioZonaOperadora(){
    this.formularioZonaCobertura.controls.cobertura_operadora.setValue(null);
    if (this.oficinaSeleccionada === null){
      return;
    }
    this.obtenerCoberturasOperadoras({
      idZona: this.formularioZonaCobertura.value.zona_operadora,
      estado: 1,
      idProvincia: this.oficinaSeleccionada.idProvincia,
      //idCanton: this.oficinaSeleccionada.idCanton
      //idParroquia: this.oficinaSeleccionada.idParroquia,
    });
  }

  /**
   * Obtiene las coberturas asignadas a la oficina
   */
  obtenerCoberturasOficinas(){
    this.listaCoberturasOficinas = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de las coberturas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioCoberturaOficina.obtenerCoberturasDeOficina({
      idFaseVacunacion: this.formularioFaseOperadora.value.fase_vacunacion,
      idOperadora: this.operadoraVacunacion.idOperadora,
      idOficina: this.oficinaSeleccionada.idOficina,
      estado: 1
    })
    .subscribe( (coberturasOficinas: CoberturaOficina[]) => {
      this.listaCoberturasOficinas = coberturasOficinas;
      Swal.close();
    });

  }

}
