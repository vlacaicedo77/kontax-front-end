import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudCorreccionCatastroService } from '../../servicios/solicitud-correccion-catastro/solicitud-correccion-catastro.service';
import { SolicitudCorreccionCatastroBovino } from 'src/app/modelos/solicitud-correccion-catastro-bovino.modelo';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-correccion-catastro',
  templateUrl: './correccion-catastro.component.html',
  styles: [
  ]
})
export class CorreccionCatastroComponent implements OnInit {

  formularioTramite: FormGroup;
  solicitudCorreccionCatastro?: SolicitudCorreccionCatastroBovino;

  constructor(
    private servicioScript: ScriptsService,
    private servicioRutaActiva: ActivatedRoute,
    private servicioSolicitudCorreccionCatastro: SolicitudCorreccionCatastroService,
    private servicioRutas: Router,
    public servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioRutaActiva.params.subscribe( (parametros: any) => {
      this.obtenerSolicitudCorreccionCatastroBovino(parametros?.id);
    });
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioTramite();
  }

  // Método que permite inicilizar el formulario para tramitar la solicitud
  inicializarFormularioTramite(){
    this.formularioTramite = new FormGroup({
      id_solicitud: new FormControl(null, Validators.required),
      observacion: new FormControl(null, Validators.maxLength(2048))
    });
  }

  // Método que permite obtener la solicitud de corrección de catastro bovino.
  obtenerSolicitudCorreccionCatastroBovino( idSolicitud: number ){
    Swal.fire({
      title: 'Obteniendo información de la solicitud...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioSolicitudCorreccionCatastro.obtenerSolicitudesCorreccionesCatastro({
      idCorreccionCatastro: idSolicitud
    }).subscribe( ( solicitudes: SolicitudCorreccionCatastroBovino[]) => {
      if ( solicitudes.length > 0) {
        this.solicitudCorreccionCatastro = solicitudes[0];
        console.log(this.solicitudCorreccionCatastro);
        this.establecerDatosEnFormulario();
      }
      Swal.close();
    });
  }

  // Método que establece los datos en el objeto formulario.
  establecerDatosEnFormulario(){
    this.formularioTramite.controls.id_solicitud.setValue(this.solicitudCorreccionCatastro.idCorreccionCatastro);
    this.formularioTramite.controls.observacion.setValue(this.solicitudCorreccionCatastro.observacion);
  }
  // Método que permite tramitar la solicitud de corrección de catastro bovino
  tramitarSolicitud(){
    if ( this.solicitudCorreccionCatastro ) {
      Swal.fire({
        title: 'Espere...',
        text: 'Aprobando la solicitud.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.servicioSolicitudCorreccionCatastro
      .aprobarSolicitudCorreccionCatastro(this.solicitudCorreccionCatastro.idCorreccionCatastro, this.formularioTramite.value.observacion)
      .subscribe( (respuesta: any) => {
        console.log(respuesta);
        Swal.fire('Éxito', 'La aprobación de la solicitud se realizó correctamente.', 'success').then(() => {
          this.servicioRutas.navigate(['solicitudes-correcciones-catastro']);
        });
      });
    }
  }

  // Método que rechaza la solicitud de correción.
  rechazarSolicitud(){
    if ( this.solicitudCorreccionCatastro ) {
      Swal.fire({
        title: 'Espere...',
        text: 'Rechazando la solicitud.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.servicioSolicitudCorreccionCatastro
      .rechazarSolicitudCorreccionCatastro(this.solicitudCorreccionCatastro.idCorreccionCatastro, this.formularioTramite.value.observacion)
      .subscribe( (respuesta: any) => {
        console.log(respuesta);
        Swal.fire('Éxito', 'El rechazo de la solicitud fue registró correctamente.', 'success').then(() => {
          this.servicioRutas.navigate(['solicitudes-correcciones-catastro']);
        });
      });
    }
  }

}
