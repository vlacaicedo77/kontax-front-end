import { Component, OnInit } from '@angular/core';
import { AgregarVehiculoService } from './servicios/agregar-vehiculo.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClaseVehiculoService } from '../../servicios/clase-vehiculo.service';
import { TipoVehiculoService } from '../../servicios/tipo-vehiculo.service';
import { ClaseVehiculo } from '../../modelos/clase-vehiculo.modelo';
import { TipoVehiculo } from '../../modelos/tipo-vehiculo.modelo';
import Swal from 'sweetalert2';
import { Vehiculo } from '../../modelos/vehiculo.modelo';
import { VehiculoService } from '../../servicios/vehiculo/vehiculo.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-agregar-vehiculo',
  templateUrl: './agregar-vehiculo.component.html',
  styleUrls: ['./agregar-vehiculo.component.css']
})
export class AgregarVehiculoComponent implements OnInit {

  formularioVehiculo: FormGroup;
  listaClasesVehiculos: ClaseVehiculo[];
  listaTiposVehiculos: TipoVehiculo[];
  listaVehiculos: Vehiculo[] = [];

  constructor(
    public servicioAgregarVehiculo: AgregarVehiculoService,
    private servicioClaseVehiculo: ClaseVehiculoService,
    private servicioTipoVehiculo: TipoVehiculoService,
    private servicioVehiculo: VehiculoService
  ) { }

  ngOnInit(): void {
    this.incializarFormularioVehiculo();
    this.listaClasesVehiculos = [];
    this.listaTiposVehiculos = [];
    this.obtenerClasesVehiculos();
    this.obtenerTiposVehiculos();
  }

  /**
   * Inicializa el formulario
   */
  incializarFormularioVehiculo(){
    this.formularioVehiculo = new FormGroup({
      placa: new FormControl(null, Validators.required),
      ci_propietario: new FormControl(null, Validators.required),
      nombres_propietario: new FormControl(null, Validators.required),
      marca: new FormControl(null, Validators.required),
      modelo: new FormControl(null, Validators.required),
      tipo_vehiculo: new FormControl(null, Validators.required),
      clase_vehiculo: new FormControl(null, Validators.required),
      cilindraje: new FormControl(null, Validators.required),
      color: new FormControl(null, Validators.required),
      anio: new FormControl(null, Validators.required)
    });
  }

  /**
   * Cierra el panel flotante
   */
  cerrarPanel(){
    this.formularioVehiculo.reset();
    this.servicioAgregarVehiculo.cerrar();
  }

  /**
   * Registra un vehículo
   */
  registrarVehiculo(){
    this.formularioVehiculo.markAllAsTouched();
    if ( this.formularioVehiculo.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores.', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando vehículo',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    const vehiculo = new Vehiculo();
    vehiculo.placa = this.formularioVehiculo.value.placa;
    vehiculo.cilindraje = this.formularioVehiculo.value.cilindraje;
    vehiculo.color = this.formularioVehiculo.value.color;
    vehiculo.anio = this.formularioVehiculo.value.anio;
    vehiculo.marca = this.formularioVehiculo.value.marca;
    vehiculo.modelo = this.formularioVehiculo.value.modelo;
    vehiculo.nombresPropietario = this.formularioVehiculo.value.nombres_propietario;
    vehiculo.cedulaPropietario = this.formularioVehiculo.value.ci_propietario;
    vehiculo.idTipoVehiculo = this.formularioVehiculo.value.tipo_vehiculo;
    vehiculo.idClaseVehiculo = this.formularioVehiculo.value.clase_vehiculo;
    console.log('Vehículo nuevo', vehiculo);
    this.servicioVehiculo.crearVehiculo(vehiculo)
    .subscribe( ( respuesta: any ) => {
      console.log(respuesta);
      this.formularioVehiculo.reset();
      this.servicioAgregarVehiculo.notificacion.emit(respuesta);
      Swal.fire('Éxito', 'El vehículo fue registrado correctamente', 'success');
    });
  }

  /**
   * Obtiene las clases de vehículos
   */
  obtenerClasesVehiculos(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando catálogos',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioClaseVehiculo.obtenerClaseVehiculo()
    .subscribe( ( clasesVehiculos: ClaseVehiculo[] ) => {
      this.listaClasesVehiculos = clasesVehiculos;
      Swal.close();
    });

  }
  /**
   * Obtiene los tipos de vehículos
   */
  obtenerTiposVehiculos(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando catálogos',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioTipoVehiculo.obtenerTipoVehiculo()
    .subscribe( (tiposVehiculos: TipoVehiculo[]) => {
      this.listaTiposVehiculos = tiposVehiculos;
      Swal.close();
    });
  }

}
