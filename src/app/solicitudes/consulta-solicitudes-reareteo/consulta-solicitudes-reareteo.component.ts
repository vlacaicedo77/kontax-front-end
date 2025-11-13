import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// Importación de servicios.
import { SolicitudReareteoService } from 'src/app/servicios/solicitud-reareteo/solicitud-reareteo.service';
import { EstadoSolicitudService } from 'src/app/servicios/estado-solicitud/estado-solicitud.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-consulta-solicitudes-reareteo',
  templateUrl: './consulta-solicitudes-reareteo.component.html',
  styleUrls: []
})
export class ConsultaSolicitudesReareteoComponent implements OnInit {

  //Objetos para gestionar la búsqueda
  public listaSolicitudes = [];
  public listaEstados = [];

  // Objeto que maneja el formulario.
  formulario: FormGroup;

  constructor(
    private _solicitudService: SolicitudReareteoService,
    private _estadosService: EstadoSolicitudService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarEstadosSolicitud();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputIdentificacionSolicitante: new FormControl(null,[Validators.pattern(mascaras.MASK_NUMERICO)]),
      inputIdentificacionResponsable: new FormControl(null,[Validators.pattern(mascaras.MASK_NUMERICO)]),
      inputNombreSolicitante: new FormControl(null,[Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputNombreResponsable: new FormControl(null,[Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputEstado: new FormControl(null)
    });
  }

  consultarReporteSolicitudes(){
    let idSolicitante = this.formulario.value.inputIdentificacionSolicitante;
    let idResponsable = this.formulario.value.inputIdentificacionResponsable;
    let solicitante = this.formulario.value.inputNombreSolicitante;
    let responsable = this.formulario.value.inputNombreResponsable;
    let idEstado = this.formulario.value.inputEstado;

    this._solicitudService.consultarReporteSolicitudes(idSolicitante,idResponsable,solicitante,responsable,idEstado,'')
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaSolicitudes = resp.resultado;
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

   // Método que obtiene los datos de tipos de actividad
cargarEstadosSolicitud() {
  this._estadosService.getEstadosSolicitud()
  .subscribe( respuesta => this.listaEstados = respuesta.resultado );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}
