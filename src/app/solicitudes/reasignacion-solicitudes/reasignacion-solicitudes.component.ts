import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Importación de modelos.
import { TramiteSolicitud } from 'src/app/modelos/tramite-solicitud.modelo';

// Importación de servicios.
import { SolicitudBajaIdentificadorService } from 'src/app/servicios/solicitud-baja-identificador/solicitud-baja-identificador.service';
import { SolicitudIdentificadorService } from 'src/app/servicios/solicitud-identificador/solicitud-identificador.service';
import { SolicitudReareteoService } from 'src/app/servicios/solicitud-reareteo/solicitud-reareteo.service';
import { SolicitudGenericoService } from 'src/app/servicios/solicitud-generico/solicitud-generico.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { OficinaInternaService } from 'src/app/servicios/oficina-interna/oficina-interna.service';

@Component({
  selector: 'app-reasignacion-solicitudes',
  templateUrl: './reasignacion-solicitudes.component.html',
  styleUrls: []
})
export class ReasignacionSolicitudesComponent implements OnInit {

  listaSolicitudesOriginal = [];
  listaSolicitudes = [];
  listaProvincias = [];
  listaOficinasOriginal = [];
  listaOficinas = [];
  listaFuncionarios = [];
  listadoTramitesVisible = false;
  formularioVisible = false;
  busquedaVisible = false;
  asignadorNacional = false;
  tramite : TramiteSolicitud;
  idOficina : number;
  tipoSolicitud;
  idSolicitud;
  listaVacia = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  formularioBusquedaFuncionarios: FormGroup;
  
  constructor(    
    private _solicitudReareteoService: SolicitudReareteoService,
    private _solicitudBajaIdentificadorService: SolicitudBajaIdentificadorService,
    private _solicitudIdentificadorService: SolicitudIdentificadorService,
    private _solicitudGenericoService: SolicitudGenericoService,
    private _usuarioService: UsuarioService,
    private _provinciaService: ProvinciaService,
    private _oficinaService: OficinaInternaService,
    private router: Router) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.inicializarFormularioBusquedaFuncionarios();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.verificarRolUsuario();//Se valida el acceso del usuario, en base a su rol
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputFuncionario: new FormControl(null, [Validators.required])
    });
  }

  // Inicializar formulario.
  inicializarFormularioBusquedaFuncionarios() {
    this.formularioBusquedaFuncionarios = new FormGroup({
      inputProvincia: new FormControl(null, [Validators.required]),
      inputOficinas: new FormControl(null, [Validators.required]),
    });
  }

  //Buscar solicitudes
  buscarTramites()
  {
    let formularioInvalido = false;
    let mensaje = "El formulario de búsqueda contiene errores<ul></br>";

    if(this.listaVacia){
      formularioInvalido = true;
      mensaje += "<li>Debe seleccionar una oficina para la búsqueda</li>";
    }

    //Validaciones de lógica de negocio.
    if(this.formularioBusquedaFuncionarios.value.inputOficinas == null){
      formularioInvalido = true;
      mensaje += "<li>Seleccione una oficina.</li>";
    }
    if ( this.formularioBusquedaFuncionarios.invalid || formularioInvalido) {
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

   this.idOficina = this.formularioBusquedaFuncionarios.value.inputOficinas;
   this.cargarFuncionariosOficina(this.idOficina);
   this.cargarSolicitudesOficina(this.idOficina);
  }

  // Método que obtiene los datos de provincias.
  cargarProvinciasPorPais(idPais: number) {
    this._provinciaService.getProvinciasPorPais(idPais)
    .subscribe( respuesta => this.listaProvincias = respuesta );
  }

  // Método que obtiene los datos de oficinas por provincias.
  cargarOficinasPorProvincia(idProvincia: number) {
    this._oficinaService.getOficinasInternasPorProvincia(idProvincia)
    .subscribe( respuesta => {
      this.listaOficinasOriginal = respuesta;
      this.listaOficinas = this.listaOficinasOriginal;
    });
  }

  // Método que obtiene el listado de las solicitudes pendientes de asignar por oficina
  cargarSolicitudesOficina(idOficina:number)
  {
    this.formularioVisible = false;
    this.idSolicitud = null;
    this.tipoSolicitud = null;
    this.idOficina = idOficina;
    this._solicitudGenericoService.consultarSolicitudesReasignables({
      idOficina: this.idOficina
    }).subscribe( (resp:any) =>{
      if (resp.estado === 'OK') 
      {
        this.listaSolicitudesOriginal = resp.resultado;
        this.listaSolicitudes = this.listaSolicitudesOriginal;
        this.listadoTramitesVisible=true;
        Swal.fire('Éxito', 'La búsqueda se ha realizado con éxito', 'success');
      }
      else {
        this.listadoTramitesVisible=false;
        Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

  // Método que obtiene los funcionarios activos de una oficina
  cargarFuncionariosOficina(idOficina:number)
  {
    this._usuarioService.consultarReporteUsuarioInternoFiltros({
      idOficina: idOficina,
      estado : 2 //estado de usuario Activo
    }).subscribe( (resp:any) =>{
          if (resp.estado === 'OK') 
          {
            this.listaFuncionarios = resp.resultado;
            Swal.fire('Éxito', 'La búsqueda se ha realizado con éxito', 'success');
          }
          else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
    });
  }

  // Método que obtiene los datos de roles del usuario
  verificarRolUsuario()
  {
    if(this._usuarioService.usuarioInterno)
    {
      let idUsuario = parseInt(localStorage.getItem('idUsuario'));

      this._usuarioService.consultarRolesUsuarioInternoId(idUsuario)
      .subscribe( (resp:any) =>{
            if (resp.estado === 'OK') 
            {
              let rolesUsuario = resp.resultado;
              let aprobadorNacional = false;
              rolesUsuario.forEach(rol => {
                if(rol.idRoles == 16)//Rol de asignador de trámites nacional
                  aprobadorNacional = true;
                if(aprobadorNacional)//Rol de asignador de trámites nacional
                {
                  this.asignadorNacional = true;
                }
                else
                {
                  this.asignadorNacional = false;
                  this.idOficina = parseInt(localStorage.getItem('oficina'));
                  this.cargarFuncionariosOficina(this.idOficina);
                  this.cargarSolicitudesOficina(this.idOficina);
                }
              })
            }
            else {
            Swal.fire('Error', resp.mensaje , 'error');
          }
        } );
    }
    else
    {
      Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad' , 'error');
      this.router.navigate(['inicio']);
    }
  }

  //Método para realizar la asignación de un trámite
  asignarTramite()
  {
    let formularioInvalido = false;
    let mensaje = "El formulario de solicitud contiene errores<ul></br>";

    //Validaciones de lógica de negocio.
    if(this.idSolicitud===null || this.idSolicitud === undefined){
        formularioInvalido = true;
        mensaje += "<li>Debe seleccionar la solicitud a asignar</li>";
      }
    if(this.formulario.value.inputFuncionario===null || this.formulario.value.inputFuncionario === undefined){
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
    tramite.accion = 'reasignar';
    tramite.observaciones = 'Reasignación de técnico';
    tramite.idUsuarioTecnico = this.formulario.value.inputFuncionario;

    Swal.fire({
      title: 'Espere...',
      text: 'Sus datos se están registrando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
   });

   this.tramitarSolicitud(tramite);
  }

  // Método que permite tramitar asignación una solicitud de identificadores.
  tramitarSolicitud(tramite : TramiteSolicitud) {

    if(this.tipoSolicitud == 1)//Solicitud de identificadores
    {
      this._solicitudIdentificadorService.tramitarSolicitud(tramite)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
          //this.cargarSolicitudesOficina(this.idOficina);
          this.router.navigate(['inicio']);
        }
        else {
        Swal.fire('Error', resp.mensaje , 'error');
        this.router.navigate(['inicio']);
        }
      });
    }
    else if(this.tipoSolicitud == 2)//Solicitud de reareteo
    {
      this._solicitudReareteoService.tramitarSolicitud(tramite)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
          //this.cargarSolicitudesOficina(this.idOficina);
          this.router.navigate(['inicio']);
        }
        else {
        Swal.fire('Error', resp.mensaje , 'error');
        this.router.navigate(['inicio']);
        }
      });
    }
    else if(this.tipoSolicitud == 3)//Solicitud de baja de identificadores
    {
      this._solicitudBajaIdentificadorService.tramitarSolicitud(tramite)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
          //this.cargarSolicitudesOficina(this.idOficina);
          this.router.navigate(['inicio']);
        }
        else {
        Swal.fire('Error', resp.mensaje , 'error');
        this.router.navigate(['inicio']);
        }
      });
    }
    else
    {
      Swal.fire('Error', 'Tipo de trámite inválido' , 'error');
    }
  }

  //Método que obtiene la selección de una solicitud del usuario
  seleccionaSolicitud(idSolicitud: number, tipoSolicitud: number){
    this.idSolicitud = idSolicitud;
    this.tipoSolicitud = tipoSolicitud;
    this.formularioVisible = true;
  }

  //Función para filtrar Solicitudes
  filtrarSolicitudesSolicitante(event: KeyboardEvent) {
    let elemento = event.target as HTMLInputElement;
    let cadena = elemento.value;
    if (typeof cadena === 'string') 
    {
      this.listaSolicitudes = this.listaSolicitudesOriginal.filter(a => a.identificacion_solicitante.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
    }
  }

  //Funcion para filtrar Trámites por su tipo
  filtrarSolicitudesTipo(filtro : string)
  {
     switch(filtro)
     {
       case "0"://todas
        this.listaSolicitudes = this.listaSolicitudesOriginal;
       break;
       case "1"://Identificadores
        this.listaSolicitudes = this.listaSolicitudesOriginal.filter(  tramite  => tramite.id_tipo_tramite == 1);
       break;
       case "2"://Reareteo
        this.listaSolicitudes = this.listaSolicitudesOriginal.filter(  tramite  => tramite.id_tipo_tramite == 2);
       break;
       case "3"://Baja Identificador
        this.listaSolicitudes = this.listaSolicitudesOriginal.filter(  tramite  => tramite.id_tipo_tramite == 3);
       break;
       default:
        Swal.fire('Error', "Filtro inválido" , 'error');
        this.listaSolicitudes = this.listaSolicitudesOriginal;
       break;
     }
  }

  //Función para filtrar Oficinas
  filtrarOficinas(event: KeyboardEvent) {
    let elemento = event.target as HTMLInputElement;
    let cadena = elemento.value;
    if (typeof cadena === 'string') 
    {
      this.listaOficinas = this.listaOficinasOriginal.filter(a => a.nombre.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
      //Agregar el control para cuando el filtrado de identificadores resulta en una lista vacía
      this.listaOficinas.length == 0 ? this.listaVacia = true : this.listaVacia = false;
    }
  }
}
