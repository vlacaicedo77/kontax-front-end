import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudAretes } from 'src/app/modelos/solicitud-aretes.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EstadoSolicitud } from '../../modelos/estado-solicitud.modelo';
import { EstadisticaValidacionesAretes } from 'src/app/modelos/estadistica-validaciones-aretes.modelo';
import { PasoSolicitudArete } from '../../modelos/paso-solicitud-arete.modelo';
// Importación de servicios.
import { EstadoSolicitudService } from 'src/app/servicios/estado-solicitud/estado-solicitud.service';
import { SolicitudAretesService } from 'src/app/servicios/solicitud-aretes/solicitud-aretes.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { PasosSolicitudesAretesService } from 'src/app/servicios/pasos-solicitudes-aretes/pasos-solicitudes-aretes.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';
// Importamos Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-tramitar-solicitud-aretes-proveedor',
  templateUrl: './tramitar-solicitud-aretes-proveedor.component.html',
  styleUrls: ['./tramitar-solicitud-aretes-proveedor.component.css']
})
export class TramitarSolicitudAretesProveedorComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  public proveedorSeleccionado?: Usuario = null;
  public solicitudSeleccionada?: SolicitudAretes = null;
  public validacionAretes = new EstadisticaValidacionesAretes();
  //**** Listas ****/
  public listaProveedoresOrdenados = [];
  public listaSolicitudes = [];
  public listaEstadoSolicitudes = [];
  public listaFasesSolicitudes = [];
  public listaFaseSiguiente = [];
  public listaAretesAprobados = [];
  //**** Variables auxiliares ****/
  public validacionAretesCatastro: number = 0;
  public idUsuarioSolicitante: number;
  public idSolicitud: number;
  public numeroIdentificacionSolicitante: string;
  public emailSolicitante: string;
  public nombresSolicitante: string;
  public emailProveedor: string;
  public nombreProveedor: string;
  public nombreTipoArete: string;
  public nombreFaseSig: string;
  public tipoSolicitante: string;
  public estadoSolicitud: number;
  public idPasosSolicitudes: number;
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  fechaInicial: string;
  fechaFinal: string;
  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();
  public cantidadAretes: number;
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private scriptServicio: ScriptsService,
    private solicitudAretesService: SolicitudAretesService,
    private usuarioService: UsuarioService,
    private estadoSolicitudService: EstadoSolicitudService,
    private pasoSolicitudAretes: PasosSolicitudesAretesService,
    private aretesBovinosService: AretesBovinosService,
    private reportesAretesService: ReportesAretesService
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerEstadosSolicitudes();
    this.obtenerFasesSolicitudes();
    this.fechaInicialBusqueda();
    if (this.usuarioService.usuarioExterno) {
      this.cargarDatosProveedor(this.usuarioService.usuarioExterno.numeroIdentificacion);
    }
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputId: new FormControl(null, [Validators.maxLength(10)]),
      inputIdentificacion: new FormControl(null, [Validators.maxLength(13)]),
      inputEstado: new FormControl('1'),
      inputFase: new FormControl('-1'),
      fecha_inicio: new FormControl(null),
      fecha_fin: new FormControl(null)
    });

    this.formulario = new FormGroup({
      inputFase: new FormControl(null, [Validators.required]),
      inputObservaciones: new FormControl(null)
    });
  }

  //**** Función para asignar la fecha inicial y final ****/
  fechaInicialBusqueda() {
    const hoy = new Date();
    const fechaPasada = new Date(hoy);
    // Restar 180 días
    hoy.setHours(hoy.getHours() - 5);
    fechaPasada.setDate(hoy.getDate() - 180);
    // Convertir las fechas a formato 'yyyy-MM-dd' requerido por los controles de tipo 'date'
    this.fechaInicial = fechaPasada.toISOString().substring(0, 10);
    this.fechaFinal = hoy.toISOString().substring(0, 10);
    this.formularioBusqueda.controls.fecha_inicio.setValue(new Date(this.fechaInicial).toISOString().substring(0, 10));
    this.formularioBusqueda.controls.fecha_fin.setValue(new Date(this.fechaFinal).toISOString().substring(0, 10));
  }

  //**** Desplazar al inicio de la página ****/
  accionNuevoBoton() {
    this.formularioVisible = true;
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  /**** Limpiar campos de todos los formularios, variables y listas ****/
  limpiarCamposGeneral() {
    this.formulario.controls.inputFase.setValue(null);
    this.formulario.controls.inputObservaciones.setValue('');
    this.listaSolicitudes = [];
    this.formularioVisible = false;
  }

  //**** Limpiar campos del formulario de búsqueda ****/
  limpiarFormularioBuscar() {
    this.formularioBusqueda.controls.inputId.setValue('');
    this.formularioBusqueda.controls.inputIdentificacion.setValue('');
    this.formularioBusqueda.controls.inputEstado.setValue('1');
    this.formularioBusqueda.controls.inputFase.setValue('-1');
    this.fechaInicialBusqueda();
  }
  //**** Botón cancelar ****/
  botonCancelar() {
    this.limpiarCamposGeneral();
    this.buscarSolicitudes();
    this.desplazarAlInicio();
  }

  //**** Limpiar lista de proveedores ****/
  limpiarListaSolicitudes() {
    this.listaSolicitudes = [];
  }

  //**** Método para buscar solicitudes ****/
  buscarSolicitudes() {

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formularioBusqueda.value.fecha_inicio == null || this.formularioBusqueda.value.fecha_inicio == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione Fecha de Inicio</li>";
    }

    if (this.formularioBusqueda.value.fecha_fin == null || this.formularioBusqueda.value.fecha_fin == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione Fecha de Fin</li>";
    }

    const fechaInicio = new Date(`${this.formularioBusqueda.value.fecha_inicio} ${'00:00:00'}`);
    const fechaFin = new Date(`${this.formularioBusqueda.value.fecha_fin} ${'00:00:00'}`);

    if (fechaInicio > fechaFin) {
      formularioInvalido = true;
      mensaje += "<li>La Fecha de Inicio no debe ser mayor a la de Fin</li>";
    }

    let days = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))

    if (days > 361) {
      formularioInvalido = true;
      mensaje += "<li>El rango de consulta no puede ser mayor a 1 año</li>";
    }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    const parametros: any = {}; // Objeto para almacenar los filtros dinámicamente
    // Obtenemos los valores actuales del formulario
    const id = this.formularioBusqueda.get('inputId')?.value;
    const identificacion = this.formularioBusqueda.get('inputIdentificacion')?.value;
    const estado = this.formularioBusqueda.get('inputEstado')?.value;
    const fases = this.formularioBusqueda.get('inputFase')?.value;
    // Parámtros obligatorios
    parametros.origen = 2; // Origen externo - registrada por usuarios externos
    parametros.idUsuarioExternoProveedor = this.proveedorSeleccionado.idUsuario;
    parametros.fechaInicio = this.formularioBusqueda.get('fecha_inicio')?.value;
    parametros.fechaFin = this.formularioBusqueda.get('fecha_fin')?.value;
    parametros.inicio = this.inicio;
    parametros.limite = this.fin;
    // Preguntas y lógica para armar el objeto dinámico
    if (id !== null && id.trim() !== '') {
      parametros.idSolicitudesAretes = id; // Incluimos el dato si no está vacío o nulo
    }

    if (identificacion !== null && identificacion.trim() !== '') {
      parametros.numeroIdentificacionSolicitante = identificacion; // Incluimos el estado solo si es distinto a -1
    }

    if (estado !== '-1') {
      parametros.idEstadosSolicitudes = estado; // Incluimos el estado solo si es distinto a -1
    }

    if (fases !== '-1') {
      parametros.idPasosSolicitudesAretes = fases; // Incluimos el estado solo si es distinto a -1
    }

    // Llamamos al método con los parámetros construidos
    this.obtenerSolicitudes(parametros);
  }

  //**** Método que permite obtener las solicitudes de aretes oficiales según sus parámetros. ****/
  obtenerSolicitudes(parametros: any) {

    // Inicializamos la lista para evitar datos residuales
    this.limpiarListaSolicitudes();
    this.mostrarCargando('Buscando solicitudes de aretes oficiales...');
    this.solicitudAretesService.obtenerSolicitudesAretes(parametros)
      .subscribe((resultado: any) => { // Cambiamos el tipo si es necesario
        Swal.close();
        // Verificamos y asignamos la lista de proveedores desde resultado
        this.listaSolicitudes = resultado.resultado;
        // Verificamos si hay elementos en la lista
        if (this.listaSolicitudes.length === 0) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
        }
      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener solicitudes. Intente nuevamente más tarde: ' + error, 'error');
      });
  }

  //**** Método para obtener estados de las solicitudes ****/
  obtenerEstadosSolicitudes() {
    this.mostrarCargando('Cargando datos...');
    this.listaEstadoSolicitudes = [];
    this.estadoSolicitudService.obtenerEstadosSolicitudes({ estado: 1 })
      .subscribe((estadosSolicitudes: EstadoSolicitud[]) => {
        // Filtrar los registros que no tienen idEstadosSolicitudes === 4
        this.listaEstadoSolicitudes = estadosSolicitudes.filter((item: EstadoSolicitud) => {
          return item.id_estados_solicitudes !== 4;
        });
        Swal.close();
      });
  }

  //**** Método para obtener fases de las solicitudes ****/
  obtenerFasesSolicitudes() {

    this.mostrarCargando('Cargando datos...');
    this.listaFasesSolicitudes = [];
    this.pasoSolicitudAretes.obtenerFasesSolicitudes({ estado: 1 })
      .subscribe((fasesSolicitudes: PasoSolicitudArete[]) => {
        // Ordenar el resultado por 'orden' numéricamente
        this.listaFasesSolicitudes = fasesSolicitudes.sort((a, b) => Number(a.orden) - Number(b.orden));
        Swal.close();
      }, error => {
        console.error('Error al obtener las fases:', error);
        Swal.close();
      });
  }

  // Método que permite cargar datos del solicitante
  cargarDatosProveedor(identificacion: string) {

    this.mostrarCargando('Cargando datos...');
    this.usuarioService.consultarUsuarioExtFiltros(null, null, null, identificacion, null, null)
      .subscribe((resp: any) => {
        Swal.close(); // Cierra el modal de carga en caso de éxito o error
        if (resp.estado === 'OK') {
          if (resp.resultado.length == 1) {
            //Cargar resumen
            this.proveedorSeleccionado = new Usuario();
            this.proveedorSeleccionado.idUsuario = resp.resultado[0].id_usuarios_externos;
            this.proveedorSeleccionado.nombres = resp.resultado[0].nombres;
            this.proveedorSeleccionado.numeroIdentificacion = resp.resultado[0].numero_identificacion;
          }
          else {
            this.formularioVisible = false;
            this.proveedorSeleccionado = new Usuario();
            this.proveedorSeleccionado.idUsuario = null;
          }
        }
        else {
          Swal.close();
          Swal.fire('Error', resp.mensaje, 'error');
        }
      });
  }

  //**** Método para asignar datos al formulario ****/
  asignarDatosRevision(id: number) {
    this.mostrarCargando('Consultando datos de la solicitud...')
    // Eliminar datos residuales
    this.listaAretesAprobados = [];
    const parametros: any = {}; // Objeto para almacenar los filtros dinámicamente
    // Obtenemos los valores actuales del formulario
    parametros.idSolicitudesAretes = id;
    parametros.fechaInicio = this.formularioBusqueda.get('fecha_inicio')?.value;
    parametros.fechaFin = this.formularioBusqueda.get('fecha_fin')?.value;
    parametros.inicio = this.inicio;
    parametros.limite = this.fin;

    this.solicitudAretesService.obtenerSolicitudesAretes(parametros)
      .subscribe((resultado: any) => { // Cambiamos el tipo si es necesario
        Swal.close();

        // Verificamos y asignamos la lista de proveedores desde resultado
        this.listaSolicitudes = resultado.resultado;

        // Verificamos si hay elementos en la lista
        if (this.listaSolicitudes.length === 0) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          return; // Salir del método si no hay resultados
        }

        // Buscar solicitud en la lista
        let solicitud = this.listaSolicitudes.find(
          (item: SolicitudAretes) => item.idSolicitudesAretes === id
        );

        this.formularioVisible = true;

        if (solicitud) {
          // Asignar la solicitud encontrada a una propiedad del componente
          this.solicitudSeleccionada = solicitud;
          this.idSolicitud = solicitud.idSolicitudesAretes;
          this.tipoSolicitante = solicitud.idTiposSolicitantes;
          this.cantidadAretes = solicitud.cantidadAretes;
          this.estadoSolicitud = solicitud.idEstadosSolicitudes;
          this.idPasosSolicitudes = solicitud.idPasosSolicitudesAretes;

          // Llamar al método para cargar estadísticas si es necesario
          this.cargarEstadisticasValidaciones(solicitud.idUsuarioSolicitante);

          // Determinar la siguiente fase
          if (solicitud.idEstadosSolicitudes == 1) {

            const faseSiguiente = this.listaFasesSolicitudes.find(
              (item: PasoSolicitudArete) =>
                item.orden === solicitud.idPasosSolicitudesAretes + 1
            );

            // Asignar el resultado de la búsqueda a la lista de fases siguiente
            this.listaFaseSiguiente = faseSiguiente ? [faseSiguiente] : [];

            // Seleccionar automáticamente el valor en el formulario si hay fase siguiente
            if (faseSiguiente) {
              this.formulario.get('inputFase')?.setValue(faseSiguiente.id_pasos_solicitudes_aretes);
            } else {
              this.formulario.get('inputFase')?.setValue(null); // Valor por defecto si no hay fase siguiente
            }

            this.nombreFaseSig = faseSiguiente.nombre;
          }

          if (solicitud.idPasosSolicitudesAretes > 2) {
            // Llamar al método para cargar aretes de la solicitud
            const parametros: any = {};
            parametros.idSolicitudesAretes = solicitud.idSolicitudesAretes;
            this.obtenerAretesOficiales(parametros);
          }

        } else {
          // Mostrar error si la solicitud no fue encontrada
          Swal.fire('Error', 'Solicitud no encontrada', 'error');
        }

      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener solicitudes. Intente nuevamente más tarde: ' + error, 'error');
      });
  }

  //**** Método obtener estadísticas para validación de catastro VS lo que se puede solicitar ****/
  cargarEstadisticasValidaciones(idUsuario: number) {
    this.solicitudAretesService.consultarEstadisticasValidaciones(idUsuario)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          this.validacionAretes = resp.resultado;
          this.validacionAretesCatastro = Number(this.validacionAretes.disponibles) + Number(this.cantidadAretes);
        }
        else {
          this.idUsuarioSolicitante = null;
          Swal.fire('Error', resp.mensaje, 'error');
        }
      });
  }

  //**** Paginación - página anterior ****/
  anterior() {
    this.inicio = this.inicio - this.rango;
    this.fin = this.rango;
    this.listaSolicitudes = [];
    this.buscarSolicitudes();
  }

  //**** Paginación - página siguiente ****/
  siguiente() {
    this.inicio = this.inicio + this.rango;
    this.fin = this.rango;
    this.listaSolicitudes = [];
    this.buscarSolicitudes();
  }

  //**** Método para tramitar solicitud - avanzar fases ****/
  tramitarSolicitud(accion: string, id: number) {

    let mensaje = '';
    let mensajeEspera = '';
    let solicitud = new SolicitudAretes();

    solicitud.idSolicitudesAretes = id;
    solicitud.accion = accion;

    if (this.formulario.value.observaciones == null || this.formulario.value.observaciones == "") {
      solicitud.observaciones = this.nombreFaseSig.toLowerCase().trim();
    } else {
      solicitud.observaciones = this.formulario.value.observaciones.toLowerCase().trim();
    }

    let idPasos = 0;

    this.listaSolicitudes.forEach((item: SolicitudAretes) => {
      if (item.idSolicitudesAretes == id) {
        this.cantidadAretes = item.cantidadAretes;
        this.nombreProveedor = item.nombresProveedor.toLocaleUpperCase().trim();
        idPasos = item.idPasosSolicitudesAretes;
        this.nombresSolicitante = item.nombresSolicitante.toLocaleUpperCase().trim();
        this.emailSolicitante = item.emailSolicitante.toLowerCase().trim();
        this.nombreTipoArete = item.nombreTipoArete.toLowerCase().trim();
      }
    });

    solicitud.idPasosSolicitudesAretes = idPasos; // Enviar para validación en el backend
    solicitud.usuarioModificador = this.usuarioService.usuarioExterno.numeroIdentificacion;

    switch (idPasos) {
      case 1:
        mensaje = 'Iniciaré contacto con ' + this.nombresSolicitante + '.';
        mensajeEspera = 'Cambiando a Contactando al solicitante...';
        break;
      case 2:
        mensaje = 'He contactado a ' + this.nombresSolicitante + ' y hemos alcanzado un acuerdo satisfactorio. Soy consciente de que, una vez aprobado, este proceso no podrá revertirse.';
        mensajeEspera = 'Generando serie oficial...';
        break;
      case 3:
        mensaje = 'Confirmo que, he entregado a ' + this.nombresSolicitante + ' los [' + this.cantidadAretes + '] aretes oficiales solicitados. Al continuar, esta solicitud no permitirá más interacciones.';
        solicitud.nombresSolicitante = this.nombresSolicitante;
        solicitud.nombresProveedor = this.nombreProveedor;
        solicitud.emailSolicitante = this.emailSolicitante;
        solicitud.nombreTipoArete = this.nombreTipoArete;
        solicitud.cantidadAretes = this.cantidadAretes;
        mensajeEspera = 'Notificando al solicitante...';
        break;
      default:
        Swal.fire('¡Advertencia!', 'El número de fase no es válido', 'warning');
        this.formularioVisible = false;
        break;
    }

    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de continuar a la siguiente fase?',
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡continuar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando(mensajeEspera);
        this.solicitudAretesService.tramitarSolicitud(solicitud)
          .subscribe({
            next: (resp: any) => {
              if (resp.estado === 'OK') {
                Swal.fire({
                  title: `Éxito`,
                  text: `Solicitud Nro. ${id}, procesada con éxito.`,
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                }).then(() => {
                  this.limpiarYActualizar(id);
                });
              } else {
                Swal.fire({
                  title: '¡Advertencia!',
                  text: resp.mensaje,
                  icon: 'warning',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                }).then(() => {
                  this.limpiarYActualizar(id);
                });
              }
            },
            error: (err) => {
              Swal.fire({
                title: '¡Advertencia!',
                text: err.error?.mensaje || 'Ocurrió un error al procesar la solicitud',
                icon: 'warning',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then(() => {
                this.limpiarYActualizar(id);
              });
            }
          });
      }
    });
  }

  // Función común para limpiar y actualizar
  limpiarYActualizar(id: any) {
    this.formulario.controls.inputObservaciones.setValue('');
    this.asignarDatosRevision(id);
  }

  //**** Método que permite obtener los aretes oficiales según sus parámetros. ****/
  obtenerAretesOficiales(parametros: any) {

    // Inicializamos la lista para evitar datos residuales
    this.listaAretesAprobados = [];
    this.mostrarCargando('Buscando aretes oficiales...');
    this.aretesBovinosService.obtenerAretes(parametros)
      .subscribe((resultado: any) => { // Cambiamos el tipo si es necesario
        Swal.close();
        // Verificamos y asignamos la lista de proveedores desde resultado
        this.listaAretesAprobados = resultado.resultado;
      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener el listado de aretes oficiales. Intente nuevamente más tarde: ' + error, 'error');
      });
  }

  //**** Botón salir ****/
  botonSalir() {
    this.formularioVisible = false;
    this.buscarSolicitudes();
  }

  //**** Método para rechazar solicitud ****/
  rechazarSolicitud(accion: string, id: number) {

    let formularioInvalido = false;
    let observaciones = '';
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if ((this.tipoSolicitante == '1' && this.cantidadAretes <= this.validacionAretesCatastro) || this.tipoSolicitante == '2' || this.idPasosSolicitudes > 2) {
      if (this.formulario.value.inputObservaciones == null || this.formulario.value.inputObservaciones.trim() == "") {
        formularioInvalido = true;
        mensaje += "<li>Ingrese observaciones</li>";
      } else {
        observaciones = this.formulario.value.inputObservaciones.toLowerCase().trim();
      }
    } else {
      observaciones = 'cantidad solicitada excede la permitida';
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    let solicitud = new SolicitudAretes();

    solicitud.idSolicitudesAretes = id;
    solicitud.accion = accion;

    let idPasos = 0;

    this.listaSolicitudes.forEach((item: SolicitudAretes) => {
      if (item.idSolicitudesAretes == id) {
        this.cantidadAretes = item.cantidadAretes;
        this.nombreProveedor = item.nombresProveedor.toLocaleUpperCase().trim();
        idPasos = item.idPasosSolicitudesAretes;
        this.nombresSolicitante = item.nombresSolicitante.toLocaleUpperCase().trim();
        this.emailSolicitante = item.emailSolicitante.toLowerCase().trim();
        this.nombreTipoArete = item.nombreTipoArete.toLowerCase().trim();
      }
    });

    solicitud.idPasosSolicitudesAretes = idPasos; // Enviar para validación en el backend
    solicitud.usuarioModificador = this.usuarioService.usuarioExterno.numeroIdentificacion;
    solicitud.observaciones = observaciones;
    solicitud.nombresSolicitante = this.nombresSolicitante;
    solicitud.nombresProveedor = this.nombreProveedor;
    solicitud.emailSolicitante = this.emailSolicitante;
    solicitud.nombreTipoArete = this.nombreTipoArete;
    solicitud.cantidadAretes = this.cantidadAretes;
    //Mensaje de confirmación
    Swal.fire({
      title: '¿ Está seguro de rechazar esta solicitud?',
      text: 'Solicitud Nro. [' + id + '], generada por [' + this.cantidadAretes + '] aretes oficiales',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡ rechazar !',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Notificando al solicitante...');
        this.solicitudAretesService.tramitarSolicitud(solicitud)
          .subscribe((resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire({
                title: `Éxito`,
                text: `Solicitud Nro. ${id}, rechazada.`,
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then(() => {
                // Esta función se ejecuta después de que el usuario presiona "OK"
                this.formulario.controls.inputObservaciones.setValue('');
                this.limpiarCamposGeneral();
                this.buscarSolicitudes();
                this.desplazarAlInicio();
              });
            }
            else {
              Swal.fire('Error', resp.mensaje, 'error');
            }
          });
      }
    });
  }

  // Exportar JSON solicitudes a Excel
  exportarSolicitudesAretes() {
    this.mostrarCargando('Generando Reporte Excel...');
    let filename = 'REPORTE_SOLICITUDES_ARETES';
    this.reportesAretesService.exportAsExcelFileSolicitudesAretes(this.listaSolicitudes, filename);
    Swal.close();
    Swal.fire({
      title: '¡Reporte Generado con Éxito!',
      text: 'Por favor, revise su carpeta de descargas',
      icon: 'success',
      timer: 3000, // Tiempo en milisegundos (3000 ms = 3 segundos)
      showConfirmButton: false // Oculta el botón de confirmación
    });
  }

  // Exportar JSON aretes oficiales a Excel
  exportarListadoAretes(id: number) {
    this.mostrarCargando('Generando Reporte Excel...');
    let filename = 'ARETES_SOLICITUD_' + id;
    this.reportesAretesService.exportAsExcelFileAretesListado(this.listaAretesAprobados, filename);
    Swal.close();
    Swal.fire({
      title: '¡Reporte Generado con Éxito!',
      text: 'Por favor, revise su carpeta de descargas',
      icon: 'success',
      timer: 3000, // Tiempo en milisegundos (3000 ms = 3 segundos)
      showConfirmButton: false // Oculta el botón de confirmación
    });
  }

  //**** Calcular tamaño de letra ****/
  calcularFontSize(value: number): string {
    const length = value.toString().length;
    if (length <= 2) {
      return '1rem'; // Tamaño normal
    } else if (length === 3) {
      return '0.9rem'; // Un poco más pequeño
    } else if (length === 4) {
      return '0.8rem'; // Más pequeño
    } else {
      return '0.6rem'; // Evita que se salga del círculo
    }
  }

  // Cargar mensaje del método actualizarAnimal
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

  //**** Generar título para hover del botón Tramitar ****/
  generarTitulo(solicitud: any): string {
    const idSolicitud = solicitud?.idSolicitudesAretes;
    return `Tramitar solicitud ${idSolicitud}`;
  }

}

