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
  selector: 'app-tramite-solicitud-identificador-prov',
  templateUrl: './tramite-solicitud-identificador-prov.component.html',
  styleUrls: []
})
export class TramiteSolicitudIdentificadorProvComponent implements OnInit {

  //Objetos para gestionar la búsqueda
  public listaSolicitudes = [];
  public idSolicitud: number;
  public idPaso: number;
  public extensionArchivo: string;
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
      confirmacionEntrega: new FormControl(null)
    });
  }

  consultarReporteSolicitudes(){
    
    let idSolicitante = '';
    let idResponsable = localStorage.getItem('identificacion');//Se consultan solamente las solicitudes de las que el usuario es responsable    
    let solicitante = '';
    let responsable = '';
    let idEstado = '';
    let tipoRolResponsable = 2;//Filtra que solamente sean usuarios externos(proveedores) los responsables

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

// Método que obtiene la solicitud seleccionada por el usuario
seleccionaSolicitud(idSolicitud:number, idPaso:number){
  this.idSolicitud = idSolicitud;
  this.idPaso = idPaso;
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
    if(this.idPaso === 5 && (this.formulario.get('confirmacionEntrega').value=== null || this.formulario.get('confirmacionEntrega').value=== undefined || this.formulario.get('confirmacionEntrega').value=== '')){
      formularioInvalido = true;
      mensaje += "<li>No se ha cargado ningún archivo válido</li>";
    }
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});

  //Mensaje de confirmación
  Swal.fire({
    title: 'Está seguro de enviar la solicitud?',
    text: "Una vez enviada la solicitud no podrá ser eliminada",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, enviar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      

      
      let tramite = new TramiteSolicitud();
      tramite.idSolicitud = this.idSolicitud;
      tramite.accion = accion;
      tramite.observaciones = this.formulario.value.inputObservaciones;
      

      if(this.idPaso === 5){ 
        //Solo cuando es paso 5(pendiente de entrega) se envía un archivo adjunto
        let fecha = new Date();
        let nombreArchivo = 'CON' + this.idSolicitud + fecha.getFullYear()+fecha.getMonth()+fecha.getDay()+fecha.getTime() + this.extensionArchivo;
        tramite.nombreAdjunto = nombreArchivo;
        
        const formData = new FormData();
        formData.append('confirmacionEntrega', this.formulario.get('confirmacionEntrega').value);
        this._solicitudService.cargarConfirmacionEntrega(nombreArchivo,formData).subscribe(
        (resp1: any) => {
    
          if ( resp1.estado === 'OK') {
            this.llamarServicioTramitar(tramite);
          }
          else
          {
            Swal.fire('Error', resp1.mensaje , 'error');
          }
        });
      }
      else
      {
        this.llamarServicioTramitar(tramite);
      }
      
    }
    else
    Swal.close();
  })
}

//Método que llama al servicio de tramitar solicitud
llamarServicioTramitar(tramite: TramiteSolicitud)
{
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

//Método que prepara el formulario cuando un archivo ha sido seleccionado
seleccionarArchivoComprobacion(event)
{
  if (event.target.files.length > 0) {
    const archivo = event.target.files[0];
    let archivoValido = true;
    let tamañoMaximoMb = 5;
    let mensaje = "El archivo cargado tiene errores<ul></br>";
    //Validaciones del archivo
    if(archivo.size >(tamañoMaximoMb*1024*1024)){
      archivoValido = false;
      mensaje += "<li>El tamaño del archivo excede el máximo permitido ("+tamañoMaximoMb+" Mb)</li>";
    }
    if(archivo.type !== 'application/pdf'){
      archivoValido = false;
      mensaje += "<li>El tipo de archivo debe ser PDF</li>";
    }
    if (archivoValido) {
      if(archivo.type === 'application/pdf')
        this.extensionArchivo ='.pdf';
      
      this.formulario.get('confirmacionEntrega').setValue(archivo);
    }
    else{
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
    }
  }
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}
