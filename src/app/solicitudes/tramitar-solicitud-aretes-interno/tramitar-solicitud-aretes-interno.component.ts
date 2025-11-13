import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { SolicitudAretes } from 'src/app/modelos/solicitud-aretes.modelo';
import { EstadoSolicitud } from '../../modelos/estado-solicitud.modelo';
// Importación de servicios.
import { EstadoSolicitudService } from 'src/app/servicios/estado-solicitud/estado-solicitud.service';
import { SolicitudAretesService } from 'src/app/servicios/solicitud-aretes/solicitud-aretes.service';
import { ProveedorAretesService } from 'src/app/servicios/proveedor-aretes/proveedor-aretes.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';
// Importamos Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-tramitar-solicitud-aretes-interno',
  templateUrl: './tramitar-solicitud-aretes-interno.component.html',
  styleUrls: ['./tramitar-solicitud-aretes-interno.component.css']
})
export class TramitarSolicitudAretesInternoComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  public solicitudSeleccionada?: SolicitudAretes = null;
  //**** Listas ****/
  public listaProveedoresOrdenados = [];
  public listaSolicitudes = [];
  public listaEstadoSolicitudes = [];
  public listaAretesAprobados = [];
  //**** Variables auxiliares ****/
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  fechaInicial: string;
  fechaFinal: string;
  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();
  public idSolicitud: number;
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private scriptServicio: ScriptsService,
    public servicioUsuario: UsuarioService,
    private solicitudAretesService: SolicitudAretesService,
    private proveedorAretesService: ProveedorAretesService,
    private estadoSolicitudService: EstadoSolicitudService,
    private aretesBovinosService: AretesBovinosService,
    private reportesAretesService: ReportesAretesService,
    private router: Router
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.verificarRolUsuario(); // Se valida el acceso del usuario, en base a su rol. Que sea usuario interno.
    this.inicializarFormulario();
    this.obtenerProveedores();
    this.obtenerEstadosSolicitudes();
    this.fechaInicialBusqueda();
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputId: new FormControl(null, [Validators.maxLength(10)]),
      inputIdentificacion: new FormControl(null, [Validators.maxLength(13)]),
      inputProveedor: new FormControl('-1'),
      inputEstado: new FormControl('1'),
      fecha_inicio: new FormControl(null),
      fecha_fin: new FormControl(null)
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

  //**** Limpiar lista de proveedores ****/
  limpiarListaSolicitudes() {
    this.listaSolicitudes = [];
  }

  //**** Botón salir ****/
  botonSalir() {
    this.formularioVisible = false;
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
    const proveedor = this.formularioBusqueda.get('inputProveedor')?.value;
    const estado = this.formularioBusqueda.get('inputEstado')?.value;
    // Parámtros obligatorios
    parametros.origen = 2; // Origen externo - ganaderos y operadores
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

          // Almacenar el resultado en listaProveedoresOrdenados tal cual
          this.listaProveedoresOrdenados = [...resultado.resultado];
        },
        (error) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el listado de proveedores. Intente nuevamente más tarde: '+error, 'error');
        }
      );
  }

  //**** Función para formatear el teléfono 
  formatoCelular(telefono: string): string {
    return telefono.replace(/(\d{3})(\d{3})(\d{3})/, '+593-$1-$2-$3');
  }

  asignarDatosRevision(id: number) {
    
    this.mostrarCargando('Consultando datos de la solicitud...');
    // Eliminar datos residuales
    this.listaAretesAprobados = [];
    // Buscar solicitud en la lista
    const solicitud = this.listaSolicitudes.find(
      (item: SolicitudAretes) => item.idSolicitudesAretes === id
    );
    this.formularioVisible = true;

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

  //**** Método que obtiene los datos de roles del usuario ****/
  verificarRolUsuario() {
    if (!this.servicioUsuario.usuarioInterno) {
      Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad', 'error');
      this.router.navigate(['inicio']);
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
    return `Revisar solicitud ${idSolicitud}`;
  }

}

