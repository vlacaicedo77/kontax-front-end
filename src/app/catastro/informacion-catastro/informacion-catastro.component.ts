import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validarCoordenadasDesdeString } from '../../config/utilitario';
import * as mascaras from 'src/app/config/mascaras';
import Swal from 'sweetalert2';
// Importación de modelos.
import { Sitio } from 'src/app/modelos/sitio.modelo';
import { Bovino } from '../../modelos/bovino.modelo';
import { Area } from '../../modelos/area.modelo';
import { EstadoPredio } from '../../modelos/estado-predio.modelo';
// Importación de servicios.
import { SitioService } from '../../servicios/sitio/sitio.service';
import { AreaService } from '../../servicios/area/area.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { EstadoPredioService } from 'src/app/servicios/estado-predio/estado-predio.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';

@Component({
  selector: 'app-informacion-catastro',
  templateUrl: './informacion-catastro.component.html'
})
export class InformacionCatastroComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formularioSitio: FormGroup;
  formularioEstado: FormGroup;
  //**** Cuerpo de modelos ****/
  sitioSeleccionado?: Area = null;
  //**** Listas ****/
  listaSitios: Sitio[] = [];
  listaEstadoPredios = [];
  listaEstadoPrediosRev = [];
  listaAreas: Area[] = [];
  listaProvincias = [];
  listaBovinosConArete: Bovino[] = [];
  //**** Variables auxiliares ****/
  op: number = 0;
  selectedText: string = '';
  estadoArea: number = 0;
  isVisibleBotonDetalles: boolean = false;
  isVisible: boolean = false;
  faseVacunacionActiva: any = null;
  //**** Variables catastro de animales ****/
  categoriasAnimalesDisponibles: any = {
    ternera: 0, ternero: 0, vacona: 0, torete: 0,
    vaca: 0, toro: 0, bufalo_hembra: 0, bufalo_macho: 0
  };

  categoriasAnimalesConArete: any = {
    ternera: 0, ternero: 0, vacona: 0, torete: 0,
    vaca: 0, toro: 0, bufalo_hembra: 0, bufalo_macho: 0
  };

  categoriasAnimalesNoVacunados: any = {
    ternera: 0, ternero: 0, vacona: 0, torete: 0,
    vaca: 0, toro: 0, bufalo_hembra: 0, bufalo_macho: 0
  };

  categoriasAnimalesMovilizacion: any = {
    ternera: 0, ternero: 0, vacona: 0, torete: 0,
    vaca: 0, toro: 0, bufalo_hembra: 0, bufalo_macho: 0
  };

  totalBovinosDisponibles: number = 0;
  totalBovinosConArete: number = 0;
  totalBovinosNoVacunados: number = 0;
  totalBovinosMovilizacion: number = 0;

  // Configuración
  private configAnimales = {
    disponibles: {
      variable: 'categoriasAnimalesDisponibles',
      total: 'totalBovinosDisponibles',
      mensaje: 'Cargando animales disponibles...',
      parametros: { codigoEstadoUbicacion: 'SIT' },
      requiereFaseVacunacion: false
    },
    conArete: {
      variable: 'categoriasAnimalesConArete',
      total: 'totalBovinosConArete',
      mensaje: 'Cargando animales con arete...',
      parametros: { codigoEstadoUbicacion: 'SIT', codigoIdentificacion: 'si' },
      requiereFaseVacunacion: false
    },
    noVacunados: {
      variable: 'categoriasAnimalesNoVacunados',
      total: 'totalBovinosNoVacunados',
      mensaje: 'Cargando animales no vacunados...',
      parametros: { codigoEstadoUbicacion: 'SIT', idBovinoCertificado: 'no_vacunado' },
      requiereFaseVacunacion: true
    },
    movilizacion: {
      variable: 'categoriasAnimalesMovilizacion',
      total: 'totalBovinosMovilizacion',
      mensaje: 'Cargando animales en movilización...',
      parametros: { codigoEstadoUbicacion: 'MOV' },
      requiereFaseVacunacion: false
    }
  };

  constructor(
    private servicioScript: ScriptsService,
    private servicioBovino: BovinoService,
    private servicioSitio: SitioService,
    private areaServicio: AreaService,
    private _provinciaService: ProvinciaService,
    private estadoPredioService: EstadoPredioService,
    public servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private reportesAretesService: ReportesAretesService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.obtenerEstadosPredios();
    this.cargarFaseVacunacion();
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputIdProvincia: new FormControl('-1'),
      inputEstado: new FormControl('-1'),
      inputIdentificacion: new FormControl('', Validators.required),
      inputIdSitio: new FormControl(null)
    });

    this.formularioSitio = new FormGroup({
      latitud: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      longitud: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$'))
    });

    this.formularioEstado = new FormGroup({
      inputObservaciones: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputIdEstado: new FormControl('-1', Validators.required)
    });
  }

  //**** Obtiene los estados de los sitios ****/
  obtenerEstadosPredios() {
    this.listaEstadoPredios = [];
    this.listaEstadoPrediosRev = [];
    this.estadoPredioService.obtenerEstadosPredios()
      .subscribe((estadoPredio: EstadoPredio[]) => {
        estadoPredio.forEach((item: EstadoPredio) => {
          if (item.estado === 1) {
            this.listaEstadoPredios.push(item);
            if (item.codigo !== 'PR') {
              this.listaEstadoPrediosRev.push(item);
            }
          }
        });
        Swal.close();
      });
  }

  //**** Abrir Mapa de Google Maps ****/
  abrirGoogleMaps(): void {
    const lat = this.formularioSitio.get('latitud')?.value;
    const long = this.formularioSitio.get('longitud')?.value;

    if (lat && long) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${long}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  //**** Obtener catálogo de provincias ****//
  cargarProvinciasPorPais(idPais: number) {
    this._provinciaService.getProvinciasPorPais(idPais)
      .subscribe(respuesta => this.listaProvincias = respuesta);
  }

  //**** Obtener sitios del productor ****/
  buscar() {
    this.limpiarCombo();

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

    const parametros: any = {};

    if (this.formularioBusqueda.value.inputIdProvincia !== "-1" &&
      this.formularioBusqueda.value.inputIdProvincia !== '' &&
      this.formularioBusqueda.value.inputIdProvincia !== null) {
      parametros.idProvinciaSitio = this.formularioBusqueda.value.inputIdProvincia;
    }

    if (this.formularioBusqueda.value.inputEstado !== "-1" &&
      this.formularioBusqueda.value.inputEstado !== '' &&
      this.formularioBusqueda.value.inputEstado !== null) {
      parametros.estadoSitio = this.formularioBusqueda.value.inputEstado;
    }

    parametros.numeroIdentificacion = this.formularioBusqueda.value.inputIdentificacion;

    this.mostrarCargando('Buscando sitios del productor...');

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe(
        (areas: Area[]) => {
          this.listaAreas = areas;
          Swal.close();
          if (this.listaAreas.length === 0) {
            Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          } else {
            Swal.fire({
              title: '¡Búsqueda exitosa!',
              text: `Se encontraron ${this.listaAreas.length} sitio(s). Por favor, seleccione un sitio del listado.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        },
        (error) => {
          Swal.close();
          Swal.fire('¡Error!', 'Hubo un problema al buscar los sitios del productor.', 'error');
        }
      );
  }

  //**** Limpiar inputs ****/
  limpiarCombo() {
    this.op = 0;
    this.listaAreas = [];
    this.formularioBusqueda.get('inputIdSitio')?.reset(); // Resetea el select
    this.formularioEstado.controls.inputIdEstado.setValue("-1");
    this.formularioEstado.controls.inputObservaciones.setValue("");
  }

  //**** Captura texto de la opción seleccionada ****/
  onChangeEstado(event: any): void {
    const selectedIndex = event.target.selectedIndex;
    this.selectedText = event.target.options[selectedIndex].text;
  }

  //**** Actualizar estado del sitio ****/
  actualizarEstadoGeneral() {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    const idProvinciaUsuario = parseInt(localStorage.getItem('idProvincia') || '0');
    if (idProvinciaUsuario !== this.sitioSeleccionado.idProvinciaSitio) {
      formularioInvalido = true;
      mensaje += "<li>El sitio no pertenece a su provincia.</li>";
    }

    if (this.sitioSeleccionado.estadoSitio == 6) {
      formularioInvalido = true;
      mensaje += "<li>Sitio deshabilitado permanentemente, no puede cambiar su estado.</li>";
    }

    const nuevoEstado = this.formularioEstado.value.inputIdEstado;
    if (nuevoEstado == 6 && (this.totalBovinosDisponibles > 0)) {
      formularioInvalido = true;
      mensaje += "<li>No puede deshabilitar permanentemente un sitio que contiene animales disponibles.</li>";
    }

    if (!nuevoEstado || nuevoEstado == "-1") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un estado del listado</li>";
    }

    const observaciones = this.formularioEstado.value.inputObservaciones;
    if (!observaciones || observaciones.trim() === "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese justificación</li>";
    }

    if (this.formularioEstado.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire({
        title: '¡Advertencia!',
        html: `<div style="text-align: left;">${mensaje}</div>`,
        icon: 'warning'
      });
      return;
    }

    const hoy = new Date();
    hoy.setHours(hoy.getHours() - 5); // Ajustar a zona horaria Ecuador (UTC-5)

    const sitio = new Sitio();
    sitio.idSitio = this.formularioBusqueda.value.inputIdSitio;
    sitio.observaciones = `${observaciones.toLowerCase()} [${localStorage.getItem('identificacion')} - ${hoy.toISOString().substring(0, 16)}]`;
    sitio.estado = nuevoEstado;

    const nombreSitio = `[ ${this.sitioSeleccionado.codigoSitio} ]`;
    const accionTexto = this.selectedText?.toLowerCase() || 'estado desconocido';
    this.estadoArea = nuevoEstado == 3 ? 1 : 0;

    Swal.fire({
      title: "¿Está seguro de cambiar el estado de este sitio?",
      html: `El sitio <strong>${nombreSitio}</strong> cambiará a estado: <strong>${accionTexto}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mostrarCargando('Actualizando estado del sitio...');
        this.servicioSitio.actualizarSitio(sitio)
          .subscribe({
            next: (resp: any) => {
              Swal.close();
              if (resp.estado === 'OK') {
                let area = new Area();
                area.idArea = this.sitioSeleccionado.idArea;
                area.estado = this.estadoArea;
                area.idUsuariosExternos = this.sitioSeleccionado.idUsuariosExternos;
                area.idTiposAreas = this.sitioSeleccionado.idTiposAreas;

                this.areaServicio.actualizarEstadoArea(area)
                  .subscribe({
                    next: (respuesta: any) => {
                      this.limpiarCombo();
                      Swal.fire({
                        title: 'Operación Exitosa',
                        text: 'Cambio de estado realizado con éxito',
                        icon: 'success'
                      });
                    },
                    error: (error) => {
                      Swal.fire('Error', 'Error al actualizar el estado del área', 'error');
                    }
                  });
              } else {
                Swal.fire('Error', resp.mensaje || 'Error al actualizar el estado', 'error');
              }
            },
            error: (error) => {
              Swal.close();
              Swal.fire('Error', 'Error de conexión al actualizar el estado', 'error');
            }
          });
      } else {
        Swal.close();
      }
    });
  }

  //**** Actualizar coordenadas del sitio ****/
  actualizarGpsSitio() {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (parseInt(localStorage.getItem('idProvincia')) !== this.sitioSeleccionado.idProvinciaSitio) {
      formularioInvalido = true;
      mensaje += "<li>El sitio no perenece a su provincia</li>";
    }

    if (!validarCoordenadasDesdeString(this.formularioSitio.value.latitud.trim(), this.formularioSitio.value.longitud.trim())) {
      formularioInvalido = true;
      mensaje += "<li>Ubicación fuera de Ecuador continental</li>";
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

    const hoy = new Date();
    hoy.setHours(hoy.getHours() - 5); // Restar 5 horas para igualar zona horaria Ecuador

    let sitio = new Sitio();
    sitio.idSitio = this.formularioBusqueda.value.inputIdSitio;
    sitio.observaciones = 'GPS [' + localStorage.getItem('identificacion') + ' - ' + hoy.toISOString().substring(0, 16) + ']';
    sitio.latitud = this.formularioSitio.value.latitud;
    sitio.longitud = this.formularioSitio.value.longitud;

    Swal.fire({
      title: "¿Está seguro de actualizar las coordenadas de este sitio?",
      text: 'Antes de actualizar, asegúrese de haber verificado en Google Maps (ver mapa) que las coordenadas correpondan a un punto real.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      this.mostrarCargando('Actualizando coordenadas del sitio...');
      if (result.value) {
        this.servicioSitio.actualizarSitio(sitio)
          .subscribe((resp: any) => {
            this.limpiarCombo();
            if (resp.estado === 'OK') {
              Swal.fire('Operación Exitosa', 'Coordenadas actualizadas con éxito', 'success');
            }
            else {
              Swal.fire('Error', resp.mensaje, 'error');
            }
          });
      }
      else
        Swal.close();
    })
  }

  /**** Genérico para mostrar mensaje mientras se ejecuta una acción ****/
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

  /**** Cargar datos del catastro al cambiar el sitio ****/
  cambioSitio() {
    this.formularioEstado.controls.inputIdEstado.setValue("-1");
    this.formularioEstado.controls.inputObservaciones.setValue("");

    const area = this.listaAreas.find((item: any) => item.idSitio === Number(this.formularioBusqueda.value.inputIdSitio));
    this.sitioSeleccionado = area;
    this.isVisibleBotonDetalles = true;
    this.formularioSitio.controls.latitud.setValue(this.sitioSeleccionado.latitudSitio);
    this.formularioSitio.controls.longitud.setValue(this.sitioSeleccionado.longitudSitio);

    this.mostrarCargando('Consultando catastro de animales...');

    Object.keys(this.configAnimales).forEach(tipo => {
      const config = (this.configAnimales as any)[tipo];

      if (config.requiereFaseVacunacion) {
        if (this.faseVacunacionActiva) {
          this.cargarAnimales(tipo);
        }
      } else {
        this.cargarAnimales(tipo);
      }
    });

    this.op = 1;
    this.isVisible = false;
  }

  /**** Cargar datos de la fase de vacunación ****/
  cargarFaseVacunacion() {
    this.servicioFaseVacunacion.obtenerFasesVacunacion({ codigoEstadoDocumento: 'CRD' }).subscribe({
      next: (fases) => {
        if (fases && fases.length > 0) {
          const fase = fases[0];
          this.faseVacunacionActiva = this.validarFaseActiva(fase);
        } else {
          this.faseVacunacionActiva = null;
        }
      },
      error: (error) => {
        this.faseVacunacionActiva = null;
      }
    });
  }

  /**** validar fase de vacunación activa ****/
  private validarFaseActiva(fase: any): any {
    if (!fase) return null;
    const fechaActual = new Date();
    const fechaInicio = new Date(fase.fechaInicio);
    const fechaFin = new Date(fase.fechaFin);
    const fechaActualAjustada = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
    const fechaInicioAjustada = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
    const fechaFinAjustada = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
    return fechaActualAjustada >= fechaInicioAjustada && fechaActualAjustada <= fechaFinAjustada ? fase : null;
  }

  /**** Método genérico para cargar los animales del catastro ****/
  private cargarAnimales(tipo: string) {
    const config = (this.configAnimales as any)[tipo];

    if (config.requiereFaseVacunacion && !this.faseVacunacionActiva) {
      this.mostrarError('No hay una fase de vacunación activa para cargar animales no vacunados');
      return;
    }

    const parametros = new Bovino();
    parametros.idUsuarioActual = this.sitioSeleccionado.idUsuariosExternos;
    parametros.codigoEstadoRegistro = 'DISP';
    parametros.codigoEstadoAnimal = 'vivo';
    parametros.idAreaActual = this.sitioSeleccionado.idArea;

    Object.assign(parametros, config.parametros);
    this.mostrarCargando(config.mensaje);

    const timeout = setTimeout(() => {
      Swal.close();
      this.mostrarError(`La consulta de ${config.mensaje.toLowerCase()} está tomando demasiado tiempo`);
    }, 30000);

    this.servicioBovino.obtenerTotalesCatastroAnimales(parametros)
      .subscribe({
        next: (resultado: any[]) => {
          clearTimeout(timeout);
          if (resultado && Array.isArray(resultado)) {
            this.procesarAnimales(resultado, tipo);
          }
          Swal.close();
        },
        error: (error) => {
          clearTimeout(timeout);
          Swal.close();
          this.mostrarError(`Error al cargar ${config.mensaje.toLowerCase()}`);
        }
      });
  }

  /**** Procesar animales, aquí se mapean las categorías ****/
  private procesarAnimales(resultado: any[], tipo: string) {
    const config = (this.configAnimales as any)[tipo];
    const categorias = this[config.variable as keyof this] as any;
    const totalKey = config.total as keyof this;
    // Reiniciar valores a 0
    Object.keys(categorias).forEach(key => {
      categorias[key] = 0;
    });
    (this as any)[totalKey] = 0;
    // Procesar cada categoría
    resultado.forEach(item => {
      const categoria = item.categoriaAnimal;
      const cantidad = parseInt(item.totalAnimales) || 0;
      if (categorias.hasOwnProperty(categoria)) {
        categorias[categoria] = cantidad;
        (this as any)[totalKey] += cantidad;
      }
    });
  }

  /**** Métodos para cargar los animales del catastro ****/
  cargarAnimalesDisponibles() { this.cargarAnimales('disponibles'); }
  cargarAnimalesConArete() { this.cargarAnimales('conArete'); }
  cargarAnimalesNoVacunados() { this.cargarAnimales('noVacunados'); }
  cargarAnimalesMovilizacion() { this.cargarAnimales('movilizacion'); }

  /**** Método para mostrar error ****/
  private mostrarError(mensaje: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Información',
      text: mensaje,
      confirmButtonText: 'Aceptar'
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

  //**** Función para alternar la visibilidad del detalle del sitio ****/
  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  //****  Descargar el listado de animales con arete en PDF ****/
  descargarListadoAnimalesConArete() {
    this.listaBovinosConArete = [];
    const parametros = new Bovino();

    // Validar que hay un sitio seleccionado
    if (!this.formularioBusqueda.value.inputIdSitio || !this.sitioSeleccionado) {
      Swal.fire('¡Advertencia!', 'Por favor seleccione un sitio primero.', 'warning');
      return;
    }

    // Validar que hay animales con arete oficial
    if (this.totalBovinosConArete <1) {
      Swal.fire('¡Atención!', 'No tiene animales con arete oficial.', 'info');
      return;
    }

    // Configurar parámetros de búsqueda
    parametros.idUsuarioActual = this.sitioSeleccionado.idUsuariosExternos;
    parametros.codigoEstadoUbicacion = 'SIT';
    parametros.codigoEstadoRegistro = 'DISP';
    parametros.codigoEstadoAnimal = 'vivo';
    parametros.idAreaActual = this.sitioSeleccionado.idArea;
    parametros.codigoIdentificacion = 'si';

    this.mostrarCargando('Buscando animales...');

    this.servicioBovino.filtrarAnimalesMovilizacion(parametros)
      .subscribe(
        (bovinos: Bovino[]) => {
          Swal.close();

          // Ordenar los bovinos por codigoIdentificacion de forma ascendente
          this.listaBovinosConArete = bovinos.sort((a, b) => {
            const codigoA = a.codigoIdentificacion || '';
            const codigoB = b.codigoIdentificacion || '';
            return codigoA.localeCompare(codigoB);
          });

          if (this.listaBovinosConArete.length === 0) {
            Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados.', 'info');
            return;
          }

          // Mostrar mensaje de éxito y generar PDF
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: `Se encontraron ${this.listaBovinosConArete.length} animales. Generando PDF...`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          // Esperar un momento antes de generar el PDF para que se vea el mensaje
          setTimeout(() => {
            this.mostrarCargando('Generando Documento PDF...');

            const pdfData = {
              estado: "OK",
              memoria: 0,
              resultado: this.listaBovinosConArete
            };

            this.reportesAretesService.exportAsPdfFileAnimalesAretesOficiales(pdfData, this.sitioSeleccionado);

            Swal.close();
            Swal.fire({
              title: 'Documento Generado con Éxito!',
              text: `Se generó el reporte de ${this.listaBovinosConArete.length} animales. Por favor, revise su carpeta de descargas`,
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          }, 1600);
        },
        (error) => {
          Swal.close();
          Swal.fire('¡Error!', 'Hubo un problema al buscar los animales.', 'error');
        }
      );
  }

}
