import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
// Importación de modelos.
import { Sitio } from 'src/app/modelos/sitio.modelo';
import { CertificacionSitio } from 'src/app/modelos/certificacion-sitio.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { CertificacionService } from 'src/app/servicios/certificacion/certificacion.service';
import { EstadoCertificacionService } from 'src/app/servicios/estado-certificacion/estado-certificacion.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-registro-certificaciones',
  templateUrl: './registro-certificaciones.component.html',
  styleUrls: []
})

export class RegistroCertificacionesComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public listaCertificaciones = [];
  public listaEstadosCertificaciones = [];

  // Objeto que maneja el formulario.
  formulario: FormGroup;

  encriptar: any;

  constructor(
    private _sitioService: SitioService,
    private _certificacionService: CertificacionService,
    private _estadoCertificacionService: EstadoCertificacionService
  ) { }

  ngOnInit() {
    this.cargarCertificaciones();
    this.cargarEstadosCertificaciones();
    this.inicializarFormulario();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      //inputIdentificacionPropietario: new FormControl(null, []),
      inputSitio: new FormControl(null, [Validators.required]),
      inputCertificacion: new FormControl(null, [Validators.required]),
      inputEstadoCertificacion: new FormControl(null, [Validators.required]),
      inputFechaInicio: new FormControl(null, [Validators.required]),
      inputFechaFin: new FormControl(null, [Validators.required]),
      inputObservaciones: new FormControl(null, [Validators.required])
    });
  }

// Método que permite registrar una certificacion para un sitio
registrarCertificacionSitio() {
  let formularioInvalido = false;
  let mensaje = "El formulario de registro contiene errores<ul></br>";

 if ( this.formulario.invalid || formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('Error', mensaje, 'error');
  return;
 }

  let certificacionSitio = new CertificacionSitio();

  certificacionSitio.idSitio = this.formulario.value.inputSitio;
  certificacionSitio.idCertificaciones = this.formulario.value.inputCertificacion;
  certificacionSitio.idEstadosCertificaciones = this.formulario.value.inputEstadoCertificacion;
  certificacionSitio.fechaInicio = this.formulario.value.inputFechaInicio;
  certificacionSitio.fechaFin = this.formulario.value.inputFechaFin;
  certificacionSitio.observaciones = this.formulario.value.inputObservaciones;
  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._sitioService.registrarCertificacionSitio(certificacionSitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'La Certificación fue registrada correctamente', 'success');
      this.formulario.reset();
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}

// Método que obtiene los datos de los estados de las certificaciones
cargarEstadosCertificaciones() {
  this._estadoCertificacionService.getEstadosCertificaciones()
  .subscribe( respuesta => this.listaEstadosCertificaciones = respuesta );
}

// Método que obtiene los datos las certificaciones
cargarCertificaciones() {
  this._certificacionService.getCertificaciones()
  .subscribe( respuesta => this.listaCertificaciones = respuesta );
}

// Método que permite buscar los sitios de un usuario por su número de identificación.
buscarSitio(numeroIdentificacionUsuario: string) {
  if ( numeroIdentificacionUsuario === null) {
    return;
  }
  this.listaSitios = [];
  this._sitioService.consultarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacionUsuario)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaSitios = resp.resultado;
        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
      }
      else {
        Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
      }
    }
    else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
   })}

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }
}


