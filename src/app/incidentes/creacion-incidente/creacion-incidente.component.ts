import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { IncidentesService } from 'src/app/servicios/incidentes/incidentes.service';
import { ProcesosIncidentesService } from 'src/app/servicios/procesos-incidentes/procesos-incidentes.service';
import { CriteriosIncidentesService } from 'src/app/servicios/criterios-incidentes/criterios-incidentes.service';

// Importacion de modelos
import { Incidente } from 'src/app/modelos/incidente.modelo';
import { Sitio } from 'src/app/modelos/sitio.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { trim } from 'jquery';

@Component({
  selector: 'app-creacion-incidente',
  templateUrl: './creacion-incidente.component.html',
  styleUrls: []
})
export class CreacionIncidenteComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaCriterios = [];
  public listaProcesos = [];
  public sitio = new Sitio();
  public usuario = new Usuario();

  // Objeto que maneja el formulario.
  formulario: FormGroup;

  constructor(
    private _sitioService: SitioService,
    private _usuarioService: UsuarioService,
    private _criterioService: CriteriosIncidentesService,
    private _procesoService: ProcesosIncidentesService,
    private _incidenteService: IncidentesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCriterios();
    this.cargarProcesos();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputProceso: new FormControl(null,[Validators.required]),
      inputCriterio: new FormControl(null,[Validators.required]),
      inputUsuarioReportado: new FormControl(null),
      inputSitio: new FormControl(null),
      inputFechaIncidente: new FormControl(null,[Validators.required]),
      inputFechaReporte: new FormControl(null,[Validators.required]),
      inputDetalle: new FormControl(null,[Validators.required,Validators.pattern(mascaras.MASK_ALFANUMERICO)])
    });
  }

  // Método que obtiene los datos de tipos de propiedad.
  cargarProcesos() {
    this._procesoService.getProcesosIncidentes()
    .subscribe( respuesta => this.listaProcesos = respuesta );
  }
    // Método que obtiene los datos de provincias.
  cargarCriterios() {
    this._criterioService.getCriteriosIncidentes()
    .subscribe( respuesta => this.listaCriterios = respuesta );
  }

  // Método que obtiene los datos de usuarios externos por su id
  buscarUsuarios(numeroIdentificacion: string) {
    this._usuarioService.consultarUsuarioExtFiltros(null, null, null, numeroIdentificacion, 2 /*Estado Activo*/)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        Swal.fire('Éxito', 'Se ha realizado la búsqueda con éxito.', 'success');
        if(resp.resultado.length == 0)
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados.', 'success');
        else
        {
          if(resp.resultado.length > 1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un registro.', 'error');
          else
            this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
            this.usuario.nombres = resp.resultado[0].nombres;
            this.usuario.apellidos = resp.resultado[0].apellidos;
        }
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

  // Método que obtiene los datos de sitios por su codigo catastral
  buscarSitios(codigoCatastral: string) {
    this._sitioService.consultarSitiosPorFiltros({codigoSitio : codigoCatastral})
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        Swal.fire('Éxito', 'Se ha realizado la búsqueda con éxito.', 'success');
        if(resp.resultado.length == 0)
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados.', 'success');
        else
        {
          if(resp.resultado.length > 1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un registro.', 'error');
          else
            this.sitio.idSitio = resp.resultado[0].id_sitio;
            this.sitio.nombre = resp.resultado[0].nombre;
        }
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

  // Método que permite registrar un incidente.
  registrarIncidente() {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

    let fechaIncidente = new Date(this.formulario.value.inputFechaIncidente);
    let fechaRegistro = new Date(this.formulario.value.inputFechaReporte);
    let fechaActual = new Date();

    fechaIncidente.setHours(0,0,0,0); //Se encera la hora.
    fechaRegistro.setHours(0,0,0,0); //Se encera la hora
    fechaActual.setHours(0,0,0,0); //Se encera la hora.

    //Validaciones de lógica de negocio.
    if(fechaActual.getTime() < fechaIncidente.getTime()){
      formularioInvalido = true;
      mensaje += "<li>La fecha de incidente debe ser anterior a la fecha actual</li>";
    }
    if(fechaActual.getTime() < fechaRegistro.getTime()){
      formularioInvalido = true;
      mensaje += "<li>La fecha de reporte debe ser anterior a la fecha actual</li>";
    }
    if(fechaIncidente.getTime() >= fechaRegistro.getTime()){
      formularioInvalido = true;
      mensaje += "<li>La fecha de incidente debe ser anterior o igual a la fecha de reporte</li>";
    }
    if(this.usuario.idUsuario == null){
      formularioInvalido = true;
      mensaje += "<li>El usuario reportado no es válido</li>";
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
    title: 'Está seguro de registrar el incidente?',
    text: "Una vez enviado no lo podrá modificar",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, enviar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
    
      let incidente = new Incidente();
      incidente.idCriterioAfectacion=this.formulario.value.inputCriterio;
      incidente.idProcesoAfectado=this.formulario.value.inputProceso;
      incidente.idSitioIncidente=this.sitio.idSitio;
      incidente.idUsuarioReportado=this.usuario.idUsuario;
      incidente.detalleIncidente=this.formulario.value.inputDetalle;
      incidente.fechaIncidente=this.formulario.value.inputFechaIncidente;
      incidente.fechaReporte=this.formulario.value.inputFechaReporte;
 
      this._incidenteService.registrarIncidente(incidente).subscribe(
      (resp: any) => {
    
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'El incidente fue registrado correctamente.', 'success');
          this.router.navigate(['inicio']);
        }
        else {
         Swal.fire('Error', resp.mensaje , 'error');
         this.router.navigate(['inicio']);
       }
        });
      }
      else
      Swal.close();
    }
  )
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

}
