import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
// Importación de modelos.
import { Bovino } from '../../modelos/bovino.modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { Area } from '../../modelos/area.modelo';
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { TiposCatastroService } from 'src/app/servicios/tipos-catastro/tipos-catastro.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-actualizar-categorias-animales',
  templateUrl: './actualizar-categorias-animales.component.html'
})
export class ActualizarCategoriasAnimalesComponent implements OnInit {

  @ViewChild('panelScrollContainer') panelScrollContainer!: ElementRef;
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formularioDatosSitio: FormGroup;
  //**** Cuerpo de modelos ****/
  public sitioSeleccionado?: Area = null;
  //**** Listas ****/
  listaAreas: Area[] = [];
  listaTiposCatastro = [];
  listaBovinos: Bovino[] = [];
  categoriasCompleto: Categoria[] = [];
  categorias: Categoria[] = [];
  //**** Variables auxiliares ****/
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
    private tiposCatastroService: TiposCatastroService,
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
    this.buscarAnimales(false, true);
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

  //**** Obtener catálogo de categorías etarias ****//
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
      .subscribe((respuesta: Categoria[]) => {
        // Filtrar solo las categorías con id_categoria = 1, 2, 4 y 5
        this.categorias = respuesta.filter(categoria =>
          [1, 2, 4, 5].includes(categoria.id_categoria)
        );
      });
  }

  //**** Obtener catálogo de categorías etarias ****//
  obtenerCategoriasCompleto() {
    this.servicioCategoria.obtenerCategorias()
      .subscribe((respuesta: Categoria[]) => {
        this.categoriasCompleto = respuesta;
      });
  }

  //**** Cargar catálogos generales ****//
  cargarCatalogos() {
    this.cargarTiposCatastro();
    this.obtenerCategoriasCompleto();
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
    if (!this.formularioBusqueda.value.inputCategoria) {
      Swal.fire('¡Atención!', 'Seleccione una categoría etaria', 'warning');
      return;
    }
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
      parametros.idCategoria = this.formularioBusqueda.value.inputCategoria;

      if (this.formularioBusqueda.value.inputTipoCatastro !== "-1" && this.formularioBusqueda.value.inputTipoCatastro !== '') {
        parametros.idBovinoCertificado = this.formularioBusqueda.value.inputTipoCatastro;
      }
      if (this.formularioBusqueda.value.inputIdOficial) {
        parametros.idBovino = this.formularioBusqueda.value.inputIdOficial.trim();
      }
      parametros.codigoIdentificacion = 'no';
      parametros.controlCambioCategoria = '0'; // Se envía cualquier valor, lo importante es que se envíe la clave al backend.
      parametros.inicio = this.inicio;
      parametros.limite = this.fin;

      this.mostrarCargando('Buscando animales en el sitio...');

      this.bovinoService.filtrarAnimales(parametros)
        .subscribe(
          (bovinos: Bovino[]) => {
            // Ordenar los bovinos por ID de forma ascendente
            this.listaBovinos = bovinos.sort((a, b) => {
              const idA = a.idBovino || 0;
              const idB = b.idBovino || 0;
              return idA - idB;
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

  //**** Método para actualizar categoria etaria del animal seleccionado ****/
  actualizarAnimal(bovino: Bovino) {
    const animal = new Bovino();
    animal.idBovino = bovino.idBovino;
    animal.idCategoria = bovino.idCategoria;
    animal.accion = 'actualizarCategoria';
    const categoriaActual = bovino.nombreCategoria;
    const categoriaNueva = this.obtenerSiguienteCategoria(bovino);
    Swal.fire({
      title: '¿Está seguro de cambiar la categoría etaria?',
      html: `<br><b>[ ${categoriaActual} ]</b> &rarr; 
          <b>[ ${categoriaNueva} ]</b>
          <br><br>
          Al continuar, esta acción no podrá revertirse. El próximo cambio de categoría de este animal, se habilitará dentro de 5 meses.`,
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
              <b>[ ${bovino.idBovino} ]</b> &rarr; 
              <b>[ ${categoriaActual} - ${categoriaNueva} ]</b>`, 'success')
                .then(() => {
                  this.botonCancelar();
                });
            } else {
              Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar la categoría del animal.', 'error');
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

  //**** Generar título para hover de botones ****/
  generarTitulo(bovino: any): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const idBovino = bovino?.idBovino || 'N/A';
    return `Actualizar categoría del ${nombreCategoria} (${idBovino})`;
  }

  // Función para validar solo números en el keypress
  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Permitir solo números (0-9) y teclas de control
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Método para obtener la siguiente categoría
  obtenerSiguienteCategoria(bovino: Bovino): string {
    if (!bovino?.idCategoria || !this.categoriasCompleto || this.categoriasCompleto.length === 0) {
      return bovino?.nombreCategoria || bovino?.nombreComunTaxonomia || 'No definido';
    }

    const categoriaActual = this.categoriasCompleto.find(cat => cat.id_categoria === bovino.idCategoria);

    if (!categoriaActual) {
      return bovino?.nombreCategoria || bovino?.nombreComunTaxonomia || 'No definido';
    }

    // Obtener todas las categorías del mismo grupo (hembra/macho)
    const categoriasMismoGrupo = this.categoriasCompleto
      .filter(cat => cat.grupo === categoriaActual.grupo)
      .sort((a, b) => a.orden_categoria - b.orden_categoria);
    const posicionActual = categoriasMismoGrupo.findIndex(cat => cat.id_categoria === bovino.idCategoria);
    // Obtener la siguiente categoría
    if (posicionActual < categoriasMismoGrupo.length - 1) {
      return categoriasMismoGrupo[posicionActual + 1].nombre;
    } else {
      return categoriaActual.nombre;
    }
  }

}