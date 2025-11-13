import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { Vehiculo } from '../../modelos/vehiculo.modelo';
import Swal from 'sweetalert2';
import { VehiculoService } from '../../servicios/vehiculo/vehiculo.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaVehiculos: Vehiculo[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioVehiculos: VehiculoService
  ) { }

  ngOnInit(): void {
    this.listaVehiculos = [];
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioBusqueda();
  }

   /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      ci_registrador: new FormControl(null),
      ci_propietario: new FormControl(null)
    });
  }

  /**
   * Buscamos los vehículos registrados por un productor
   */
  buscarVehiculos(){
    this.listaVehiculos = [];
    if ( (this.formularioBusqueda.value.ci_registrador === null || this.formularioBusqueda.value.ci_registrador === '') &&
    (  this.formularioBusqueda.value.ci_propietario === null || this.formularioBusqueda.value.ci_propietario === '') ) {
      Swal.fire('Error', 'Ingrese al menos un criterio de búsqueda', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando vehículos.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    const vehiculoParametros = new Vehiculo();
    if ( this.formularioBusqueda.value.ci_registrador ) {
      vehiculoParametros.numeroIdentificacionUsuarioExterno = this.formularioBusqueda.value.ci_registrador;
    }
    if ( this.formularioBusqueda.value.ci_propietario ) {
      vehiculoParametros.cedulaPropietario = this.formularioBusqueda.value.ci_propietario;
    }
    this.servicioVehiculos.obtenerVehiculosPorFiltro(vehiculoParametros)
    .subscribe( (vehiculos: Vehiculo[]) => {
      this.listaVehiculos = vehiculos;
      Swal.close();
    });
  }

  /**
   * Habilita el vehículo
   * @param id 
   */
  habilitarVehiculo(id: number){
    Swal.fire({
      title: 'Habilitar vehículo',
      text: '¿Está seguro que desea habilitar el vehículo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then( (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Habilitando vehículo.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioVehiculos.habilitarVehiculo(id)
        .subscribe( (respuesta: any) => {
          this.buscarVehiculos();
        });
      }
    });

  }
  /**
   * Deshabilita el vehículo
   * @param id 
   */
  deshabilitarVehiculo(id: number){
    Swal.fire({
      title: 'Deshabilitar vehículo',
      text: '¿Está seguro que desea deshabilitar el vehículo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then( (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Deshabilitando vehículo.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioVehiculos.deshabilitarVehiculo(id)
        .subscribe( (respuesta: any) => {
          this.buscarVehiculos();
        });

      }
    });
  }

}
