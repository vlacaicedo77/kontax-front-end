import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
// Importación de modelos.
import { Bovino } from '../../modelos/bovino.modelo';
import { Area } from '../../modelos/area.modelo';
import { Usuario } from '../../modelos/usuario.modelo';
import { EstadoPredio } from '../../modelos/estado-predio.modelo';
// Importación de servicios.
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { AreaService } from '../../servicios/area/area.service';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
import { EstadoPredioService } from 'src/app/servicios/estado-predio/estado-predio.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { ReportesAretesService } from 'src/app/servicios/reportes-aretes/reportes-aretes.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formularioSitio: FormGroup;
  //**** Cuerpo de modelos ****/
  sitioSeleccionado?: Area = null;
  usuario: Usuario;
  //**** Listas ****/
  listaEstadisticas: null;
  listaAreas: Area[] = [];
  listaEstadoPredios = [];
  listaBovinosConArete: Bovino[] = [];
  //**** Variables auxiliares ****/
  op: number = 0;
  isVisibleBotonDetalles: boolean = false;
  isVisible: boolean = false;
  faseVacunacionActiva: any = null;
  numeroIdentificacion: string = '';
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
    public scriptServicio: ScriptsService,
    public usuarioServicio: UsuarioService,
    public bovinoServicio: BovinoService,
    private rutas: Router,
    private areaServicio: AreaService,
    private estadoPredioService: EstadoPredioService,
    private autenticacionServicio: AutenticacionService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private reportesAretesService: ReportesAretesService
  ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerEstadosPredios();
    this.cargarFaseVacunacion();  
    this.obtenerDashboardInterno();
    // Cargar sitios del productor
    if (this.usuarioServicio.usuarioExterno) {
      this.buscar();
    }
    // Cargar PopUp Políticas de uso
    setTimeout(() => {
      this.lanzarPopUp();
    }, 2000);
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputEstado: new FormControl('3'),
      inputIdSitio: new FormControl(null)
    });

    this.formularioSitio = new FormGroup({
    });
  }

  //**** Obtiene los estados de los sitios ****/
  obtenerEstadosPredios() {
    this.listaEstadoPredios = [];
    this.estadoPredioService.obtenerEstadosPredios()
      .subscribe((estadoPredio: EstadoPredio[]) => {
        this.listaEstadoPredios = estadoPredio.filter((item: EstadoPredio) => {
          return item.estado === 1;
        });
        Swal.close();
      });
  }

  //**** Abrir Mapa de Google Maps ****/
  abrirGoogleMaps(): void {
    const lat = this.sitioSeleccionado.latitudSitio;
    const lng = this.sitioSeleccionado.longitudSitio;

    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  //**** Obtener sitios del productor ****/
  buscar() {
    this.limpiarCombo();
    const parametros: any = {};

    if (this.formularioBusqueda.value.inputEstado !== "-1" &&
      this.formularioBusqueda.value.inputEstado !== '' &&
      this.formularioBusqueda.value.inputEstado !== null) {
      parametros.estadoSitio = this.formularioBusqueda.value.inputEstado;
    }

    parametros.numeroIdentificacion = this.usuarioServicio.usuarioExterno.numeroIdentificacion;
    this.mostrarCargando('Buscando sitios...');
    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe(
        (areas: Area[]) => {
          this.listaAreas = areas;
          Swal.close();
        },
        (error) => {
          Swal.close();
          Swal.fire('¡Error!', 'Hubo un problema al cargar los sitios', 'error');
        }
      );
  }

  //**** Limpiar inputs ****/
  limpiarCombo() {
    this.op = 0;
    this.listaAreas = [];
    this.formularioBusqueda.get('inputIdSitio')?.reset(); // Resetea el select
  }

  // Método que obtiene las estadísticas del dashboard interno
  obtenerDashboardInterno() {
    if (!this.usuarioServicio.usuarioInterno) {
      return;
    }
    this.bovinoServicio.obtenerDashboardInterno()
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          this.listaEstadisticas = resp.resultado;
        }
        else {
          this.listaEstadisticas = null;
        }
      })
  }

  //**** Limpiar inputs ****/
  lanzarPopUp() {

    if (this.usuarioServicio.usuarioExterno) {
      this.numeroIdentificacion = this.usuarioServicio.usuarioExterno.numeroIdentificacion;
    } else {
      this.numeroIdentificacion = this.usuarioServicio.usuarioInterno.numeroIdentificacion;
    }

    let parametros: any = {};
    parametros = {
      numeroIdentificacion: this.numeroIdentificacion,
      tipo: 1
    }
    this.usuarioServicio.buscarUsuariosPoliticas(parametros)
      .subscribe((respuesta: any) => {
        if (respuesta.estado === 'OK') {
          if (respuesta.resultado.length < 1) {
            this.popUpPoliticasVersion2();
          }
        }
      });
  }

  // Método que se usa para cerrar la sesión de un usuario.
  cerrarSesion() {
    this.autenticacionServicio.logout()
      .subscribe(
        (respuesta: any) => {
          this.rutas.navigate(['login']);
        }
        , (err: HttpErrorResponse) => {
          if (err.error.estado === 'ERR') {
            Swal.fire('Error', err.error.mensaje, 'error');
          }
        });
  }

  //**** Pop Up - Políticas nuevas ****/
  popUpPoliticasVersion2() {
    Swal.fire({
      title: '<h2 style="color: #2c3e50; font-size: 22px; font-weight: 600; margin-bottom: 15px;">Aviso de uso y tratamiento de datos personales</h2>',
      icon: 'info',
      width: '800px',
      background: '#FFFFFF',
      html:
        '<div style="text-align: justify; line-height: 1.6; color: #333; font-size: 14px;">' +
        '<p>En cumplimiento con lo dispuesto por la <b>Ley Orgánica de Protección de Datos Personales (Art. 66)</b>, ' +
        'la Agencia de Regulación y Control Fito y Zoosanitario pone en su conocimiento que almacenará los datos ' +
        'que usted proporcione a través del Sistema SIFAE 2.0 y la aplicación SIFAE Móvil. En ese sentido, usted ' +
        'otorga su consentimiento <b>(Art. 8)</b> voluntario, libre, previo, expreso, específico, informado e inequívoco ' +
        'a la Agencia de Regulación y Control Fito y Zoosanitario para que realice el tratamiento <b>(Art. 33)</b>, en ' +
        'cualquiera de sus modalidades, medios o soportes, de la información y los datos personales y de identificación ' +
        'que usted haya proporcionado, para el uso exclusivo de la Agencia de Regulación y Control Fito y Zoosanitario, ' +
        'acorde a las competencias estatutarias de cada Coordinación. La información podrá ser compartida con otras ' +
        'entidades públicas, ministerios o entes rectores del Estado, de conformidad con las competencias estatutarias ' +
        'de cada Coordinación o de la institución, y en cumplimiento de sus funciones legales, técnicas y administrativas.</p>' +
        '</div>',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      confirmButtonText: 'Sí, estoy de acuerdo',
      cancelButtonText: 'Salir del sistema',
      timer: 120000 // 2 minutos
    }).then((result) => {
      if (result.isConfirmed) {
        const numeroIdentificacion = this.usuarioServicio.usuarioExterno
          ? this.usuarioServicio.usuarioExterno.numeroIdentificacion
          : this.usuarioServicio.usuarioInterno.numeroIdentificacion;

        const parametros = {
          numeroIdentificacion: numeroIdentificacion,
          tipo: 1
        };

        this.usuarioServicio.registrarUsuariosPoliticas(parametros)
          .subscribe({
            next: () => {},
            error: () => {}
          });
      } else {
        this.cerrarSesion();
      }
    });
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

    const area = this.listaAreas.find((item: any) => item.idSitio === Number(this.formularioBusqueda.value.inputIdSitio));
    this.sitioSeleccionado = area;
    this.isVisibleBotonDetalles = true;

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

    this.bovinoServicio.obtenerTotalesCatastroAnimales(parametros)
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
    if (this.totalBovinosConArete < 1) {
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

    this.bovinoServicio.filtrarAnimalesMovilizacion(parametros)
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
