import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudAretes } from 'src/app/modelos/solicitud-aretes.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EstadoSolicitud } from '../../modelos/estado-solicitud.modelo';
// Importación de servicios.
import { EstadoSolicitudService } from 'src/app/servicios/estado-solicitud/estado-solicitud.service';
import { SolicitudAretesService } from 'src/app/servicios/solicitud-aretes/solicitud-aretes.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ProveedorAretesService } from 'src/app/servicios/proveedor-aretes/proveedor-aretes.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';
// Importamos Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  templateUrl: './tramitar-solicitud-extempo-interno.component.html',
  styleUrls: ['./tramitar-solicitud-extempo-interno.component.css']
})
export class TramitarSolicitudExtempoInternoComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  public solicitante?: Usuario = null;
  usuario: Usuario = new Usuario();
  public solicitudSeleccionada?: SolicitudAretes = null;
  //**** Listas ****/
  public listaProveedores = [];
  public listaSolicitudes = [];
  public listaEstadoSolicitudes = [];
  public listaAretesAprobados = [];
  //**** Variables auxiliares ****/
  public idUsuario: number;
  public idSolicitud: number;
  public validacionAretesCatastro = 0;
  public celularProveedor: string;
  public emailProveedor: string;
  public nombreProveedor: string;
  public nombreSolicitante: string;
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  revisarVisible: boolean = false; // true = Visible // false = Oculto
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
    private proveedorAretesService: ProveedorAretesService,
    private estadoSolicitudService: EstadoSolicitudService,
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
    this.obtenerProveedores();
    this.obtenerEstadosSolicitudes();
    this.fechaInicialBusqueda();
    // Suscribir a valueChanges en inputCantidad y inputSerieInicio
    this.formulario.get('inputCantidad').valueChanges.subscribe(() => {
      this.calculateSerieFin();
    });
    this.formulario.get('inputSerieInicio').valueChanges.subscribe(() => {
      this.calculateSerieFin();
    });
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputIdentificacion: new FormControl(null, [Validators.maxLength(25)]),
      inputProveedor: new FormControl('-1'),
      fecha_inicio: new FormControl(null),
      fecha_fin: new FormControl(null)
    });

    this.formulario = new FormGroup({
      inputIdUsuario: new FormControl(''),
      inputRazonSocial: new FormControl(null, [Validators.required]),
      inputProveedor: new FormControl(null, [Validators.required]),
      inputCantidad: new FormControl(null, [Validators.required]),
      inputSerieInicio: new FormControl(null, [Validators.required]),
      inputSerieFin: new FormControl(null, [Validators.required]),
      inputFechaAsignacion: new FormControl(null, [Validators.required])
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

  //**** Limpiar campos usuario ****/
  limpiarCamposUsuario() {
    this.idUsuario = null;
    this.formulario.controls.inputRazonSocial.setValue('');
  }

  /**** Limpiar campos de todos los formularios, variables y listas ****/
  limpiarCamposGeneral() {

    this.limpiarCamposUsuario();
    this.formulario.controls.inputIdUsuario.setValue('');
    this.formulario.controls.inputProveedor.setValue(null);
    this.formulario.controls.inputCantidad.setValue('');
    this.formulario.controls.inputSerieInicio.setValue('');
    this.formulario.controls.inputSerieFin.setValue('');
    this.formulario.controls.inputFechaAsignacion.setValue('');

    this.listaSolicitudes = [];
    this.formularioVisible = false;
  }

  //**** Limpiar campos del formulario de búsqueda ****/
  limpiarFormularioBuscar() {
    this.formularioBusqueda.controls.inputIdentificacion.setValue('');
    this.formularioBusqueda.controls.inputProveedor.setValue('-1');
    this.fechaInicialBusqueda();
  }
  //**** Botón cancelar ****/
  botonCancelar() {
    this.limpiarCamposGeneral();
    this.limpiarFormularioBuscar();
    this.desplazarAlInicio();
  }

  //**** Botón salir ****/
  botonSalir() {
    this.formularioVisible = false;
    this.revisarVisible = false;
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
    const identificacion = this.formularioBusqueda.get('inputIdentificacion')?.value;
    const proveedor = this.formularioBusqueda.get('inputProveedor')?.value;
    // Parámtros obligatorios
    parametros.origen = 1; // Origen interno - registro extemporáneo
    parametros.fechaInicio = this.formularioBusqueda.get('fecha_inicio')?.value;
    parametros.fechaFin = this.formularioBusqueda.get('fecha_fin')?.value;
    parametros.inicio = this.inicio;
    parametros.limite = this.fin;
    // Preguntas y lógica para armar el objeto dinámico
    if (identificacion !== null && identificacion.trim() !== '') {
      parametros.numeroIdentificacionSolicitante = identificacion; // Incluimos el dato si no está vacío o nulo
    }

    if (proveedor !== '-1') {
      parametros.idProveedoresAretes = proveedor; // Incluimos el estado solo si es distinto a -1
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
        Swal.fire('Error', 'No se pudo obtener solicitudes. Intente nuevamente más tarde: '+error, 'error');
      });
  }

  //**** Método para obtener estados de las solicitudes ****/
  obtenerEstadosSolicitudes() {
    this.mostrarCargando('Cargando datos...');
    this.listaEstadoSolicitudes = [];
    this.estadoSolicitudService.obtenerEstadosSolicitudes({ estado: 1 })
      .subscribe((estadosSolitudes: EstadoSolicitud[]) => {
        this.listaEstadoSolicitudes = estadosSolitudes;
        Swal.close();
      });
  }

  //**** Método para buscar proveedores ****/
  obtenerProveedores() {
    const parametros: any = {}; // Objeto para almacenar los filtros dinámicamente
    parametros.idTiposProveedores = 1; // Tipo proveedor (principal)
    parametros.estado = 1; // Proveedores en estado activo
    this.mostrarCargando('Cargando datos...');
    this.proveedorAretesService.obtenerProveedorAretes(parametros)
      .subscribe(
        (resultado: any) => {
          Swal.close();
          this.listaProveedores = [...resultado.resultado];
        },
        (error) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el listado de proveedores. Intente nuevamente más tarde: '+error, 'error');
        }
      );
  }

  //**** Método para buscar usuarios externos en la base de datos ****/
  buscarUsuario(numeroIdentificacion: string) {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    // Validar que el campo de identificación no esté vacío
    if (this.formulario.value.inputIdUsuario == null || this.formulario.value.inputIdUsuario == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de identificación</li>";
    }

    // Si el formulario es inválido, mostrar mensaje de advertencia y detener la ejecución
    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    // Llamar a la función para cargar los datos del solicitante y mostrar mensaje de éxito
    this.cargarDatosSolicitante(numeroIdentificacion, true); // true indica que se debe mostrar el mensaje de éxito
  }

  // Método que permite cargar datos del solicitante
  cargarDatosSolicitante(identificacion: string, mostrarMensajeExito: boolean = false) {
    // Mostrar modal de carga
    this.mostrarCargando('Cargando información del solicitante....');
    // Consultar el servicio para obtener los datos del solicitante
    this.usuarioService.consultarUsuarioExtFiltros(null, null, null, identificacion, null, null)
      .subscribe(
        (resp: any) => {
          Swal.close(); // Cerrar el modal de carga
          if (resp.estado === 'OK') {
            if (resp.resultado.length == 1) {
              // Cargar resumen del solicitante
              this.solicitante = new Usuario();
              this.solicitante.idUsuario = resp.resultado[0].id_usuarios_externos;
              this.solicitante.nombres = resp.resultado[0].nombres;
              this.solicitante.numeroIdentificacion = resp.resultado[0].numero_identificacion;

              // Cargar los datos del usuario en el formulario y variables
              this.idUsuario = this.solicitante.idUsuario;
              this.formulario.controls.inputRazonSocial.setValue(this.solicitante.nombres);

              // Mostrar mensaje de éxito solo si mostrarMensajeExito es true
              if (mostrarMensajeExito) {
                Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');
              }
            } else {
              // Si no se encuentran datos, mostrar mensaje informativo
              this.solicitante = new Usuario();
              this.solicitante.idUsuario = null;

              Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
            }
          } else {
            // Mostrar mensaje de error si la respuesta no es exitosa
            Swal.fire('Error', resp.mensaje, 'error');
          }
        },
        (error) => {
          // Mostrar mensaje de error en caso de fallo en la solicitud
          Swal.fire('Error', 'No se pudo obtener la información del solicitante. Intente nuevamente más tarde: '+error, 'error');
        }
      );
  }

  //**** Método para crear una solicitud de aretes oficiales ****/
  registrarSolicitudAretes() {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputRazonSocial == null || this.formulario.value.inputRazonSocial == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese Apellidos y nombres / Razón social</li>";
    }

    if (this.formulario.value.inputProveedor == null || this.formulario.value.inputProveedor == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un proveedor</li>";
    }

    if (this.formulario.value.inputSerieInicio <= 0) {
      formularioInvalido = true;
      mensaje += "<li>Inicio serie debe ser mayor a cero.</li>";
    }

    if (this.formulario.value.inputCantidad <= 0) {
      formularioInvalido = true;
      mensaje += "<li>Cantidad debe ser mayor a cero.</li>";
    }

    if (this.formulario.value.inputSerieFin <= 0) {
      formularioInvalido = true;
      mensaje += "<li>Fin serie debe ser mayor a cero.</li>";
    }

    const fechaActual = new Date(); // Obtiene la fecha y hora actual
    const fechaAsignacion = new Date(this.formulario.value.inputFechaAsignacion); // Convierte el valor a una fecha

    if (this.formulario.value.inputFechaAsignacion == null || this.formulario.value.inputFechaAsignacion == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione fecha de entrega</li>";
    } else if (fechaAsignacion > fechaActual) {
      formularioInvalido = true;
      mensaje += "<li>La fecha de entrega no puede ser mayor a la fecha actual.</li>";
    }

    if (this.idUsuario == null) {
      formularioInvalido = true;
      mensaje += "<li>Ha ocurrido un error al obtener el ID del usuario externo solicitante.</li>";
    }

    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    let solicitud = new SolicitudAretes();

    solicitud.accion = 'serieManual';
    solicitud.idProveedoresAretes = this.formulario.value.inputProveedor;
    solicitud.idUsuarioSolicitante = this.idUsuario;
    solicitud.idTiposSolicitantes = 1; // ganadero
    solicitud.idTiposAretes = 1; // arete amarillo por defecto
    solicitud.cantidadAretes = this.formulario.value.inputCantidad;
    solicitud.telefonoSolicitante = "99999999";
    solicitud.usuarioModificador = localStorage.getItem('identificacion');
    solicitud.observaciones = "registro extemporáneo";
    solicitud.origen = 1; // Origen Interno
    solicitud.numeroInicial = this.formulario.value.inputSerieInicio;
    solicitud.fechaEntrega = this.formulario.value.inputFechaAsignacion;

    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de registrar esta solicitud extemporánea?',
      text: "Una vez registrada, no podrá ser modificada.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡ registrar !',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mostrarCargando('Registrando solicitud...');
        this.solicitudAretesService.registrarSolicitudAretes(solicitud)
          .subscribe(
            (resp: any) => {
              if (resp.estado === 'OK') {
                Swal.fire({
                  title: 'Éxito',
                  text: 'Solicitud extemporánea registrada con éxito',
                  icon: 'success',
                  confirmButtonText: 'OK'
                }).then(() => {
                  this.limpiarCamposGeneral();
                  this.buscarSolicitudes();
                  this.desplazarAlInicio();
                });
              } else {
                // Mostrar mensaje de error si el estado no es OK
                Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
              }
            },
            (error) => {
              Swal.fire('Error', 'Ha ocurrido un error al registrar la solicitud: '+error, 'error');
            }
          );
      } else {
        Swal.close();
      }
    });
  }

  //**** Método para asignar datos de la solicitud al formulario ****/
  asignarDatosRevision(id: number) {
    
    this.mostrarCargando('Consultando datos de la solicitud...');
    // Eliminar datos residuales
    this.listaAretesAprobados = [];
    // Buscar solicitud en la lista
    const solicitud = this.listaSolicitudes.find(
      (item: SolicitudAretes) => item.idSolicitudesAretes === id
    );
    this.revisarVisible = true;

    if (solicitud) {
      // Asignar la solicitud encontrada a una propiedad del componente
      this.solicitudSeleccionada = solicitud;
      this.idSolicitud = solicitud.idSolicitudesAretes;

      this.cargarDatosSolicitante(solicitud.numeroIdentificacionSolicitante);

      if (solicitud.idPasosSolicitudesAretes > 3) {
        // Llamar al método para cargar aretes de la solicitud
        const parametros: any = {};
        parametros.idSolicitudesAretes = solicitud.idSolicitudesAretes;
        this.obtenerAretesOficiales(parametros);
      }

      Swal.close();
    } else {
      // Mostrar error si la solicitud no fue encontrada
      Swal.fire(
        'Error',
        'Solicitud no encontrada',
        'error'
      );
    }
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
        Swal.fire('Error', 'No se pudo obtener el listado de aretes oficiales. Intente nuevamente más tarde: '+error, 'error');
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

  // Calcular serie fin //
  calculateSerieFin(): void {
    const cantidad = this.formulario.get('inputCantidad').value;
    const serieInicio = this.formulario.get('inputSerieInicio').value;

    if (cantidad && serieInicio) {
      const serieFin = serieInicio + cantidad - 1;
      this.formulario.get('inputSerieFin').setValue(serieFin);
    } else {
      this.formulario.get('inputSerieFin').setValue(null);
    }
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
    return `Revisar solicitud ${idSolicitud}`;
  }

}

