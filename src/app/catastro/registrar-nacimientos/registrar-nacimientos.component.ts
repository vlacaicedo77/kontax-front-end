import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
// Importación de modelos.
import { Bovino } from '../../modelos/bovino.modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { Area } from '../../modelos/area.modelo';
import { Raza } from '../../modelos/raza.modelo';
import { Pureza } from 'src/app/modelos/pureza.modelo';
import { AreteBovino } from 'src/app/modelos/arete-bovino.modelo';
import { TipoServicio } from 'src/app/modelos/tipo-servicio.modelo';
import { TipoRegistro } from '../../modelos/tipo-registro.modelo';
import { Sexo } from '../../modelos/sexo.modelo';
import { Taxonomia } from '../../modelos/taxonomia.modelo';
import { EstadisticaValidacionesNacimientos } from 'src/app/modelos/estadistica-validaciones-nacimientos.modelo';
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { RazaService } from '../../servicios/raza/raza.service';
import { PurezaService } from 'src/app/servicios/pureza/pureza.service';
import { TipoServicioService } from '../../servicios/tipo_servicio/tipo-servicio.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { PaisService } from 'src/app/servicios/pais/pais.service';
import { ProcedenciaService } from 'src/app/servicios/procedencia/procedencia.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { TipoRegistroService } from '../../servicios/tipo-registro/tipo-registro.service';
import { SexoService } from '../../servicios/sexo/sexo.service';
import { TaxonomiaService } from '../../servicios/taxonomia.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-registrar-nacimientos',
  templateUrl: './registrar-nacimientos.component.html'
})
export class RegistrarNacimientosComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  formularioBusqueda: FormGroup;
  formularioDatosSitio: FormGroup;
  //**** Cuerpo de modelos ****/
  public sitioSeleccionado?: Area = null;
  public animalSeleccionado?: Bovino = null;
  public areteSeleccionado?: AreteBovino = null;
  public tipoServicioSeleccionado: any = null;
  public areaSeleccionada: any = null;
  public validacionNacimiento = new EstadisticaValidacionesNacimientos();
  //**** Listas ****/
  listaAreas: Area[] = [];
  listaPaisesOriginal = [];
  listaPaises = [];
  listaProcedencia = [];
  listaAretesAprobados: AreteBovino[] = [];
  listaBovinos: Bovino[] = [];
  listaMadres: Bovino[] = [];
  listaMadresDonadoras: Bovino[] = [];
  listaPadres: Bovino[] = [];
  categorias: Categoria[] = [];
  razas: Raza[] = [];
  purezas: Pureza[] = [];
  tiposServicios: TipoServicio[] = [];
  tiposRegistros: TipoRegistro[] = [];
  sexos: Sexo[] = [];
  taxonomias: Taxonomia[] = [];
  //**** Variables auxiliares ****/
  public cantidadPosible = 0;
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  infoAnimalVisible: boolean = false; // true = Visible // false = Oculto
  procedenciaVisible: boolean = false; // true = Visible // false = Oculto
  isVisibleBotonDetalles: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  isVisible: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  panelEstadistica: boolean = false; // Variable para controlar la visibilidad de la información de nacimientos
  frameRegDefinitivo: boolean = false; // Variable para controlar la visibilidad de campos para registro definitivo
  razaPureza: boolean = false; // true = Visible // false = Oculto
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScripts: ScriptsService,
    private bovinoService: BovinoService,
    private servicioCategoria: CategoriaService,
    private usuarioServicio: UsuarioService,
    private areaServicio: AreaService,
    private razasService: RazaService,
    private purezasService: PurezaService,
    private tiposServiciosService: TipoServicioService,
    private aretesBovinosService: AretesBovinosService,
    private tiposRegistrosService: TipoRegistroService,
    private sexosService: SexoService,
    private taxonomiaService: TaxonomiaService,
    private paisesService: PaisService,
    private procedenciaService: ProcedenciaService,
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
    // Cargar sitios activos del ganadero (usuario externo)
    this.obtenerSitiosProductor();
    // Cargar catálogos generales
    this.cargarCatalogos();
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
      inputSitio: new FormControl(null, Validators.required),
      inputCategoria: new FormControl(null),
      inputIdOficial: new FormControl('')
    });

    this.formularioDatosSitio = new FormGroup({
    });

    this.formulario = new FormGroup({
      // ------------------Lugar de nacimiento------------------
      inputIdSitio: new FormControl(null, Validators.required),
      // ------------------Tipo de registro---------------------
      inputIdTipoRegistro: new FormControl(2, Validators.required),
      // ------------------Datos generales----------------------
      inputFechaNacimiento: new FormControl(null, Validators.required),
      inputIdTaxonomia: new FormControl(null, Validators.required),
      inputIdSexo: new FormControl(null, Validators.required),
      // ------------------Pedigrí e identificación------------------
      inputRaza: new FormControl(null),
      inputPureza: new FormControl(null),
      inputArete: new FormControl(null),
      inputNumeroRegistroNacimiento: new FormControl(''),
      inputProcedencia: new FormControl('1'),
      inputPaisProcedencia: new FormControl(null),
      // ------------------Registro Reproductivo------------------
      inputCodigoPajuelaPadre: new FormControl(''),
      inputTipoServicio: new FormControl(null),
      inputIdBovinoMadre: new FormControl(null),
      inputIdBovinoMadreDonadora: new FormControl(null),
      inputIdBovinoPadre: new FormControl(null),
      // ------------------Buscar Identificadores------------------
      inputBuscarMadre: new FormControl(''),
      inputBuscarMadreDonadora: new FormControl(''),
      inputBuscarPadre: new FormControl(''),
      inputBuscarArete: new FormControl('')
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

  //**** Botón cancelar ****/
  botonCancelar() {
    this.desplazarAlInicio();
    this.isVisible = false;
    this.infoAnimalVisible = false;
    this.formularioVisible = false;
    this.frameRegDefinitivo = false;
    this.limpiarCamposGeneralesFormulario();
    this.limpiarFrameDetinitivo();
    this.panelEstadistica = false;
  }

  //**** Botón Salir ****/
  botonSalir() {
    this.botonCancelar();
    this.buscarAnimales(false, true);
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Obtener catálogo de razas ****//
  obtenerRazas() {
    this.razasService.obtenerRazas()
      .subscribe(respuesta => this.razas = respuesta);
  }

  //**** Obtener catálogo de purezas ****//
  obtenerPurezas() {
    this.purezasService.obtenerPurezas()
      .subscribe(respuesta => this.purezas = respuesta);
  }

  //**** Obtener catálogo de tipos de servicio ****//
  obtenerTiposServicios() {
    this.tiposServiciosService.obtenerTiposServicios()
      .subscribe(respuesta => this.tiposServicios = respuesta);
  }

  //**** Obtener catálogo de tipos de procedencia de los animales ****//
  cargarProcedencia() {
    this.procedenciaService.obtenerProcedencia()
      .subscribe(
        respuesta => {
          // Filtrar solo tipos en estado 1 (activo)
          this.listaProcedencia = respuesta.filter(tipo => tipo.estado === 1);
        },
        error => {
          throw new Error(`Error al cargar los tipos de procedencia: ${error}`);
        }
      );
  }

  //**** Obtener catálogo de países ****//
  cargarPaises() {
    this.paisesService.getPaises()
      .subscribe(
        respuesta => {
          // Filtrar la lista para excluir Ecuador y solo incluir países con estado_import=1
          this.listaPaises = respuesta.filter(pais => pais.codigo !== 'EC' && pais.estado_import === 1);
        },
        error => {
          throw new Error(`Error al cargar los países: ${error}`);
        }
      );
  }

  //**** Obtener catálogo de categorías etarias ****//
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
      .subscribe((respuesta: Categoria[]) => {
        // Filtrar las categorías para excluir solo las que tienen id_categoria = 3 o 6
        const categoriasFiltradas = respuesta.filter(categoria => categoria.id_categoria !== 3 && categoria.id_categoria !== 6);

        // Agregar "Todas" al inicio y "Búfalos" al final
        this.categorias = [
          { id_categoria: -1, nombre: 'Todas' }, // Opción quemada "Todas" al inicio
          ...categoriasFiltradas, // Categorías filtradas obtenidas del servicio
          { id_categoria: 7, nombre: 'Búfalo Hembra' }, // Opción quemada "Búfalo Hembra" al final
          { id_categoria: 8, nombre: 'Búfalo Macho' } // Opción quemada "Búfalo Macho" al final
        ];
      });
  }

  //**** Obtener catálogo de Tipos Registros ****//
  obtenerTiposRegistros() {
    this.tiposRegistrosService.obtenerTiposRegistros()
      .subscribe(respuesta => this.tiposRegistros = respuesta);
  }

  //**** Obtener catálogo de Taxonomías (especies) ****//
  obtenerTaxonomias() {
    const codigosPermitidos = new Set(['bubalus_bubalis', 'bos_taurus_primigenius']);
    this.taxonomiaService.obtenerTaxonomias().subscribe((taxonomias: Taxonomia[]) => {
      this.taxonomias = taxonomias.filter((item: Taxonomia) => codigosPermitidos.has(item.codigo));
    });
  }

  //**** Obtener catálogo de Sexos ****//
  obtenerSexos() {
    this.sexosService.obtenerSexos()
      .subscribe((respuesta: Sexo[]) => this.sexos = respuesta);
  }

  //**** Cargar catálogos generales ****//
  cargarCatalogos() {
    this.obtenerRazas();
    this.obtenerTiposServicios();
    this.obtenerPurezas();
    this.cargarPaises();
    this.obtenerTiposRegistros();
    this.obtenerTaxonomias();
    this.obtenerSexos();
    this.obtenerCategorias();
    this.cargarProcedencia();
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
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
    this.listaBovinos = [];
    this.isVisible = false;
    // Buscar sitio en la lista
    const area = this.listaAreas.find((item: any) => item.idSitio === Number(id));
    //Asignar valores a las variables
    this.sitioSeleccionado = area;
    this.isVisibleBotonDetalles = true;
  }

  //**** Método que permite resetear la búsqueda residual al cambio el valor ****/
  cambioCategoria() {
    this.buscarAnimales(true, true);
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
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

  /**** Limpiar campos del formularios, variables y listas del registro reproductivo ****/
  cambioTipoServicio() {
    this.tipoServicioSeleccionado = this.formulario.value.inputTipoServicio;
    this.formulario.controls.inputIdBovinoMadre.setValue(null);
    this.formulario.controls.inputIdBovinoMadreDonadora.setValue(null);
    this.formulario.controls.inputIdBovinoPadre.setValue(null);
    this.formulario.controls.inputCodigoPajuelaPadre.setValue('');
    //Cajas de buscar
    this.formulario.controls.inputBuscarMadre.setValue('');
    this.formulario.controls.inputBuscarMadreDonadora.setValue('');
    this.formulario.controls.inputBuscarPadre.setValue('');
    //Listas
    this.listaMadres = [];
    this.listaMadresDonadoras = [];
    this.listaPadres = [];
  }

  /**** Limpiar variables y listas de procedencia ****/
  cambioProcedencia() {
    if (this.formulario.value.inputProcedencia == 2) {
      this.procedenciaVisible = true;
    } else {
      this.procedenciaVisible = false;
    }
    this.formulario.controls.inputPaisProcedencia.setValue(null);
  }

  //**** Obtener sitios del productor ****/
  obtenerSitiosProductor() {
    //Parámetros
    this.mostrarCargando('Cargando sitios...')
    const parametros: Area = {
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      codigoEstadoSitio: 'AC', //solo sitios en estado ACTIVO
      estado: 1
    };

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((areas: Area[]) => {
        this.listaAreas = areas.filter((item: any) => {
          return item.codigoTipoArea === 'ex_pec_bov'; // solo explotaciones pecuarias
        });
        Swal.close();
      });
  }

  //**** Método que permite buscar animales en el catastro según sus parámetros. ****/
  buscarAnimales(mensaje: boolean = false, inicioDefault: boolean = false) {
    // Eliminar datos residuales
    this.resetScroll();
    if (inicioDefault) { this.inicio = 0; }
    this.fin = this.rango;
    this.listaBovinos = [];

    if (!this.formularioBusqueda.value.inputCategoria) {
      this.formularioBusqueda.controls.inputCategoria.setValue('-1');
    }

    if (this.formularioBusqueda.value.inputSitio) {
      const parametros = new Bovino();
      //parametros.idUsuarioActual = this.usuarioServicio.usuarioExterno.idUsuario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idSitioNacimiento = this.formularioBusqueda.value.inputSitio;
      parametros.idBovinoCertificado = 'nacimiento';
      parametros.fechaNacimiento = 'ultimoAnio';

      if (this.formularioBusqueda.value.inputCategoria !== "-1" && this.formularioBusqueda.value.inputCategoria !== null) {
        parametros.idCategoria = this.formularioBusqueda.value.inputCategoria;
      }
      if (this.formularioBusqueda.value.inputIdOficial?.trim()) {
        const inputIdOficial = this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim();
        parametros.codigoIdentificacion = inputIdOficial;
      }

      parametros.inicio = this.inicio;
      parametros.limite = this.fin;

      this.mostrarCargando('Buscando animales en el sitio...');

      this.bovinoService.filtrarAnimales(parametros)
        .subscribe(
          (bovinos: Bovino[]) => {
            // Ordenar la lista de bovinos por idBovino de mayor a menor
            this.listaBovinos = bovinos.sort((a, b) => b.idBovino - a.idBovino);
            Swal.close();
            if (mensaje) {
              if (this.listaBovinos.length === 0) {
                Swal.fire('¡Atención!', 'No se encontraron animales de la categoría seleccionada en este sitio.', 'info');
              } else {
                // Mostrar mensaje de éxito
                Swal.fire({
                  title: '¡Búsqueda exitosa!',
                  text: `Se cargaron los animales encontrados.`,
                  icon: 'success',
                  timer: 1000, // Tiempo en milisegundos (1000 ms = 1 segundo)
                  showConfirmButton: false // Oculta el botón de confirmación
                });
              }
            }
          },
          (error) => {
            Swal.close();
            Swal.fire('¡Error!', 'Hubo un problema al buscar los animales de este sitio: '+error, 'error');
          }
        );
    } else {
      Swal.fire('¡Atención!', 'Seleccione un sitio para realizar la búsqueda.', 'info');
    }
  }

  //**** Método para asignar los datos del animal al formulario. ****/
  asignarDatosFormularioAnimal(id: number) {

    this.animalSeleccionado = null;
    this.formularioBusqueda.controls.inputIdOficial.setValue('');

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
      this.infoAnimalVisible = true;
      Swal.close();

    } else {
      // Mostrar error si el animal no fue encontrado
      this.infoAnimalVisible = false;
      Swal.fire('Error', 'Animal no encontrado', 'error');
    }
  }

  //**** Método que permite buscar aretes oficiales ****/
  buscarAretesOficiales(mensaje: boolean = false) {
    // Mostrar mensaje de carga
    this.mostrarCargando('Buscando aretes oficiales...');

    // Obtener el idUsuarioActual de manera segura
    const idUsuarioActual = this.animalSeleccionado?.idUsuarioActual ?? (parseInt(localStorage.getItem('idUsuario') || '0', 10) || 0);
    // Parámetros para la búsqueda
    const parametros: AreteBovino = {
      idUsuarioActual: idUsuarioActual,
      numeroIdentificacionActual: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      idEstadosAretesBovinos: 2 // Estado de aretes oficiales
    };
    // Si el campo de búsqueda no está vacío, agregar el código oficial
    if (this.formulario.value.inputBuscarArete) {
      parametros.codigoOficial = `%${this.formulario.value.inputBuscarArete.toUpperCase().trim()}%`;
    }
    // Llamar al servicio para obtener aretes oficiales
    this.aretesBovinosService.obtenerAretes(parametros).subscribe(
      (resultado: any) => {
        Swal.close(); // Cerrar el mensaje de carga
        // Asignar el resultado de la búsqueda a this.listaAretesAprobados
        this.listaAretesAprobados = resultado.resultado;
        // Manejar los casos según la cantidad de resultados
        if (resultado.resultado.length === 0) {
          if (mensaje) {
            Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
            this.formulario.controls.inputArete.setValue(null);
          }
        } else if (resultado.resultado.length === 1) {
          const areteSeleccionado = this.listaAretesAprobados[0];
          this.formulario.controls.inputArete.setValue(areteSeleccionado.idAretesBovinos);

          if (mensaje) {
            Swal.fire({
              title: '¡Búsqueda exitosa!',
              text: `Arete oficial encontrado [${areteSeleccionado.codigoOficial}]`,
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });
          }
        } else {
          if (mensaje) {
            Swal.fire({
              title: '¡Búsqueda exitosa!',
              text: 'Por favor, seleccione un arete oficial.',
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });
          }
          this.formulario.controls.inputArete.setValue(null);
        }
      },
      (error) => {
        Swal.close(); // Cerrar el mensaje de carga en caso de error
        Swal.fire('Error', 'Hubo un problema al buscar aretes oficiales: '+error, 'error');
      }
    );
  }

  //**** Método que permite buscar padres ****//
  buscarPadres() {
    // Limpiar la lista antes de realizar la búsqueda
    this.listaPadres = [];
    this.formulario.controls.inputIdBovinoPadre.setValue(null);
    // Validar campo obligatorio
    const numeroArete = this.formulario.value.inputBuscarPadre.toUpperCase().trim();
    if (!numeroArete) {
      this.mostrarAdvertenciaArete();
      return;
    }
    // Determinar el valor de idCategoria
    const nombreCategoria = this.formulario.value.inputIdTaxonomia == '13' ? 'búfalos machos' : 'bovino macho';
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      padres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        this.listaPadres = resultado;
        Swal.close();
        // Verificar si hay resultados
        if (this.listaPadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          const padreSeleccionado = this.listaPadres[0];
          this.formulario.controls.inputIdBovinoPadre.setValue(padreSeleccionado.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${padreSeleccionado.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000, // Tiempo en milisegundos (2000 ms = 2 segundos)
            showConfirmButton: false // Oculta el botón de confirmación
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar aretes de padres: '+error, 'error');
      }
    );
  }

  //**** Método que permite buscar madres donadoras ****/
  buscarMadresDonadoras() {
    // Limpiar la lista antes de realizar la búsqueda
    this.listaMadresDonadoras = [];
    this.formulario.controls.inputIdBovinoMadreDonadora.setValue(null);
    // Validar campo obligatorio
    const numeroArete = this.formulario.value.inputBuscarMadreDonadora.toUpperCase().trim();
    if (!numeroArete) {
      this.mostrarAdvertenciaArete();
      return;
    }
    // Determinar el valor de idCategoria
    const nombreCategoria = this.formulario.value.inputIdTaxonomia == '13' ? 'búfalos machos' : 'bovino hembra';
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        this.listaMadresDonadoras = resultado;
        Swal.close();
        // Verificar si hay resultados
        if (this.listaMadresDonadoras.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          // Si hay un resultado, asignarlo directamente al formulario
          const madreDonadoraSeleccionada = this.listaMadresDonadoras[0];
          this.formulario.controls.inputIdBovinoMadreDonadora.setValue(madreDonadoraSeleccionada.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${madreDonadoraSeleccionada.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000, // Tiempo en milisegundos (2000 ms = 2 segundos)
            showConfirmButton: false // Oculta el botón de confirmación
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar ID de madres donadoras: '+error, 'error');
      }
    );
  }

  //**** Método que permite buscar madres ****/
  buscarMadres() {
    // Limpiar la lista antes de realizar la búsqueda
    this.listaMadres = [];
    this.formulario.controls.inputIdBovinoMadre.setValue(null);
    // Validar campo obligatorio
    const sitio = this.formulario.value.inputIdSitio;
    if (!sitio) {
      Swal.fire('¡Advertencia!', 'Por favor, seleccione un sitio antes de realizar la búsqueda.', 'warning');
      return;
    }
    const numeroArete = this.formulario.value.inputBuscarMadre.toUpperCase().trim();
    if (!numeroArete) {
      this.mostrarAdvertenciaArete();
      return;
    }
    // Determinar el valor de idCategoria
    const nombreCategoria = this.formulario.value.inputIdTaxonomia == '13' ? 'búfalos machos' : 'bovino hembra';
    // Mostrar mensaje de carga
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    // Realizar la consulta para buscar madres
    this.bovinoService.filtrarAnimales({
      idSitioActual: this.formulario.value.inputIdSitio,
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true',
      fechaUltimoParto: '0' // Se envía cualquier valor, lo importante es que se envíe la clave al backend.
    }).subscribe(
      (resultado: Bovino[]) => {
        // Asignar los resultados a la lista de madres
        this.listaMadres = resultado;
        Swal.close();
        // Verificar si hay resultados
        if (this.listaMadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          // Si hay un resultado, asignarlo directamente al formulario
          const madreSeleccionada = this.listaMadres[0];
          this.formulario.controls.inputIdBovinoMadre.setValue(madreSeleccionada.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${madreSeleccionada.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000, // Tiempo en milisegundos (2000 ms = 2 segundos)
            showConfirmButton: false // Oculta el botón de confirmación
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar madres con arete oficial: '+error, 'error');
      }
    );
  }

  //**** Generar título para hover del botón Revisar ****/
  generarTitulo(bovino: any): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const codigoIdentificacion = bovino?.codigoIdentificacion || bovino?.idBovino;
    return `Revisar datos de ${nombreCategoria} ${codigoIdentificacion}`;
  }

  //**** Visualizar el formulario para llenado de datos ****/
  accionNuevoBoton() {
    this.formularioVisible = true;
  }

  //**** Método obtener estadísticas de nacimientos que se puede solicitar ****/
  cargarEstadisticasNacimientos(idSitio: number) {
    this.bovinoService.consultarEstadisticasNacimientos(idSitio)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          this.validacionNacimiento = resp.resultado;
          this.panelEstadistica = true;
        }
        else {
          this.formulario.controls.inputSitio.setValue(null);
          this.panelEstadistica = false;
          Swal.fire('Error', resp.mensaje, 'error');
        }
      });
  }

  //**** Limpiar campos generales ****/
  limpiarCamposGeneralesFormulario() {
    this.formulario.controls.inputIdSitio.setValue(null);
    this.formulario.controls.inputIdTipoRegistro.setValue(2);
    this.formulario.controls.inputFechaNacimiento.setValue('');
    this.formulario.controls.inputIdTaxonomia.setValue(null);
    this.formulario.controls.inputIdSexo.setValue(null);
  }

  //**** Limpiar campos de las secciones relacionadas al nacimiento definitivo ****/
  limpiarFrameDetinitivo() {
    this.cambioTipoServicio();
    this.formulario.controls.inputTipoServicio.setValue(null);
    this.tipoServicioSeleccionado = null;
    this.formulario.controls.inputRaza.setValue(null);
    this.formulario.controls.inputPureza.setValue(null);
    this.formulario.controls.inputProcedencia.setValue(1);
    this.cambioProcedencia();
    this.formulario.controls.inputNumeroRegistroNacimiento.setValue('');
    this.formulario.controls.inputArete.setValue(null);
    this.formulario.controls.inputBuscarArete.setValue('');
  }

  /**** Limpiar variables y opciones de raza y pureza ****/
  cambioTaxonomia() {

    if (this.formulario.value.inputIdTipoRegistro == 2) {

      this.frameRegDefinitivo = false;
    }
    if (this.formulario.value.inputIdTipoRegistro == 1) {
      this.limpiarFrameDetinitivo();
      this.frameRegDefinitivo = true;
      this.buscarAretesOficiales();
    }

    const idTaxonomia = this.formulario.value.inputIdTaxonomia;

    if (idTaxonomia === '11') { // Bovinos
      this.razaPureza = true;
    } else if (idTaxonomia === '13') { // Búfalos
      this.razaPureza = false;
    } else {
      this.razaPureza = null; // Ocultar ambos campos si no es 11 ni 13
    }
  }

  /**** Limpiar variables y opciones según tipo de registro ****/
  cambioTipoRegistro() {
    this.formulario.controls.inputFechaNacimiento.setValue('');
    this.formulario.controls.inputIdTaxonomia.setValue(null);
    this.formulario.controls.inputIdSexo.setValue(null);
    this.limpiarFrameDetinitivo();
    this.frameRegDefinitivo = false;
  }

  /**** Método para registrar un nuevo nacimiento ****/
  registrarBovino() {
    const formulario = this.formulario.value;
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    // Función para validar campos obligatorios
    const validarCampo = (campo, mensajeError) => {
      if (!campo) {
        formularioInvalido = true;
        mensaje += `<li>${mensajeError}</li>`;
      }
    };

    // Función para validar fechas
    const validarFecha = (fecha, fechaComparacion, mensajeError) => {
      if (fecha > fechaComparacion) {
        formularioInvalido = true;
        mensaje += `<li>${mensajeError}</li>`;
        this.formulario.controls.inputFechaNacimiento.setValue(null);
      }
    };

    // Validar campos obligatorios
    validarCampo(formulario.inputIdSitio, "Seleccione un sitio de nacimiento.");
    validarCampo(formulario.inputFechaNacimiento, "Seleccione una fecha de nacimiento.");
    validarCampo(formulario.inputIdTaxonomia, "Seleccione una especie.");
    validarCampo(formulario.inputIdSexo, "Seleccione sexo del animal.");

    // Validar fechas
    const fechaNacimiento = new Date(formulario.inputFechaNacimiento);
    fechaNacimiento.setHours(fechaNacimiento.getHours() + 5); // Ajuste de zona horaria
    const fechaActual = new Date();
    const fechaMinimaPermitida = new Date(fechaActual);
    fechaMinimaPermitida.setMonth(fechaActual.getMonth() - 3); // 3 meses antes de la fecha actual

    validarFecha(fechaNacimiento, fechaActual, "La fecha de nacimiento ingresada no puede superar la fecha actual.");
    if (fechaNacimiento < fechaMinimaPermitida) {
      formularioInvalido = true;
      const fechaFormateada = this.formatearFecha(fechaMinimaPermitida);
      mensaje += `<li>La fecha de nacimiento no puede ser anterior al ${fechaFormateada} </li>`;
      this.formulario.controls.inputFechaNacimiento.setValue(null);
    }

    // Validaciones adicionales para registro definitivo
    if (formulario.inputIdTipoRegistro == 1) {
      validarCampo(formulario.inputTipoServicio, "Seleccione un tipo de servicio.");

      if (formulario.inputIdTaxonomia == '11') {
        validarCampo(formulario.inputRaza, "Seleccione raza predominante.");
        validarCampo(formulario.inputPureza, "Seleccione pureza.");
      }

      if (formulario.inputProcedencia == 2) {
        validarCampo(formulario.inputPaisProcedencia, "Seleccione un país de procedencia.");
      }

      validarCampo(formulario.inputArete, "Seleccione un arete oficial.");
    }

    // Validar cantidad posible a registrar
    if (formulario.inputIdTaxonomia == 11) {
      if (this.validacionNacimiento.cantidadPosibleBovinos < 1) {
        formularioInvalido = true;
        mensaje += "<li>No dispone de cupo para registro de nacimientos de Bovinos.</li>";
      }
    }

    if (formulario.inputIdTaxonomia == 13) {
      if (this.validacionNacimiento.cantidadPosibleBufalos < 1) {
        formularioInvalido = true;
        mensaje += "<li>No dispone de cupo para registro de nacimientos de Búfalos.</li>";
      }
    }

    // Mostrar advertencia si el formulario es inválido
    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire({
        title: '¡Advertencia!',
        html: `<div style="text-align: left;">${mensaje}</div>`,
        icon: 'warning'
      });
      return;
    }

    // Crear objeto Bovino
    const bovinoNuevo = new Bovino();
    const sitio = this.listaAreas.find((item: Area) => item.idSitio === Number(formulario.inputIdSitio));
    this.sitioSeleccionado = sitio;

    // Asignar valores generales
    bovinoNuevo.idTipoRegistro = formulario.inputIdTipoRegistro;
    bovinoNuevo.idSitioNacimiento = this.sitioSeleccionado.idSitio;
    bovinoNuevo.idAreaNacimiento = this.sitioSeleccionado.idArea;
    bovinoNuevo.fechaNacimiento = formulario.inputFechaNacimiento;
    bovinoNuevo.idTaxonomia = formulario.inputIdTaxonomia;
    bovinoNuevo.idSexo = formulario.inputIdSexo;
    bovinoNuevo.idPaisNacimiento = 19;
    bovinoNuevo.pesoNacimientoKg = 0;
    bovinoNuevo.idUsuarioActual = this.usuarioServicio.usuarioExterno.idUsuario;
    bovinoNuevo.idCategoria = this.determinarCategoria();
    bovinoNuevo.caracteristicas = '';
    // Asignar valores para registro provisional
    if (formulario.inputIdTipoRegistro == 2) {
      bovinoNuevo.idTipoServicio = 3; // Monta
      bovinoNuevo.idPaisProcedencia = 19; // Ecuador
      bovinoNuevo.idRaza = 1; // Otros
      bovinoNuevo.idPureza = 2; // Mestizo
    }

    // Asignar valores para registro definitivo
    if (formulario.inputIdTipoRegistro == 1) {
      bovinoNuevo.idTipoServicio = formulario.inputTipoServicio;

      if (formulario.inputIdBovinoMadre) bovinoNuevo.idBovinoMadre = formulario.inputIdBovinoMadre;
      if (formulario.inputIdBovinoMadreDonadora) bovinoNuevo.idBovinoMadreDonadora = formulario.inputIdBovinoMadreDonadora;
      if (formulario.inputIdBovinoPadre) bovinoNuevo.idBovinoPadre = formulario.inputIdBovinoPadre;
      if (formulario.inputCodigoPajuelaPadre) bovinoNuevo.codigoPajuelaPadre = formulario.inputCodigoPajuelaPadre.toUpperCase().trim();

      if (formulario.inputIdTaxonomia == '13') {
        bovinoNuevo.idRaza = 1; // Otros
        bovinoNuevo.idPureza = 2; // Mestizo
      }
      if (formulario.inputIdTaxonomia == '11') {
        bovinoNuevo.idRaza = formulario.inputRaza;
        bovinoNuevo.idPureza = formulario.inputPureza;
      }

      bovinoNuevo.idPaisProcedencia = formulario.inputProcedencia == '2' ? formulario.inputPaisProcedencia : 19;
      if (formulario.inputNumeroRegistroNacimiento) bovinoNuevo.registroNacimientoDefinitivo = formulario.inputNumeroRegistroNacimiento.toUpperCase().trim();


      if (formulario.inputArete) {
        bovinoNuevo.idIdentificador = formulario.inputArete;
        const arete = this.listaAretesAprobados.find((item: AreteBovino) => item.idAretesBovinos === Number(formulario.inputArete));
        this.areteSeleccionado = arete;
        if (arete) bovinoNuevo.codigoIdentificacion = this.areteSeleccionado.codigoOficial;
      }
    }

    const especie = formulario.inputIdTaxonomia == 13 ? 'Búfalo' : 'Bovino';
    const sexo = formulario.inputIdSexo == 1 ? 'Hembra' : 'Macho';

    let mensajeFire = '';
    let mensajeExito = '';
    let tipoRegistro = ';'

    if (formulario.inputIdTipoRegistro == 1) {
      tipoRegistro = 'definitivo';
      mensajeFire = `<br><b>[ ${this.areteSeleccionado.codigoOficial} ]</b> &rarr; 
            <b>[ ${especie} - ${sexo} ]</b>
            <br><br>
            Por favor, revise cuidadosamente la información ingresada. 
            Al continuar, este proceso no podrá revertirse.`;
      mensajeExito = `<br><b>[ ${this.areteSeleccionado.codigoOficial} ]</b> &rarr; 
            <b>[ ${especie} - ${sexo} ]</b>
            <br><br>`;
    } else {
      tipoRegistro = 'provisional';
      mensajeFire = `<br><b>[ ${especie} &rarr; ${sexo} ]</b><br><br>`;
      mensajeExito = mensajeFire;
    }
    // Confirmación del usuario
    Swal.fire({
      title: `¿Registrar nacimiento ${tipoRegistro}?`,
      html: mensajeFire,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Registrando nacimiento...');
        this.bovinoService.registrarBovinoDescarte(bovinoNuevo).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', `¡Nacimiento ${tipoRegistro} registrado con éxito!
                <br>${mensajeExito}`, 'success')
                .then(() => {
                  this.formularioBusqueda.controls.inputSitio.setValue(this.formulario.value.inputIdSitio);
                  this.formularioBusqueda.controls.inputCategoria.setValue('-1');
                  this.formularioBusqueda.controls.inputIdOficial.setValue('');
                  this.botonCancelar(); // Llamar a botonCancelar después de cerrar el mensaje de éxito
                  this.buscarAnimales(false, true);
                });
            } else {
              Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo registrar el nacimiento del animal.', 'error');
          },
        });
      }
    });
  }

  /**** Método que devuelve la categoría del animal en base al sexo seleccionado ****/
  determinarCategoria() {

    let idCategoria = 1;

    if ((this.formulario.value.inputIdSexo == 1) && (this.formulario.value.inputIdTaxonomia != 13)) { // 1 = Hembra
      idCategoria = 1;
    }
    if ((this.formulario.value.inputIdSexo == 2) && (this.formulario.value.inputIdTaxonomia != 13)) { // 2 = Macho
      idCategoria = 4;
    }
    if (this.formulario.value.inputIdTaxonomia == 13) {
      idCategoria = null;
    }

    return idCategoria;
  }

  // mensaje común advertencia en la búsqueda de un arete
  mostrarAdvertenciaArete() {
    Swal.fire({
      title: '¡Advertencia!',
      text: 'Por favor, ingrese un número de arete oficial. Ejemplo: EC006132716',
      icon: 'warning'
    });
  }

  // Función auxiliar para formatear fecha como dd/mm/aaaa
  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

}
