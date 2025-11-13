import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
// Importación de modelos.
import { Bovino } from '../../modelos/bovino.modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { Area } from '../../modelos/area.modelo';
import { HistoriaBovino } from '../../modelos/historia-bovino.modelo';
import { BovinosOtrasVacunaciones } from 'src/app/modelos/bovinos-otras-vacunaciones.modelo';
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { HistoriaBovinoService } from '../../servicios/historia-bovino/historia-bovino.service';
import { TiposCatastroService } from 'src/app/servicios/tipos-catastro/tipos-catastro.service';
import { VacunaOficialService } from 'src/app/servicios/vacuna-oficial/vacuna-oficial.service';
import { BovinosOtrasVacunacionesService } from 'src/app/servicios/bovinos-otras-vacunaciones/bovinos-otras-vacunaciones.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';

@Component({
  selector: 'app-consultar-animales-operador',
  templateUrl: './consultar-animales-operador.component.html'
})
export class ConsultarAnimalesOperadorComponent implements OnInit {

  @ViewChild('panelScrollContainer') panelScrollContainer!: ElementRef;
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  formularioBusqueda: FormGroup;
  formularioDatosSitio: FormGroup;
  //**** Cuerpo de modelos ****/
  public sitioSeleccionado?: Area = null;
  public animalSeleccionado?: Bovino = null;
  public tipoServicioSeleccionado: any = null;
  //**** Listas ****/
  listaAreas: Area[] = [];
  listaBovinos: Bovino[] = [];
  categorias: Categoria[] = [];
  listaTiposCatastro = [];
  listaVacunasOficiales = [];
  listaBovinosOtrasVacunaciones: BovinosOtrasVacunaciones[] = [];
  //**** Variables auxiliares ****/
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  isVisibleBotonDetalles: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  isVisible: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  panelHistorico: boolean;
  listaHistoriasBovino: HistoriaBovino[];
  consultando: boolean;
  codigoOficial: string;
  tipoProductor = true;
  arete: string = "arete";
  productor: string = "productor";
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScripts: ScriptsService,
    private bovinoService: BovinoService,
    private servicioCategoria: CategoriaService,
    public usuarioServicio: UsuarioService,
    private areaServicio: AreaService,
    private historiaBovinoServicio: HistoriaBovinoService,
    private tiposCatastroService: TiposCatastroService,
    private vacunaOficialService: VacunaOficialService,
    private bovinosOtrasVacunacionesService: BovinosOtrasVacunacionesService,
    private reportesAretesService: ReportesAretesService,
    private router: Router 
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.resetScroll();
      }
    });

  }

  ngOnInit() {
    this.servicioScripts.inicializarScripts();
    this.inicializarFormulario();
    this.cargarTiposCatastro();
  }

  // Método para resetear el scroll
  resetScroll() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputTipoConsulta: new FormControl('productor'),
      inputIdentificacion: new FormControl(''),
      inputSitio: new FormControl(null),
      inputTipoCatastro: new FormControl('-1'),
      inputCategoria: new FormControl(null),
      inputIdOficial: new FormControl('')
    });

    this.formularioDatosSitio = new FormGroup({
    });

    this.formulario = new FormGroup({
      // ------------------Registro Vacunaciones------------------
      inputIdVacuna: new FormControl('-1'),
      inputFechaVacunacion: new FormControl(null)
    }, [
    ]);
  }

  //**** Paginación - página anterior ****/
  anterior() {
    this.inicio = this.inicio - this.rango;
    this.fin = this.rango;
    this.listaBovinos = [];
    this.buscarAnimales();
  }

  //**** Paginación - página siguiente ****/
  siguiente() {
    this.inicio = this.inicio + this.rango;
    this.fin = this.rango;
    this.listaBovinos = [];
    this.buscarAnimales();
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Obtener catálogo de tipos de catastro ****//
  cargarTiposCatastro() {
    this.tiposCatastroService.obtenerTiposCatastro()
      .subscribe(
        respuesta => {
          // Filtrar solo tipos en estado 1 (activo)
          this.listaTiposCatastro = respuesta.filter(tipo => tipo.estado === 1);
          this.listaTiposCatastro = [
            { codigo: -1, nombre: 'Todos' }, // Opción quemada "Todos" al inicio
            ...respuesta
          ];
        },
        error => {
          throw new Error(`Error al cargar los tipos de catastro: ${error}`);
        }
      );
  }

  //**** Obtener catálogo de enfermedades de los bovinos ****//
  cargarVacunasOficiales() {
    this.vacunaOficialService.obtenerVacunasOficiales()
      .subscribe(
        respuesta => {
          // Filtrar solo tipos en estado 1 (activo)
          this.listaVacunasOficiales = respuesta.filter(tipo => tipo.estado === 1);
        },
        error => {
          throw new Error(`Error al cargar las vacunas oficiales: ${error}`);
        }
      );
  }

  //**** Obtener catálogo de categorías etarias ****//
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
      .subscribe((respuesta: Categoria[]) => {
        // Agregar "Todas" al inicio y "Búfalos" al final
        this.categorias = [
          { id_categoria: -1, nombre: 'Todas' }, // Opción quemada "Todas" al inicio
          ...respuesta, // Categorías dinámicas obtenidas del servicio
          { id_categoria: 7, nombre: 'Búfalo Hembra' }, // Opción quemada "Búfalo Hembra" al final
          { id_categoria: 8, nombre: 'Búfalo Macho' } // Opción quemada "Búfalo Macho" al final
        ];
      });
  }

  //**** Abrir Mapa de Google Maps ****/
  abrirGoogleMaps(lat: string, lng: string) {
    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  //**** Función para alternar la visibilidad del detalle del sitio ****/
  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  //**** Método que permite asignar el sitio encontrado a una varible global y resetear la búsqueda residual ****/
  cambioSitio(id: number) {
    //Reset variables y valores residuales
    this.formularioBusqueda.controls.inputCategoria.setValue(null);
    this.formularioBusqueda.controls.inputTipoCatastro.setValue('-1');
    //this.formularioBusqueda.controls.inputIdOficial.setValue('');
    this.listaBovinos = [];
    this.isVisible = false;
    // Buscar sitio en la lista
    const area = this.listaAreas.find((item: any) => item.idSitio === Number(id));
    //Asignar valores a las variables
    this.sitioSeleccionado = area;
    this.isVisibleBotonDetalles = true;
    // Cargar catálogo de categorías
    this.obtenerCategorias();
  }

  //**** Método que permite resetear la búsqueda residual al cambio el valor ****/
  cambioTipoCatastro() {
    this.listaBovinos = [];
    this.formularioBusqueda.controls.inputCategoria.setValue(null);
    //this.formularioBusqueda.controls.inputIdOficial.setValue('');
  }

  //**** Método que permite resetear la búsqueda residual al cambio el valor ****/
  cambioCategoria() {
    this.buscarAnimales(true, true);
    //this.formularioBusqueda.controls.inputIdOficial.setValue('');
  }

  //**** Método que permite buscar animales en el catastro según sus parámetros. ****/
  buscarAnimales(mensaje: boolean = false, inicioDefault: boolean = false) {
    this.resetScroll();
    //Eliminar datos residuales
    if (inicioDefault) { this.inicio = 0; }
    this.fin = this.rango;
    this.listaBovinos = [];
    const parametros = new Bovino();

    if (!this.formularioBusqueda.value.inputCategoria) {
      this.formularioBusqueda.controls.inputCategoria.setValue('-1');
    }

    if (!this.tipoProductor) {
      if (this.formularioBusqueda.value.inputIdOficial) {
        parametros.codigoIdentificacion = `%${this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim()}`;
      } else {
        Swal.fire('¡Advertencia!', 'Ingrese número de arete oficial.', 'warning');
        return;
      }
    }

    if (this.formularioBusqueda.value.inputSitio) {
      parametros.idUsuarioActual = this.sitioSeleccionado.idUsuariosExternos;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idSitioActual = this.formularioBusqueda.value.inputSitio;

      if (this.formularioBusqueda.value.inputTipoCatastro !== "-1" && this.formularioBusqueda.value.inputTipoCatastro !== null) {
        parametros.idBovinoCertificado = this.formularioBusqueda.value.inputTipoCatastro;
      }
      if (this.formularioBusqueda.value.inputCategoria !== "-1" && this.formularioBusqueda.value.inputCategoria !== null) {
        parametros.idCategoria = this.formularioBusqueda.value.inputCategoria;
      }

      parametros.codigoIdentificacion = 'si';

    }

    parametros.inicio = this.inicio;
    parametros.limite = this.fin;

    this.mostrarCargando('Buscando animales...');

    this.bovinoService.filtrarAnimales(parametros)
      .subscribe(
        (bovinos: Bovino[]) => {
          // Ordenar los bovinos por codigoIdentificacion de forma ascendente
          this.listaBovinos = bovinos.sort((a, b) => {
            const codigoA = a.codigoIdentificacion || '';
            const codigoB = b.codigoIdentificacion || '';
            return codigoA.localeCompare(codigoB);
          });
          Swal.close();
          if (mensaje) {
            if (this.listaBovinos.length === 0) {
              Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados.', 'info');
            } else {
              // Mostrar mensaje de éxito
              Swal.fire({
                title: '¡Búsqueda exitosa!',
                text: `Se cargaron los animales encontrados.`,
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
              });
            }
          }
        },
        (error) => {
          Swal.close();
          Swal.fire('¡Error!', 'Hubo un problema al buscar los animales.', 'error');
        }
      );
  }

  //**** Método para asignar los datos del animal al formulario. ****/
  asignarDatosFormularioAnimal(id: number) {

    this.animalSeleccionado = null;
    this.mostrarCargando('Asignando datos del animal...');

    this.bovinoService.filtrarAnimales({ idBovino: id })
      .subscribe((bovinos: Bovino[]) => {
        this.listaBovinos = bovinos;;
        Swal.close();
      });

    // Buscar el animal en la lista
    let animal = this.listaBovinos.find((item: Bovino) => item.idBovino === id);

    // Verificar si el animal fue encontrado
    if (animal) {
      // Asignar los valores al formulario
      this.animalSeleccionado = animal;
      this.formularioVisible = true;
      this.cargarVacunasOficiales();
      this.cargarOtrasVacunaciones(id);
      Swal.close();
    } else {
      // Mostrar error si el animal no fue encontrado
      this.formularioVisible = false;
      Swal.fire('Error', 'Animal no encontrado', 'error');
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

  //**** Generar título para hover de botones ****/
  generarTitulo(bovino: any, tipo: 'vacunacion' | 'trazabilidad' = 'vacunacion'): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const idBovino = tipo === 'trazabilidad'
      ? bovino?.codigoIdentificacion || bovino?.idBovino
      : bovino?.idBovino || 'N/A';
    const prefijo = tipo === 'trazabilidad' ? 'Trazabilidad de' : 'Registrar vacunación de';
    return `${prefijo} ${nombreCategoria} (${idBovino})`;
  }

  // Método que muestra el panel de información del histórico de un animal.
  mostrarHistoricoBovino(idBovinoParametro: number, codigoOficial: string) {
    this.codigoOficial = codigoOficial;
    this.panelHistorico = true;
    this.consultando = true;
    this.historiaBovinoServicio.obtenerHistoriaBovinoPorFiltro({ idBovino: idBovinoParametro })
      .subscribe((respuesta) => {
        this.listaHistoriasBovino = respuesta;
        this.consultando = false;
      });
  }
  // Método que cerrar el panel de información del histórico de un animal.
  cerrarPanel() {
    this.panelHistorico = false;
    this.listaHistoriasBovino = [];

    // Espera un ciclo de detección de cambios de Angular
    setTimeout(() => {
      const panel = this.panelScrollContainer?.nativeElement;
      if (panel) panel.scrollTop = 0;
    }, 50);
  }

  //**** Botón salir ****/
  botonSalir() {
    this.formularioVisible = false;
    this.buscarAnimales();
  }

  //**** Obtener sitios del productor ****/
  buscarSitiosProductor() {
    //Parámetros
    if (!this.formularioBusqueda.value.inputIdentificacion) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, ingrese el número de identificación del productor.',
        icon: 'warning',
        confirmButtonText: 'Ok',
        timer: 5000,
        showCancelButton: false
      });
      return;
    }

    this.limpiarLista();
    let identificacion = this.formularioBusqueda.value.inputIdentificacion.toUpperCase().trim();

    this.mostrarCargando('Consultando sitios del productor...')

    const parametros: Area = {
      numeroIdentificacion: identificacion,
      codigoEstadoSitio: 'AC', //solo sitios en estado ACTIVO
      estado: 1 // área activa
    };

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((areas: Area[]) => {
        this.listaAreas = areas.filter((item: any) => {
          return item.codigoTipoArea === 'ex_pec_bov'; // solo explotaciones pecuarias
        });
        Swal.close();

        if (this.listaAreas.length < 1) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
        } else {
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: 'Por favor, seleccione un sitio del listado',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          });
        }
      });
  }

  //**** Limpiar lista sitios ****//
  limpiarLista() {
    this.listaBovinos = [];
    this.listaAreas = [];
    this.isVisibleBotonDetalles = false;
    this.formularioBusqueda.controls.inputSitio.setValue(null);
    this.formularioBusqueda.controls.inputTipoCatastro.setValue('-1');
    this.categorias = [];
    this.formularioBusqueda.controls.inputCategoria.setValue(null);
  }

  //**** Método para cargar otras vacunaciones ****/
  cargarOtrasVacunaciones(idBovinoParametro: number) {

    const parametros: any = {}; // Objeto para almacenar los filtros dinámicamente
    parametros.idBovino = idBovinoParametro; // id del bovino
    parametros.estado = 1; // estado 1 solo registros activos
    // Inicializa la lista para evitar datos residuales
    this.listaBovinosOtrasVacunaciones = [];
    this.mostrarCargando('Cargando registros de vacunación...');
    this.bovinosOtrasVacunacionesService.obtenerOtrasvacunaciones(parametros)
      .subscribe((resultado: any) => {
        Swal.close();
        this.listaBovinosOtrasVacunaciones = resultado.resultado;
      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener el registro de vacunaciones. Intente nuevamente más tarde: ' + error, 'error');
      });
  }

  //**** Botón cancelar ****/
  botonCancelar() {
    this.desplazarAlInicio();
    this.isVisible = false;
    this.buscarAnimales(false, true);
    this.formularioVisible = false;
    this.limpiarformulario();
  }

  //**** limpiar formulario ****/
  limpiarformulario() {
    this.formulario.controls.inputIdVacuna.setValue('-1');
    this.formulario.controls.inputFechaVacunacion.setValue('');
  }

  //**** Método para registrar otras vacunaciones del animal ****/
  registrarVacunacion() {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputIdVacuna == '-1') {
      formularioInvalido = true;
      mensaje += "<li>Seleccione una vacuna</li>";
    }

    if (!this.formulario.value.inputFechaVacunacion) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione una fecha de vacunación.</li>";
    }

    const fechaVacunacion = new Date(this.formulario.value.inputFechaVacunacion);
    const fechaActual = new Date(); // Fecha actual
    // Inicializar fechaMinimaPermitida con la fecha actual
    let fechaMinimaPermitida = new Date(fechaActual);
    // Restar 3 meses a la fecha actual
    fechaMinimaPermitida.setMonth(fechaActual.getMonth() - 3);
    // Validar que la fecha de muerte no sea mayor que la fecha actual
    if (fechaVacunacion > fechaActual) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de vacunación no puede superar la fecha actual.</li>`;
      this.formulario.controls.inputFechaVacunacion.setValue(null); // o setValue('') dependiendo de lo que esperes en el formulario
    }
    // Validar que la fecha de muerte no sea menor que la fecha mínima permitida
    else if (fechaVacunacion < fechaMinimaPermitida) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de vacunación no puede ser anterior al [ ${fechaMinimaPermitida.toISOString().substring(0, 10)} ]</li>`;
      this.formulario.controls.inputFechaVacunacion.setValue(null);
    }

    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire({
        title: '¡Advertencia!',
        html: `<div style="text-align: left;">${mensaje}</div>`,
        icon: 'warning'
      });
      return;
    }

    const vacuna = this.listaVacunasOficiales.find(
      (item: any) => item.id_vacunas_oficiales === Number(this.formulario.value.inputIdVacuna)
    );

    const otrasVacunas = new BovinosOtrasVacunaciones();
    otrasVacunas.idBovino = this.animalSeleccionado.idBovino;
    otrasVacunas.idVacunasOficiales = this.formulario.value.inputIdVacuna;
    otrasVacunas.idUsuarioProductor = this.animalSeleccionado.idUsuarioActual;
    otrasVacunas.idUsuarioOperador = Number(this.usuarioServicio.usuarioExterno.idUsuario);
    otrasVacunas.idSitio = this.animalSeleccionado.idSitioActual;
    otrasVacunas.fechaVacunacion = fechaVacunacion.toISOString().substring(0, 10);
    otrasVacunas.estado = 1; // Activo

    const categoria = this.animalSeleccionado.idTaxonomia == 13
      ? `${this.animalSeleccionado.nombreComunTaxonomia || ''} ${this.animalSeleccionado.nombreSexo || ''}`.trim()
      : this.animalSeleccionado.nombreCategoria;
    Swal.fire({
      title: '¿Registrar vacunación?',
      html: `<b>${vacuna.nombre}</b>
            <br><br><b>[ ${this.animalSeleccionado.codigoIdentificacion} ]</b> &rarr; 
            <b>[ ${categoria} ]</b>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Registrando vacunación...');
        this.bovinosOtrasVacunacionesService.registrarVacunacion(otrasVacunas).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', `¡Vacunación registrada con éxito!
                <br><br>
                <b>${vacuna.nombre}</b>
                <br><br><b>[ ${this.animalSeleccionado.codigoIdentificacion} ]</b> &rarr; 
                <b>[ ${categoria} ]</b>`, 'success')
                .then(() => {
                  this.cargarOtrasVacunaciones(this.animalSeleccionado.idBovino);
                  this.limpiarformulario();
                });
            } else {
              Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo guardar datos de vacunación.', 'error');
          },
        });
      }
    });
  }

  //**** Método para eliminar vacunaciones del animal ****/
  eliminarVacunacion(vacuna: any) {

    const fechaVacunacion = new Date(vacuna.fechaVacunacion);
    const fechaActual = new Date();
    const fechaLimite = new Date(fechaVacunacion);
    fechaLimite.setDate(fechaVacunacion.getDate() + 15);

    if (vacuna.idUsuarioOperador !== Number(this.usuarioServicio.usuarioExterno.idUsuario)) {
      Swal.fire('¡Atención!', 'No puede eliminar vacunaciones registras por otro usuario.', 'info');
      return;
    }

    if (fechaActual > fechaLimite) {
      Swal.fire('¡Atención!', 'No puede eliminar vacunaciones después de 15 días de su registro.', 'info');
      return;
    }

    const categoria = this.animalSeleccionado.idTaxonomia == 13
      ? `${this.animalSeleccionado.nombreComunTaxonomia || ''} ${this.animalSeleccionado.nombreSexo || ''}`.trim()
      : this.animalSeleccionado.nombreCategoria;
    Swal.fire({
      title: '¿Eliminar vacunación?',
      html: `<b>${vacuna.nombreVacuna}</b>
            <br><br><b>[ ${this.animalSeleccionado.codigoIdentificacion} ]</b> &rarr; 
            <b>[ ${categoria} ]</b>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Eliminando vacunación...');
        this.bovinosOtrasVacunacionesService.eliminarVacunacion(vacuna.idOtrasVacunaciones)
          .subscribe((respuesta: any) => {
            console.log(respuesta);
            Swal.fire('Éxito', `¡Vacunación eliminada con éxito!`, 'success').then(() => {
              this.cargarOtrasVacunaciones(this.animalSeleccionado.idBovino);
            });
          });
      }
    });
  }

  cambiarTipoParametro() {
    this.limpiarLista();
    this.formularioBusqueda.controls.inputIdentificacion.setValue(null);
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
    if (this.formularioBusqueda.value.inputTipoConsulta == "productor") {
      this.tipoProductor = true;
    }
    else {
      this.tipoProductor = false;
    }
  }

  //**** Exportar JSON Bovinos a PDF ****/
  exportarListadoBovinosPDF() {
    if (!this.listaBovinos || this.listaBovinos.length === 0) {
      Swal.fire('¡Advertencia!', 'No hay datos para generar el Documento PDF', 'warning');
      return;
    }
    this.mostrarCargando('Generando Documento PDF...');
    const pdfData = {
      estado: "OK",
      memoria: 0,
      resultado: this.listaBovinos
    };
    this.reportesAretesService.exportAsPdfFileBovinosVacunacion(pdfData);
    Swal.close();
    Swal.fire({
      title: 'Documento Generado con Éxito!',
      text: 'Por favor, revise su carpeta de descargas',
      icon: 'success',
      timer: 3000, // Tiempo en milisegundos (3000 ms = 3 segundos)
      showConfirmButton: false // Oculta el botón de confirmación
    });
  }

}
