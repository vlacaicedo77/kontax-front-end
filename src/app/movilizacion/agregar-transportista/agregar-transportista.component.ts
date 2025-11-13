import { Component, OnInit } from '@angular/core';
import { AgregarTransportistaService } from './servicios/agregar-transportista.service';
import { TransportistaService } from '../../servicios/transportista/transportista.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TipoActividadTransporteService } from '../../servicios/tipo-actividad-transporte.service';
import { TipoActividadTransportes } from '../../modelos/tipo-actividad-transporte.modelo';
import Swal from 'sweetalert2';
import { Transportista } from 'src/app/modelos/transportista.modelo';

@Component({
  selector: 'app-agregar-transportista',
  templateUrl: './agregar-transportista.component.html',
  styleUrls: ['./agregar-transportista.component.css']
})
export class AgregarTransportistaComponent implements OnInit {

  formularioTrasnportista: FormGroup;
  listaTipoActividadTransporte: TipoActividadTransportes[] = [];

  constructor(
    public servicioAgregarTransportista: AgregarTransportistaService,
    private servicioTransportista: TransportistaService,
    private servicioTipoActividadTransporte: TipoActividadTransporteService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.obtenerTiposActividadesTransportes();
  }

  /**
   * Inicializa el formulario
   */
  inicializarFormulario(){
    this.formularioTrasnportista = new FormGroup({
      cedula: new FormControl(null, Validators.required),
      nombre_completo: new FormControl(null, Validators.required),
      tipo_licencia: new FormControl(null, Validators.required),
      puntos_licencia: new FormControl(null, Validators.required),
      id_tipo_actividad_transporte: new FormControl(null, Validators.required)
    });
  }

  /**
   * Registra un nuevo transportista
   */
  registrarTransportista(){
    this.formularioTrasnportista.markAllAsTouched();
    if ( this.formularioTrasnportista.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores.', 'error');
      return;
    }
    const transportista = new Transportista();
    transportista.cedula = this.formularioTrasnportista.value.cedula;
    transportista.nombreCompleto = this.formularioTrasnportista.value.nombre_completo;
    transportista.tipoLicencia = this.formularioTrasnportista.value.tipo_licencia;
    transportista.puntosLicencia = this.formularioTrasnportista.value.puntos_licencia;
    transportista.idTipoActividadTransporte = this.formularioTrasnportista.value.id_tipo_actividad_transporte;
    console.log('Transportista: ', transportista);
    this.servicioTransportista.registrarTransportista(transportista)
    .subscribe( (respuesta: any) => {
      this.formularioTrasnportista.reset();
      this.servicioAgregarTransportista.notificacion.emit(respuesta);
      Swal.fire('Éxito', 'El nuevo transportista se registró correctamente.', 'success');
    });
  }

  /**
   * Cierra el panel flotante
   */
  cerrarPanel(){
    this.formularioTrasnportista.reset();
    this.servicioAgregarTransportista.cerrar();
  }

  /**
   * Consulta el catálogo de tipos de actividades de transportes
   */
  obtenerTiposActividadesTransportes(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando el catálogo.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioTipoActividadTransporte.obtenerTiposActividadesTransportes()
    .subscribe( (tiposActividades: TipoActividadTransportes[]) => {
      this.listaTipoActividadTransporte = tiposActividades;
      Swal.close();
    });

  }

}
