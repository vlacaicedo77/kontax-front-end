import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudAretes } from 'src/app/modelos/solicitud-aretes.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { ProveedoresAretes } from 'src/app/modelos/proveedores-aretes.modelo';
import { EstadoSolicitud } from '../../modelos/estado-solicitud.modelo';
import { EstadisticaValidacionesAretes } from 'src/app/modelos/estadistica-validaciones-aretes.modelo';
import { TipoArete } from '../../modelos/tipo-arete.modelo';
// Importación de servicios.
import { EstadoSolicitudService } from 'src/app/servicios/estado-solicitud/estado-solicitud.service';
import { SolicitudAretesService } from 'src/app/servicios/solicitud-aretes/solicitud-aretes.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ProveedorAretesService } from 'src/app/servicios/proveedor-aretes/proveedor-aretes.service';
import { TiposAretesService } from 'src/app/servicios/tipos-aretes/tipos-aretes.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';
// Importamos Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-solicitud-aretes-operador',
  templateUrl: './solicitud-aretes-operador.component.html',
  styleUrls: ['./solicitud-aretes-operador.component.css']
})
export class SolicitudAretesOperadorComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  public solicitante?: Usuario = null;
  public solicitudSeleccionada?: SolicitudAretes = null;
  public validacionAretes = new EstadisticaValidacionesAretes();
  //**** Listas ****/
  public listaProveedores = [];
  public listaOperadores = [];
  public listaProveedoresOrdenados = [];
  public listaSolicitudes = [];
  public listaEstadoSolicitudes = [];
  public listaTiposAretes = [];
  public listaAretesAprobados = [];
  //**** Variables auxiliares ****/
  public idSolicitud: number;
  public validacionAretesCatastro = 0;
  public celularProveedor: string;
  public emailProveedor: string;
  public nombreProveedor: string;
  public nombreSolicitante: string;
  public nombreTipoArete: string;
  public aomz: number;
  public selectedTipoArete: number | null = null;
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
    private tiposAretesService: TiposAretesService,
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
    //this.obtenerTiposAretes();
    this.fechaInicialBusqueda();
    if (this.usuarioService.usuarioExterno) {
      this.cargarDatosSolicitante(this.usuarioService.usuarioExterno.numeroIdentificacion);
      this.buscarOperadorAutorizado(this.usuarioService.usuarioExterno.numeroIdentificacion);
    }
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      InputId: new FormControl(null, [Validators.maxLength(10)]),
      inputProveedor: new FormControl('-1'),
      InputEstado: new FormControl('1'),
      fecha_inicio: new FormControl(null),
      fecha_fin: new FormControl(null)
    });

    this.formulario = new FormGroup({
      inputProveedor: new FormControl(null, [Validators.required]),
      inputTelefono: new FormControl(null, [Validators.required]),
      inputTipoArete: new FormControl(null, [Validators.required]),
      inputCantidad: new FormControl(null, [Validators.required])
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
    if (this.usuarioService.usuarioExterno) {
      this.cargarDatosSolicitante(this.usuarioService.usuarioExterno.numeroIdentificacion);
    }
    this.formulario.controls.inputProveedor.setValue(null);
    this.formulario.controls.inputTipoArete.setValue(null);
    this.formulario.controls.inputTelefono.setValue('');
    this.formulario.controls.inputCantidad.setValue('');
    this.listaSolicitudes = [];
    this.formularioVisible = false;
    this.emailProveedor = null;
    this.celularProveedor = null;
    this.nombreProveedor = null;
    this.nombreTipoArete = null;
  }

  //**** Limpiar campos del formulario de búsqueda ****/
  limpiarFormularioBuscar() {
    this.formularioBusqueda.controls.InputId.setValue('');
    this.formularioBusqueda.controls.inputProveedor.setValue('-1');
    this.formularioBusqueda.controls.InputEstado.setValue('1');
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
    const id = this.formularioBusqueda.get('InputId')?.value;
    const proveedor = this.formularioBusqueda.get('inputProveedor')?.value;
    const estado = this.formularioBusqueda.get('InputEstado')?.value;
    // Parámtros obligatorios
    parametros.origen = 2; // Origen externo - registrada por usuarios externos
    parametros.idUsuarioSolicitante = this.solicitante.idUsuario;
    parametros.idTiposSolicitantes = 2;
    parametros.fechaInicio = this.formularioBusqueda.get('fecha_inicio')?.value;
    parametros.fechaFin = this.formularioBusqueda.get('fecha_fin')?.value;
    parametros.inicio = this.inicio;
    parametros.limite = this.fin;
    // Preguntas y lógica para armar el objeto dinámico
    if (id !== null && id.trim() !== '') {
      parametros.idSolicitudesAretes = id; // Incluimos el dato si no está vacío o nulo
    }

    if (proveedor !== '-1') {
      parametros.idProveedoresAretes = proveedor; // Incluimos el estado solo si es distinto a -1
    }

    if (estado !== '-1') {
      parametros.idEstadosSolicitudes = estado; // Incluimos el estado solo si es distinto a -1
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

          // Almacenar el resultado en listaProveedoresOrdenados tal cual
          this.listaProveedoresOrdenados = [...resultado.resultado];

          // Almacenar los proveedores en listaProveedores en orden aleatorio
          this.listaProveedores = [...resultado.resultado].sort(() => Math.random() - 0.5);
        },
        (error) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el listado de proveedores. Intente nuevamente más tarde: '+error, 'error');
        }
      );
  }

  //**** Función para formatear el teléfono 
  formatoCelular(telefono: string): string {
    return '09-' + telefono.replace(/(\d{4})(\d{4})/, '$1-$2');
  }

  //**** Método obtener datos del proveedor seleccionado ****/
  cambiarProveedor(id: string) {
    const proveedorSeleccionado = this.listaProveedores.find(
      (proveedor: ProveedoresAretes) => proveedor.idProveedoresAretes === Number(id)
    );

    if (proveedorSeleccionado) {
      this.emailProveedor = proveedorSeleccionado.email || 'No disponible';
      this.nombreProveedor = proveedorSeleccionado.nombresUsuario || 'No disponible';
      this.celularProveedor = this.formatoCelular(proveedorSeleccionado.telefono) || 'No disponible';
    } else {
      // Si no se encuentra el proveedor, limpiar los valores
      this.emailProveedor = 'No disponible';
      this.celularProveedor = 'No disponible';
      this.nombreProveedor = 'No disponible';
    }
  }

  // Método que permite cargar datos del solicitante
  cargarDatosSolicitante(identificacion: string) {
    
    this.mostrarCargando('Cargando información del solicitante....');
    this.usuarioService.consultarUsuarioExtFiltros(null, null, null, identificacion, null, null)
      .subscribe((resp: any) => {
        Swal.close(); // Cierra el modal de carga en caso de éxito o error
        if (resp.estado === 'OK') {
          if (resp.resultado.length == 1) {
            //Cargar resumen
            this.solicitante = new Usuario();
            this.solicitante.idUsuario = resp.resultado[0].id_usuarios_externos;
            this.solicitante.nombres = resp.resultado[0].nombres;
            this.solicitante.numeroIdentificacion = resp.resultado[0].numero_identificacion;
            //this.cargarEstadisticasValidaciones(this.solicitante.idUsuario);
          }
          else {
            this.formularioVisible = false;
            this.solicitante = new Usuario();
            this.solicitante.idUsuario = null;
          }
        }
        else {
          Swal.close();
          Swal.fire('Error', resp.mensaje, 'error');
        }
      });
  }

  //**** Método para crear una solicitud de aretes oficiales ****/
  registrarSolicitudAretes() {

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputProveedor == null || this.formulario.value.inputProveedor == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un proveedor</li>";
    }

    if (this.formulario.value.inputTelefono == null || this.formulario.value.inputTelefono.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese Celular / WhatsApp</li>";
    }

    if (this.formulario.value.inputTipoArete == null || this.formulario.value.inputTipoArete == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo arete</li>";
    }

    if (this.formulario.value.inputCantidad <= 0) {
      formularioInvalido = true;
      mensaje += "<li>Cantidad solicitada debe ser mayor a cero.</li>";
    }

    if (this.solicitante.idUsuario == null) {
      formularioInvalido = true;
      mensaje += "<li>Ha ocurrido un error al obtener el ID del usuario externo solicitante.</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    let solicitud = new SolicitudAretes();

    solicitud.idProveedoresAretes = this.formulario.value.inputProveedor;
    solicitud.idUsuarioSolicitante = parseInt(localStorage.getItem('idUsuario'));
    solicitud.idTiposSolicitantes = 2; // operador autorizado
    solicitud.idTiposAretes = this.formulario.value.inputTipoArete;
    solicitud.cantidadAretes = this.formulario.value.inputCantidad;
    solicitud.telefonoSolicitante = this.formulario.value.inputTelefono;
    solicitud.usuarioModificador = this.usuarioService.usuarioExterno.numeroIdentificacion;
    solicitud.observaciones = "Solicitud creada";
    solicitud.origen = 2; // Origen Externo
    solicitud.nombresSolicitante = this.solicitante.nombres;
    solicitud.nombresProveedor = this.nombreProveedor;
    solicitud.emailProveedor = this.emailProveedor;
    solicitud.nombreTipoArete = this.nombreTipoArete;

    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de registrar esta solicitud?',
      text: "Una vez registrada, no podrá ser modificada.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡registrar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mostrarCargando('Registrando solicitud...');

        this.solicitudAretesService.registrarSolicitudAretes(solicitud).subscribe(
          (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire({
                title: 'Éxito',
                text: 'Solicitud registrada con éxito',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then(() => this.actualizarYLimpiar());
            } else {
              // Asume que cualquier otro caso es error (incluye 'ERR')
              Swal.fire({
                title: 'Advertencia',
                text: resp.mensaje || 'Error al procesar la solicitud',
                icon: 'warning',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then(() => this.actualizarYLimpiar());
            }
          }
        );
      }
    });
  }

  //código común para actualizar
  actualizarYLimpiar() {
    this.limpiarCamposGeneral();
    this.limpiarFormularioBuscar();
    this.buscarSolicitudes();
    this.desplazarAlInicio();
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

  //**** Método obtener datos del tipo de arete seleccionado ****/
  cambiarTipoArete(id: string) {
    const tipoAreteSeleccionado = this.listaTiposAretes.find(
      (tipoArete: TipoArete) => tipoArete.id_tipos_aretes === Number(id)
    );

    if (tipoAreteSeleccionado) {
      this.nombreTipoArete = tipoAreteSeleccionado.nombre || 'No disponible';
    } else {
      // Si no se encuentra el tipo de arete, limpiar los valores
      this.nombreTipoArete = 'No disponible';
    }
  }

  //**** Método para tramitar solicitud - anular ****/
  tramitarSolicitud(accion: string, id: number) {

    let solicitud = new SolicitudAretes();
    solicitud.idSolicitudesAretes = id;
    solicitud.accion = accion;

    let idPasos = 0;

    this.listaSolicitudes.forEach((item: SolicitudAretes) => {
      if (item.idSolicitudesAretes == id) {
        this.cantidadAretes = item.cantidadAretes;
        this.nombreProveedor = item.nombresProveedor.toLocaleUpperCase().trim();
        idPasos = item.idPasosSolicitudesAretes;
        this.nombreSolicitante = item.nombresSolicitante.toLocaleUpperCase().trim();
        this.emailProveedor = item.emailProveedor.toLowerCase().trim();
      }
    });

    solicitud.nombresSolicitante = this.nombreSolicitante;
    solicitud.nombresProveedor = this.nombreProveedor;
    solicitud.emailProveedor = this.emailProveedor;
    solicitud.idPasosSolicitudesAretes = idPasos; // Enviar para validación en el backend
    solicitud.usuarioModificador = this.usuarioService.usuarioExterno.numeroIdentificacion;

    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de anular esta solicitud?',
      text: `Solicitud Nro. [${id}], generada por [${this.cantidadAretes}] aretes oficiales a ${this.nombreProveedor}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡anular!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Anulando solicitud...');
        this.solicitudAretesService.tramitarSolicitud(solicitud)
          .subscribe((resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire({
                title: `Éxito`,
                text: `Solicitud Nro. ${id}, anulada con éxito.`,
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then(() => {
                this.actualizarDatos();
              });
            } else {
              // Asume que cualquier otro caso es error (incluye 'ERR')
              Swal.fire({
                title: '¡Advertencia!',
                text: resp.mensaje || 'Error al procesar la solicitud',
                icon: 'warning',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then(() => {
                this.actualizarDatos();
              });
            }
          });
      }
    });
  }

  // Función común para actualizar datos
  actualizarDatos() {
    this.buscarSolicitudes();
    if (this.usuarioService.usuarioExterno) {
      this.cargarDatosSolicitante(this.usuarioService.usuarioExterno.numeroIdentificacion);
    }
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

  buscarOperadorAutorizado(identificacion: string) {
    // Mostrar alerta de carga
    this.listaOperadores = [];
    this.listaTiposAretes = []; // Inicializar listaTiposAretes
    this.mostrarCargando('Cargando datos...');
    // Llamar a obtenerProveedores y esperar a la respuesta
    this.proveedorAretesService.obtenerProveedorAretes({ numeroIdentificacionUsuario: identificacion })
      .subscribe((resultado: any) => {
        this.listaOperadores = resultado.resultado;

        // Verificar si hay al menos un operador en la lista
        if (this.listaOperadores.length > 0) {
          // Acceder a la propiedad aomz del primer operador
          this.aomz = this.listaOperadores[0].aomz;
        } else {
          // Si no hay operadores, asignar un valor null
          this.aomz = null;
        }

        // Cargar opciones según el valor de aomz
        this.tiposAretesService.obtenerTiposAretes({ estado: 1 })
          .subscribe((tiposAretes: TipoArete[]) => {
            if (this.aomz === 1) {
              // Filtrar para dejar solo el tipo de arete con id_tipos_aretes igual a 1
              this.listaTiposAretes = tiposAretes.filter(tipo => tipo.id_tipos_aretes === 1);
            } else if (this.aomz === 2) {
              this.listaTiposAretes = tiposAretes;
            }
          });
        // Cerrar alerta de carga
        Swal.close();
      }, (error) => {
        Swal.fire('Error', 'No se pudo obtener los datos del operadore autorizado: '+error, 'error');
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

  //**** Generar título para hover del botón Revisar ****/
  generarTitulo(solicitud: any, accion: string = 'Revisar'): string {
    const idSolicitud = solicitud?.idSolicitudesAretes;
    return `${accion} solicitud ${idSolicitud}`;
  }

}

