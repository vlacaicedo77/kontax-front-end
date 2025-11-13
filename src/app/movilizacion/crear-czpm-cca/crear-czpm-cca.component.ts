import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Bovino } from 'src/app/modelos/bovino.modelo';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';
import { Provincia } from '../../modelos/provincia.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { MediosTransportesService } from '../../servicios/medios-transportes/medios-transportes.service';
import { TiposAreasService } from '../../servicios/tipos-areas/tipos-areas.service';
//import { VehiculoService } from '../../servicios/vehiculo/vehiculo.service';
import { Vehiculo } from '../../modelos/vehiculo.modelo';
import { Transportista } from '../../modelos/transportista.modelo';
import { MedioTransporte } from '../../modelos/medio-transporte.modelo';
import Swal from 'sweetalert2';
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { TipoPeriodoValidez } from '../../modelos/tipo-periodo-validez.modelo';
import { TipoPeriodoValidezService } from '../../servicios/tipo-periodo-validez/tipo-periodo-validez.service';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import { TipoEmisionCertificadoService } from '../../servicios/tipo-emision-certificado/tipo-emision-certificado.service';
import { TipoEmisionCertificado } from '../../modelos/tipo-emision-certificado.modelo';
import { BovinoVacunadoService } from '../../servicios/bovino-vacunado.service';
import { BovinoCertificadoVacunacion } from '../../modelos/bovino-certificado-vacunacion.modelo';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Area } from '../../modelos/area.modelo';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { Router } from '@angular/router';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { MatriculaVehiculo } from '../../modelos/matricula-vehiculo.modelo';
import { DatoLicencia } from '../../modelos/dato-licencia.modelo';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service'
import { CrearUsuarioExternoService } from '../../usuarios-externos/crear-usuario-externo/servicios/crear-usuario-externo.service';
import { DetalleCertificadoMovilizacion } from 'src/app/modelos/detalle-certificado-movilizacion.modelo';

@Component({
  selector: 'app-crear-czpm-cca',
  templateUrl: './crear-czpm-cca.component.html',
  styles: []
})


  

export class CrearCzpmCcaComponent implements OnInit {

   @ViewChild('fecha_movilizacion') fecha_movilizacion: ElementRef;
   
  mostrarCorreo: boolean = false;
  listaProductores: UsuarioExterno[] = [];
  listaUsuariosCca: UsuarioExterno[] = [];
  //usuarioSeleccionado: UsuarioExterno = null;
  usuarioSolicitanteSeleccionado: UsuarioExterno;
  listaOtrosProductores: UsuarioExterno[] = [];
  listaSolicitantes: UsuarioExterno[] = [];
  usuarioActual: number;
  destino: string;
  centro: string;
  //provinciaID: number;
  listaProvincias: Provincia[];
  //listaProvinciasD: Provincia[];
  listaDestinos: Area[];
  usuarioExterno: Usuario;
  listaMediosTransportes: MedioTransporte [] = [];
  listaTiposAreas: any[] = [];
  formulario: FormGroup;
  listaVehiculos: Vehiculo[] = [];
  listaTransportistas: Transportista[];
  medioTransporteSeleccionado: string;
  tiposEmisionesCertificados: TipoEmisionCertificado[] = [];
  tiposPeriodosValidez: TipoPeriodoValidez [] = [];
  predioArrendado: boolean;
  destinoSeleccionado?: Area = null;
  listaAreaOrigen?: Area[] = [];

  // Animales vacunados disponibles
  listaBovinosVacunadosDisponibles: BovinoCertificadoVacunacion[] = [];
  listaBovinosAgregados: BovinoCertificadoVacunacion[] = [];
  // Catastro de nacimientos disponibles
  listaNacimientosDisponibles: Bovino[] = [];
  listaNacimientosAgregados: Bovino[] = [];
  // Bovinos por Ticket
  BovinoTicket: Bovino[] = [];
  // Bovinos por Ticket
  CertificadoTicket: DetalleCertificadoMovilizacion[] = [];

  listaHoras: number[] = [];
  listaMinutos: number[] = [];
  horaInicio: number = 0;
  horaFin: number = 13;
  minutoInicio: number = 0;
  minutoFin: number = 59;

  vehiculoSeleccionado: Vehiculo;
  matriculaVehiculoSeleccionado: MatriculaVehiculo;
  datoLicenciaSeleccionado: DatoLicencia;

  origenSeleccionado?: Area = null;
  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();
  listaBovinosTickets: BovinoCertificadoVacunacion[] = [];
  listaBovinosTicketsD: Bovino[] = [];

  //Variables auxiliares
  idSolicitanteAux: number;
  idProductorAux: number;

  constructor(
    private scriptSerivicio: ScriptsService,
    private _provinciaService: ProvinciaService,
    private areaServicio: AreaService,
    public usuarioServicio: UsuarioService,
    private servicioBovinoVacunado: BovinoVacunadoService,
    private medioTransporteServicio: MediosTransportesService,
    private tipoAreaServicio: TiposAreasService,
    //private vehiculoServicio: VehiculoService,
    private tipoEmisionCertificadoServicio: TipoEmisionCertificadoService,
    private tipoPeriodoValidezServicio: TipoPeriodoValidezService,
    private certificadoMovilizacionServicio: CertificadoMovilizacionService,
    private servicioBovino: BovinoService,
    private servicioVisorPdf: VisorPdfService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
    private enrutador: Router,
    private servicioDinardap: DinardapService
  ) {
    this.fechaMaxima.setHours(23, 59, 59, 0);
    this.fechaMaxima.setDate(this.fechaMaxima.getDate() + 1);
    this.inicializarFormulario();
  }

  ngOnInit() {
    
    this.servicioVisorPdf.notificacion.subscribe( (valor: any) => {
      if ( valor === 'cerrar') {
        this.limpiarFomulario();

        // Scroll hasta el div solicitado.
        let top = document.getElementById('top');
        if (top !== null) {
          top.scrollIntoView();
          top = null;
        }
      }
    });

    this.predioArrendado = false;
    this.crearTiempoValidez();
    
    this.destino = '';
    this.centro = '';
    this.medioTransporteSeleccionado = '';

    if (this.usuarioServicio.usuarioExterno) {
      this.cargarCentrosConcentracion();
    }

    this.obtenerTiposPeriodosValidez();
    this.obtenerTiposEmisionesCSMI();
    this.obtenerMediosTransportes();
    this.obtenerTiposAreas();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.scriptSerivicio.inicializarScripts();
  }

  // Método que inicializa el formulario.
  inicializarFormulario(){
    this.formulario = new FormGroup({
      //propietario_animales: new FormControl(null, Validators.required),
      tipo_area: new FormControl(null, Validators.required),
      provincia_destino: new FormControl(null),
      id_area_destino: new FormControl(null, Validators.required),
      fecha_hora_movilizacion: new FormControl(null, Validators.required),
      hora_movilizacion: new FormControl(null, Validators.required),
      medio_transporte: new FormControl(null, Validators.required),
      id_vehiculo: new FormControl(null),
      placa: new FormControl(null),
      marca_vehiculo: new FormControl(null),
      id_transportista: new FormControl(null),
      nombre_productor: new FormControl(null),
      ruta: new FormControl('', Validators.maxLength(256)),
      area_origen: new FormControl(null, Validators.required),
      horas: new FormControl(0),
      minutos: new FormControl(0),
      tickets: new FormControl(false),
      solicitante_tipo: new FormControl(false),
      ci_solicitante: new FormControl(null),
      ci_productor: new FormControl(null),
      nombre_solicitante: new FormControl(null),
      numero_ticket: new FormControl(null),
    }, [
      this.placaObligatoria('placa', 'medio_transporte'),
      this.transportistaObligatorio('id_transportista', 'medio_transporte'),
      this.validarFechaMovilizacion('fecha_hora_movilizacion'),
      this.validarHoraMovilización('hora_movilizacion', 'fecha_hora_movilizacion'),
      this.tiempoValidez('horas', 'minutos', 'fecha_hora_movilizacion')
    ]);
  }

  /**
   * Limpiar formulario para la emisión de un nuevo CZPM-M
   */
   limpiarFomulario() {
    this.listaBovinosTickets = [];
    this.listaBovinosTicketsD = [];
    this.listaBovinosAgregados = [];
    this.listaNacimientosAgregados = [];
    this.cambioAreaOrigen();
    this.destino = '';
    this.centro = '';
    this.formulario.controls.ruta.setValue(null);
    this.limpiarOtrosProductores();
    this.formulario.controls.ci_productor.setValue(null);
    this.limpiarSolicitantes();
    this.formulario.controls.solicitante_tipo.reset();
    this.formulario.controls.ci_solicitante.setValue(null);
    this.formulario.controls.medio_transporte.reset();
    this.limpiarfechasMovilizacion();
    this.medioTransporteSeleccionado = null;
   }

   /**
   * Limpiar fechas movilización
   */

    limpiarfechasMovilizacion(){
      this.formulario.controls.hora_movilizacion.setValue(null);
      this.formulario.controls.horas.setValue('0');
      this.formulario.controls.minutos.setValue('0');
      this.formulario.controls.fecha_hora_movilizacion.reset();
     }

  /**
   * Busca a un usuario de centro de concentración animal
   */
   cargarCentrosConcentracion() {
    Swal.fire({
      title: 'Cargando Centros de Concentración...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this.usuarioServicio.filtrarUsuariosCca({
      idUsuariosExternos: this.usuarioServicio.usuarioExterno.idUsuario,
      bandera: 'idUsuario'
    })
    .subscribe( (usuarios: UsuarioExterno[]) => {
      this.listaUsuariosCca = usuarios;

      const idUsuarioCca = new UsuarioExterno();
      this.listaUsuariosCca.forEach( (item: UsuarioExterno) => {
        idUsuarioCca.idUsuariosExternosCca = item.idUsuariosExternosCca;
      });

      // Se asigna el Id del usuario del CCA como usuario actual
      this.usuarioActual = idUsuarioCca.idUsuariosExternosCca;
      //this.formulario.controls.propietario_animales.setValue(this.usuarioActual);
      this.obtenerSitiosProductor({
        idUsuariosExternos: this.usuarioActual,
        codigoEstadoSitio: "AC",
        estado: "1"
      });

      Swal.close();
    });
  }

  /**
   * Carga todos los animales del catastro
   */
   cambioAreaOrigen(){
    this.origenSeleccionado = null;
    // Buscamos el área seleccionada para mostrarla
    this.listaAreaOrigen.forEach( (itemArea: Area) => {
      if ( Number(itemArea.idArea) === Number(this.formulario.value.area_origen) ) {
        this.origenSeleccionado = itemArea;
      }
    });

    this.cambioTickets();
    
    if ( this.usuarioActual === null ) {
      Swal.fire('¡Advertencia!', 'No existe un usuario ganadero seleccionado','warning');
      this.formulario.controls.area_origen.reset();
      return;
    }
    
    this.cargarCatastroVacunados();
    this.cargarCatastroNacimientos();
  }

   /**
   * Obtenemos los terneros no vacunados para enviarlos al centro de faenamiento.
   */
    cargarCatastroVacunados(){
       Swal.fire({
         title: 'Cargando catastro de animales vacunados...',
         confirmButtonText: '',
         allowOutsideClick: false,
         onBeforeOpen: () => {
           Swal.showLoading();
         }
       });
       this.servicioBovinoVacunado.obtenerBovinosVacunadosWs({
        idUsuarioActual: this.usuarioActual,
        idAreaActual: this.formulario.value.area_origen,
        estadoUbicacion: 'SIT'
      })

      .subscribe( (listaBovinosVacunados: BovinoCertificadoVacunacion[]) => {
        this.listaBovinosVacunadosDisponibles = listaBovinosVacunados;
        Swal.close();
      });
     }

   /**
   * Obtenemos los terneros no vacunados para enviarlos al centro de faenamiento.
   */
    cargarCatastroNacimientos(){
      Swal.fire({
        title: 'Cargando catastro de nacimientos...',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.servicioBovino.obtenerBovinosNacimientos({
        estadoUbicacion:'SIT',
        idAreaActual: this.formulario.value.area_origen
      })
      .subscribe( ( listaBovinosNacimientos: Bovino[]) => {
        this.listaNacimientosDisponibles = listaBovinosNacimientos;
        Swal.close();
      });
    }


  /**
   * Crea los rangos de tiempos de validez
   */
  crearTiempoValidez(){
    this.listaHoras.push(0);
    this.listaMinutos.push(0);
  }

  /**
   * Método que se ejecuta para verificar si el solicitante es el productor de destino.
   */
   cambiarTipoSolicitante(){
    this.usuarioSolicitanteSeleccionado = null;
    this.listaSolicitantes = [];
    this.formulario.controls.ci_solicitante.setValue(null);
    this.formulario.controls.nombre_solicitante.reset();
    this.idSolicitanteAux = null;

    if(this.formulario.value.solicitante_tipo)
    {
        this.listaSolicitantes = this.listaOtrosProductores;
        this.idSolicitanteAux = this.idProductorAux;
        this.cambioSolicitante();
    }
  }

  /**
   * Se ejecuta cuando se selecciona a un reeptor.
   */
   cambioSolicitante(){
    this.listaSolicitantes.forEach( (item: UsuarioExterno) => {
      if (Number(item.idUsuariosExternos) === Number(this.idSolicitanteAux)) {
        this.usuarioSolicitanteSeleccionado = item;
      }
    });
  }

  /**
   * Valida la fecha seleccionada no sea menor a la actual ni mayor a 5 días
   * @param fechaMovilizacion 
   * @returns 
   */
  validarFechaMovilizacion(fechaMovilizacion: string){
    return (formularioCsmi: FormGroup) => {
      const valorFechaMovilizacon: string = formularioCsmi.controls[fechaMovilizacion].value;
      if ( valorFechaMovilizacon !== null ) {
        // Obtenemos la fecha en ese formato porque nos devuelve un día menos y es por la hora
        const fechaSelecionada = new Date(`${valorFechaMovilizacon} 00:00:00`);
        const fechaMaxima = new Date();
        fechaMaxima.setHours(0, 0 , 0 , 0);
        fechaMaxima.setDate(fechaMaxima.getDate() + 4);
        if ( fechaSelecionada.getTime() > fechaMaxima.getTime() ) {
          console.log(' Fecha mayor a la permitida');
          return {
            fechaMayorPermitida: true
          };
        }
      }
      return null;
    };
  }
  /**
   * Valida la hora que no sea menor a las cinco de la mañana y mayor a las 18 horas
   * @param horaMovilizacion 
   * @returns 
   */
  validarHoraMovilización(horaMovilizacion: string, fechaMovilizacion: string){
    return (formularioCsmi: FormGroup) => {
      const valorHoraMovilizacion: string = formularioCsmi.controls[horaMovilizacion].value;
      const valorFechaMovilizacion: string = formularioCsmi.controls[fechaMovilizacion].value;
      if ( valorHoraMovilizacion !== null && valorFechaMovilizacion !== null ) {
        // Que la fecha y hora no sea menor a la actual
        const fechaHoraMovilizacion: Date = new Date(`${valorFechaMovilizacion} ${valorHoraMovilizacion}`);
        const fechaHoraActual = new Date();
        const fechaHoraMinima: Date = new Date(fechaHoraMovilizacion.getTime());
        fechaHoraMinima.setHours(5, 0, 0, 0);
        const fechaHoraMaxima: Date = new Date(fechaHoraMovilizacion.getTime());
        fechaHoraMaxima.setHours(18, 0, 0, 0);
        if ( fechaHoraMovilizacion.getTime() < fechaHoraMinima.getTime() || fechaHoraMovilizacion.getTime() > fechaHoraMaxima.getTime() ) {
          return {
            fechaRangoNoPermitido: true
          };
        }
        if ( fechaHoraMovilizacion.getTime() < fechaHoraActual.getTime() ) {
          return {
            fechaMenorActual: true
          };
        }
      }
      return null;
    };
  }

  /**
   * Tiempo de validez del certificado de movilización
   */
  tiempoValidez(horas: string, minutos: string, fechaMovilizacion: string){
    return (formularioCsmi: FormGroup) => {
      const valorHoras = formularioCsmi.controls[horas].value;
      const valorMinutos = formularioCsmi.controls[minutos].value;
      if ( valorHoras === null || valorMinutos === null ){
        return {
          tiempoValidezRequerido: true
        };
      }
      if ( Number(valorMinutos) < 5 && Number(valorHoras) === 0 ) {
        return {
          tiempoValidezValorMinimo: true
        };
      }
      return null;
    };
  }

  /**
   * Se ejecuta cuando se cambia la fecha y hora de movilización
   */
  cambioFechaHoraMovilizacion(){
    if ( this.formulario.value.fecha_hora_movilizacion === null || this.formulario.value.hora_movilizacion === null ){
      return;
    }
    console.log(' Cambiando fechas...');
    this.formulario.controls.horas.setValue(null);
    this.formulario.controls.minutos.setValue(null);
    this.listaHoras = [];
    this.listaMinutos = [];
    if( this.formulario.errors?.fechaMenorActual ){
      return;
    }
    const fechaHoraElegida = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    if ( fechaHoraElegida ) {
      const fechaHoraInicio = new Date(fechaHoraElegida);
      fechaHoraInicio.setMinutes(fechaHoraInicio.getMinutes() + 5);
      const fechaHoraMaxima = new Date(fechaHoraElegida);
      fechaHoraMaxima.setHours(18, 30, 0, 0);
      const horasRestantes = Math.round((fechaHoraMaxima.getTime() - fechaHoraInicio.getTime()) / 3600000);
      console.log('Horas restantes: '+horasRestantes)

      const minutosRestantes = Math.round((fechaHoraMaxima.getTime() - fechaHoraInicio.getTime()) / 60000);
      console.log('Minutos restantes: '+minutosRestantes)

      if (horasRestantes <= 13){
        for ( let i = 0; i <= (horasRestantes-1); i++) {
          this.listaHoras.push(i);
        }
      }
      if(horasRestantes === 1)
      {
        for (let i = 0; i <= minutosRestantes-25 ; i++) {
          this.listaMinutos.push(i);
        }
      }
      else{
        for (let i = 0; i <= 59 ; i++) {
          this.listaMinutos.push(i);
        }
      }
    }
  }

  /**
   * Requiere la placa cuando se selecciona el vehículo
   */
   placaObligatoria( placa: string, medioTransporte: string) {
    return (formularioCsmi: FormGroup) => {
      const valorPlaca = formularioCsmi.controls[placa].value;
      const valorMedio = formularioCsmi.controls[medioTransporte].value;
      let requierePlaca = false;
      this.listaMediosTransportes.forEach( (item: MedioTransporte) => {
        if ( Number(item.idMedioTransporte) === Number(valorMedio) && item.codigo === 'vehiculo' && valorPlaca === null) {
          requierePlaca = true;
        }
      });
      if ( requierePlaca ) {
        return {
          placaObligatoria: true
        };
      }
      return null;
    };
  }

  /**
   * Requiere el transportista cuandos se selecciona el vehículo
   */
  transportistaObligatorio( transportista: string, medioTransporte: string ){
    return (formularioCsmi: FormGroup) => {
      const valorTransportista = formularioCsmi.controls[transportista].value;
      const valorMedio = formularioCsmi.controls[medioTransporte].value;
      let requiereTransportista = false;
      this.listaMediosTransportes.forEach( (item: MedioTransporte) => {
        if ( Number(item.idMedioTransporte) === Number(valorMedio) && item.codigo === 'vehiculo' && valorTransportista === null) {
          requiereTransportista = true;
        }
      });
      if ( requiereTransportista ) {
        return {
          transportistaObligatorio: true
        };
      }
      return null;
    };
  }

  /**
   * Busca a un propietario
   * @param ci 
   */
  buscarPropietario(ci: string) {
    if (ci.length <= 0) {
      Swal.fire('Error', 'Ingrese el número de cédula del propietario', 'error');
      return;
    }
    Swal.fire({
      title: 'Buscando productor...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.usuarioServicio.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    })
    .subscribe( (usuarios: UsuarioExterno[]) => {
      this.listaProductores = usuarios;
      Swal.close();
    });
  }

  /**
   * Se ejecuta cuando se selecciona otro propietario
   */
  cambioPropietario(){
    this.listaBovinosVacunadosDisponibles = [];
    this.obtenerSitiosProductor({
      idUsuariosExternos: this.usuarioActual
    });
  }

  /**
   * Método que obtiene los tipos de áreas.
   */
   obtenerTiposAreas(){
    this.listaTiposAreas = [];
    Swal.fire({title: 'Espere...', text: 'Consultando tipos de destinos.', confirmButtonText: '', allowOutsideClick: false,
    onBeforeOpen: () => { Swal.showLoading(); } });
    this.tipoAreaServicio.obtenerTiposAreas()
    .subscribe( (respuesta: any[]) => {
      console.log(respuesta);
      this.listaTiposAreas = respuesta;
    });
  }

  /**
   * Método que permite limpiar combos de provincia y destino.
   */
   
  cambioTipoSitio(tipoSitio: string){
     if ( tipoSitio === 'c_concentracion' ) {
       this.destino = '';
     }

    this.formulario.controls.provincia_destino.reset();
    this.formulario.controls.id_area_destino.reset();
    this.listaDestinos = [];
    // Establecemos el tipo de área
    this.formulario.controls.tipo_area.setValue(tipoSitio);
    console.log(tipoSitio);
  }

  /**
   * Método que permite cargar los sitios de destino según la provincia.
   */

  cargarSitioDestino(){
    
   this.formulario.controls.id_area_destino.reset();
   this.listaDestinos = [];
   switch (this.formulario.value.tipo_area) {
     case 'cen_faen':
       this.obtenerAreas({ codigoTipoArea: 'cen_faen', estado: 1, idProvinciaSitio: this.formulario.value.provincia_destino});
       break;
     case 'fer_exp':
       this.obtenerAreas({ codigoTipoArea: 'fer_exp', estado: 1, idProvinciaSitio: this.formulario.value.provincia_destino});
       break;
     case 'fer_com':
       this.obtenerAreas({ codigoTipoArea: 'fer_com', estado: 1, idProvinciaSitio: this.formulario.value.provincia_destino});
       break;
     case 'cen_hos':
       this.obtenerAreas({ codigoTipoArea: 'cen_hos', estado: 1, idProvinciaSitio: this.formulario.value.provincia_destino});
       break;
     case 'ex_pec_bov':
       this.obtenerAreas({ idUsuariosExternos: this.usuarioActual, codigoTipoArea: 'ex_pec_bov', estado: 1});
       break;
     default:
       break;
   }
 }

  /**
   * Método que permite buscar un vehículo por placa.
   */
  buscarVehiculo(parametro: string){
    this.matriculaVehiculoSeleccionado = null;
    parametro = parametro.toUpperCase().trim();
    this.vehiculoSeleccionado = null;
    this.formulario.controls.placa.reset();
    this.formulario.controls.marca_vehiculo.reset();
    if ( parametro.length === 0 ) {
      Swal.fire('¡Advertencia!', 'Ingrese la placa del vehículo','warning');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando la placa del vehículo en la base de datos de la Agencia Nacional de Tránsito (ANT)',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioDinardap.obtenerMatriculaVehiculo(parametro)
    .subscribe( (resultados: MatriculaVehiculo[]) => {
      if(resultados.length>0){
        resultados.forEach( (itemVehiculo: MatriculaVehiculo) => {
          this.matriculaVehiculoSeleccionado = itemVehiculo;
          this.formulario.controls.placa.setValue(parametro);
          this.servicioDinardap.obtenerMarcaVehiculo(parametro)
          .subscribe( ( vehiculos: Vehiculo[]) => {
            vehiculos.forEach( (itemVehiculo: Vehiculo) => {
              this.vehiculoSeleccionado = itemVehiculo;
            });
            Swal.close();
          });
        });
     } else{
        Swal.close();
        Swal.fire('¡Atención!', 'El servicio de la Agencia Nacional de Tránsito (ANT) no está disponible o la placa no existe','info');
     }
    });

    return;
  }
  /**
   * Método que permite buscar un transportista por cédula de identidad.
   */
  buscarConductor(ci: string){
    this.datoLicenciaSeleccionado = null;
    this.formulario.controls.id_transportista.reset();
    if (ci.length === 0) {
      Swal.fire('¡Advertencia!', 'Ingrese el número de licencia del conductor', 'warning');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando número de licencia del conductor en la base de datos de la Agencia Nacional de Tránsito (ANT)',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioDinardap.obtenerDatosLicencia(ci)
    .subscribe( (licencias: DatoLicencia[]) => {
      licencias.forEach( (itemLicencia: DatoLicencia) => {
        this.datoLicenciaSeleccionado = itemLicencia;
        this.formulario.controls.id_transportista.setValue(ci);
      });
      Swal.close();
    });
  }
  /**
   * Método que se ejecuta cuando cambia de medio de transporte
   */
  cambioMedioTransporte(idMedioTransporte: number){
    this.formulario.controls.id_vehiculo.setValue(null);
    this.formulario.controls.id_transportista.setValue(null);

    if (idMedioTransporte) {
      this.listaMediosTransportes.forEach( (item: MedioTransporte) => {
        if ( Number(idMedioTransporte) === Number(item.idMedioTransporte)){
          this.medioTransporteSeleccionado = item.codigo;
        }
      });
    }
  }

  /**
   * Limpiar otros productores
   */

   limpiarOtrosProductores(){
    this.listaOtrosProductores = [];
    this.listaDestinos = [];
    this.destinoSeleccionado = null;
    this.formulario.controls.id_area_destino.setValue(null);
    this.idProductorAux = null;
    this.formulario.controls.nombre_productor.setValue(null);
   }

  /**
   * Buscamos otro productor
   */
   buscarOtrosProductores(ci: string){

    this.limpiarOtrosProductores();

    if (ci.length <= 0) {
      Swal.fire('¡Advertencia!', 'Ingrese el # de identificación del productor', 'warning');
      return;
    }
    
    Swal.fire({
      title: 'Buscando registros...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.usuarioServicio.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    })
    .subscribe( (respuesta: UsuarioExterno[]) => {
      Swal.close();
      this.listaOtrosProductores = respuesta;

      if(this.listaOtrosProductores.length == 1)
        {
          //Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');
          Swal.close();
          this.idProductorAux = respuesta[0].idUsuariosExternos;
          this.formulario.controls.nombre_productor.setValue(respuesta[0].nombres);
          this.cambioProductor();
        }
        else
        {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
        }

    });
  }

  /**
   * Limpiar otros productores
   */

   limpiarSolicitantes(){
    this.listaSolicitantes = [];
    this.formulario.controls.nombre_solicitante.setValue(null);
    this.idSolicitanteAux = null;
    
   }

  /**
   * Buscamos otro productor
   */
   buscarSolicitantes(ci: string){

    this.limpiarSolicitantes();

    if (ci.length <= 0) {
      Swal.fire('¡Advertencia!', 'Ingrese el # de identificación del solicitante', 'warning');
      return;
    }
    this.listaSolicitantes = [];
    //const control = 'id_productor_arriendo';
    this.formulario.controls.nombre_solicitante.setValue(null);
    this.idSolicitanteAux = null;
    Swal.fire({
      title: 'Buscando registros...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.usuarioServicio.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    })
    .subscribe( (respuesta: UsuarioExterno[]) => {
      Swal.close();
      this.listaSolicitantes = respuesta;

      if(this.listaSolicitantes.length == 1)
        {
          //Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');
          Swal.close();
          this.idSolicitanteAux = respuesta[0].idUsuariosExternos;
          this.formulario.controls.nombre_solicitante.setValue(respuesta[0].nombres);
        }
        else
        {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
        }
    });
  }

  /**
   * Método que agrega un animal vacunado a la lista 
   * @param idBovino 
   */
  agregarBovino(idBovino: number){
      this.listaBovinosVacunadosDisponibles = this.listaBovinosVacunadosDisponibles.filter( (itemBovino: BovinoCertificadoVacunacion) => {
      if ( Number(idBovino) === Number(itemBovino.idBovino) ) {
        this.listaBovinosAgregados.push(itemBovino);
      } else {
        return true;
      }
    });
  }

  /**
   * Método que quita un animal selecccionado.
   */
  quitarBovino(idBovino: number){
    this.listaBovinosAgregados = this.listaBovinosAgregados.filter( (itemBovino: BovinoCertificadoVacunacion) => {
      if ( Number(idBovino) === Number(itemBovino.idBovino) ) {
        this.listaBovinosVacunadosDisponibles.push(itemBovino);
      } else {
        return true;
      }
    });
  }
  /**
   * Agrega un animal del catastro de nacimientos
   */
   agregarBovinoDescarte(id: number){
    this.listaNacimientosDisponibles = this.listaNacimientosDisponibles.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino)) {
        this.listaNacimientosAgregados.push(item);
      } else {
        return true;
      }
    });
  }
  /**
   * Quita un animal de la lista de nacimientos
   */
  quitarBovinoDescarte(id: number){
    this.listaNacimientosAgregados = this.listaNacimientosAgregados.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino ) ) {
        this.listaNacimientosDisponibles.push(item);
      } else {
        return true;
      }
    });
  }

  /**
   * Método que permite obtener las áreas dado sus parámetros.
   */
   obtenerAreas(parametros: any){
     this.listaDestinos = [];
     Swal.fire({
       title: 'Buscando destinos...',
       confirmButtonText: '',
       allowOutsideClick: false,
       onBeforeOpen: () => {
         Swal.showLoading();
       }
     });
     this.listaDestinos = [];
     this.areaServicio.obtenerAreasPorFiltro(parametros)
     .subscribe( (resultado: Area[]) => {
       Swal.close();
       this.listaDestinos = resultado;
     });
  }

  /**
   * Método que obtiene los medios de transporte.
   */
  obtenerMediosTransportes(){
    this.medioTransporteServicio.obtenerMediosTransportes()
    .subscribe( (respuesta: any) => {
      this.listaMediosTransportes = respuesta;
    });
  }
  /**
   * Obtener los tipos de periodos de validez
   */
  obtenerTiposPeriodosValidez(){
    this.tipoPeriodoValidezServicio.obtenerTiposPeriodosValidez()
    .subscribe( (respuesta: TipoPeriodoValidez[]) => this.tiposPeriodosValidez = respuesta );
  }

  /**
   * Obtener tipos de emisiones de CSMI
   */
  obtenerTiposEmisionesCSMI() {
    this.tipoEmisionCertificadoServicio.obtenerTiposEmisionesCertificados()
    .subscribe( (respuesta: TipoEmisionCertificado[]) => this.tiposEmisionesCertificados = respuesta );
  }

  /**
   * Cambio de productor cuando el predio es arrendado.
   */
   cambioProductor2(idProductor: number){
    if (idProductor) {
      const parametros: any = {
        codigoTipoArea: this.destino,
        idUsuariosExternos: idProductor,
        estado: 1
      };
      this.obtenerAreas(parametros);
      this.cambiarTipoSolicitante();
    }
  }

  /**
   * Cambio de productor cuando el predio es arrendado.
   */
   cambioProductor(){
    if (this.idProductorAux) {
      const parametros: any = {
        codigoTipoArea: this.destino,
        idUsuariosExternos: this.idProductorAux,
        estado: 1
      };
      this.obtenerAreas(parametros);
      this.cambiarTipoSolicitante();
    }
  }

  /**
   * Método que registrar un nuevo csmi
   */
  registrarCertificado(){

    this.formulario.markAllAsTouched();
    console.log(this.formulario);
    
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formulario.value.id_area_destino == null || this.formulario.value.id_area_destino == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione destino</li>";
    }

    if(this.formulario.value.fecha_hora_movilizacion == null || this.formulario.value.fecha_hora_movilizacion == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione fecha de movilización</li>";
    }

    if(this.formulario.value.hora_movilizacion == null || this.formulario.value.hora_movilizacion == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese hora de movilización</li>";
    }

    if(this.formulario.value.horas == null || this.formulario.value.horas == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione horas de validez</li>";
    }

    if(this.formulario.value.minutos == null || this.formulario.value.minutos == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione minutos de validez</li>";
    }

    if(this.formulario.value.medio_transporte == null || this.formulario.value.medio_transporte == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione medio de transporte</li>";
    }

    if ( this.formulario.value.medio_transporte == '2') {
      if (this.vehiculoSeleccionado?.marca == "" || this.vehiculoSeleccionado?.marca == null) {
        formularioInvalido = true;
        mensaje += "<li>Consulte datos del vehículo</li>";
      }
    }

    if ( this.formulario.value.medio_transporte == '2') {
      if (this.formulario.value.id_transportista == "" || this.formulario.value.id_transportista == null) {
        formularioInvalido = true;
        mensaje += "<li>Consulte datos del transportista</li>";
      }
    }

    if(this.formulario.value.area_origen == null || this.formulario.value.area_origen == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione predio origen</li>";
    }

    const total = this.listaBovinosTickets.length + this.listaBovinosTicketsD.length;

      if ( this.listaBovinosTickets.length === 0 && this.listaBovinosTicketsD.length === 0) {
        formularioInvalido = true;
        mensaje += "<li>La cantidad a movilizar debe ser mayor a cero [0] animales</li>";
      }


    if ( total > 30 ) {
      formularioInvalido = true;
      mensaje += "<li>La cantidad a movilizar no debe ser mayor a treinta [30] animales</li>";
    }

    if(this.formulario.value.solicitante_tipo == false){
      if(this.formulario.value.nombre_solicitante == null || this.formulario.value.nombre_solicitante == ""){
        formularioInvalido = true;
        mensaje += "<li>Consulte datos del solicitante</li>";
      }
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    // Validamos la fecha fin de movilización o el tiempo de validez
    const fechaFinMovilizacion = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaFinMovilizacion.setHours(fechaFinMovilizacion.getHours() + Number(this.formulario.value.horas),
    fechaFinMovilizacion.getMinutes() + Number(this.formulario.value.minutos), 0, 0 );
    const fechaYHoraMaxima = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaYHoraMaxima.setHours(18, 0, 0, 0);
    if ( !(fechaFinMovilizacion.getTime() <= fechaYHoraMaxima.getTime()) ) {
      Swal.fire('¡Advertencia!', 'El tiempo de validez supera a la fecha límite', 'warning');
      return;
    }
    // Creamos el objeto para enviarlo al Banckend
    const nuevoCertificado = new CertificadoMovilizacion();
    // Determinamos que tipo de emisión se realiza
    if ( this.usuarioActual ) {
      nuevoCertificado.idProductor = this.usuarioActual;//this.usuarioExterno.idUsuario;
      //nuevoCertificado.usuarioGenera = this.usuarioExterno.numeroIdentificacion; Lo consultamos en el Backend
      // Si lo realiza el operador pecuario
      const tipoEmision: TipoEmisionCertificado = this.tiposEmisionesCertificados.find( (item: TipoEmisionCertificado) => {
        return (item.codigo === 'P');
      });
      if (tipoEmision) {
        nuevoCertificado.idTipoEmision = tipoEmision.idTipoEmisionCertificado;
      }
    }
    // Determinamos el tipo de periodo de validez del CSMI que se va a generar
    if ( this.destino === 'fer_exp' || this.destino === 'fer_com' || this.destino === 'cen_hos' ) {
      // Temporal
      const periodoValidez = this.tiposPeriodosValidez.find( (item: TipoPeriodoValidez) => {
        return item.codigo === 'temporal';
      });
      nuevoCertificado.idTipoPeriodoValidez = periodoValidez.idTipoPeriodoValidez;
    } else {
      // Definitiva
      const periodoValidez = this.tiposPeriodosValidez.find( (item: TipoPeriodoValidez) => {
        return item.codigo === 'definitivo';
      });
      nuevoCertificado.idTipoPeriodoValidez = periodoValidez.idTipoPeriodoValidez;
    }

    // Establecemos los datos de destino
    nuevoCertificado.idProvinciaDestino = this.destinoSeleccionado.idProvinciaSitio;
    nuevoCertificado.idCantonDestino = this.destinoSeleccionado.idCantonSitio;
    nuevoCertificado.idParroquiaDestino = this.destinoSeleccionado.idParroquiaSitio;
    nuevoCertificado.idSitioDestino = this.destinoSeleccionado.idSitio;
    nuevoCertificado.idAreaDestino = this.destinoSeleccionado.idArea;
    if(this.formulario.value.ruta !== null)
    {
      nuevoCertificado.ruta = this.formulario.value.ruta.toUpperCase();
    }
    nuevoCertificado.idAreaOrigen = this.formulario.value.area_origen;
    // Agregamos la cantidad de animales por categoría según lo seleccionado
    nuevoCertificado.detalles = [];
    // Determinamos si se agrega por tickets o por cantidad
    
      this.listaBovinosTickets.forEach( (itemBovino: BovinoCertificadoVacunacion) => {
        const bovino = new Bovino();
        bovino.idBovino = itemBovino.idBovino;
        nuevoCertificado.detalles.push(bovino);
      });

      this.listaBovinosTicketsD.forEach( (itemBovino: Bovino) => {
        const bovino = new Bovino();
        bovino.idBovino = itemBovino.idBovino;
        nuevoCertificado.detalles.push(bovino);
      });

    // Formateamos la fecha
    nuevoCertificado.fechaHoraMovilizacion = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`).toLocaleString('en-US');
    //const fechaFin = new Date(this.formulario.value.fecha_hora_movilizacion);
    const fechaFin = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    //nuevoCertificado.fechaHoraFinMovilizacion = `${fechaFin.getMonth() + 1}/${fechaFin.getDate()}/${fechaFin.getFullYear()} ${fechaFin.getHours() + Number(this.formulario.value.horas)}:${fechaFin.getMinutes() + Number(this.formulario.value.minutos)}`;
    //nuevoCertificado.fechaHoraFinMovilizacion = `${fechaFin.getFullYear()}-${fechaFin.getMonth()+1}-${fechaFin.getDate()}T${fechaFin.getHours() + Number(this.formulario.value.horas)}:${fechaFin.getMinutes() + Number(this.formulario.value.minutos)}`;
    fechaFin.setHours(fechaFin.getHours()+ Number(this.formulario.value.horas), fechaFin.getMinutes() + Number(this.formulario.value.minutos), 0, 0);
    nuevoCertificado.fechaHoraFinMovilizacion = fechaFin.toLocaleString('en-US');
    // 09/06/2021 16:59
    nuevoCertificado.idMedioTransporte = this.formulario.value.medio_transporte;
    const medioTransporteSeleciconado = this.listaMediosTransportes.find( (item: MedioTransporte) => {
      return Number(item.idMedioTransporte) === Number(nuevoCertificado.idMedioTransporte);
    });
    if ( medioTransporteSeleciconado ) {
      if (medioTransporteSeleciconado.codigo === 'vehiculo') {
        // Vehículo
        nuevoCertificado.vehiculo = {
          placa: this.formulario.value.placa,
          tipoTransporte: this.matriculaVehiculoSeleccionado?.tipoVehiculo,
          propietario: this.matriculaVehiculoSeleccionado?.propietario,
          marca: this.vehiculoSeleccionado?.marca,
          modelo: this.matriculaVehiculoSeleccionado?.modelo
        };
        //nuevoCertificado.idVehiculo = Number(this.formulario.value.id_vehiculo);
        // Transportista
        nuevoCertificado.transportista = {
          numeroIdentificacion: this.formulario.value.id_transportista,
          nombres: `${this.datoLicenciaSeleccionado?.nombres} ${this.datoLicenciaSeleccionado?.apellidos}`
        };
        //nuevoCertificado.idTransportista = Number(this.formulario.value.id_transportista);
      }
    }

    if(this.formulario.value.solicitante_tipo){
      nuevoCertificado.idSolicitante = this.idSolicitanteAux;
    }else
    {
      nuevoCertificado.idSolicitante = this.idSolicitanteAux;
    }

    console.log(nuevoCertificado);
    Swal.fire({
      title: 'Registrando CZPM-M...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.certificadoMovilizacionServicio.registrarNuevoCSMI(nuevoCertificado)
    .subscribe( (respuesta: any) => {
      console.log(respuesta);
      Swal.fire({
        title: 'Espere...',
        text: 'Generando Documento CZPM-M',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.certificadoMovilizacionServicio.obtenerPdfCertificadoMovilizacion(respuesta.idCertificadoMovilizacion)
      .subscribe( (resp: any) => {
        console.log('Contenido: ', resp);
        Swal.close();
        this.servicioVisorPdf.establecerArchivoDesdeBase64(resp.contenido);
        this.servicioVisorPdf.abrir();
      });
    }, );
  }

  /**
   * Se ejecuta cuando se cambia de destino
   */
  cambioDestino(){
    this.listaDestinos.forEach( (itemArea: Area) => {
      if ( Number(itemArea.idArea) === Number(this.formulario.value.id_area_destino) ) {
        this.destinoSeleccionado = itemArea;
      }
    });
  }

  /**
   * Obtiene los sitios del productor
   */
  obtenerSitiosProductor(parametros: any){
    this.listaAreaOrigen = [];
    Swal.fire({
      title: 'Buscando centros de concentración de animales...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    // parametros.estado = 1;
    this.areaServicio.obtenerAreasPorFiltro(parametros)
    .subscribe( (areas: Area[]) => {
      this.listaAreaOrigen = areas;

      this.listaAreaOrigen = areas.filter( ( item: any ) => {
        return item.codigoTipoArea === 'fer_com' || item.codigoTipoArea === 'fer_exp' || item.codigoTipoArea === 'cen_hos';
      });
      Swal.close();
    });
  }

  

    /**
   * Carga los datos de los bovinos
   */
     actualizarTickets(){
      
      Swal.fire({
        title: 'Actualizando Tickets del centro de concentración...',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
  
      this.cargarCatastroVacunados();
      this.cargarCatastroNacimientos();
    }

  
  
  /**
   * Obtenemos los datos de un bovino
   */
   obtenerBovinoTicket(){
    this.BovinoTicket = [];
    
    Swal.fire({
      title: 'Buscando información del Ticket...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioBovino.filtrarBovinosTicket({
      codigoEstadoAnimal: 'vivo',
      codigoEstadoRegistro: 'DISP',
      idBovino: this.formulario.value.numero_ticket.trim()
    })
    .subscribe( ( infoTicket: Bovino[]) => {
      this.BovinoTicket = infoTicket;
      
      if(this.BovinoTicket.length > 0){

        this.BovinoTicket.forEach( ( itemBovino: Bovino) => {
        let cat:string;

        if(itemBovino.nombreCategoria == null){ cat = "BÚFALO"; } else { cat = itemBovino.nombreCategoria; }
        
        if(itemBovino.idAreaActual !== this.formulario.value.area_origen){
          Swal.fire('Alerta', '<b>TICKET '+itemBovino.idBovino+' | <font color="#CC0000" size="+1">NO DISPONIBLE</font></b> <br><br> <b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "MOVIMIENTO")){
          Swal.fire('Alerta', '<b>TICKET '+itemBovino.idBovino+' | <font color="#FF9900" size="+1">EN USO</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "EN SITIO")){
          Swal.fire('Alerta', '<b>TICKET '+itemBovino.idBovino+' | <font color="#006600" size="+1">DISPONIBLE</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br> <b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+' <br><br> Por favor, actualizar Tickets disponibles...', 'warning');
        }

        } );
      } else
      {
        Swal.fire('Alerta', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">NO EXISTE </font></b>', 'warning');
        this.formulario.controls.numero_ticket.setValue(null);
      }
    });
  }

  /**
   * Busca el bovino y lo agrega a la lista para ser movilizados
   */
   agregarBovinoTicket(){

    console.log('Catastro de animales vacunados', this.listaBovinosVacunadosDisponibles);
    console.log('Catastro de nacimientos', this.listaNacimientosDisponibles);
    console.log('Número de ticket: ', this.formulario.value.numero_ticket);

    if (this.formulario.value.area_origen === null){
      Swal.fire('Alerta', 'Por favor, seleccione una explotación pecuaria de origen...', 'warning');
      this.formulario.controls.numero_ticket.setValue(null);
      return;
    }

    if (this.formulario.value.numero_ticket == null || this.formulario.value.numero_ticket.trim() == "" ){
      Swal.fire('Alerta', 'Ingrese un número de Ticket', 'warning');
      this.formulario.controls.numero_ticket.setValue(null);
      return;
    }

    if ((this.listaBovinosVacunadosDisponibles.findIndex( (item: BovinoCertificadoVacunacion) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 ) && (this.listaNacimientosDisponibles.findIndex( (item: Bovino) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 )){
    
      this.obtenerBovinoTicket();
      return;
      
    }

    // Si no lo encuentra entonces lo agrega
    if (this.listaBovinosTickets.findIndex( (item: BovinoCertificadoVacunacion) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 ){
      this.listaBovinosVacunadosDisponibles.forEach( ( itemBovino: BovinoCertificadoVacunacion) => {
        if (Number(this.formulario.value.numero_ticket.trim()) === Number(itemBovino.idBovino) ) {
          this.listaBovinosTickets.push(itemBovino);
        }
      } );
    } else {
        Swal.fire('Alerta', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">YA REGISTRADO </font></b>', 'warning');
    } 

    // Si no lo encuentra entonces lo agrega
    if (this.listaBovinosTicketsD.findIndex( (item: Bovino) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 ){
      this.listaNacimientosDisponibles.forEach( ( itemBovino: Bovino) => {
        if (Number(this.formulario.value.numero_ticket.trim()) === Number(itemBovino.idBovino) ) {
          this.listaBovinosTicketsD.push(itemBovino);
        }
      } );
    } else {
        Swal.fire('Alerta', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">YA REGISTRADO </font></b>', 'warning');
    } 
    
    this.formulario.controls.numero_ticket.setValue(null);
  }

  /**
   * Quita el bovino de la lista de tickets
   * @param numerTicket 
   */
  quitarBovinoTicket(numerTicket: number){
    this.listaBovinosTickets = this.listaBovinosTickets.filter( (itemBovino: BovinoCertificadoVacunacion) => {
      return Number(itemBovino.idBovino) !== Number (numerTicket);
    });
  }

  /**
   * Quita el bovino de la lista de tickets de descarte
   * @param numerTicket 
   */
   quitarBovinoTicketD(numerTicket: number){
    this.listaBovinosTicketsD = this.listaBovinosTicketsD.filter( (itemBovino: Bovino) => {
      return Number(itemBovino.idBovino) !== Number (numerTicket);
    });
  }

  cambioControl(){
    console.log('Cambiando...');
  }

  /**
   * Se ejecuta cuando se cambia el control de los tickets
   */
  cambioTickets(){
    this.listaBovinosTickets = [];
    this.formulario.controls.numero_ticket.setValue(null);
  }

  // Método que obtiene los datos de provincias.
cargarProvinciasPorPais(idPais: number) {
  this._provinciaService.getProvinciasPorPais(idPais)
  .subscribe( respuesta => this.listaProvincias = respuesta );
}

/**
 * Permite agregar un ciudadano si no se lo encuentra.
 */
 agregarCiudadano(){
  this.mostrarCorreo = false;
  this.servicioCrearUsuario.abrir();
  }

}
