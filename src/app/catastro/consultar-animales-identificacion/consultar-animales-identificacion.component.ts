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
import { TipoServicio } from 'src/app/modelos/tipo-servicio.modelo';
import { HistoriaBovino } from '../../modelos/historia-bovino.modelo';
import { BovinosOtrasVacunaciones } from 'src/app/modelos/bovinos-otras-vacunaciones.modelo';
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { HistoriaBovinoService } from '../../servicios/historia-bovino/historia-bovino.service';
import { TiposCatastroService } from 'src/app/servicios/tipos-catastro/tipos-catastro.service';
import { VacunaOficialService } from 'src/app/servicios/vacuna-oficial/vacuna-oficial.service';
import { RazaService } from '../../servicios/raza/raza.service';
import { PurezaService } from 'src/app/servicios/pureza/pureza.service';
import { TipoServicioService } from '../../servicios/tipo_servicio/tipo-servicio.service';
import { PaisService } from 'src/app/servicios/pais/pais.service';
import { ProcedenciaService } from 'src/app/servicios/procedencia/procedencia.service';
import { BovinosOtrasVacunacionesService } from 'src/app/servicios/bovinos-otras-vacunaciones/bovinos-otras-vacunaciones.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-consultar-animales-identificacion',
  templateUrl: './consultar-animales-identificacion.component.html'
})
export class ConsultarAnimalesIdentificacionComponent implements OnInit {

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
  listaPaises = [];
  listaTiposCatastro = [];
  listaProcedencia = [];
  listaVacunasOficiales = [];
  listaBovinos: Bovino[] = [];
  listaMadres: Bovino[] = [];
  listaMadresDonadoras: Bovino[] = [];
  listaPadres: Bovino[] = [];
  categorias: Categoria[] = [];
  razas: Raza[] = [];
  purezas: Pureza[] = [];
  tiposServicios: TipoServicio[] = [];
  listaBovinosOtrasVacunaciones: BovinosOtrasVacunaciones[] = [];
  //**** Variables auxiliares ****/
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  procedenciaVisible: boolean = false; // true = Visible // false = Oculto
  isVisibleBotonDetalles: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  isVisible: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  panelHistorico: boolean;
  listaHistoriasBovino: HistoriaBovino[];
  consultando: boolean;
  codigoOficial: string;
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
    private paisesService: PaisService,
    private tiposCatastroService: TiposCatastroService,
    private procedenciaService: ProcedenciaService,
    private historiaBovinoServicio: HistoriaBovinoService,
    private vacunaOficialService: VacunaOficialService,
    private bovinosOtrasVacunacionesService: BovinosOtrasVacunacionesService,
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
      inputTipoCatastro: new FormControl('-1'),
      inputCategoria: new FormControl(null),
      inputIdOficial: new FormControl('')
    });

    this.formularioDatosSitio = new FormGroup({
    });

    this.formulario = new FormGroup({
      // ------------------Pedigrí e identificación------------------
      inputFechaNacimiento: new FormControl(null, Validators.required),
      checkFechaSugerida: new FormControl(false),
      inputRaza: new FormControl(null),
      inputPureza: new FormControl(null),
      inputNumeroRegistroNacimiento: new FormControl(''),
      inputProcedencia: new FormControl('1'),
      inputPaisProcedencia: new FormControl(null),
      // ------------------Registro Reproductivo------------------
      inputCodigoPajuelaPadre: new FormControl(''),
      inputTipoServicio: new FormControl(null, Validators.required),
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

  //**** Calcular tamaño de letra ****/
  calcularFontSize(value: number): string {
    const length = value.toString().length;
    if (length <= 2) {
      return '1rem';
    } else if (length === 3) {
      return '0.9rem';
    } else if (length === 4) {
      return '0.8rem';
    } else {
      return '0.6rem';
    }
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
    this.buscarAnimales(false, true);
    this.formularioVisible = false;
    this.limpiarformulario();
  }

  //**** limpiar formulario ****/
  limpiarformulario() {
    this.listaMadres = [];
    this.listaMadresDonadoras = [];
    this.listaPadres = [];
    this.formulario.controls.inputBuscarMadre.setValue('');
    this.formulario.controls.inputBuscarMadreDonadora.setValue('');
    this.formulario.controls.inputBuscarPadre.setValue('');
    this.formulario.controls.inputBuscarArete.setValue('');
    this.formulario.controls.checkFechaSugerida.setValue(false);
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

  //**** Obtener catálogo de países ****//
  cargarPaises() {
    this.paisesService.obtenerPaisesParametros({estadoImport: 1})
      .subscribe(
        respuesta => {
          this.listaPaises = respuesta;
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
        // Agregar "Todas" al inicio y "Búfalos" al final
        this.categorias = [
          { id_categoria: -1, nombre: 'Todas' }, // Opción quemada "Todas" al inicio
          ...respuesta, // Categorías dinámicas obtenidas del servicio
          { id_categoria: 7, nombre: 'Búfalo Hembra' }, // Opción quemada "Búfalo Hembra" al final
          { id_categoria: 8, nombre: 'Búfalo Macho' } // Opción quemada "Búfalo Macho" al final
        ];
      });
  }

  //**** Cargar catálogos generales ****//
  cargarCatalogos() {
    this.obtenerRazas();
    this.obtenerTiposServicios();
    this.obtenerPurezas();
    this.cargarPaises();
    this.cargarTiposCatastro();
    this.cargarProcedencia();
    this.cargarVacunasOficiales();
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
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
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
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
  }

  //**** Método que permite resetear la búsqueda residual al cambio el valor ****/
  cambioCategoria() {
    this.buscarAnimales(true, true);
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
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
    const parametros: Area = {
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      codigoEstadoSitio: 'AC', //solo sitios en estado ACTIVO
      estado: 1,
      codigoTipoArea: 'ex_pec_bov'
    };

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((areas: Area[]) => {
        this.listaAreas = areas;
        Swal.close();
      });
  }

  //**** Método que permite buscar animales en el catastro según sus parámetros. ****/
  buscarAnimales(mensaje: boolean = false, inicioDefault: boolean = false) {
    this.resetScroll();
    //Eliminar datos residuales
    if (inicioDefault) { this.inicio = 0; }
    this.fin = this.rango;
    this.listaBovinos = [];

    if (!this.formularioBusqueda.value.inputCategoria) {
      this.formularioBusqueda.controls.inputCategoria.setValue('-1');
    }

    if (this.formularioBusqueda.value.inputSitio) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.usuarioServicio.usuarioExterno.idUsuario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idSitioActual = this.formularioBusqueda.value.inputSitio;

      if (this.formularioBusqueda.value.inputTipoCatastro !== "-1" && this.formularioBusqueda.value.inputTipoCatastro !== '') {
        parametros.idBovinoCertificado = this.formularioBusqueda.value.inputTipoCatastro;
      }
      if (this.formularioBusqueda.value.inputCategoria !== "-1" && this.formularioBusqueda.value.inputCategoria !== '') {
        parametros.idCategoria = this.formularioBusqueda.value.inputCategoria;
      }

      if (this.formularioBusqueda.value.inputIdOficial) {
        parametros.codigoIdentificacion = `%${this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim()}`;
      } else {
        parametros.codigoIdentificacion = 'si';
      }

      parametros.inicio = this.inicio;
      parametros.limite = this.fin;

      this.mostrarCargando('Buscando animales en el sitio...');

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
            Swal.fire('¡Error!', 'Hubo un problema al buscar los animales de este sitio.', 'error');
          }
        );
    } else {
      this.formularioBusqueda.controls.inputCategoria.setValue(null);
      Swal.fire('¡Atención!', 'Seleccione un sitio para realizar la búsqueda.', 'info');
    }
  }

  //**** Método para asignar los datos del animal al formulario. ****/
  asignarDatosFormularioAnimal(id: number) {

    this.animalSeleccionado = null;
    this.procedenciaVisible = false;
    this.formulario.controls.inputProcedencia.setValue(1);
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
      //Asignar datos al formulario (registro reproductivo)
      this.formulario.controls.inputTipoServicio.setValue(this.animalSeleccionado.idTipoServicio);
      this.tipoServicioSeleccionado = this.animalSeleccionado.idTipoServicio;
      // Cargar datos de padre y madres
      this.cargarDatosParentales('Madre', 'idBovinoMadre', 'inputIdBovinoMadre', 'listaMadres');
      this.cargarDatosParentales('Madre Donadora', 'idBovinoMadreDonadora', 'inputIdBovinoMadreDonadora', 'listaMadresDonadoras');
      this.cargarDatosParentales('Padre', 'idBovinoPadre', 'inputIdBovinoPadre', 'listaPadres');
      this.formulario.controls.inputCodigoPajuelaPadre.setValue(this.animalSeleccionado.codigoPajuelaPadre);
      //Asignar datos al formulario (pedigrí e identificación)
      if (this.animalSeleccionado.fechaNacimiento) {
        this.formulario.controls.inputFechaNacimiento.setValue(new Date(this.animalSeleccionado.fechaNacimiento).toISOString().substring(0, 10));
      } else {
        this.formulario.controls.inputFechaNacimiento.setValue(null);
      }
      this.formulario.controls.inputRaza.setValue(this.animalSeleccionado.idRaza);
      this.formulario.controls.inputPureza.setValue(this.animalSeleccionado.idPureza);
      this.formulario.controls.inputNumeroRegistroNacimiento.setValue(this.animalSeleccionado.registroNacimientoDefinitivo);

      if (this.animalSeleccionado.idPaisProcedencia !== 19) {
        this.formulario.controls.inputProcedencia.setValue(2);
        this.procedenciaVisible = true;
        this.formulario.controls.inputPaisProcedencia.setValue(this.animalSeleccionado.idPaisProcedencia);
      }

      //Cargar información de vacunaciones del animal
      this.cargarOtrasVacunaciones(id);
      Swal.close();

    } else {
      // Mostrar error si el animal no fue encontrado
      this.formularioVisible = false;
      Swal.fire('Error', 'Animal no encontrado', 'error');
    }
  }

  // Método para cargar datos parentales
  private cargarDatosParentales(tipo: string, campoSeleccionado: string, campoFormulario: string, lista: string): void {
    const idParental = this.animalSeleccionado[campoSeleccionado];

    if (idParental) {
      this.bovinoService.filtrarAnimales({ idBovino: idParental })
        .subscribe({
          next: (respuesta) => {
            this[lista] = respuesta;
            this.formulario.controls[campoFormulario].setValue(idParental);
          },
          error: () => {
            Swal.fire('Error', `Error al cargar ${tipo.toLowerCase()}`, 'error');
          }
        });
    } else {
      this.formulario.controls[campoFormulario].setValue(null);
    }
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
    // Determinar el valor de idCategoria basado en this.animalSeleccionado.idTaxonomia
    const nombreCategoria = this.animalSeleccionado.idTaxonomia === 13 ? 'búfalo macho' : 'bovino macho';
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      padres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        this.listaPadres = resultado;
        Swal.close();
        if (this.listaPadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          const padreSeleccionado = this.listaPadres[0];
          this.formulario.controls.inputIdBovinoPadre.setValue(padreSeleccionado.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${padreSeleccionado.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar identificadores de padres: ' + error, 'error');
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
    // Determinar el valor de idCategoria basado en this.animalSeleccionado.idTaxonomia
    const nombreCategoria = this.animalSeleccionado.idTaxonomia === 13 ? 'búfalo hembra' : 'bovino hembra';
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        this.listaMadresDonadoras = resultado;
        Swal.close();
        if (this.listaMadresDonadoras.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          const madreDonadoraSeleccionada = this.listaMadresDonadoras[0];
          this.formulario.controls.inputIdBovinoMadreDonadora.setValue(madreDonadoraSeleccionada.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${madreDonadoraSeleccionada.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar ID de madres donadoras: ' + error, 'error');
      }
    );
  }

  //**** Método que permite buscar madres ****/
  buscarMadres() {
    // Limpiar la lista antes de realizar la búsqueda
    this.listaMadres = [];
    this.formulario.controls.inputIdBovinoMadre.setValue(null);
    // Validar campo obligatorio
    const numeroArete = this.formulario.value.inputBuscarMadre.toUpperCase().trim();
    if (!numeroArete) {
      this.mostrarAdvertenciaArete();
      return;
    }
    // Determinar el valor de idCategoria basado en this.animalSeleccionado.idTaxonomia
    const nombreCategoria = this.animalSeleccionado.idTaxonomia === 13 ? 'búfalo hembra' : 'bovino hembra';
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true',
      fechaUltimoParto: '0' // Se envía cualquier valor, lo importante es que se envíe la clave al backend.
    }).subscribe(
      (resultado: Bovino[]) => {
        this.listaMadres = resultado;
        Swal.close();
        if (this.listaMadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          const madreSeleccionada = this.listaMadres[0];
          this.formulario.controls.inputIdBovinoMadre.setValue(madreSeleccionada.idBovino);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Arete encontrado: ${madreSeleccionada.codigoIdentificacion}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar madres con arete oficial: ' + error, 'error');
      }
    );
  }

  //**** Método para actualizar datos del animal seleccionado ****/
  actualizarAnimal() {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (!this.formulario.value.inputTipoServicio) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un tipo de servicio.</li>";
    }

    if (!this.formulario.value.inputFechaNacimiento) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione una fecha de nacimiento.</li>";
    }

    // Validar que la fecha sea correcta para la categoría seleccionada
    const idCategoria = this.animalSeleccionado?.idCategoria;
    const fechaNacimientoString = this.formulario.value.inputFechaNacimiento;

    const fechaNacimientoDate = new Date(fechaNacimientoString);
    fechaNacimientoDate.setHours(fechaNacimientoDate.getHours() + 5); // Sumar 5 horas para igualar UTC y GMT de Ecuador
    const fechaActual = new Date();

    const fechaNacimientoSolo = new Date(fechaNacimientoDate.getFullYear(), fechaNacimientoDate.getMonth(), fechaNacimientoDate.getDate());
    const fechaActualSolo = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());

    // Validar que la fecha de nacimiento no sea mayor que la fecha actual
    if (fechaNacimientoSolo > fechaActualSolo) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de nacimiento ingresada no puede superar la fecha actual.</li>`;
      this.restablecerFechaNacimiento();
    }

    // Validación por categoría
    if (idCategoria) {
      const validacion = this.validarFechaNacimientoPorCategoria(idCategoria, fechaNacimientoString);
      if (!validacion.valido) {
        formularioInvalido = true;
        mensaje += `<li>${validacion.mensaje}</li>`;
      }
    } else {
      // Si no hay categoría, validar fecha mínima de 1 año
      const fechaMinimaPermitida = new Date(fechaActual);
      fechaMinimaPermitida.setFullYear(fechaActual.getFullYear() - 1);
      const fechaMinimaSolo = new Date(fechaMinimaPermitida.getFullYear(), fechaMinimaPermitida.getMonth(), fechaMinimaPermitida.getDate());
      
      if (fechaNacimientoSolo < fechaMinimaSolo) {
        formularioInvalido = true;
        mensaje += `<li>La fecha de nacimiento no puede ser anterior al [ ${this.formatearFecha(fechaMinimaPermitida)} ]</li>`;
        this.formulario.controls.inputFechaNacimiento.setValue(null);
      }
    }

    if (!this.formulario.value.inputRaza) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione raza predominante.</li>";
    }
    if (!this.formulario.value.inputPureza) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione pureza.</li>";
    }
    if (this.formulario.value.inputProcedencia == 2) {
      if (!this.formulario.value.inputPaisProcedencia) {
        formularioInvalido = true;
        mensaje += "<li>Seleccione un país de procedencia.</li>";
      }
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

    const animal = new Bovino();
    animal.idBovino = this.animalSeleccionado.idBovino;
    animal.accion = 'actualizarDatos';
    animal.fechaNacimiento = fechaNacimientoDate.toISOString().substring(0, 10);
    animal.codigoPajuelaPadre = this.formulario.value.inputCodigoPajuelaPadre?.toUpperCase().trim() || '';
    animal.codigoIdentificacion = this.animalSeleccionado.codigoIdentificacion;
    animal.idPureza = this.formulario.value.inputPureza;
    animal.idRaza = this.formulario.value.inputRaza;
    animal.registroNacimientoDefinitivo = this.formulario.value.inputNumeroRegistroNacimiento?.toUpperCase().trim() || '';
    animal.idTipoServicio = this.formulario.value.inputTipoServicio;
    if (this.formulario.value.inputIdBovinoMadre) {
      animal.idBovinoMadre = this.formulario.value.inputIdBovinoMadre;
    }
    if (this.formulario.value.inputIdBovinoMadreDonadora) {
      animal.idBovinoMadreDonadora = this.formulario.value.inputIdBovinoMadreDonadora;
    }
    if (this.formulario.value.inputIdBovinoPadre) {
      animal.idBovinoPadre = this.formulario.value.inputIdBovinoPadre;
    }
    if (this.formulario.value.inputProcedencia == 2) {
      animal.idPaisProcedencia = this.formulario.value.inputPaisProcedencia;
    }
    const categoria = this.animalSeleccionado.idTaxonomia == 13
      ? `${this.animalSeleccionado.nombreComunTaxonomia || ''} ${this.animalSeleccionado.nombreSexo || ''}`.trim()
      : this.animalSeleccionado.nombreCategoria;
    Swal.fire({
      title: '¿Está seguro de modificar datos de este animal?',
      html: `<br><b>[ ${this.animalSeleccionado.codigoIdentificacion} ]</b> &rarr; 
          <b>[ ${this.animalSeleccionado.idBovino} - ${categoria} ]</b>
          <br><br>
          Por favor, revise cuidadosamente la información ingresada antes de continuar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Actualizando datos del animal...');
        this.bovinoService.actualizarDatosAnimal(animal).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', `¡Datos actualizados con éxito!
              <br><br>
              <b>[ ${this.animalSeleccionado.codigoIdentificacion} ]</b> &rarr; 
              <b>[ ${this.animalSeleccionado.idBovino} - ${categoria} ]</b>`, 'success')
                .then(() => {
                  this.botonCancelar(); // Llamar a botonCancelar después de cerrar el mensaje de éxito
                });
            } else {
              Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar datos del animal.', 'error');
          },
        });
      }
    });
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

  // mensaje común advertencia en la búsqueda de un arete
  mostrarAdvertenciaArete() {
    Swal.fire({
      title: '¡Advertencia!',
      text: 'Por favor, ingrese un número de arete oficial. Ejemplo: EC006132716',
      icon: 'warning'
    });
  }

  //**** Generar título para hover de botones ****/
  generarTitulo(bovino: any, tipo: 'actualizar' | 'trazabilidad' = 'actualizar'): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const idBovino = tipo === 'trazabilidad'
      ? bovino?.codigoIdentificacion || bovino?.idBovino
      : bovino?.idBovino || 'N/A';
    const prefijo = tipo === 'trazabilidad' ? 'Trazabilidad de' : 'Actualizar datos de';
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
    setTimeout(() => {
      const panel = this.panelScrollContainer?.nativeElement;
      if (panel) panel.scrollTop = 0;
    }, 50);
  }

  //**** Método para cargar otras vacunaciones ****/
  cargarOtrasVacunaciones(idBovinoParametro: number) {
    this.listaBovinosOtrasVacunaciones = [];
    const parametros: any = {};
    parametros.idBovino = idBovinoParametro;
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

  //**** Cambiar a fecha de nacimiento sugerida según la categoría del animal ****/
  cambiarFechaNacimientoSugerida(): void {
    this.formulario.controls.inputFechaNacimiento.setValue(null);
    const checkboxMarcado = this.formulario.get('checkFechaSugerida')?.value;
    if (checkboxMarcado) {
      if (this.animalSeleccionado.idCategoria !== null) {
        const fechaCalculada = this.calcularFechaNacimientoPorCategoria(this.animalSeleccionado.idCategoria);
        this.formulario.controls.inputFechaNacimiento.setValue(fechaCalculada);
      }
    } else{
      this.formulario.controls.inputFechaNacimiento.setValue(new Date(this.animalSeleccionado.fechaNacimiento).toISOString().substring(0, 10));
    }
  }

  // Función para calcular fecha de nacimiento basada en categoría
  calcularFechaNacimientoPorCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(cat => cat.id_categoria === idCategoria);
    
    if (!categoria || categoria.id_categoria === -1) {
      return null;
    }

    const dias = parseInt(categoria.inicio_dias.toString());
    
    // Si es ternera o ternero (id_categoria 1 o 4), restar 60 días
    if (idCategoria === 1 || idCategoria === 4) {
      return this.calcularFechaPorRangoDias(60);
    }
    
    return this.calcularFechaPorRangoDias(dias);
  }

  // Función auxiliar para calcular fecha restando días desde hoy
  private calcularFechaPorRangoDias(dias: number): string {
    const fechaActual = new Date();
    const fechaNacimiento = new Date();
    fechaNacimiento.setDate(fechaActual.getDate() - dias);
    return fechaNacimiento.toISOString().substring(0, 10);
  }

  // Función para validar fecha de nacimiento según categoría
  validarFechaNacimientoPorCategoria(idCategoria: number, fechaNacimiento: string): { valido: boolean; mensaje?: string } {
    const categoria = this.categorias.find(cat => cat.id_categoria === idCategoria);
    
    if (!categoria || categoria.id_categoria === -1) {
      return { valido: true }; // No validar si no hay categoría
    }

    const fechaNac = new Date(fechaNacimiento);
    const fechaActual = new Date();
    const diferenciaDias = Math.floor((fechaActual.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24));
    
    const inicioDias = parseInt(categoria.inicio_dias.toString());

    // Grupo 1: Ternera y Ternero (id 1 y 4) - máximo 90 días
    if (idCategoria === 1 || idCategoria === 4) {
      if (diferenciaDias > 90) {
        const fechaMaxima = new Date();
        fechaMaxima.setDate(fechaActual.getDate() - 90);
        return {
          valido: false,
          mensaje: `${categoria.nombre}: la fecha de nacimiento puede ser máximo 90 días atrás [ ${this.formatearFecha(fechaMaxima)} ]`
        };
      }
    }
    // Grupo 2: Vacona y Torete (id 2 y 5) - rango de 90 días
    else if (idCategoria === 2 || idCategoria === 5) {
      const fechaMaxima = new Date();
      fechaMaxima.setDate(fechaActual.getDate() - inicioDias);
      
      const fechaMinima = new Date(fechaMaxima);
      fechaMinima.setDate(fechaMaxima.getDate() - 90);

      if (diferenciaDias > (inicioDias + 90) || diferenciaDias < inicioDias) {
        return {
          valido: false,
          mensaje: `${categoria.nombre}: la fecha de nacimiento puede encontrarse entre ${this.formatearFecha(fechaMinima)} y ${this.formatearFecha(fechaMaxima)}`
        };
      }
    }
    // Grupo 3: Vaca y Toro (id 3 y 6) - sin límite superior
    else if (idCategoria === 3 || idCategoria === 6) {
      if (diferenciaDias < inicioDias) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaActual.getDate() - inicioDias);
        return {
          valido: false,
          mensaje: `${categoria.nombre}: la fecha de nacimiento puede ser menor o igual a ${this.formatearFecha(fechaLimite)}`
        };
      }
    }

    return { valido: true };
  }

  // Función auxiliar para formatear fecha como dd/mm/aaaa
  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Método auxiliar para restablecer fecha de nacimiento
  private restablecerFechaNacimiento(): void {
    if (this.animalSeleccionado?.fechaNacimiento) {
      this.formulario.controls.inputFechaNacimiento.setValue(
        new Date(this.animalSeleccionado.fechaNacimiento).toISOString().substring(0, 10)
      );
    } else {
      this.formulario.controls.inputFechaNacimiento.setValue(null);
    }
  }

}