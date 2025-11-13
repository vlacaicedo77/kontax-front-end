import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// Importación de servicios.
import { SolicitudReareteoService } from 'src/app/servicios/solicitud-reareteo/solicitud-reareteo.service';
import { BovinoService } from 'src/app/servicios/bovino/bovino.service';
// Importacion de modelos
import { TramiteSolicitud } from 'src/app/modelos/tramite-solicitud.modelo';
import { Bovino } from 'src/app/modelos/bovino.modelo';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';

@Component({
  selector: 'app-tramite-solicitud-reareteo',
  templateUrl: './tramite-solicitud-reareteo.component.html',
  styleUrls: []
})
export class TramiteSolicitudReareteoComponent implements OnInit {

//Objetos para gestionar la búsqueda
public listaSolicitudes = [];
public bovino:Bovino;
public idSolicitud:number;
public idIdentificador:number;
public formularioVisible = false;
public tipoConfirmacion:string;
public observacionesAnteriores:string;

// Objeto que maneja el formulario.
formulario: FormGroup;

constructor(
  private scriptServicio: ScriptsService,
  private _solicitudService: SolicitudReareteoService,
  private _bovinoService: BovinoService,
  private router: Router
) { }

ngOnInit() {
  this.scriptServicio.inicializarScripts();
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
    
  let idSolicitante = localStorage.getItem('identificacion');//Se consultan solamente las solicitudes creadas por el usuario
  let idResponsable = '';
  let solicitante = '';
  let responsable = '';
  let idEstado = '';

  if(idSolicitante===null || idSolicitante === undefined || idSolicitante ==='')
  {
    Swal.fire('Error', "Ha ocurrido un error al intentar obtener el identificador del usuario" , 'error');
    return;
  }

  this._solicitudService.consultarReporteSolicitudes(idSolicitante,idResponsable,solicitante,responsable,idEstado,'')
.subscribe( (resp: any) => {
  if ( resp.estado === 'OK')  {
    if(resp.resultado.length > 0) {
      this.listaSolicitudes = resp.resultado;
      Swal.fire('Éxito', 'Se han cargado sus solicitudes exitosamente', 'success');
    }
    else {
      Swal.fire('Éxito', 'No existen solicitudes en su historial', 'success');
    }
  }
  else {
    Swal.fire('Error', resp.mensaje , 'error');
  }
 })}

// Método que se activa cuando el usuario selecciona una solicitud
seleccionaSolicitud(idSolicitud:number, idIdentificadorBovino:number, paso:number, observacionesAnteriores:string){

  let formularioInvalido = false;
  let mensaje = "Ha ocurrido un error. <ul></br>";
  
  //Validaciones de lógica de negocio.
  if(idSolicitud == null){
    formularioInvalido = true;
    mensaje += "<li>Debe seleccionar una solicitud de reareteo. </li>";
  }
  if(idIdentificadorBovino == null){
    formularioInvalido = true;
    mensaje += "<li>No se ha podido obtener el código del identificador a rearetear. </li>";
  }
  if(paso < 6 && paso > 7)
  {
    formularioInvalido = true;
    mensaje += "<li>Paso de la solicitud inválido. </li>";
  }
  else
  {
    if(paso == 6)
      this.tipoConfirmacion = 'Confirmar recibido identificador para reareteo';
    if(paso==7)
      this.tipoConfirmacion = 'Confirmar bovino reareteado';
  }


  if (formularioInvalido) {
   mensaje += "</ul>"
   this.formularioVisible = false;
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  else
  {
    this.formularioVisible= true;
    this.idSolicitud = idSolicitud;
    this.idIdentificador = idIdentificadorBovino;
    this.observacionesAnteriores = observacionesAnteriores;
    this.buscarBovino();
  }
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

// Método que permite buscar un Bovino.
buscarBovino() {

  Swal.fire({
    title: 'Espere...',
    text: 'Se está ejecutando la búsqueda',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._bovinoService.obtenerBovinosPorFiltroResp({idIdentificador: this.idIdentificador}) 
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      if(resp.resultado.length == 1)
      {
        //Cargar bovino
        this.bovino = resp.resultado[0] as Bovino;
        this.formularioVisible= true;
        Swal.fire('Éxito', 'La búsqueda ha sido ejecutada exitosamente', 'success');
      }
      else
      {
        this.formularioVisible= false;
        if(resp.resultado.length >1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un resultado' , 'error');
        else
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');
      }
    }
    else {
      this.formularioVisible= false;
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
