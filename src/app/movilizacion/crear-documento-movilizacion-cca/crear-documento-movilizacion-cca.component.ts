import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { clavePublica } from '../../config/config';
import { validarCedula } from '../../config/utilitario';
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Categoria } from '../../modelos/categoria.modelo';
import { Bovino } from 'src/app/modelos/bovino.modelo';
import { Provincia } from '../../modelos/provincia.modelo';
import { Vehiculo } from '../../modelos/vehiculo.modelo';
import { Transportista } from '../../modelos/transportista.modelo';
import { MedioTransporte } from '../../modelos/medio-transporte.modelo';
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Area } from '../../modelos/area.modelo';
import { MatriculaVehiculo } from '../../modelos/matricula-vehiculo.modelo';
import { DatoLicencia } from '../../modelos/dato-licencia.modelo';
import { DatoDemografico } from '../../modelos/dato-demografico.modelo';
import { Usuario } from '../../modelos/usuario.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { MediosTransportesService } from '../../servicios/medios-transportes/medios-transportes.service';
import { TiposAreasService } from '../../servicios/tipos-areas/tipos-areas.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';

@Component({
  selector: 'app-crear-documento-movilizacion-cca',
  templateUrl: './crear-documento-movilizacion-cca.component.html'
})
export class CrearDocumentoMovilizacionCcaComponent implements OnInit {

  @ViewChild('fecha_movilizacion') fecha_movilizacion: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputTicket', { static: false }) inputTicket: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  formularioInfoSitioOrigen: FormGroup;
  formularioInfoSitioDestino: FormGroup;
  formularioBusqueda: FormGroup;
  //**** Cuerpo de modelos ****/
  vehiculoSeleccionado: Vehiculo = null;
  matriculaVehiculoSeleccionado: MatriculaVehiculo = null;
  datoLicenciaSeleccionado: DatoLicencia = null;
  origenSeleccionado?: Area = null;
  destinoSeleccionado?: Area = null;
  public totalAnimalesInd: any = {};
  //**** Listas ****/
  listaAnimalesDisponibles: Bovino[] = [];
  listaAnimalesMovilizar: Bovino[] = [];
  // Bovinos por Ticket
  bovinoTicket: Bovino[] = [];
  productorDestino: UsuarioExterno[] = [];
  listaProvincias: Provincia[];
  listaMediosTransportes: MedioTransporte[] = [];
  listaTiposAreas: any[] = [];
  listaVehiculos: Vehiculo[] = [];
  listaAreasOrigen?: Area[] = [];
  listaTransportistas: Transportista[];
  listaAreasDestinos?: Area[];
  listaHoras: number[] = [];
  listaMinutos: number[] = [];
  categorias: Categoria[] = [];
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  idUsuarioSolicitante: number;
  //**** Control de fechas en validez de certificado ****/
  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();
  tiempoMinimoHoras: number = 0;
  tiempoMinimoMinutos: number = 0;
  //**** Variables auxiliares ****/
  codigoAreaOrigen: string = '';
  medioTransporteSeleccionado: string;
  emailProductor: string = '';
  nombresProductor: string = '';
  msjTrayecto: SafeHtml = 'Esperando datos para calcular distancia y tiempo de recorrido...';
  recorridoPie: boolean = false;
  destino: string;
  centro: string;
  ipPublica: string = '';
  idUsuarioEstablecimiento: number;
  encriptar: any;
  //**** Totales de animales ****/
  // Agregados para movilizar
  ternerasAgregados: number = 0;
  ternerosAgregados: number = 0;
  vaconasAgregados: number = 0;
  toretesAgregados: number = 0;
  vacasAgregados: number = 0;
  torosAgregados: number = 0;
  bufalosHembrasAgregados: number = 0;
  bufalosMachosAgregados: number = 0;
  totalAnimalesAgregados: number = 0;
  //**** Manejo de visivilidad de frames ****/
  isVisibleBotonDetallesOrigen: boolean = false; // true = Visible
  isVisibleBotonDetallesDestino: boolean = false; // // true = Visible
  isVisibleOrigen: boolean = false; // true = Visible
  isVisibleDestino: boolean = false; // true = Visible
  isVisibleAnimales: boolean = false; // true = Visible
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private scriptSerivicio: ScriptsService,
    private provinciaServicio: ProvinciaService,
    private areaServicio: AreaService,
    public usuarioServicio: UsuarioService,
    private medioTransporteServicio: MediosTransportesService,
    private tipoAreaServicio: TiposAreasService,
    private certificadoMovilizacionServicio: CertificadoMovilizacionService,
    private bovinoServicio: BovinoService,
    private servicioDinardap: DinardapService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.fechaMaxima.setHours(23, 59, 59, 0);
    this.fechaMaxima.setDate(this.fechaMaxima.getDate() + 3);
    this.inicializarFormulario();
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit() {

    this.encriptar = new JSEncrypt();
    this.scriptSerivicio.inicializarScripts();
    this.inicializarFormulario();
    // Obtener la IP pública del cliente
    this.servicioDinardap.obtenerIpCliente().subscribe((res: any) => {
      this.ipPublica = res?.ip || 'IP no disponible';
    });

    this.crearTiempoValidez();
    this.destino = '';
    this.centro = '';
    this.medioTransporteSeleccionado = '';
    this.mapUsuarioEstablecimiento();
    this.obtenerMediosTransportes();
    this.obtenerTiposAreas();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
  }

  //**** Inicializa los formularios. ****/
  inicializarFormulario() {
    this.formularioInfoSitioOrigen = new FormGroup({
    });
    this.formularioInfoSitioDestino = new FormGroup({
    });

    this.formulario = new FormGroup({
      //Origen
      inputIdAreaOrigen: new FormControl(null, Validators.required),
      //Búsqueda de Tickets
      inputNumeroTicket: new FormControl(null),
      //Destino
      tipo_area: new FormControl(null, Validators.required),
      inputProvinciaDestino: new FormControl(null),
      inputIdAreaDestino: new FormControl(null, Validators.required),
      inputNombreReceptor: new FormControl(null),
      ruta: new FormControl('', Validators.maxLength(256)),
      //Solicitante
      tipo_solicitante: new FormControl(false),
      inputIdentificacionSolicitante: new FormControl(null),
      inputNombreSolicitante: new FormControl(null),
      //Transporte
      inputDetalleVehiculo: new FormControl(null),
      inputDatosTransportista: new FormControl(null),
      medio_transporte: new FormControl(null, Validators.required),
      id_vehiculo: new FormControl(null),
      placa: new FormControl(null),
      id_transportista: new FormControl(null),
      //Controles con validación especial fecha y hora
      fecha_hora_movilizacion: new FormControl(null, Validators.required),
      hora_movilizacion: new FormControl(null, Validators.required),
      horas: new FormControl(0),
      minutos: new FormControl(0)

    }, [
      this.placaObligatoria('placa', 'medio_transporte'),
      this.transportistaObligatorio('id_transportista', 'medio_transporte'),
      this.validarFechaMovilizacion('fecha_hora_movilizacion'),
      this.validarHoraMovilización('hora_movilizacion', 'fecha_hora_movilizacion'),
      this.tiempoValidez('horas', 'minutos', 'fecha_hora_movilizacion'),
      //Dejar comentado hasta que se regularice el tiempo de salida de las ferias
      //this.validarTiempoRecorrido('horas', 'minutos')
    ]);
  }

  //**** Buscar el id del establecimiento al que pertenece el usuario logueado ****/
  mapUsuarioEstablecimiento() {
    this.usuarioServicio.filtrarUsuariosCca({
      idUsuariosExternos: this.usuarioServicio.usuarioExterno.idUsuario,
      bandera: 'idUsuario'
    }).subscribe(
      (usuarios: UsuarioExterno[]) => {
        if (!usuarios.length) {
          this.router.navigate(['inicio']);
          return;
        }
        this.idUsuarioEstablecimiento = usuarios[0].idUsuariosExternosCca;
        this.obtenerCentrosConcentracionAnimales();
      },
      (error) => {
        this.router.navigate(['inicio']);
      }
    );
  }

  //**** Desplazar la página hasta el inicio después de emitir un documento ****//
  scrollTopTickets() {
    setTimeout(() => {
      const top = document.getElementById('top');
      if (top) {
        window.scrollTo({
          top: top.offsetTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  //**** Deplazarse hasta los tickets y enfocar el input ****//
  desplazarDivTickets() {
    setTimeout(() => {
      const top = document.getElementById('top');
      if (top) {
        window.scrollTo({
          top: top.offsetTop,
          behavior: 'smooth'
        });
        setTimeout(() => {
          this.limpiarInputTicket();
        }, 400);
      }
    }, 100);
  }

  //**** Limpiar y enfocar el input Tickets ****//
  limpiarInputTicket() {
    this.formulario.controls.inputNumeroTicket.setValue(null);
    setTimeout(() => {
      if (this.inputTicket?.nativeElement) {
        this.inputTicket.nativeElement.focus({ preventScroll: true });
      }
    }, 50);
  }

  //**** Crea los rangos de tiempos de validez ****//
  crearTiempoValidez() {
    this.listaHoras.push(0);
    this.listaMinutos.push(0);
  }

  //**** Obtener catálogo de provincias ****//
  cargarProvinciasPorPais(idPais: number) {
    this.provinciaServicio.getProvinciasPorPais(idPais)
      .subscribe(respuesta => this.listaProvincias = respuesta);
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Abrir Mapa de Google Maps ****/
  abrirGoogleMaps(lat: string, lng: string) {
    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  //**** Función para alternar la visibilidad del detalle del sitio ****/
  toggleVisibility(tipo: string) {
    if (tipo == 'origen') {
      this.isVisibleOrigen = !this.isVisibleOrigen;
    }
    if (tipo == 'destino') {
      this.isVisibleDestino = !this.isVisibleDestino;
    }
  }

  //**** Obtener medios de transporte ****//
  obtenerMediosTransportes() {
    this.medioTransporteServicio.obtenerMediosTransportes()
      .subscribe((respuesta: any) => {
        this.listaMediosTransportes = respuesta;
      });
  }

  //**** Valida la fecha seleccionada no sea menor a la actual ni mayor a 3 días ****//
  validarFechaMovilizacion(fechaMovilizacion: string) {
    return (formulario: FormGroup) => {
      const valorFechaMovilizacon: string = formulario.controls[fechaMovilizacion].value;
      if (valorFechaMovilizacon !== null) {
        // Obtenemos la fecha en ese formato porque nos devuelve un día menos y es por la hora
        const fechaSelecionada = new Date(`${valorFechaMovilizacon} 00:00:00`);
        const fechaMaxima = new Date();
        fechaMaxima.setHours(0, 0, 0, 0);
        fechaMaxima.setDate(fechaMaxima.getDate() + 3);
        if (fechaSelecionada.getTime() > fechaMaxima.getTime()) {
          return {
            fechaMayorPermitida: true
          };
        }
      }
      return null;
    };
  }

  //**** Valida la hora que no sea menor a las cinco de la mañana y mayor a las 18 horas ****//
  validarHoraMovilización(horaMovilizacion: string, fechaMovilizacion: string) {
    return (formulario: FormGroup) => {
      const valorHoraMovilizacion: string = formulario.controls[horaMovilizacion].value;
      const valorFechaMovilizacion: string = formulario.controls[fechaMovilizacion].value;
      if (valorHoraMovilizacion !== null && valorFechaMovilizacion !== null) {
        // Que la fecha y hora no sea menor a la actual
        const fechaHoraMovilizacion: Date = new Date(`${valorFechaMovilizacion} ${valorHoraMovilizacion}`);
        const fechaHoraActual = new Date();
        const fechaHoraMinima: Date = new Date(fechaHoraMovilizacion.getTime());
        fechaHoraMinima.setHours(5, 0, 0, 0);
        const fechaHoraMaxima: Date = new Date(fechaHoraMovilizacion.getTime());
        fechaHoraMaxima.setHours(18, 0, 0, 0);
        if (fechaHoraMovilizacion.getTime() < fechaHoraMinima.getTime() || fechaHoraMovilizacion.getTime() > fechaHoraMaxima.getTime()) {
          return {
            fechaRangoNoPermitido: true
          };
        }
        if (fechaHoraMovilizacion.getTime() < fechaHoraActual.getTime()) {
          return {
            fechaMenorActual: true
          };
        }
      }
      return null;
    };
  }

  //**** Valida que el tiempo de validez seleccionado, no sea menor al sugerido por el cálculo de la distancia ****//
  validarTiempoRecorrido(horas: string, minutos: string) {
    return (formulario: FormGroup) => {
      const valorHoras = Number(formulario.controls[horas]?.value) || 0;
      const valorMinutos = Number(formulario.controls[minutos]?.value) || 0;
      const totalMinutosSeleccionados = (valorHoras * 60) + valorMinutos;
      const totalMinutosRequeridos = (this.tiempoMinimoHoras * 60) + this.tiempoMinimoMinutos;
      // Validar si no se ingresó tiempo
      if (valorHoras === 0 && valorMinutos === 0) {
        return { tiempoRecorridoRequerido: true };
      }
      // Validar si el tiempo es insuficiente
      if (totalMinutosSeleccionados < totalMinutosRequeridos) {
        return { tiempoRecorridoInsuficiente: true };
      }
      return null;
    };
  }

  //**** Valida que Tiempo de validez del certificado de movilización no sea menor a 5 minutos ****//
  tiempoValidez(horas: string, minutos: string, fechaMovilizacion: string) {
    return (formulario: FormGroup) => {
      const valorHoras = formulario.controls[horas].value;
      const valorMinutos = formulario.controls[minutos].value;
      if (valorHoras === null || valorMinutos === null) {
        return {
          tiempoValidezRequerido: true
        };
      }
      if (Number(valorMinutos) < 5 && Number(valorHoras) === 0) {
        return {
          tiempoValidezValorMinimo: true
        };
      }
      return null;
    };
  }

  //**** Se ejecuta cuando se cambia la fecha y hora de movilización para actualizar validaciones ****//
  cambioFechaHoraMovilizacion() {
    if (this.formulario.value.fecha_hora_movilizacion === null || this.formulario.value.hora_movilizacion === null) {
      return;
    }
    this.formulario.controls.horas.setValue(null);
    this.formulario.controls.minutos.setValue(null);
    this.listaHoras = [];
    this.listaMinutos = [];
    if (this.formulario.errors?.fechaMenorActual) {
      return;
    }
    const fechaHoraElegida = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    if (fechaHoraElegida) {
      const fechaHoraInicio = new Date(fechaHoraElegida);
      fechaHoraInicio.setMinutes(fechaHoraInicio.getMinutes() + 5);
      const fechaHoraMaxima = new Date(fechaHoraElegida);
      fechaHoraMaxima.setHours(18, 30, 0, 0);
      const horasRestantes = Math.round((fechaHoraMaxima.getTime() - fechaHoraInicio.getTime()) / 3600000);
      const minutosRestantes = Math.round((fechaHoraMaxima.getTime() - fechaHoraInicio.getTime()) / 60000);

      if (horasRestantes <= 13) {
        for (let i = 0; i <= (horasRestantes - 1); i++) {
          this.listaHoras.push(i);
        }
      }
      if (horasRestantes === 1) {
        for (let i = 0; i <= minutosRestantes - 25; i++) {
          this.listaMinutos.push(i);
        }
      }
      else {
        for (let i = 0; i <= 59; i++) {
          this.listaMinutos.push(i);
        }
      }
    }
  }

  //**** Requiere la placa cuando se selecciona el vehículo ****//
  placaObligatoria(placa: string, medioTransporte: string) {
    return (formulario: FormGroup) => {
      const valorPlaca = formulario.get(placa)?.value;
      const valorMedio = formulario.get(medioTransporte)?.value;

      // Verificar si el medio de transporte requiere placa
      const medioRequierePlaca = this.listaMediosTransportes?.some(
        item => Number(item.idMedioTransporte) === Number(valorMedio) &&
          item.codigo === 'vehiculo'
      );

      if (medioRequierePlaca && !valorPlaca) {
        formulario.get(placa)?.setErrors({ placaObligatoria: true });
        formulario.get('inputDetalleVehiculo')?.setErrors({ placaObligatoria: true });
        return { placaObligatoria: true };
      }

      // Limpiar errores si la validación pasa
      formulario.get(placa)?.setErrors(null);
      formulario.get('inputDetalleVehiculo')?.setErrors(null);
      return null;
    };
  }

  //**** Requiere el transportista cuando se selecciona vehículo ****//
  transportistaObligatorio(transportista: string, medioTransporte: string) {
    return (formulario: FormGroup) => {
      const valorTransportista = formulario.get(transportista)?.value;
      const valorMedio = formulario.get(medioTransporte)?.value;

      const medioRequiereTransportista = this.listaMediosTransportes?.some(
        item => Number(item.idMedioTransporte) === Number(valorMedio) &&
          item.codigo === 'vehiculo'
      );

      if (medioRequiereTransportista && !valorTransportista) {
        formulario.get(transportista)?.setErrors({ transportistaObligatorio: true });
        formulario.get('inputDatosTransportista')?.setErrors({ transportistaObligatorio: true });
        return { transportistaObligatorio: true };
      }

      // Limpiar errores si la validación pasa
      formulario.get(transportista)?.setErrors(null);
      formulario.get('inputDatosTransportista')?.setErrors(null);
      return null;
    };
  }

  //**** Obtiene los tipos de áreas. ****//
  obtenerTiposAreas() {
    this.listaTiposAreas = [];
    this.mostrarCargando('Consultando tipos de destino...');
    this.tipoAreaServicio.obtenerTiposAreas()
      .subscribe((respuesta: any[]) => {
        this.listaTiposAreas = respuesta;
      });
  }

  //**** Limpia campos de destinatario al cambiar el tipo de sitio de destino ****//
  cambioTipoSitio(tipoSitio: string) {
    // Resetear centro cuando no es una opción de concentración
    if (tipoSitio !== 'fer_exp' && tipoSitio !== 'fer_com' && tipoSitio !== 'cen_hos') {
      this.centro = '';
    }
    // Si se selecciona concentración, resetear destino temporalmente
    if (tipoSitio === 'c_concentracion') {
      this.destino = 'c_concentracion';
    } else if (tipoSitio !== 'fer_exp' && tipoSitio !== 'fer_com' && tipoSitio !== 'cen_hos') {
      this.destino = tipoSitio;
    }
    this.limpiarDestinatario();
    // Establece el tipo de área
    this.formulario.controls.tipo_area.setValue(tipoSitio);
  }

  //**** Cargar los sitios de destino según la provincia. ****//
  cargarSitioDestino() {
    // Resetear valores del formulario
    this.formulario.controls.inputIdAreaDestino.setValue(null);
    this.listaAreasDestinos = [];
    // Obtener valores del formulario una sola vez
    const { tipo_area, inputProvinciaDestino } = this.formulario.value;
    // Mapeo de tipos de área a parámetros
    const tipoAreaParams = {
      'cen_faen': { codigoTipoArea: 'cen_faen', estado: 1, idProvinciaSitio: inputProvinciaDestino },
      'fer_exp': { codigoTipoArea: 'fer_exp', estado: 1, idProvinciaSitio: inputProvinciaDestino },
      'fer_com': { codigoTipoArea: 'fer_com', estado: 1, idProvinciaSitio: inputProvinciaDestino },
      'cen_hos': { codigoTipoArea: 'cen_hos', estado: 1, idProvinciaSitio: inputProvinciaDestino },
      'ex_pec_bov': { idUsuariosExternos: this.usuarioServicio.usuarioExterno.idUsuario, codigoTipoArea: 'ex_pec_bov', estado: 1 }
    };
    // Verificar si el tipo de área existe en el mapeo
    if (tipoAreaParams[tipo_area]) {
      this.obtenerAreasDestino(tipoAreaParams[tipo_area]);
    }
  }

  //**** Buscar áreas/sitios de destino ****//
  obtenerAreasDestino(parametros: any) {
    this.listaAreasDestinos = [];
    this.mostrarCargando('Buscando sitios de destino...');
    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((resultado: Area[]) => {
        Swal.close();
        this.listaAreasDestinos = resultado;
      });
  }

  //**** Limpiar la caja de texto de datos del vehículo al modificar la placa ****//
  limpiarDetalleVehiculo() {
    this.formulario.get('placa').reset();
    this.formulario.get('inputDetalleVehiculo').reset();
    this.formulario.get('placa').markAsTouched();
    this.formulario.updateValueAndValidity();
  }

  //**** Limpiar la caja de texto de datos del transportista al modificar la cédula ****//
  limpiarDatosTransportista() {
    this.formulario.get('id_transportista').reset();
    this.formulario.get('inputDatosTransportista').reset();
    this.formulario.get('id_transportista').markAsTouched();
    this.formulario.updateValueAndValidity();
  }

  //**** Buscar vehículos ****//
  buscarTransporte(parametro: string) {
    // Resetear valores iniciales
    this.matriculaVehiculoSeleccionado = null;
    this.vehiculoSeleccionado = null;
    this.formulario.controls.placa.reset();
    this.formulario.controls.inputDetalleVehiculo.setValue(null);

    parametro = parametro.toUpperCase().trim();
    if (!parametro) {
      Swal.fire('¡Advertencia!', 'Ingrese la placa del vehículo', 'warning');
      return;
    }
    // Validar formato de placa (ABC1234 o AB123C)
    const formatoValido = /^([A-Z]{3}\d{4}|[A-Z]{2}\d{3}[A-Z])$/.test(parametro);
    if (!formatoValido) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato de placa incorrecto',
        text: 'Los formatos válidos son: ABC1234 o AB123C',
        confirmButtonText: 'Ok'
      });
      return;
    }

    this.mostrarCargando('Obteniendo información del vehículo desde la base de datos de la ANT');
    // Llamar ambos servicios en paralelo
    forkJoin([
      this.servicioDinardap.obtenerMatriculaVehiculo(parametro),
      this.servicioDinardap.obtenerMarcaVehiculo(parametro)
    ]).subscribe({
      next: ([matriculas, vehiculos]) => {
        Swal.close();
        // Validar resultados combinados en un solo if
        if (!matriculas?.length || !vehiculos?.length) {
          Swal.fire('¡Advertencia!', 'No se encontraron registros para la placa ingresada', 'warning');
          return;
        }
        // Procesar resultados exitosos
        this.matriculaVehiculoSeleccionado = matriculas[0];
        this.vehiculoSeleccionado = vehiculos[0];
        this.formulario.controls.placa.setValue(parametro);

        const detalle = `${vehiculos[0].marca} ${matriculas[0].tipoVehiculo} ${matriculas[0].modelo}`;
        this.formulario.controls.inputDetalleVehiculo.setValue(detalle);

        Swal.fire({
          title: '¡Búsqueda exitosa!',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        Swal.close();
        const mensajeError = error?.error?.estado === 'ERR' ? error.error.mensaje : 'No se ha podido conectar con el servicio de la ANT';
        Swal.fire('¡Error!', mensajeError, 'error');
      }
    });
  }

  //**** Buscar transportista ****//
  buscarTransportista(ci: string) {
    // Resetear valores iniciales
    this.datoLicenciaSeleccionado = null;
    this.formulario.controls.id_transportista.reset();
    this.formulario.controls.inputDatosTransportista.reset();

    // Validar parámetro
    ci = ci.toUpperCase().trim();
    if (!ci) {
      Swal.fire('¡Advertencia!', 'Ingrese el número de identificación del transportista', 'warning');
      return;
    }

    this.mostrarCargando('Obteniendo información del transportista desde la base de datos de la ANT');

    // Consultar servicio
    this.servicioDinardap.obtenerDatosLicencia(ci).subscribe({
      next: (licencias: DatoLicencia[]) => {
        Swal.close();
        if (!licencias || licencias.length === 0) {
          Swal.fire('¡Advertencia!', 'No se encontraron licencias para el número de identificación proporcionado', 'warning');
          return;
        }

        this.datoLicenciaSeleccionado = licencias[0];
        this.formulario.controls.id_transportista.setValue(ci);
        this.formulario.controls.inputDatosTransportista.setValue(
          `${this.datoLicenciaSeleccionado.nombres}${this.datoLicenciaSeleccionado.apellidos ? ' ' + this.datoLicenciaSeleccionado.apellidos.trim() : ''}`
        );

        Swal.fire({
          title: '¡Búsqueda exitosa!',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });

      },
      error: (error) => {
        Swal.close();
        let errorMessage = 'No se ha podido conectar con el servicio de la ANT';
        if (error.status === 404) {
          errorMessage = 'El servicio no encontró resultados para el número de identificación ingresado';
        } else if (error.status >= 500) {
          errorMessage = 'El servicio de la ANT está temporalmente no disponible';
        }
        Swal.fire('¡Advertencia!', errorMessage, 'warning');
      }
    });
  }

  //**** Se ejecuta cuando cambia de medio de transporte ****//
  cambioMedioTransporte(idMedioTransporte: number) {
    this.formulario.controls.id_vehiculo.setValue(null);
    this.formulario.controls.id_transportista.setValue(null);
    this.limpiarDetalleVehiculo();
    this.limpiarDatosTransportista();

    if (idMedioTransporte) {
      this.listaMediosTransportes.forEach((item: MedioTransporte) => {
        if (Number(idMedioTransporte) === Number(item.idMedioTransporte)) {
          this.medioTransporteSeleccionado = item.codigo;
          this.calcularDistanciaTiempo();
        }
      });
    }
  }

  //**** Limpiar datos del destinatario ****//
  limpiarDestinatario() {
    this.productorDestino = [];
    this.listaAreasDestinos = [];
    this.destinoSeleccionado = null;
    this.formulario.controls.inputProvinciaDestino.setValue(null);
    this.formulario.controls.inputIdAreaDestino.setValue(null);
    this.formulario.controls.inputNombreReceptor.setValue('');
    this.isVisibleBotonDetallesDestino = false;
    this.isVisibleDestino = false;
    //limpiar solicitante
    this.formulario.controls.inputIdentificacionSolicitante.setValue(null);
    this.formulario.controls.tipo_solicitante.reset();
    this.limpiarSolicitante();
  }

  //**** Buscar productores de destino ****//
  buscarProductoresDestino(ci: string) {
    this.limpiarDestinatario();
    ci = ci.toUpperCase().trim();

    if (!ci) {
      Swal.fire('¡Advertencia!', 'Ingrese el número de identificación válido', 'warning');
      return;
    }

    this.mostrarCargando('Buscando destinatario...');

    this.usuarioServicio.filtrarUsuariosExternos({ numeroIdentificacion: ci }).subscribe({
      next: (respuesta: UsuarioExterno[]) => {
        this.productorDestino = respuesta;

        if (respuesta.length !== 1) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          return;
        }

        const usuario = respuesta[0];
        this.formulario.controls.inputNombreReceptor.setValue(usuario.nombres);

        const parametros = {
          codigoTipoArea: this.destino,
          idUsuariosExternos: usuario.idUsuariosExternos,
          estado: 1
        };

        this.listaAreasDestinos = [];
        this.areaServicio.obtenerAreasPorFiltro(parametros).subscribe({
          next: (resultado: Area[]) => {
            this.listaAreasDestinos = resultado;
            Swal.fire({
              title: '¡Búsqueda exitosa!',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000
            });
          },
          error: () => Swal.close()
        });
      },
      error: () => Swal.close()
    });
  }

  //**** Obtener centros de concentración de animales ****/
  obtenerCentrosConcentracionAnimales() {
    const parametros: Area = {
      idUsuariosExternos: this.idUsuarioEstablecimiento,
      codigoEstadoSitio: 'AC', //solo sitios en estado ACTIVO
      estado: 1
    };

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((areas: Area[]) => {
        this.listaAreasOrigen = areas.filter((item: any) => {
          return item.codigoTipoArea === 'fer_com' || item.codigoTipoArea === 'fer_exp' || item.codigoTipoArea === 'cen_hos'; // solo cca
        });
        Swal.close();
      });
  }

  //**** Método que permite cargar los datos del sitio de origen incluido el catastro ****/
  cambioAreaOrigen() {
    try {
      // Resetear valores previos
      this.origenSeleccionado = null;
      this.listaAnimalesDisponibles = [];
      this.listaAnimalesMovilizar = [];

      // Obtener ID del área de origen
      const idAreaOrigen = Number(this.formulario.value.inputIdAreaOrigen);
      if (!idAreaOrigen) return;

      // Buscar sitio en la lista
      const area = this.listaAreasOrigen.find((item: Area) => item.idArea === idAreaOrigen);

      if (!area) {
        Swal.fire('Error', 'Área de origen no encontrada', 'error');
        return;
      }

      this.emailProductor = area.email;
      this.nombresProductor = area.nombres;

      // Asignar valores
      this.origenSeleccionado = area;
      this.codigoAreaOrigen = area.codigoTipoArea;
      this.isVisibleBotonDetallesOrigen = true;
      this.isVisibleOrigen = true;
      this.isVisibleAnimales = true;
      this.calcularDistanciaTiempo();
      // Focus al buscador de identificadores
      this.desplazarDivTickets();

    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al cambiar el área de origen: ' + error, 'error');
    }
  }

  //**** Calcular distancia y tiempo de recorrido de un sitio a otro ****/
  calcularDistanciaTiempo(): void {
    // Lista de controles a verificar
    this.recorridoPie = false;
    const controlesRequeridos = [
      'inputIdAreaOrigen',
      'inputIdAreaDestino',
      'medio_transporte'
    ];

    // Verificar si algún control es null o está vacío
    const algunControlInvalido = controlesRequeridos.some(control => {
      const formControl = this.formulario.controls[control];
      return !formControl || !formControl.value;
    });

    if (algunControlInvalido) {
      return;
    }

    const R = 6371; // Radio de la Tierra en km
    const toRad = (angle: number) => (angle * Math.PI) / 180; // Convertir grados a radianes

    const lat1 = this.origenSeleccionado?.latitudSitio;
    const lon1 = this.origenSeleccionado?.longitudSitio;
    const lat2 = this.destinoSeleccionado?.latitudSitio;
    const lon2 = this.destinoSeleccionado?.longitudSitio;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km

    // Definir velocidad según el tipo de transporte
    let velocidad = this.medioTransporteSeleccionado === 'pie' ? 5 : 33.33;
    let medioTransporte = this.medioTransporteSeleccionado === 'pie' ? 'a pie' : 'en vehículo';

    // Verificar si es a pie y la distancia es mayor a 5 km
    if (this.medioTransporteSeleccionado === 'pie' && distance > 5) {
      const mensaje = `Su destino está a <b>${distance.toFixed(2)} Km</b>, y la distancia máxima permitida <b>${medioTransporte}</b> es de 5 Km.`;
      this.msjTrayecto = this.sanitizer.bypassSecurityTrustHtml(mensaje);
      this.recorridoPie = true;
      return;
    }

    const timeInHours = distance / velocidad;
    this.tiempoMinimoHoras = Math.floor(timeInHours);
    this.tiempoMinimoMinutos = Math.round((timeInHours - this.tiempoMinimoHoras) * 60);

    const mensaje = `Su destino está a <b>${distance.toFixed(2)} Km</b>, y <b>${medioTransporte}</b> le tomará un tiempo mínimo de <b>${this.tiempoMinimoHoras} horas ${this.tiempoMinimoMinutos} minutos</b>.`;
    this.msjTrayecto = this.sanitizer.bypassSecurityTrustHtml(mensaje);
  }

  //**** Se ejecuta cuando se cambia el sitio destino ****/
  cambioDestino() {
    this.listaAreasDestinos.forEach((itemArea: Area) => {
      if (Number(itemArea.idArea) === Number(this.formulario.value.inputIdAreaDestino)) {
        this.destinoSeleccionado = itemArea;
        this.isVisibleBotonDetallesDestino = true;
        this.isVisibleDestino = true;
        this.calcularDistanciaTiempo();
      }
    });
  }

  //**** Registrar un nuevo certificado de movilización ****/
  registrarCertificado() {

    this.formulario.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (!this.formulario.value.inputIdAreaOrigen) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione sitio de origen</li>";
    }

    if (this.listaAnimalesMovilizar.length === 0) {
      formularioInvalido = true;
      mensaje += "<li>Movilizar mínimo 1 animal</li>";
    }

    if (!this.formulario.value.tipo_area) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de destino</li>";
    }

    if (this.formulario.value.inputIdAreaDestino == null || this.formulario.value.inputIdAreaDestino == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione sitio de destino</li>";
    }

    if (this.formulario.value.tipo_solicitante == false) {
      if (!this.formulario.value.inputNombreSolicitante) {
        formularioInvalido = true;
        mensaje += "<li>Ingrese datos del solicitante</li>";
      }
    }

    if (!this.formulario.value.medio_transporte) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de transporte</li>";
    }

    const erroresPlaca = this.placaObligatoria('placa', 'medio_transporte')(this.formulario);

    if (erroresPlaca?.placaObligatoria) {
      formularioInvalido = true;
      mensaje += `<li>Ingrese datos del vehículo</li>`;
    }

    const erroresTansportista = this.transportistaObligatorio('id_transportista', 'medio_transporte')(this.formulario);

    if (erroresTansportista?.transportistaObligatorio) {
      formularioInvalido = true;
      mensaje += `<li>Ingrese datos del transportista</li>`;
    }

    if (!this.formulario.value.fecha_hora_movilizacion) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese fecha de movilización</li>";
    }

    const erroresHoraMovilizacion = this.validarHoraMovilización('hora_movilizacion', 'fecha_hora_movilizacion')(this.formulario);

    if (erroresHoraMovilizacion?.fechaRangoNoPermitido) {
      formularioInvalido = true;
      mensaje += `<li>Movilización permitida de 05H00 a 18H00</li>`;
    }

    if (erroresHoraMovilizacion?.fechaMenorActual) {
      formularioInvalido = true;
      mensaje += `<li>La fecha y hora seleccionada debe ser mayor a la fecha y hora actual</li>`;
    }

    const erroresTiempoValidez = this.tiempoValidez('horas', 'minutos', 'fecha_hora_movilizacion')(this.formulario);

    if (erroresTiempoValidez?.tiempoValidezRequerido) {
      formularioInvalido = true;
      mensaje += `<li>Ingrese tiempo de validez</li>`;
    }

    if (this.recorridoPie) {
      formularioInvalido = true;
      mensaje += "<li>Distancia máxima permitida de movilización a pie es de 5 Km</li>";
    }

    if (erroresTiempoValidez?.tiempoValidezValorMinimo) {
      formularioInvalido = true;
      mensaje += `<li>Tiempo de validez mínimo es de 5 minutos</li>`;
    }

    //Se queda comentado hasta que se regularicen los tiempos de salida en las ferias
    /*const erroresTiempo = this.validarTiempoRecorrido('horas', 'minutos')(this.formulario);

    if (erroresTiempo?.tiempoRecorridoInsuficiente) {
      formularioInvalido = true;
      mensaje += `<li>Tiempo de validez mínimo: ${this.tiempoMinimoHoras} horas ${this.tiempoMinimoMinutos} minutos</li>`;
    }*/

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire({
        title: '¡Advertencia!',
        html: `<div style="text-align: left;">${mensaje}</div>`,
        icon: 'warning'
      });
      return;
    }

    // Validamos la fecha fin de movilización no se pase de las 18h00
    const fechaFinMovilizacion = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaFinMovilizacion.setHours(fechaFinMovilizacion.getHours() + Number(this.formulario.value.horas),
      fechaFinMovilizacion.getMinutes() + Number(this.formulario.value.minutos), 0, 0);
    const fechaYHoraMaxima = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaYHoraMaxima.setHours(18, 0, 0, 0);

    if (!(fechaFinMovilizacion.getTime() <= fechaYHoraMaxima.getTime())) {
      Swal.fire('¡Advertencia!', 'El tiempo de validez supera a la fecha límite', 'warning');
      return;
    }

    // Creamos el objeto para enviarlo al Banckend
    const nuevoCertificado = new CertificadoMovilizacion();
    // Determinamos que tipo de emisión se realiza
    nuevoCertificado.idProductor = this.idUsuarioEstablecimiento;
    nuevoCertificado.idTipoEmision = 1; // Emitido por el Productor
    // Determinamos el tipo de periodo de validez del documento que se va a generar
    if (this.destino === 'fer_exp' || this.destino === 'fer_com' || this.destino === 'cen_hos') {
      nuevoCertificado.idTipoPeriodoValidez = 1; // Temporal
    } else {
      nuevoCertificado.idTipoPeriodoValidez = 2; // Definitivo
    }

    nuevoCertificado.fechaHoraMovilizacion = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`).toLocaleString('en-US');
    const fechaFin = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaFin.setHours(fechaFin.getHours() + Number(this.formulario.value.horas), fechaFin.getMinutes() + Number(this.formulario.value.minutos), 0, 0);
    nuevoCertificado.fechaHoraFinMovilizacion = fechaFin.toLocaleString('en-US');
    nuevoCertificado.idMedioTransporte = this.formulario.value.medio_transporte;
    nuevoCertificado.idProvinciaDestino = this.destinoSeleccionado.idProvinciaSitio;
    nuevoCertificado.idCantonDestino = this.destinoSeleccionado.idCantonSitio;
    nuevoCertificado.idParroquiaDestino = this.destinoSeleccionado.idParroquiaSitio;
    nuevoCertificado.idSitioDestino = this.destinoSeleccionado.idSitio;
    nuevoCertificado.idAreaDestino = this.destinoSeleccionado.idArea;
    nuevoCertificado.ruta = this.formulario.value.ruta.toUpperCase();
    nuevoCertificado.idAreaOrigen = this.formulario.value.inputIdAreaOrigen;
    nuevoCertificado.origenEmision = 1; // Emitido desde la web
    nuevoCertificado.ipPublica = this.ipPublica;

    if (this.codigoAreaOrigen === 'ex_pec_bov') {
      nuevoCertificado.emailProductor = this.emailProductor;
      nuevoCertificado.nombresProductor = this.nombresProductor;
    }

    // Agregamos la cantidad de animales por categoría según lo seleccionado
    nuevoCertificado.detalles = [];
    // Ordenar la lista
    this.listaAnimalesMovilizar.sort((a: Bovino, b: Bovino) => {
      // Función para verificar si tiene código de identificación
      const tieneCodigo = (bovino: Bovino) => {
        return bovino.codigoIdentificacion && bovino.codigoIdentificacion.trim() !== '';
      };
      // Función para obtener el nombre a comparar
      const obtenerNombre = (bovino: Bovino) => {
        return bovino?.nombreCategoria
          ? bovino.nombreCategoria.toLowerCase()
          : `${bovino.nombreComunTaxonomia} ${bovino.nombreSexo}`.toLowerCase();
      };
      // Primero ordenamos por presencia de código (los que tienen código primero)
      const aTieneCodigo = tieneCodigo(a);
      const bTieneCodigo = tieneCodigo(b);

      if (aTieneCodigo !== bTieneCodigo) {
        return aTieneCodigo ? -1 : 1;
      }
      // Si ambos tienen o no tienen código, ordenamos alfabéticamente
      const nombreA = obtenerNombre(a);
      const nombreB = obtenerNombre(b);

      return nombreA.localeCompare(nombreB);
    });
    // Procesar la lista ya ordenada
    this.listaAnimalesMovilizar.forEach((itemBovino: Bovino) => {
      const bovino = new Bovino();
      bovino.idBovino = itemBovino.idBovino;
      nuevoCertificado.detalles.push(bovino);
    });

    const medioTransporteSeleciconado = this.listaMediosTransportes.find((item: MedioTransporte) => {
      return Number(item.idMedioTransporte) === Number(nuevoCertificado.idMedioTransporte);
    });
    if (medioTransporteSeleciconado) {
      if (medioTransporteSeleciconado.codigo === 'vehiculo') {
        // Vehículo
        nuevoCertificado.vehiculo = {
          placa: this.formulario.value.placa.toUpperCase(),
          tipoTransporte: this.matriculaVehiculoSeleccionado?.tipoVehiculo,
          propietario: this.matriculaVehiculoSeleccionado?.propietario,
          marca: this.vehiculoSeleccionado?.marca,
          modelo: this.matriculaVehiculoSeleccionado?.modelo
        };
        // Transportista
        nuevoCertificado.transportista = {
          numeroIdentificacion: this.formulario.value.id_transportista,
          nombres: `${this.datoLicenciaSeleccionado?.nombres} ${this.datoLicenciaSeleccionado?.apellidos}`
        };
      }
    }

    //Se envía el idUsuario del solicitante (solo en ferias)
    nuevoCertificado.idSolicitante = this.idUsuarioSolicitante;

    Swal.fire({
      title: '¿Está seguro de generar este certificado de movilización?',
      text: 'Verifique que los datos ingresados sean correctos. Una vez generado, este documento cambiará de estado automáticamente y, tras su confirmación, no podrá ser anulado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, generar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Registrando certificado de movilización...');
        this.certificadoMovilizacionServicio.registrarNuevoCSMI(nuevoCertificado).subscribe(
          (respuesta) => {
            this.generarPDF(respuesta.idCertificadoMovilizacion);
          },
          (error) => {
            Swal.fire({
              title: '¡Advertencia!',
              html: error.error,
              icon: 'warning'
            });
          }
        );
      }
    });
  }

  /**** Generar el certificado de movilización en PDF ****/
  generarPDF(id: number) {
    this.mostrarCargando('Generando Documento PDF...');
    let codigoCertificado = '';

    this.certificadoMovilizacionServicio.obtenerCertificadosMovilizacion({ idCertificadoMovilizacion: id })
      .subscribe((certificados: CertificadoMovilizacion[]) => {
        this.listaCertificadosMovilizacion = certificados;
        if (this.listaCertificadosMovilizacion.length > 0) {
          certificados.forEach((certificado: any) => {
            codigoCertificado = certificado.codigo;
          });
        }
      });

    this.certificadoMovilizacionServicio.obtenerPdfCertificadoMovilizacion(id)
      .subscribe({
        next: (resp: any) => {
          Swal.close();
          // Convertir base64 a Blob
          const byteCharacters = atob(resp.contenido);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);

          // Configuración de SweetAlert con dos botones
          Swal.fire({
            title: `${codigoCertificado}`,
            html: 'Documento generado con éxito.<br><br><b>Seleccione una opción:</b>',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#ffc107',
            confirmButtonText: '<i class="fas fa-file-pdf"></i> Abrir PDF',
            cancelButtonText: '<i class="fas fa-download" style="color: black;"></i> <span style="color: black;">Descargar</span>',
            focusCancel: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
            preConfirm: () => {
              // Abrir PDF y cerrar el diálogo inmediatamente
              const newWindow = window.open(pdfUrl, '_blank');
              if (!newWindow || newWindow.closed) {
                Swal.showValidationMessage('El navegador bloqueó la ventana. Por favor habilite Pop-Ups.');
              }
            }
          }).then((result) => {
            if (result.isConfirmed) {
              // El usuario hizo clic en "Abrir PDF"
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Descargar PDF
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = codigoCertificado + '.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            // Liberar memoria
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
            // Limpiar el formulario y regresar a la sección de identificadores
            Swal.close();
            setTimeout(() => {
              this.limpiarFormulario();
              this.scrollTopTickets();
            }, 300);
          });
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el documento PDF: ' + err, 'error');
        }
      });
  }

  /**** Limpiar componentes de fecha y tiempo de movilización ****/
  limpiarfechasMovilizacion() {
    this.formulario.controls.fecha_hora_movilizacion.setValue(null);
    this.formulario.controls.hora_movilizacion.setValue(null);
    this.formulario.controls.horas.setValue(null);
    this.formulario.controls.minutos.setValue(null);
  }

  //**** Limpiar todo el formulario, excepto el área de origen seleccionada ****/
  limpiarFormulario() {
    this.listaAnimalesMovilizar = [];
    this.ternerasAgregados = 0;
    this.ternerosAgregados = 0;
    this.vaconasAgregados = 0;
    this.toretesAgregados = 0;
    this.vacasAgregados = 0;
    this.torosAgregados = 0;
    this.bufalosHembrasAgregados = 0;
    this.bufalosMachosAgregados = 0;
    this.totalAnimalesAgregados = 0;
    this.isVisibleBotonDetallesDestino = false;
    this.isVisibleDestino = false;
    this.formulario.controls.tipo_area.setValue(null);
    this.destino = '';
    this.limpiarDestinatario();
    this.formulario.controls.ruta.setValue('');
    this.formulario.controls.medio_transporte.setValue(null);
    this.medioTransporteSeleccionado = null;
    this.limpiarfechasMovilizacion();
    this.msjTrayecto = 'Esperando datos para calcular distancia y tiempo de recorrido...';
  }

  /**** Acción que se realizar al cancelar, limpiar y regresar a la sección de identificadores ****/
  botonCancelar() {
    this.limpiarFormulario();
    if (!this.formulario.value.inputIdAreaOrigen) {
      this.desplazarAlInicio();
    } else {
      this.scrollTopTickets();
    }
  }

  // 
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

  //**** Método para quitar animales del listado de movilización ****/
  quitarAnimal(id: number) {

    const animalIndex = this.listaAnimalesMovilizar.findIndex(item =>
      Number(id) === Number(item.idBovino)
    );

    if (animalIndex === -1) return;

    // Obtener el animal antes de modificar la lista
    const [animalRemovido] = this.listaAnimalesMovilizar.splice(animalIndex, 1);

    // Actualizar contadores de animales agregados
    this.quitarAgregarAnimales(-1, animalRemovido.idCategoriaAnimal);

    // Devolver el animal a la lista de disponibles
    this.listaAnimalesDisponibles.push(animalRemovido);
    this.limpiarInputTicket();
  }

  //**** Quitar o agregar animales del listado de movilización ****/
  quitarAgregarAnimales(cantidad: number, idCategoria: number) {
    const categorias: { [key: number]: { agregados: string } } = {
      1: { agregados: 'ternerasAgregados' },
      4: { agregados: 'ternerosAgregados' },
      2: { agregados: 'vaconasAgregados' },
      5: { agregados: 'toretesAgregados' },
      3: { agregados: 'vacasAgregados' },
      6: { agregados: 'torosAgregados' },
      7: { agregados: 'bufalosHembrasAgregados' },
      8: { agregados: 'bufalosMachosAgregados' }
    };

    const categoria = categorias[idCategoria];
    if (!categoria) return;

    if (cantidad > 0) {
      this[categoria.agregados]++;
      this.totalAnimalesAgregados++;
    } else {
      this[categoria.agregados]--;
      this.totalAnimalesAgregados--;
    }
  }

  //**** Define las categorías de acuerdo a la Taxonomía y Sexo del animal ****/
  private obtenerCategoria(bovino: Bovino): string {
    return bovino.nombreCategoria
      ? bovino.nombreCategoria
      : `${bovino.nombreComunTaxonomia} ${bovino.nombreSexo}`;
  }

  //**** Mensaje para Arete/Ticket no existente ****/
  mostrarTicketNoExiste(numeroTicket: string) {
    Swal.fire({
      title: '¡Atención!',
      html: `<br>Arete/Ticket <b>${numeroTicket}</b> no existe`,
      icon: 'info'
    });
    this.limpiarInputTicket();
  }

  // Cambiar cadenas a tipo título (primera letra mayúscula)
  private formatTitleCase(text: string): string {
    return text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Formato de mensaje de advertencia cuando un animal no se encuentra disponible en el sitio.
  mostrarMensajeTicket(bovino: Bovino, categoria: string, identificadorBuscado: string) {
    const badgeClassID = bovino?.codigoIdentificacion ? 'badge-amarillo' : 'badge-secondary';
    const ubicacion = bovino.nombreEstadoUbicacion.toLowerCase();
    const badgeClassUbicacion = ubicacion === 'en sitio' ? 'badge-info' : 'badge-warning';
    Swal.fire({
      title: '¡Advertencia!',
      html: `<br>El animal no está disponible en este sitio<br><br>
             <div style="text-align: left;">
             <i class="fas fa-tag"></i> <b>Arete/Ticket:</b> <span class="badge rounded-pill ${badgeClassID}">${identificadorBuscado}</span> &rarr; <span style="font-size: 0.9em;">${categoria}</span><br>
             <i class="fas fa-flag"></i> <b>Tránsito:</b> <span class="badge rounded-pill ${badgeClassUbicacion}">${ubicacion}</span><br>
             <i class="fas fa-map-marker-alt"></i> <b>Sitio actual:</b> <span style="font-size: 0.8em;"> ${bovino.nombreAreaActual.toUpperCase()}</span><br>
             <i class="fas fa-id-card"></i> <b>Identificación:</b> <span style="font-size: 0.9em;"> ${bovino.numeroIdentificacionUsuarioActual}</span><br>
             <i class="fas fa-user"></i> <b>Propietario:</b> <span style="font-size: 0.9em;">${this.formatTitleCase(bovino.nombresUsuarioActual)}</span><br>
             </div>`,
      icon: 'warning'
    });
  }

  //**** Asignar id del productor de destino al solicitante cuando sea el mismo ****/
  cambiarTipoSolicitante(): void {
    this.formulario.controls.inputIdentificacionSolicitante.setValue(null);
    this.limpiarSolicitante();
    const checkboxMarcado = this.formulario.get('tipo_solicitante')?.value;
    if (checkboxMarcado) {
      if (this.productorDestino.length > 0) {
        const usuarioEncontrado = this.productorDestino[0];
        this.idUsuarioSolicitante = usuarioEncontrado.idUsuariosExternos; // Asigna ID
      }
    }
  }

  // Limpiar datos del solicitante
  limpiarSolicitante() {
    this.idUsuarioSolicitante = null;
    this.formulario.controls.inputNombreSolicitante.setValue(null);
  }

  //**** Método para buscar usuarios externos, estén o no en la base de datos. (se usa solo para el solicitante) ****/
  buscarUsuarioExterno() {
    const ci = this.formulario.value.inputIdentificacionSolicitante.toUpperCase().trim();
    if (ci.length < 10) {
      Swal.fire('¡Advertencia!', 'Ingrese un número de identificación válido', 'warning');
      return;
    }

    this.limpiarSolicitante();
    // Primero busca en la base de datos local
    this.mostrarCargando('Buscando en la base de datos...');
    this.usuarioServicio.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    }).subscribe(
      (respuesta: UsuarioExterno[]) => {
        if (respuesta.length === 1) {
          this.idUsuarioSolicitante = respuesta[0].idUsuariosExternos;
          this.formulario.controls.inputNombreSolicitante.setValue(respuesta[0].nombres);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000
          });
        } else {
          // Como solo se consultan cédulas nacionales, validar que tenga 10 dígitos
          if (ci.length !== 10) {
            Swal.fire('¡Advertencia!', 'Ingrese un número de identificación válido [DINARP]', 'warning');
            return;
          }
          if (!validarCedula(ci)) return;
          // Si no existe en la base de datos local, buscar con el servicio web de DINARP
          this.mostrarCargando('Consultando datos en Registro Civil...');
          this.servicioDinardap.obtenerDatosDemograficos(ci).subscribe(
            (datosDemograficos: DatoDemografico[]) => {
              if (datosDemograficos && datosDemograficos.length > 0) {
                const datoDemografico = datosDemograficos[0];
                this.formulario.controls.inputNombreSolicitante.setValue(datoDemografico.nombre);
                // Registrar usuario automáticamente con datos del servicio web
                this.encriptar.setPublicKey(clavePublica);
                const claveEncriptada = this.encriptar.encrypt('12345678Agro');
                const usuario = new Usuario();
                usuario.tipoIdentificacion = 1;
                usuario.numeroIdentificacion = ci;
                usuario.nombres = datoDemografico.nombre.toUpperCase().trim();
                usuario.apellidos = datoDemografico.nombre.toUpperCase().trim();
                usuario.email = 'info@noset.com';
                usuario.contraseña = claveEncriptada;

                this.mostrarCargando('Registrando nuevo usuario...');
                this.usuarioServicio.registrarUsuarioExternoVacunacion(usuario).subscribe(
                  (respuestaRegistro: any) => {
                    if (respuestaRegistro.estado === 'ERR') {
                      Swal.fire('Error', respuestaRegistro.mensaje, 'error');
                      return;
                    }
                    if (respuestaRegistro.estado === 'OK' && respuestaRegistro.resultado?.idUsuarioExterno) {
                      this.idUsuarioSolicitante = respuestaRegistro.resultado.idUsuarioExterno;
                    }
                    Swal.fire({
                      title: '¡Éxito!',
                      text: 'Usuario registrado con datos del Registro Civil',
                      icon: 'success',
                      showConfirmButton: false,
                      timer: 1500
                    });
                  },
                  (errorRegistro) => {
                    Swal.fire('Error', 'Ocurrió un error al registrar el usuario: ' + errorRegistro, 'error');
                  }
                );
              } else {
                Swal.fire({
                  position: 'center',
                  icon: 'warning',
                  title: 'No se encontraron registros locales ni en Registro Civil',
                  showConfirmButton: true
                });
              }
            },
            (errorDINARP) => {
              Swal.fire('Error', 'Ocurrió un error al consultar el Registro Civil: ' + errorDINARP, 'error');
            }
          );
        }
      },
      (errorLocal) => {
        Swal.fire('Error', 'Ocurrió un error al buscar en registros locales: ' + errorLocal, 'error');
      }
    );
  }

  //**** Método para agregar animales al listado de movilización ****/
  agregarAnimal() {
    const inputValor = this.formulario.value.inputNumeroTicket?.toUpperCase().trim();

    if (!inputValor) {
      Swal.fire('¡Atención!', 'Ingrese número de Arete/Ticket', 'info');
      this.limpiarInputTicket();
      return;
    }

    // Validar límite de animales
    if (this.listaAnimalesMovilizar.length >= 30) {
      Swal.fire('¡Advertencia!', 'El número máximo permitido a movilizar es de 30 animales', 'warning');
      return;
    }

    // Verificar si ya está en la lista
    const yaRegistrado = this.listaAnimalesMovilizar.some((item: Bovino) =>
      (item.codigoIdentificacion && item.codigoIdentificacion === inputValor) ||
      Number(item.idBovino) === Number(inputValor)
    );

    if (yaRegistrado) {
      Swal.fire({
        title: '¡Atención!',
        html: `<br></i>Arete/Ticket <b>${inputValor}</b> registrado en:<br><br>
               <i class="fas fa-list-ol"></i> Lista de movilización actual`,
        icon: 'info'
      });
      this.limpiarInputTicket();
      return;
    }

    // Buscar directamente en la base de datos
    this.buscarAnimalEnBaseDatos(inputValor);
  }

  //**** Buscar animal directamente en base de datos ****/
  buscarAnimalEnBaseDatos(inputValor: string) {
    const buscarPorArete = !/^\d+$/.test(inputValor) || inputValor.startsWith('EC');
    this.mostrarCargando('Buscando información del Arete/Ticket...');

    // Buscar en animales disponibles
    const parametros = new Bovino();
    parametros.idUsuarioActual = this.idUsuarioEstablecimiento;
    parametros.codigoEstadoRegistro = 'DISP';
    parametros.codigoEstadoAnimal = 'vivo';
    parametros.codigoEstadoUbicacion = 'SIT';
    parametros.idAreaActual = this.formulario.value.inputIdAreaOrigen;

    // Asignar el parámetro según el tipo de búsqueda
    if (buscarPorArete) {
      parametros.codigoIdentificacion = inputValor;
    } else {
      parametros.idBovino = Number(inputValor);
    }

    this.bovinoServicio.filtrarAnimalesMovilizacionFerias(parametros).subscribe({
      next: (bovinos: Bovino[]) => {
        Swal.close();
        if (bovinos.length > 0) {
          // Encontrado en disponibles - agregar a la lista
          const bovinoEncontrado = bovinos[0];
          this.quitarAgregarAnimales(1, bovinoEncontrado.idCategoriaAnimal);
          this.listaAnimalesMovilizar.unshift(bovinoEncontrado);

          if (this.listaAnimalesMovilizar.length >= 30) {
            Swal.fire('¡Advertencia!', 'Has llegado al máximo de 30 animales permitidos para movilización', 'warning');
          }

          this.limpiarInputTicket();
          return;
        }

        // Si no se encuentra en disponibles, buscar información del ticket
        this.mostrarCargando('Buscando información adicional del animal...');

        const filtro: any = {
          codigoEstadoAnimal: 'vivo',
          codigoEstadoRegistro: 'DISP'
        };

        // Asignar el filtro según el tipo de búsqueda
        if (buscarPorArete) {
          filtro.codigoIdentificacion = inputValor;
        } else {
          filtro.idBovino = inputValor;
        }

        this.bovinoServicio.filtrarBovinosTicket(filtro).subscribe({
          next: (infoTicket: Bovino[]) => {
            Swal.close(); // Cerrar loading

            if (infoTicket.length === 0) {
              this.mostrarTicketNoExiste(inputValor);
              this.limpiarInputTicket();
              return;
            }

            // Procesar el animal encontrado para informar al usuario
            const bovinoEncontrado = infoTicket[0];
            this.procesarAnimalEncontrado(bovinoEncontrado, inputValor);
          },
          error: (err) => {
            Swal.close();
            Swal.fire('Error', `Ocurrió un error al buscar: ${err}`, 'error');
            this.limpiarInputTicket();
          }
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire('Error', `Ocurrió un error al buscar: ${err}`, 'error');
        this.limpiarInputTicket();
      }
    });
  }

  //**** Validar existencia del animal en cuanto a ubicación y estado ****/
  procesarAnimalEncontrado(bovino: Bovino, identificadorBuscado: string) {
    const categoria = this.obtenerCategoria(bovino);
    const areaOrigen = Number(this.formulario.value.inputIdAreaOrigen);
    const estadoUbicacion = bovino.nombreEstadoUbicacion.toUpperCase();
    // Valida si NO está disponible (área diferente o en movimiento)
    if (bovino.idAreaActual !== areaOrigen || estadoUbicacion === "MOVIMIENTO") {
      this.mostrarMensajeTicket(bovino, categoria, identificadorBuscado);
      this.limpiarInputTicket();
      return;
    }
  }

}