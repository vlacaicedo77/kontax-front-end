import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// Importación de modelos.
import { Bovino } from '../../modelos/bovino.modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { Area } from '../../modelos/area.modelo';
import { TipoBaja } from '../../modelos/tipo-baja.modelo';
// Importación de servicios.
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { TipoBajaService } from '../../servicios/tipo-baja/tipo-baja.service';
import { TiposCatastroService } from 'src/app/servicios/tipos-catastro/tipos-catastro.service';

@Component({
  selector: 'app-registrar-bajas-animales',
  templateUrl: './registrar-bajas-animales.component.html'
})
export class RegistrarBajasAnimalesComponent implements OnInit {

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
  public tiposBajas: TipoBaja[] = [];
  //**** Variables auxiliares ****/
  formularioVisible: boolean = false; // true = Visible // false = Oculto
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
    private tipoBajaServicio: TipoBajaService,
    private tiposCatastroService: TiposCatastroService
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit() {
    this.servicioScripts.inicializarScripts();
    this.inicializarFormulario();
    // Cargar sitios activos del ganadero (usuario externo)
    this.obtenerSitiosProductor();
    this.obtenerTiposBajas();
    this.cargarTiposCatastro();
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
      inputFechaMuerte: new FormControl(null, Validators.required),
      inputMotivoMuerte: new FormControl(null, Validators.required),
      inputDetalleMuerte: new FormControl('')
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
    this.formularioVisible = false;
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  // Método para obtener los tipos de bajas filtrando por grupo 'BOV'
  obtenerTiposBajas() {
    this.tipoBajaServicio.obtenerTiposBajas()
      .subscribe((respuesta: TipoBaja[]) => {
        this.tiposBajas = respuesta.filter(tipo => tipo.grupo === 'BOV');
      });
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
    this.mostrarCargando('Cargando sitios...');
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

      if (this.formularioBusqueda.value.inputTipoCatastro !== "-1" && this.formularioBusqueda.value.inputTipoCatastro !== null) {
        parametros.idBovinoCertificado = this.formularioBusqueda.value.inputTipoCatastro;
      }
      if (this.formularioBusqueda.value.inputCategoria !== "-1" && this.formularioBusqueda.value.inputCategoria !== null) {
        parametros.idCategoria = this.formularioBusqueda.value.inputCategoria;
      }
      if (this.formularioBusqueda.value.inputIdOficial?.trim()) {
        parametros.codigoIdentificacion = `%${this.formularioBusqueda.value.inputIdOficial.toUpperCase().trim()}%`;
      }
      //parametros.codigoIdentificacion = 'no';
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
    this.formulario.controls.inputFechaMuerte.setValue(null);
    this.formulario.controls.inputMotivoMuerte.setValue(null);
    this.formulario.controls.inputDetalleMuerte.setValue('');

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
      Swal.close();
    } else {
      // Mostrar error si el animal no fue encontrado
      this.formularioVisible = false;
      Swal.fire('Error', 'Animal no encontrado', 'error');
    }
  }


  //**** Método para actualizar datos del animal seleccionado ****/
  registrarBaja(id: number) {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (!this.formulario.value.inputFechaMuerte) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione una fecha de suceso.</li>";
    }

    const fechaMuerte = new Date(this.formulario.value.inputFechaMuerte);
    const fechaActual = new Date(); // Fecha actual

    // Inicializar fechaMinimaPermitida con la fecha actual
    let fechaMinimaPermitida = new Date(fechaActual);

    // Restar 3 meses a la fecha actual
    fechaMinimaPermitida.setMonth(fechaActual.getMonth() - 3);

    // Validar que la fecha de muerte no sea mayor que la fecha actual
    if (fechaMuerte > fechaActual) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de suceso ingresada no puede superar la fecha actual.</li>`;
      this.formulario.controls.inputFechaMuerte.setValue(null); // o setValue('') dependiendo de lo que esperes en el formulario
    }
    // Validar que la fecha de muerte no sea menor que la fecha mínima permitida
    else if (fechaMuerte < fechaMinimaPermitida) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de suceso no puede ser anterior al [ ${fechaMinimaPermitida.toISOString().substring(0, 10)} ]</li>`;
      this.formulario.controls.inputFechaMuerte.setValue(null);
    }

    if (!this.formulario.value.inputMotivoMuerte) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un suceso.</li>";
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

    const codigoIdentificacion = this.animalSeleccionado?.codigoIdentificacion?.trim()
      ? this.animalSeleccionado.codigoIdentificacion
      : this.animalSeleccionado.idBovino;

    const motivoMuerte = this.tiposBajas.find(
      (item: TipoBaja) => item.idTipoBaja === Number(this.formulario.value.inputMotivoMuerte)
    );

    const animal = new Bovino();
    animal.idBovino = id;
    animal.accion = 'darBaja';
    animal.fechaMuerte = fechaMuerte.toISOString().substring(0, 10);
    animal.idTipoBaja = this.formulario.value.inputMotivoMuerte;
    if (this.formulario.value.inputDetalleMuerte) {
      animal.detalleMuerte = this.formulario.value.inputDetalleMuerte.toLocaleLowerCase();
    }

    const categoria = this.animalSeleccionado.idTaxonomia == 13
      ? `${this.animalSeleccionado.nombreComunTaxonomia || ''} ${this.animalSeleccionado.nombreSexo || ''}`.trim()
      : this.animalSeleccionado.nombreCategoria;
    // Confirmación del usuario
    Swal.fire({
      title: '¿Estás seguro de dar de baja este animal?',
      html: `<br><b>${motivoMuerte.nombre.toLocaleUpperCase()}</b>
            <br><br><b>[ ${codigoIdentificacion} ]</b> &rarr; 
            <b>[ ${categoria} ]</b>
            <br><br>
            Atención: Una vez dado de baja, el proceso será irreversible. Verifique la información antes de continuar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Dando de baja al animal...');
        this.bovinoService.actualizarDatosAnimal(animal).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', `¡Animal dado de baja con éxito!
                <br><br>
                <b>${motivoMuerte.nombre.toLocaleUpperCase()}</b>
                <br><br><b>[ ${codigoIdentificacion} ]</b> &rarr; 
                <b>[ ${categoria} ]</b>`, 'success')
                .then(() => {
                  this.botonCancelar(); // Llamar a botonCancelar después de cerrar el mensaje de éxito
                });
            } else {
              Swal.fire('¡Advertencia!', resp.mensaje, 'warning');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo guardar datos del animal.', 'error');
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

  //**** Generar título para hover del botón Dar de baja ****/
  generarTitulo(bovino: any): string {
    const nombreCategoria = bovino?.nombreCategoria ?? 'Búfalo';
    const idBovino = bovino?.codigoIdentificacion || bovino?.idBovino ;
    return `Dar de baja a ${nombreCategoria} (${idBovino})`;
  }

}
