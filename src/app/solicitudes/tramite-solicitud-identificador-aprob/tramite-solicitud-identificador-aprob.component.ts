import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de servicios.
import { SolicitudIdentificadorService } from 'src/app/servicios/solicitud-identificador/solicitud-identificador.service';
// Importacion de modelos
import { TramiteSolicitud } from 'src/app/modelos/tramite-solicitud.modelo';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-tramite-solicitud-identificador-aprob',
  templateUrl: './tramite-solicitud-identificador-aprob.component.html',
  styleUrls: []
})
export class TramiteSolicitudIdentificadorAprobComponent implements OnInit {

  //Objetos para gestionar la búsqueda
  public listaSolicitudes = [];
  public idSolicitud: number;
  public tramiteVisible = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;

  constructor(
    private _solicitudService: SolicitudIdentificadorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.consultarReporteSolicitudes();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputObservaciones: new FormControl(null,[Validators.required,Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
    });
  }

  consultarReporteSolicitudes(){
     
    let idSolicitante = '';
    let idResponsable = localStorage.getItem('identificacion');//Se consultan solamente las solicitudes de las que el usuario es responsable    
    let solicitante = '';
    let responsable = '';
    let idEstado = '';
    let tipoRolResponsable = 1;//Filtra que solamente sean usuarios internos(funcionarios) los responsables

    if(idResponsable===null || idResponsable === undefined || idResponsable ==='')
    {
      Swal.fire('Error', "Ha ocurrido un error al intentar obtener el identificador del usuario" , 'error');
      return;
    }

    this._solicitudService.consultarReporteSolicitudes(idSolicitante,idResponsable,solicitante,responsable,idEstado,tipoRolResponsable)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaSolicitudes = resp.resultado;
        //Swal.fire('Éxito', 'Se han cargado sus solicitudes exitosamente', 'success');
      }
      else {
        Swal.fire('Éxito', 'No existen solicitudes en su historial', 'success');
      }
    }
    else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
   })}

//
seleccionaSolicitud(idSolicitud:number){
  this.idSolicitud = idSolicitud;
  this.tramiteVisible = true;
}

// Método que permite tramitar una solicitud.
tramitarSolicitud(accion: string) {
  let formularioInvalido = false;
  let mensaje = "El formulario de solicitud contiene errores<ul></br>";

  //Validaciones de lógica de negocio.
  if(this.idSolicitud===null || this.idSolicitud === undefined){
      formularioInvalido = true;
      mensaje += "<li>Debe seleccionar la solicitud a tramitar</li>";
    }
  if(accion===null || accion === undefined || accion ===''){
      formularioInvalido = true;
      mensaje += "<li>Acción inválida</li>";
    }
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  let tramite = new TramiteSolicitud();
  tramite.idSolicitud = this.idSolicitud;
  tramite.accion = accion;
  tramite.observaciones = this.formulario.value.inputObservaciones;

  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._solicitudService.tramitarSolicitud(tramite)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
      this.router.navigate(['inicio']);
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}
