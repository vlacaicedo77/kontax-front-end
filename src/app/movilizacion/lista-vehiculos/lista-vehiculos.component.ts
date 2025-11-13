import { Component, OnInit } from '@angular/core';
import { Vehiculo } from 'src/app/modelos/vehiculo.modelo';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';
import { VehiculoService } from 'src/app/servicios/vehiculo/vehiculo.service';
import Swal from 'sweetalert2';
import { AgregarVehiculoService } from '../agregar-vehiculo/servicios/agregar-vehiculo.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-lista-vehiculos',
  templateUrl: './lista-vehiculos.component.html',
  styleUrls: ['./lista-vehiculos.component.css']
})
export class ListaVehiculosComponent implements OnInit {

  listaVehiculos: Vehiculo[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioVehiculos: VehiculoService,
    private servicioAgregarVehiculo: AgregarVehiculoService,
    private servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.listaVehiculos = [];
    this.obtenerVehiculos();
    this.servicioAgregarVehiculo.notificacion.subscribe( (respuesta) => {
      this.obtenerVehiculos();
    });
  }

  agregarVehiculo(){
    this.servicioAgregarVehiculo.abrir();
  }

  /**
   * Obtiene los vehículos
   */
  obtenerVehiculos(){
    this.listaVehiculos = [];
    if ( this.servicioUsuario.usuarioExterno ) {
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando datos',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
      });
      const vehiculoParametro = new Vehiculo();
      vehiculoParametro.idUsuarioExterno = this.servicioUsuario.usuarioExterno.idUsuario;
      this.servicioVehiculos.obtenerVehiculosPorFiltro(vehiculoParametro)
      .subscribe( ( vehiculos: Vehiculo[]) => {
        this.listaVehiculos = vehiculos;
        Swal.close();
      });
    }
  }

}
