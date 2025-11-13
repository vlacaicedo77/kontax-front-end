import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { RazaService } from '../../servicios/raza/raza.service';
import { PurezaService } from 'src/app/servicios/pureza/pureza.service';
import { TipoServicioService } from '../../servicios/tipo_servicio/tipo-servicio.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { PaisService } from 'src/app/servicios/pais/pais.service';
import { TiposCatastroService } from 'src/app/servicios/tipos-catastro/tipos-catastro.service';
import { ProcedenciaService } from 'src/app/servicios/procedencia/procedencia.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';

@Component({
  selector: 'app-asignar-arete-bovino',
  templateUrl: './asignar-arete-bovino.component.html'
})
export class AsignarAreteBovinoComponent implements OnInit {

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
  listaAretesAprobados: AreteBovino[] = [];
  listaBovinos: Bovino[] = [];
  listaMadres: Bovino[] = [];
  listaMadresDonadoras: Bovino[] = [];
  listaPadres: Bovino[] = [];
  categorias: Categoria[] = [];
  razas: Raza[] = [];
  purezas: Pureza[] = [];
  tiposServicios: TipoServicio[] = [];
  //**** Variables auxiliares ****/
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  procedenciaVisible: boolean = false; // true = Visible // false = Oculto
  isVisibleBotonDetalles: boolean = false; // Variable para controlar la visibilidad de la información del sitio
  isVisible: boolean = false; // Variable para controlar la visibilidad de la información del sitio
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
    private paisesService: PaisService,
    private tiposCatastroService: TiposCatastroService,
    private procedenciaService: ProcedenciaService,
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
    // Cargar sitios activos del ganadero (usuario externo)
    this.obtenerSitiosProductor();
    // Cargar catálogos generales
    this.cargarCatalogos();
    // Cargar aretes aprobados del productor
    this.buscarAretesOficiales();
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
      inputArete: new FormControl(null, Validators.required),
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
      return '1rem'; // Tamaño normal
    } else if (length === 3) {
      return '0.9rem'; // Un poco más pequeño
    } else if (length === 4) {
      return '0.8rem'; // Más pequeño
    } else {
      return '0.6rem'; // Evita que se salga del círculo
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
    this.buscarAretesOficiales();
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
    //this.inicio = this.inicio + this.rango;
    this.fin = this.rango;
    this.listaBovinos = [];

    let formularioInvalido = false;
    let alerta = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formularioBusqueda.value.inputIdOficial?.trim()) {
      const inputIdOficial = this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim();

      // Verificar si el valor contiene letras (no es un número válido)
      if (/[A-Za-z]/.test(inputIdOficial)) { // Expresión regular para validar letras
        formularioInvalido = true;
        alerta += "<li>El ID solo puede contener números.</li>";
      }
    }
    if (formularioInvalido) {
      alerta += "</ul>";
      Swal.fire('¡Advertencia!', alerta, 'warning');
      return;
    }

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
      if (this.formularioBusqueda.value.inputIdOficial?.trim()) {
        const inputIdOficial = this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim();
        parametros.idBovino = Number(inputIdOficial); // Convertir a número
      }

      parametros.codigoIdentificacion = 'no';
      parametros.inicio = this.inicio;
      parametros.limite = this.fin;

      this.mostrarCargando('Buscando animales en el sitio...');

      this.bovinoService.filtrarAnimales(parametros)
        .subscribe(
          (bovinos: Bovino[]) => {
            this.listaBovinos = bovinos;
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
    this.formularioBusqueda.controls.inputIdOficial.setValue('');
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
      this.listaAretesAprobados = [];
      //Asignar datos al formulario (registro reproductivo)
      this.formulario.controls.inputTipoServicio.setValue(this.animalSeleccionado.idTipoServicio);
      this.tipoServicioSeleccionado = this.animalSeleccionado.idTipoServicio;
      this.formulario.controls.inputIdBovinoMadre.setValue(this.animalSeleccionado.idBovinoMadre);
      this.formulario.controls.inputIdBovinoMadreDonadora.setValue(this.animalSeleccionado.idBovinoMadreDonadora);
      this.formulario.controls.inputIdBovinoPadre.setValue(this.animalSeleccionado.idBovinoPadre);
      this.formulario.controls.inputCodigoPajuelaPadre.setValue(this.animalSeleccionado.codigoPajuelaPadre);
      //Asignar datos al formulario (pedigrí e identificación)
      if (this.animalSeleccionado.fechaNacimiento) {
        this.formulario.controls.inputFechaNacimiento.setValue(new Date(this.animalSeleccionado.fechaNacimiento).toISOString().substring(0, 10));
      } else {
        this.formulario.controls.inputFechaNacimiento.setValue(null);
      }
      this.formulario.controls.inputRaza.setValue(this.animalSeleccionado.idRaza);
      this.formulario.controls.inputPureza.setValue(this.animalSeleccionado.idPureza);
      this.formulario.controls.inputArete.setValue(this.animalSeleccionado.idIdentificador);
      this.formulario.controls.inputNumeroRegistroNacimiento.setValue(this.animalSeleccionado.registroNacimientoDefinitivo);

      if (this.animalSeleccionado.idPaisProcedencia !== 19) {
        this.formulario.controls.inputProcedencia.setValue(2);
        this.procedenciaVisible = true;
        this.formulario.controls.inputPaisProcedencia.setValue(this.animalSeleccionado.idPaisProcedencia);
      }

      Swal.close();

    } else {
      // Mostrar error si el animal no fue encontrado
      this.formularioVisible = false;
      Swal.fire('Error', 'Animal no encontrado', 'error');
    }
  }

  //**** Método que permite buscar aretes oficiales ****/
  buscarAretesOficiales(mensaje: boolean = false, limite: boolean = false) {
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
    //activar paginación
    if (limite) {
      parametros.LIMITE = 100;
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
        Swal.fire('Error', 'Hubo un problema al buscar aretes oficiales: ' + error, 'error');
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
    // Determinar el valor de idCategoria basado en this.animalSeleccionado.idTaxonomia
    const nombreCategoria = this.animalSeleccionado.idTaxonomia === 13 ? 'búfalo macho' : 'bovino macho';
    // Mostrar mensaje de carga
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    // Realizar la consulta para buscar padres
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      padres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        // Asignar los resultados a la lista de padres
        this.listaPadres = resultado;
        // Cerrar el mensaje de carga
        Swal.close();
        // Verificar si hay resultados
        if (this.listaPadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          // Si hay un resultado, asignarlo directamente al formulario
          const padreSeleccionado = this.listaPadres[0];
          this.formulario.controls.inputIdBovinoPadre.setValue(padreSeleccionado.idBovino);
          // Mostrar mensaje de éxito
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
        // Cerrar el mensaje de carga en caso de error
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
    // Mostrar mensaje de carga
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    // Realizar la consulta para buscar padres
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true'
    }).subscribe(
      (resultado: Bovino[]) => {
        // Asignar los resultados a la lista de padres
        this.listaMadresDonadoras = resultado;
        // Cerrar el mensaje de carga
        Swal.close();
        // Verificar si hay resultados
        if (this.listaMadresDonadoras.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          // Si hay un resultado, asignarlo directamente al formulario
          const madreDonadoraSeleccionada = this.listaMadresDonadoras[0];
          this.formulario.controls.inputIdBovinoMadreDonadora.setValue(madreDonadoraSeleccionada.idBovino);
          // Mostrar mensaje de éxito
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
        // Cerrar el mensaje de carga en caso de error
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
    // Mostrar mensaje de carga
    this.mostrarCargando(`Buscando ${nombreCategoria} con arete oficial...`);
    // Realizar la consulta para buscar padres
    this.bovinoService.filtrarAnimales({
      codigoIdentificacion: numeroArete.toUpperCase().trim(),
      madres: 'true',
      fechaUltimoParto: '0' // Se envía cualquier valor, lo importante es que se envíe la clave al backend.
    }).subscribe(
      (resultado: Bovino[]) => {
        // Asignar los resultados a la lista de padres
        this.listaMadres = resultado;
        // Cerrar el mensaje de carga
        Swal.close();
        // Verificar si hay resultados
        if (this.listaMadres.length === 0) {
          Swal.fire('¡Atención!', 'No se han encontrado resultados. Recuerde ingresar el número completo del arete oficial. Ejemplo: EC006132716', 'info');
        } else {
          // Si hay un resultado, asignarlo directamente al formulario
          const madreSeleccionada = this.listaMadres[0];
          this.formulario.controls.inputIdBovinoMadre.setValue(madreSeleccionada.idBovino);
          // Mostrar mensaje de éxito
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
        // Cerrar el mensaje de carga en caso de error
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al buscar madres con arete oficial: ' + error, 'error');
      }
    );
  }

  // Método auxiliar para restablecer fecha
  private restablecerFechaNacimiento(): void {
    if (this.animalSeleccionado?.fechaNacimiento) {
      this.formulario.controls.inputFechaNacimiento.setValue(
        new Date(this.animalSeleccionado.fechaNacimiento).toISOString().substring(0, 10)
      );
    } else {
      this.formulario.controls.inputFechaNacimiento.setValue(null);
    }
  }

  //**** Método para actualizar datos del animal seleccionado ****/
  actualizarAnimal(id: number) {
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
        mensaje += `<li>La fecha de nacimiento no puede ser anterior al ${this.formatearFecha(fechaMinimaPermitida)}</li>`;
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
    if (!this.formulario.value.inputArete) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un arete oficial.</li>";
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
    animal.idBovino = id;
    animal.accion = 'asignarAreteOficial';
    animal.fechaNacimiento = fechaNacimientoDate.toISOString().substring(0, 10);
    animal.idIdentificador = this.formulario.value.inputArete;
    animal.codigoPajuelaPadre = this.formulario.value.inputCodigoPajuelaPadre?.toUpperCase().trim() || '';
    // Buscar código oficial del arete
    const areteOficial = this.listaAretesAprobados.find(
      (item: AreteBovino) => item.idAretesBovinos === Number(this.formulario.value.inputArete)
    );
    animal.codigoIdentificacion = areteOficial.codigoOficial;
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
    // Confirmación del usuario
    Swal.fire({
      title: '¿Asignar este arete oficial?',
      html: `<b>[ ${areteOficial.codigoOficial} ]</b> &rarr; 
            <b>[ ${this.animalSeleccionado.idBovino} - ${categoria} ]</b>
            <br><br>
            Por favor, revise cuidadosamente la información ingresada. 
            Al continuar, este proceso no podrá revertirse.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Asignando arete oficial...');
        this.bovinoService.actualizarDatosAnimal(animal).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', `¡Arete oficial asignado con éxito!
                <br><br>
                <b>[ ${areteOficial.codigoOficial} ]</b> &rarr; 
                <b>[ ${this.animalSeleccionado.idBovino} - ${categoria} ]</b>`, 'success')
                .then(() => {
                  this.botonCancelar(); // Llamar a botonCancelar después de cerrar el mensaje de éxito
                  this.buscarAretesOficiales();
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

  //**** Generar título para hover del botón Asignar arete oficial ****/
  generarTitulo(bovino: any): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const idBovino = bovino?.idBovino || 'N/A';
    return `Asignar arete oficial a ${nombreCategoria} (${idBovino})`;
  }

  //**** Exportar JSON aretes oficiales a PDF ****/
  exportarListadoAretesPDF() {
    if (!this.listaAretesAprobados || this.listaAretesAprobados.length === 0) {
      Swal.fire('¡Advertencia!', 'No hay datos para generar el Documento PDF', 'warning');
      return;
    }
    this.mostrarCargando('Generando Documento PDF...');
    const pdfData = {
      estado: "OK",
      memoria: 0,
      resultado: this.listaAretesAprobados
    };
    this.reportesAretesService.exportAsPdfFileAretesListado(pdfData);
    Swal.close();
    Swal.fire({
      title: 'Documento Generado con Éxito!',
      text: 'Por favor, revise su carpeta de descargas',
      icon: 'success',
      timer: 3000, // Tiempo en milisegundos (3000 ms = 3 segundos)
      showConfirmButton: false // Oculta el botón de confirmación
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

  resetFechaSugerida () {
    this.formulario.controls.checkFechaSugerida.setValue(false);
  }
  
}
