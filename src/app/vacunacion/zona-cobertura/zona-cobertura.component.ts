import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { ZonaService } from '../../servicios/zona.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Zona } from '../../modelos/zona.modelo';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Cobertura } from '../../modelos/cobertura.modelo';
import { ZonaOperadora } from '../../modelos/zona-operadora.modelo';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { CantonService } from '../../servicios/canton/canton.service';
import { Canton } from '../../modelos/canton.modelo';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';

@Component({
  selector: 'app-zona-cobertura',
  templateUrl: './zona-cobertura.component.html',
  styles: [
  ]
})
export class ZonaCoberturaComponent implements OnInit {

  formularioOperadora: FormGroup;
  formularioCobertura: FormGroup;
  zona?: Zona;
  listaCoberturas?: Cobertura[];
  listaZonaOperadoras?: ZonaOperadora[];
  listaOperadorasVacunacion?: OperadoraVacunacion[];
  listaCantones?: Canton[];
  listaParroquias?: Parroquia[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioZona: ZonaService,
    private servicioRutaActiva: ActivatedRoute,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioCantones: CantonService,
    private servicioParroquia: ParroquiaService
  ) { }

  ngOnInit(): void {
    this.servicioRutaActiva.params.subscribe( (parametros: any) => {
      this.obtenerZona(parametros?.id);
    });
    this.inicializarFormularioOperadora();
    this.inicializarFormularioCobertura();
    this.servicioScript.inicializarScripts();
  }

  // Inicializa el formulario para agregar operadoras
  inicializarFormularioOperadora(){
    this.formularioOperadora = new FormGroup({
      operadora: new FormControl(null, Validators.required)
    });
  }

  // Inicializa el formulario para la cobertura
  inicializarFormularioCobertura(){
    this.formularioCobertura = new FormGroup({
      canton: new FormControl(null, Validators.required),
      parroquia: new FormControl(null)
    });
  }

  // Obtiene la zona
  obtenerZona(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioZona.obtenerZonas({
      idZona: id
    }).subscribe( (zonas: Zona[]) => {
      if( zonas.length > 0 ){
        this.zona = zonas[0];
        this.obtenerOperadorasVacunaciones();
        this.obtenerZonasOperadoras();
        this.obtenerCantones();
        this.obtenerCoberturas();
      }
      Swal.close();
    });
  }

  // Método que permite obtener los cantones de una provincia.
  obtenerCantones(){
    this.formularioCobertura.controls.parroquia.setValue(null);
    this.servicioCantones.getCantonesPorProvincia(this.zona.idProvincia)
    .subscribe( (respuesta: Canton[]) => {
      this.listaCantones = respuesta;
    });
  }

  // Método que obtiene las parroquias.
  cambioCanton(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioParroquia.getParroquiasPorCanton(this.formularioCobertura.value.canton)
    .subscribe( (parroquias: Parroquia[]) => {
      this.listaParroquias = parroquias;
      Swal.close();
    });
  }
  
  // Obtiene coberturas de las zonas
  obtenerCoberturas(){
    if (!this.zona) {
      return;
    }
    this.servicioZona.obtenerCoberturas({
      idZona: this.zona?.idZona,
      idProvincia: this.zona?.idProvincia,
      estado: 1
    }).subscribe( ( respuesta: Cobertura[]) => {
      this.listaCoberturas = respuesta;
    });
  }

  // Obtiene las operadoras por zonas
  obtenerZonasOperadoras(){
    if (!this.zona) {
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioZona.obtenerZonaOperadora({
      idZona: this.zona?.idZona,
      estado: 1
    })
    .subscribe( (respuesta: ZonaOperadora[]) => {
      this.listaZonaOperadoras = respuesta;
      Swal.close();
    });
  }

  // Llama al servicio que elimina a la operadora de la zona de cobertura
  eliminarZonaOperadora(idZonaOperadora: number){
    Swal.fire({
      title: '¿Está seguro que desea eliminar a la operadora?',
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
        this.servicioZona.eliminarZonaOperadora(idZonaOperadora)
        .subscribe( (respuesta: any) => {
          Swal.close();
          this.obtenerZonasOperadoras();
        });

      }
    });
  }

  // Obtener las operadoras de vacunación de la zona
  obtenerOperadorasVacunaciones(){
    if (!this.zona) {
      return;
    }
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion({
      idFaseVacunacion: this.zona.idFaseVacunacion,
      idProvincia: this.zona.idProvincia,
      codigoEstadoRegistro: 'HAB'
    }).subscribe( (operadoras: OperadoraVacunacion[]) => {
      console.log(operadoras);
      this.listaOperadorasVacunacion = operadoras;
    });
  }

  // Agrega una operadora a la zona
  agregarOperadora(){
    this.formularioOperadora.markAllAsTouched();
    if (this.formularioOperadora.invalid) {
      Swal.fire('Error', 'El formulario contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Agregando operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    let operadora = new ZonaOperadora();
    operadora.idZona = this.zona.idZona;
    operadora.idOperadora = this.formularioOperadora.value.operadora;
    this.servicioZona.crearZonaOperadora(operadora)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se agregó correctamente la operadora a la zona.',
        'success'
      ).then( () => {
        this.formularioOperadora.reset();
        this.obtenerZonasOperadoras();
      });
    });
  }

  /**
   * Método que agrega una cobertura
   */
  agregarCobertura(){
    this.formularioCobertura.markAllAsTouched();
    if ( this.formularioCobertura.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores', 'error');
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
    const cobertura = new Cobertura();
    cobertura.idZona = this.zona?.idZona;
    cobertura.idProvincia = this.zona?.idProvincia;
    cobertura.idCanton = this.formularioCobertura.value.canton;
    if ( this.formularioCobertura.value.parroquia ) {
      cobertura.idParroquia = this.formularioCobertura.value.parroquia;
    }
    this.servicioZona.crearCobertura(cobertura)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se agregó correctamente la cobertura a la zona.',
        'success'
      ).then( () => {
        this.formularioCobertura.reset();
        this.listaParroquias = [];
        this.obtenerCoberturas();
      });
    });
  }

  /**
   * Método que elimina una cobertura
   * @param idCobertura 
   */
  eliminarCobertura(idCobertura: number) {
    Swal.fire({
      title: '¿Está seguro que desea eliminar la cobertura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Eliminando cobertura.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioZona.eliminarCobertura(idCobertura)
        .subscribe( (respuesta: any) => {
          Swal.close();
          this.listaParroquias = [];
          this.obtenerCoberturas();
        });
      }
    });
  }

}
