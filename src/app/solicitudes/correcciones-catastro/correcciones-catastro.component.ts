import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { SolicitudCorreccionCatastroBovino } from '../../modelos/solicitud-correccion-catastro-bovino.modelo';
import { SolicitudCorreccionCatastroService } from '../../servicios/solicitud-correccion-catastro/solicitud-correccion-catastro.service';
import Swal from 'sweetalert2';
import { EstadoDocumentoService } from '../../servicios/estado-documento/estado-documento.service';
import { EstadoDocumento } from '../../modelos/estado-documento.modelo';
import { ThrowStmt } from '@angular/compiler';
import { FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-correcciones-catastro',
  templateUrl: './correcciones-catastro.component.html',
  styles: [
  ]
})
export class CorreccionesCatastroComponent implements OnInit {

  formularioBusqueda: FormGroup;
  solicitudes: SolicitudCorreccionCatastroBovino[];
  estadosDocumentos: EstadoDocumento[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioSolicitudesCorreccionesCatastro: SolicitudCorreccionCatastroService,
    private servicioEstadosDocumentos: EstadoDocumentoService,
    public servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.obtenerEstadosDocumentos();
    this.servicioScript.inicializarScripts();
    this.consultarSolicitudesCorreccionesCatastro();
    this.inicializarFormularioBusqueda();
  }

  // Método que permite consultar las solicitudes de correcciones de catastro.
  consultarSolicitudesCorreccionesCatastro(parametros: any = {}){
    this.solicitudes = [];
    if ( this.servicioUsuario.usuarioExterno ) {
      parametros.idUsuario = this.servicioUsuario.usuarioExterno.idUsuario;
    } else if ( this.servicioUsuario.usuarioInterno ) {
      parametros.idTecnico = this.servicioUsuario.usuarioInterno.idUsuario;
    } else{
      return;
    }
    Swal.fire({
      text: 'Buscando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioSolicitudesCorreccionesCatastro.obtenerSolicitudesCorreccionesCatastro(parametros)
    .subscribe( (solicitudesCorrecciones: SolicitudCorreccionCatastroBovino[]) => {
      this.solicitudes = solicitudesCorrecciones;
      console.log(this.solicitudes);
      Swal.close();
    });
  }

  // Método que permite consultar los estados de los documentos.
  obtenerEstadosDocumentos(){
    this.servicioEstadosDocumentos.obtenerEstadosDocumentos()
    .subscribe( ( resultado: EstadoDocumento[]) => {
      this.estadosDocumentos = resultado.filter( (item) => {
        return item.grupo === 'SCCB';
      });
    });
  }

  // Método que inicializa el formulario de búsqueda
  inicializarFormularioBusqueda() {
    this.formularioBusqueda = new FormGroup({
      codigo_solicitud: new FormControl(null),
      id_estado_documento: new FormControl(null)
    });
  }

  // Método que permite recargar las solicitudes
  recargarSolicitudes(){
    this.formularioBusqueda.reset();
    this.consultarSolicitudesCorreccionesCatastro();
  }

  // Método que se ejecuta para el panel de búsqueda
  busquedaSolicitudes() {
    const parametros: any = {};
    if (this.formularioBusqueda.value.id_estado_documento !== null) {
      parametros.idEstadoDocumento = this.formularioBusqueda.value.id_estado_documento;
    }
    if ( this.formularioBusqueda.value.codigo_solicitud !== null && this.formularioBusqueda.value.codigo_solicitud !== '' ) {
      parametros.codigoSolicitud = this.formularioBusqueda.value.codigo_solicitud;
    }
    this.consultarSolicitudesCorreccionesCatastro(parametros);
  }

}
