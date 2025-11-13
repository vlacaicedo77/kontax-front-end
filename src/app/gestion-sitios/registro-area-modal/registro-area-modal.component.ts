import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RegistroAreaModalService } from './servicios/registro-area-modal.service';
import { Sitio } from '../../modelos/sitio.modelo';
import { SitioService } from '../../servicios/sitio/sitio.service';
import { TipoActividadAreaService } from '../../servicios/tipo-actividad-area/tipo-actividad-area.service';
import { Area } from '../../modelos/area.modelo';
import { AreaService } from '../../servicios/area/area.service';

@Component({
  selector: 'app-registro-area-modal',
  templateUrl: './registro-area-modal.component.html',
  styleUrls: ['./registro-area-modal.component.css']
})
export class RegistroAreaModalComponent implements OnInit {

  formularioArea: FormGroup;
  listaSitios: Sitio[];
  sitioSeleccionado: Sitio;
  listaTiposActividades: any[];

  constructor(
    public servicioRegistroAreaModal: RegistroAreaModalService,
    private servicioSitio: SitioService,
    private servicioTipoActividad: TipoActividadAreaService,
    private servicioArea: AreaService
  ) { }

  ngOnInit(): void {
    this.sitioSeleccionado = null;
    this.listaSitios = [];
    this.listaTiposActividades = [];
    this.inicializarFormulario();
    this.obtenerTiposActividades();
  }

  inicializarFormulario(){
    this.formularioArea = new FormGroup({
      ci_ruc: new FormControl(null),
      sitio: new FormControl(null, Validators.required),
      nombre: new FormControl(null, Validators.required),
      superficie: new FormControl(null, Validators.required),
      tipo_actividad: new FormControl(null),
      estado: new FormControl(null, Validators.required)
    });
    this.formularioArea.controls.estado.setValue(1);
  }

  /**
   * Cierra el panel
   */
  cerrarPanel(){
    this.formularioArea.reset();
    this.servicioRegistroAreaModal.cerrar();
  }

  /**
   * Registra el área en un sitio
   */
  registrarArea(){
    this.formularioArea.markAllAsTouched();
    if ( this.formularioArea.invalid ) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    if ( Number(this.formularioArea.value.superficie) > Number(this.sitioSeleccionado.superficieHa) ) {
      Swal.fire('Error', `La superficie del área no puede ser mayor a ${this.sitioSeleccionado.superficieHa}`, 'error');
      return;
    }
    const areaNueva = new Area();
    areaNueva.idSitio = this.formularioArea.value.sitio;
    areaNueva.nombre = this.formularioArea.value.nombre;
    areaNueva.superficieHa = this.formularioArea.value.superficie;
    areaNueva.estado = this.formularioArea.value.estado;
    areaNueva.idActividadPrincipal = this.formularioArea.value.tipo_actividad;
    console.log(areaNueva);
    Swal.fire({
      title: 'Espere...',
      text: 'Sus datos se están registrando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioArea.registrarExplotacionPecuaria(areaNueva)
    .subscribe( (respuesta: any) => {
      if ( respuesta.estado === 'OK' ){
        Swal.fire('Éxito', 'La Explotación Pecuaria fue registrada correctamente', 'success');
        this.formularioArea.reset();
        this.sitioSeleccionado = null;
      } else {
        Swal.fire('Error', respuesta.mensaje , 'error');
      }
    });

  }

  /**
   * Buscar ciudadano
   */
  buscarSitios(){
    this.listaSitios = [];
    if ( !this.formularioArea.value.ci_ruc ) {
      Swal.fire('Error', 'Ingrese un número de cédula o RUC', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de predios del ciudadano.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioSitio.filtrarSitios({
      numeroIdentificacionUsuario: this.formularioArea.value.ci_ruc
    }).subscribe( (sitios: Sitio[]) => {
      this.listaSitios = sitios;
      Swal.close();
    });

  }

  /**
   * Permite establecer el sitio seleccionado
   */
  cambioSitio(){
    this.sitioSeleccionado = null;
    this.listaSitios.forEach( (item: Sitio) => {
      if ( Number(item.idSitio) === Number(this.formularioArea.value.sitio) ) {
        this.sitioSeleccionado = item;
      }
    });
  }

  /**
   * Obtiene los tipos de actividades
   */
  obtenerTiposActividades(){
    this.listaSitios = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de predios del ciudadano.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioTipoActividad.getTiposActividadArea()
    .subscribe( (tipos: any[]) => {
      this.listaTiposActividades = tipos;
      Swal.close();
    });

  }


}
