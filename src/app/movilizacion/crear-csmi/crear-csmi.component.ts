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
import { VehiculoService } from '../../servicios/vehiculo/vehiculo.service';
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
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { DetalleCertificadoMovilizacion } from 'src/app/modelos/detalle-certificado-movilizacion.modelo';

@Component({
  selector: 'app-crear-csmi',
  templateUrl: './crear-csmi.component.html',
  styles: []
})
export class CrearCsmiComponent implements OnInit {

   @ViewChild('fecha_movilizacion') fecha_movilizacion: ElementRef;

  listaProductores: UsuarioExterno[] = [];
  usuarioSeleccionado: UsuarioExterno = null;
  listaOtrosProductores: UsuarioExterno[] = [];
  destino: string;
  centro: string;
  provinciaID: number;
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
  // Bovinos disponibles
  listaBovinosDisponibles: BovinoCertificadoVacunacion[] = [];
  listaBovinosDisponiblesTotal: BovinoCertificadoVacunacion[] = [];
  
  listaTernerosDescarteTotal: Bovino[] = [];
  listaTernerosDescarteAgregados: Bovino[] = [];

  listaBovinosAgregados: BovinoCertificadoVacunacion[] = [];

  listaHoras: number[] = [];
  listaMinutos: number[] = [];
  horaInicio: number = 0;
  horaFin: number = 13;
  minutoInicio: number = 0;
  minutoFin: number = 59;

  vehiculoSeleccionado: Vehiculo;
  matriculaVehiculoSeleccionado: MatriculaVehiculo;
  datoLicenciaSeleccionado: DatoLicencia;

  // Bovinos vacunados
  listaBovinosVacunadosDisponibles: BovinoCertificadoVacunacion[] = [];
  // Bovinos por Ticket
  BovinoTicket: Bovino[] = [];
  // Bovinos por Ticket
  CertificadoTicket: DetalleCertificadoMovilizacion[] = [];
  // Disponibles
  ternerasDisponibles: number = 0;
  ternerosDisponibles: number = 0;
  vaconasDisponibles: number = 0;
  toretesDisponibles: number = 0;
  vacasDisponibles: number = 0;
  torosDisponibles: number = 0;
  bufalosHembrasDisponibles: number = 0;
  bufalosMachosDisponibles: number = 0;
  // Agregados
  ternerasAgregados: number = 0;
  ternerosAgregados: number = 0;
  vaconasAgregados: number = 0;
  toretesAgregados: number = 0;
  vacasAgregados: number = 0;
  torosAgregados: number = 0;
  bufalosHembrasAgregados: number = 0;
  bufalosMachosAgregados: number = 0;

  // Terneros descarte
  listaTernerosDescarte: Bovino[] = [];
  ternerasDescarteDisponibles: number = 0;
  ternerasDescarteAgregados: number = 0;
  ternerosDescarteDisponibles: number = 0;
  ternerosDescarteAgregados: number = 0;
  bufalosHembrasDescarteDisponibles: number = 0;
  bufalosMachosDescarteDisponibles: number = 0;
  bufalosHembrasDescarteAgregados: number = 0;
  bufalosMachosDescarteAgregados: number = 0;

  origenSeleccionado?: Area = null;
  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();
  listaBovinosTickets: BovinoCertificadoVacunacion[] = [];
  listaBovinosTicketsD: Bovino[] = [];

  //Variables auxiliares
  idSolicitanteAux: string = '';
  idProductorAux: number;
  emailProductor: string = '';
  nombresProductor: string = '';
  codigoAreaOrigen: string = '';

  constructor(
    private scriptSerivicio: ScriptsService,
    private _provinciaService: ProvinciaService,
    private areaServicio: AreaService,
    public usuarioServicio: UsuarioService,
    private servicioBovinoVacunado: BovinoVacunadoService,
    private medioTransporteServicio: MediosTransportesService,
    private tipoAreaServicio: TiposAreasService,
    private vehiculoServicio: VehiculoService,
    private tipoEmisionCertificadoServicio: TipoEmisionCertificadoService,
    private tipoPeriodoValidezServicio: TipoPeriodoValidezService,
    private certificadoMovilizacionServicio: CertificadoMovilizacionService,
    private servicioBovino: BovinoService,
    private servicioVisorPdf: VisorPdfService,
    private enrutador: Router,
    private servicioDinardap: DinardapService
  ) {
    this.fechaMaxima.setHours(23, 59, 59, 0);
    this.fechaMaxima.setDate(this.fechaMaxima.getDate() + 3);
    this.inicializarFormulario();
  }

  ngOnInit() {
    
    this.servicioVisorPdf.notificacion.subscribe( (valor: any) => {
      if ( valor === 'cerrar') {
        console.log('Se cierra el panel');
        this.enrutador.navigate(['/certificados-movilizacion-emitidos']);
      }
    });
    this.predioArrendado = false;
    this.crearTiempoValidez();
    
    this.destino = '';
    this.centro = '';
    this.medioTransporteSeleccionado = '';
    if (this.usuarioServicio.usuarioExterno) {
      this.usuarioExterno = this.usuarioServicio.usuarioExterno;
      this.formulario.controls.propietario_animales.setValue(this.usuarioExterno.idUsuario);
      //this.emailProductor = this.usuarioExterno.email;
      //console.log('IdUsuario: '+this.usuarioExterno.idUsuario);
      //console.log('Email: '+this.emailProductor);
      this.obtenerSitiosProductor({
        idUsuariosExternos: this.formulario.value.propietario_animales,
        codigoEstadoSitio: "AC",
        estado: "1"
      });
    }
    this.obtenerTiposPeriodosValidez();
    this.obtenerTiposEmisionesCSMI();
    this.obtenerMediosTransportes();
    this.obtenerTiposAreas();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.scriptSerivicio.inicializarScripts();
    this.buscarEmailProductor(this.usuarioExterno.idUsuario);
    //this.hora.nativeElement.on('click', (evento) => { 
    //  console.log(evento);
    //});
  }
  ngAfterViewInit() {
    //this.fecha_movilizacion.nativeElement.onchange = (evento) => {
    //  this.formulario.controls.fecha_hora_movilizacion.setValue(this.fecha_movilizacion.nativeElement.value);
    //  this.cambioFechaHoraMovilizacion();
    //};
  }

  /**
   * Buscamos E-mail del productor
   */
   buscarEmailProductor(ci: number){
    Swal.fire({
      title: 'Buscando E-mail del productor...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.usuarioServicio.filtrarUsuariosExternos({
      idUsuariosExternos: ci
    })
    .subscribe( (respuesta: UsuarioExterno[]) => {
      Swal.close();
      this.listaProductores = respuesta;

      if(this.listaProductores.length == 1)
        {
          //Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');
          Swal.close();
          this.emailProductor = respuesta[0].email;
          this.nombresProductor = respuesta[0].nombres;
          console.log('Email:'+this.emailProductor)
          console.log('Productor:'+this.nombresProductor)
          //this.cambioProductor();
        }
        else
        {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
        }

    });
  }

  /**
   * Crea los rangos de tiempos de validez
   */
  crearTiempoValidez(){
    this.listaHoras.push(0);
    this.listaMinutos.push(0);
  }

  // Método que inicializa el formulario.
  inicializarFormulario(){
    this.formulario = new FormGroup({
      propietario_animales: new FormControl(null, Validators.required),
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
      //bovinos_agregados: new FormControl(0, Validators.min(1)),
      //id_productor_arriendo: new FormControl(null),
      nombre_productor: new FormControl(null),
      ruta: new FormControl('', Validators.maxLength(256)),
      area_origen: new FormControl(null, Validators.required),
      horas: new FormControl(0),
      minutos: new FormControl(0),
      tickets: new FormControl(false),
      numero_ticket: new FormControl(null),
    }, [
      this.placaObligatoria('placa', 'medio_transporte'),
      this.transportistaObligatorio('id_transportista', 'medio_transporte'),
      this.validarFechaMovilizacion('fecha_hora_movilizacion'),
      this.validarHoraMovilización('hora_movilizacion', 'fecha_hora_movilizacion'),
      this.tiempoValidez('horas', 'minutos', 'fecha_hora_movilizacion')
      //this.fechaMovilizacion('fecha_hora_movilizacion'),
      //--this.validarFechaMovilizacion('fecha_hora_movilizacion'),
    ]);
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
        fechaMaxima.setDate(fechaMaxima.getDate() + 3);
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
    this.listaBovinosDisponibles = [];
    this.obtenerSitiosProductor({
      idUsuariosExternos: this.formulario.value.propietario_animales
    });
  }

  /**
   * Obtiene los bovinos vacunados según el propietario
   */
 /* cargarBovinosProductor() {
    this.listaBovinosDisponibles = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando datos del catastro.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    const parametros = new BovinoCertificadoVacunacion();
    parametros.codigoEstadoDocumentoCertificadoVacunacion = 'VIG';
    parametros.estado = 1;
    parametros.estadoSitioActual = 1;
    parametros.codigoEstadoAnimal = 'vivo';
    parametros.codigoEstadoRegistro = 'DISP';
    parametros.codigoEstadoUbicacion = 'SIT';
    parametros.codigoTipoRegistro = 'n-general';
    parametros.idUsuarioActual = this.formulario.value.propietario_animales;
    this.servicioBovinoVacunado.obtenerBovinosVacunados(parametros)
    .subscribe( (bovinosVacunados: BovinoCertificadoVacunacion[]) => {
      this.listaBovinosDisponiblesTotal = bovinosVacunados;
      const areasOrigenes: Area[] = this.listaAreaOrigen;
      this.listaBovinosDisponiblesTotal.forEach( (itemBovino: BovinoCertificadoVacunacion) => {
        const area: Area[] = areasOrigenes.filter( (itemArea: Area) => {
          return Number(itemBovino.idAreaActual) === Number(itemArea.idArea);
        });
        if ( area.length === 0 ) {
          const itemArea = new Area();
          itemArea.idArea = itemBovino.idAreaActual;
          itemArea.nombre = itemBovino.nombreAreaActual;
          itemArea.nombreSitio = itemBovino.nombreSitioActual;
          itemArea.nombreParroquiaSitio = itemBovino.nombreParroquiaActual;
          itemArea.nombreCantonSitio = itemBovino.nombreCantonActual;
          itemArea.nombreProvinciaSitio = itemBovino.nombreProvinciaActual;
          this.listaAreaOrigen.push(itemArea);
        }

      });
      Swal.close();
    });
  }*/
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
      //this.listaTiposAreas = respuesta.filter( ( item: any ) => {
      //  return item.codigo !== 'com_ident' && item.codigo !== 'cen_enfr';
      //});
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
    //tipo_area
    this.formulario.controls.tipo_area.setValue(tipoSitio);

    console.log('Tipo Área:'+tipoSitio);
    if ( tipoSitio === 'ex_pec_bov' ) {
      this.cargarSitioDestino();
    }
    // Reestablecemos los valores agregados de bovinos
    /*this.ternerasAgregados = 0;
    this.ternerosAgregados = 0;
    this.vaconasAgregados = 0;
    this.toretesAgregados = 0;
    this.vacasAgregados = 0;
    this.torosAgregados = 0;
    this.bufalosHembrasAgregados = 0;
    this.bufalosMachosAgregados = 0;
    this.ternerosDescarteAgregados = 0;*/
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
       this.obtenerAreas({ idUsuariosExternos: this.formulario.value.propietario_animales, codigoTipoArea: 'ex_pec_bov', estado: 1});
       break;
     default:
       break;
   }
   // Establecemos el tipo de área
   //tipo_area
   //this.formulario.controls.tipo_area.setValue(tipoSitio);
   // Reestablecemos los valores agregados de bovinos
   /*this.ternerasAgregados = 0;
   this.ternerosAgregados = 0;
   this.vaconasAgregados = 0;
   this.toretesAgregados = 0;
   this.vacasAgregados = 0;
   this.torosAgregados = 0;
   this.bufalosHembrasAgregados = 0;
   this.bufalosMachosAgregados = 0;
   this.ternerosDescarteAgregados = 0;*/
 }


  /**
   * Método que permite cargar datos en base al destino.
   */
   /*cambioTipoSitio(tipoSitio: string){
    
    let tipoSitio2: string = this.formulario.value.tipo_area;

    if ( tipoSitio === 'c_concentracion' ) {
      this.destino = '';
    }

    if ( tipoSitio2 === 'c_concentracion' ) {
      tipoSitio2=this.formulario.value.centro_concentracion;
    }

    console.log(tipoSitio2)
    
    /*if ( this.formulario.value.provincia_destino === null ||  this.formulario.value.provincia_destino === '') {
     this.destino = '';
   }*/

  /* this.formulario.controls.id_area_destino.reset();

  

   //this.formulario.controls.provincia_destino.reset();
   this.listaDestinos = [];
   switch (tipoSitio) {
     case 'cen_faen':
       this.obtenerAreas({ codigoTipoArea: 'cen_faen', estado: 1, idProvinciaSitio: this.formulario.value.provincia_destino});
       break;
     case 'fer_exp':
       this.obtenerAreas({ codigoTipoArea: 'fer_exp', estado: 1});
       break;
     case 'fer_com':
       this.obtenerAreas({ codigoTipoArea: 'fer_com', estado: 1});
       break;
     case 'cen_hos':
       this.obtenerAreas({ codigoTipoArea: 'cen_hos', estado: 1});
       break;
     case 'ex_pec_bov':
       this.obtenerAreas({ idUsuariosExternos: this.formulario.value.propietario_animales, codigoTipoArea: 'ex_pec_bov', estado: 1});
       break;
     default:
       break;
   }
   // Establecemos el tipo de área
   //tipo_area
   this.formulario.controls.tipo_area.setValue(tipoSitio);
   // Reestablecemos los valores agregados de bovinos
   this.ternerasAgregados = 0;
   this.ternerosAgregados = 0;
   this.vaconasAgregados = 0;
   this.toretesAgregados = 0;
   this.vacasAgregados = 0;
   this.torosAgregados = 0;
   this.bufalosHembrasAgregados = 0;
   this.bufalosMachosAgregados = 0;
   this.ternerosDescarteAgregados = 0;
 }*/


  /**
   * Método que permite buscar un vehículo por placa.
   */
  buscarVehiculo(parametro: string){
    this.matriculaVehiculoSeleccionado = null;
    this.vehiculoSeleccionado = null;
    parametro = parametro.toUpperCase().trim();
    this.vehiculoSeleccionado = null;
    this.formulario.controls.placa.reset();
    this.formulario.controls.marca_vehiculo.reset();
    if ( parametro.length === 0 ) {
      Swal.fire('Error', 'Ingrese la placa del vehículo a buscar','error');
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
          //console.log('Vehículo: ', itemVehiculo);
          //this.vehiculoSeleccionado.placa = parametro;
          //this.vehiculoSeleccionado.marca = itemVehiculo.marca;
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
        Swal.fire('Error', 'El servicio de la Agencia Nacional de Tránsito (ANT) no está disponible o la placa no existe','error');
     }
    });

    return;
    this.formulario.controls.id_vehiculo.setValue(null);
    this.listaVehiculos = [];
    this.vehiculoServicio.obtenerVehiculosPorFiltro({ placa: parametro})
    .subscribe( (respuesta: Vehiculo[]) => {
      this.listaVehiculos = respuesta;
      Swal.close();
    } );
  }
  /**
   * Método que permite buscar un transportista por cédula de identidad.
   */
  buscarConductor(ci: string){
    this.datoLicenciaSeleccionado = null;
    this.formulario.controls.id_transportista.reset();
    if (ci.length === 0) {
      Swal.fire('Error', 'Ingrese el número de licencia del conductor', 'error');
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
    //const control = 'id_productor_arriendo';
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
    //this.listaOtrosProductores = [];
    //const control = 'id_productor_arriendo';
    //this.formulario.controls.id_productor_arriendo.setValue(null);
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
   * Método que agrega un bovino a la lista 
   * @param idBovino 
   */
  agregarBovino(idBovino: number){
    this.listaBovinosDisponibles = this.listaBovinosDisponibles.filter( (itemBovino: BovinoCertificadoVacunacion) => {
      if ( Number(idBovino) === Number(itemBovino.idBovino) ) {
        this.listaBovinosAgregados.push(itemBovino);
      } else {
        return true;
      }
    });
  }

  /**
   * Método que quita los bovino selecccionados.
   */
  quitarBovino(idBovino: number){
    this.listaBovinosAgregados = this.listaBovinosAgregados.filter( (itemBovino: BovinoCertificadoVacunacion) => {
      if ( Number(idBovino) === Number(itemBovino.idBovino) ) {
        this.listaBovinosDisponibles.push(itemBovino);
      } else {
        return true;
      }
    });
  }
  /**
   * Agrega un terneno de descarte
   */
   agregarBovinoDescarte(id: number){
    this.listaTernerosDescarte = this.listaTernerosDescarte.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino)) {
        this.listaTernerosDescarteAgregados.push(item);
      } else {
        return true;
      }
    });
  }
  /**
   * Quita un ternero de descarte
   */
  quitarBovinoDescarte(id: number){
    this.listaTernerosDescarteAgregados = this.listaTernerosDescarteAgregados.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino ) ) {
        this.listaTernerosDescarte.push(item);
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
   * Activar predio arrendado
   */
   activarPredioArrendado(){
    this.formulario.controls.id_area_destino.setValue(null);
    this.predioArrendado = !this.predioArrendado;
    this.listaOtrosProductores = [];
    if ( !this.predioArrendado ) {
      //this.formulario.controls.id_productor_arriendo.setValue(null);
      this.idProductorAux = null;
    }
    if (this.predioArrendado) {
      this.listaDestinos = [];
    } else {
      // Enviamos a buscar las áreas del propietario.
      const parametros: any = {
        codigoTipoArea: this.destino,
        idUsuariosExternos: this.formulario.value.propietario_animales,
        estado: 1
      };
      this.obtenerAreas(parametros);
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

    //Total Bovinos Vacunados
    const total = this.ternerasAgregados + this.ternerosAgregados + this.vaconasAgregados + this.toretesAgregados + this.vacasAgregados + this.torosAgregados + this.bufalosHembrasAgregados + this.bufalosMachosAgregados + this.ternerasDescarteAgregados + this.ternerosDescarteAgregados + this.bufalosHembrasDescarteAgregados + this.bufalosMachosDescarteAgregados;
    //Total Bovinos Nacimientos
    //const totalB = this.ternerasDescarteAgregados + this.ternerosDescarteAgregados + this.bufalosHembrasDescarteAgregados + this.bufalosMachosDescarteAgregados;

    /*if ( this.formulario.value.tipo_area === 'cen_faen') {
      if (total === 0 && this.ternerosDescarteAgregados === 0) {
        formularioInvalido = true;
        mensaje += "<li>La cantidad a movilizar debe ser mayor a cero [0] animales</li>";
      }
    }*/
    if (this.formulario.value.tickets){
      if ( this.listaBovinosTickets.length === 0 && this.listaBovinosTicketsD.length === 0) {
        formularioInvalido = true;
        mensaje += "<li>La cantidad a movilizar debe ser mayor a cero [0] animales</li>";
      }

    } else {
      if ( total === 0 ) {
        formularioInvalido = true;
        mensaje += "<li>La cantidad a movilizar debe ser mayor a cero [0] animales</li>";
      }
    }


    if ( total > 30 ) {
      formularioInvalido = true;
      mensaje += "<li>La cantidad a movilizar no debe ser mayor a treinta [30] animales</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    /*if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario contiene errores', 'error');
      return;
    }
    const total = this.ternerasAgregados + this.ternerosAgregados + this.vaconasAgregados + this.toretesAgregados + this.vacasAgregados + this.torosAgregados + this.bufalosHembrasAgregados + this.bufalosMachosAgregados;
    
    if ( this.formulario.value.tipo_area === 'cen_faen') {
      if (total === 0 && this.ternerosDescarteAgregados === 0) {
        Swal.fire('Error', 'Debe agregar bovinos para generar el certificado de movilización', 'error');
      return;
      }
    } else {
      if ( total === 0 ) {
        Swal.fire('Error', 'La cantidad a movilizar debe ser mayor a cero [0] animales', 'error');
        return;
      }else {
        if ( total > 30 ) {
          Swal.fire('Error', 'La cantidad a movilizar no debe ser mayor a treinta [30] animales', 'error');
          return;
        }
      }
    }*/
    
    // Validamos la fecha fin de movilización o el tiempo de validez
    const fechaFinMovilizacion = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaFinMovilizacion.setHours(fechaFinMovilizacion.getHours() + Number(this.formulario.value.horas),
    fechaFinMovilizacion.getMinutes() + Number(this.formulario.value.minutos), 0, 0 );
    const fechaYHoraMaxima = new Date(`${this.formulario.value.fecha_hora_movilizacion} ${this.formulario.value.hora_movilizacion}`);
    fechaYHoraMaxima.setHours(18, 0, 0, 0);
    if ( !(fechaFinMovilizacion.getTime() <= fechaYHoraMaxima.getTime()) ) {
      Swal.fire('Error', 'El tiempo de validez supera a la fecha límite', 'error');
      return;
    }
    // Creamos el objeto para enviarlo al Banckend
    const nuevoCertificado = new CertificadoMovilizacion();
    // Determinamos que tipo de emisión se realiza
    if ( this.usuarioExterno ) {
      nuevoCertificado.idProductor = this.usuarioExterno.idUsuario;
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
    //const destino = this.listaDestinos.find( (item: any) => {
    //  return Number(item.idArea) === Number(this.formulario.value.id_area_destino);
    //});
    nuevoCertificado.idProvinciaDestino = this.destinoSeleccionado.idProvinciaSitio;
    nuevoCertificado.idCantonDestino = this.destinoSeleccionado.idCantonSitio;
    nuevoCertificado.idParroquiaDestino = this.destinoSeleccionado.idParroquiaSitio;
    nuevoCertificado.idSitioDestino = this.destinoSeleccionado.idSitio;
    nuevoCertificado.idAreaDestino = this.destinoSeleccionado.idArea;
    nuevoCertificado.ruta = this.formulario.value.ruta.toUpperCase();
    nuevoCertificado.idAreaOrigen = this.formulario.value.area_origen;
    
    if (this.codigoAreaOrigen === 'ex_pec_bov') {
      nuevoCertificado.emailProductor = this.emailProductor;
      nuevoCertificado.nombresProductor = this.nombresProductor;
    }
    
    // Agregamos la cantidad de animales por categoría según lo seleccionado
    nuevoCertificado.detalles = [];
    // Determinamos si se agrega por tickets o por cantidad
    if ( this.formulario.value.tickets ) {
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

    } else {
      // Agregamos las terneras
      if ( this.ternerasAgregados > 0 ) {
        const terneras: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'ternera';
        });
        for ( let i = 0; i < this.ternerasAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = terneras[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos los terneros
      if ( this.ternerosAgregados > 0 ) {
        const terneros: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'ternero';
        });
        for ( let i = 0; i < this.ternerosAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = terneros[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos las terneras para descarte
      if ( this.ternerasDescarteAgregados > 0 ) {
        const ternerasD: Bovino[] = this.listaTernerosDescarte.filter( (item: Bovino) => {
          return item.codigoCategoria === 'ternera';
        });
        for ( let i = 0; i < this.ternerasDescarteAgregados; i++ ) {
          const item: Bovino = ternerasD[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos los terneros para descarte
      if ( this.ternerosDescarteAgregados > 0 ) {
        const ternerosD: Bovino[] = this.listaTernerosDescarte.filter( (item: Bovino) => {
          return item.codigoCategoria === 'ternero';
        });
        for ( let i = 0; i < this.ternerosDescarteAgregados; i++ ) {
          const item: Bovino = ternerosD[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos los terneros para descarte
      /**if ( this.ternerosDescarteAgregados > 0 ) {
        for ( let i = 0; i < this.ternerosDescarteAgregados; i++ ) {
          const item: Bovino = this.listaTernerosDescarte[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }**/
      if ( this.vaconasAgregados > 0 ) {
        const vaconas: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'vacona';
        });
        for ( let i = 0; i < this.vaconasAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = vaconas[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      if ( this.toretesAgregados > 0 ) {
        const toretes: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'torete';
        });
        for ( let i = 0; i < this.toretesAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = toretes[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      if ( this.vacasAgregados > 0 ) {
        const vacas: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'vaca';
        });
        for ( let i = 0; i < this.vacasAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = vacas[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos los toros
      if ( this.torosAgregados > 0 ) {
        const toros: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoCategoria === 'toro';
        });
        for ( let i = 0; i < this.torosAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = toros[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
      // Agregamos los búfalos hembras
      if ( this.bufalosHembrasAgregados > 0 ) {
        const bufalosHembras: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles
        .filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoSexo === 'hembra' && item.codigoTaxonomia === 'bubalus_bubalis';
        });
        for ( let i = 0; i < this.bufalosHembrasAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = bufalosHembras[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
       // Agregamos los búfamos machos
      if ( this.bufalosMachosAgregados > 0 ) {
        const bufalosMachos: BovinoCertificadoVacunacion[] = this.listaBovinosVacunadosDisponibles
        .filter( (item: BovinoCertificadoVacunacion) => {
          return item.codigoSexo === 'macho' && item.codigoTaxonomia === 'bubalus_bubalis';
        });
        for ( let i = 0; i < this.bufalosMachosAgregados; i++ ) {
          const item: BovinoCertificadoVacunacion = bufalosMachos[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }

      // Agregamos los búfalos hembras para descarte
      if ( this.bufalosHembrasDescarteAgregados > 0 ) {
        const bufalosHembrasD: Bovino[] = this.listaTernerosDescarte
        .filter( (item: Bovino) => {
          return item.codigoSexo === 'hembra' && item.codigoTaxonomia === 'bubalus_bubalis';
        });
        for ( let i = 0; i < this.bufalosHembrasDescarteAgregados; i++ ) {
          const item: Bovino = bufalosHembrasD[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }
       // Agregamos los búfamos machos para descarte
      if ( this.bufalosMachosDescarteAgregados > 0 ) {
        const bufalosMachosD: Bovino[] = this.listaTernerosDescarte
        .filter( (item: Bovino) => {
          return item.codigoSexo === 'macho' && item.codigoTaxonomia === 'bubalus_bubalis';
        });
        for ( let i = 0; i < this.bufalosMachosDescarteAgregados; i++ ) {
          const item: Bovino = bufalosMachosD[i];
          const bovino = new Bovino();
          bovino.idBovino = item.idBovino;
          nuevoCertificado.detalles.push(bovino);
        }
      }

    }
    
   
    // Formateamos la fecha
    //nuevoCertificado.fechaHoraMovilizacion = this.formulario.value.fecha_hora_movilizacion;
    //const fechaHoraMovilizacion: string[] = nuevoCertificado.fechaHoraMovilizacion.split(' ');
    //const fecha: string[] = fechaHoraMovilizacion[0].split('/');
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
    console.log(nuevoCertificado);
    Swal.fire({
      title: 'Registrando certificado de movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.certificadoMovilizacionServicio.registrarNuevoCSMI(nuevoCertificado)
    .subscribe( (respuesta: any) => {
      //console.log('Al guardar'+respuesta);
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando el Certificado de Movilización registrado.',
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
      title: 'Buscando predios de origen ...',
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
        return item.codigoTipoArea === 'ex_pec_bov';
      });
      //this.cargarBovinosProductor();
      Swal.close();
    });
  }

  /**
   * Carga los datos de los bovinos
   */
  cambioAreaOrigen(){
    this.origenSeleccionado = null;
    // Buscamos el área seleccionada para mostrarla
    this.listaAreaOrigen.forEach( (itemArea: Area) => {
      if ( Number(itemArea.idArea) === Number(this.formulario.value.area_origen) ) {
        this.origenSeleccionado = itemArea;
        this.codigoAreaOrigen = itemArea['codigoTipoArea'];//.codigoTipoArea;
        //console.log('A Origen:' + this.codigoAreaOrigen);
      }
    });
    // Disponibles
    this.ternerasDisponibles = 0;
    this.ternerosDisponibles = 0;
    this.vaconasDisponibles = 0;
    this.toretesDisponibles = 0;
    this.vacasDisponibles = 0;
    this.torosDisponibles = 0;
    this.bufalosHembrasDisponibles = 0;
    this.bufalosMachosDisponibles = 0;
    //this.ternerosDescarteDisponibles = 0;
    // Agregados
    this.ternerasAgregados = 0;
    this.ternerosAgregados = 0;
    this.vaconasAgregados = 0;
    this.toretesAgregados = 0;
    this.vacasAgregados = 0;
    this.torosAgregados = 0;
    this.bufalosHembrasAgregados = 0;
    this.bufalosMachosAgregados = 0;
    //this.ternerosDescarteAgregados = 0;
    this.cambioTickets();
    // Verificamos que el predio esté activo para cargar los bovinos, sino no mostrar nada.
    if ( this.origenSeleccionado?.codigoEstadoSitio !== 'AC' ){
      return;
    }
    if ( this.formulario.value.propietario_animales === null ) {
      Swal.fire('¡Advertencia!', 'No existe un usuario ganadero seleccionado','warning');
      this.formulario.controls.area_origen.reset();
      return;
    }
    Swal.fire({
      title: 'Buscando bovinos vacunados en el predio...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    
    /*this.servicioBovinoVacunado.obtenerBovinosVacunados({
      idAreaActual: this.formulario.value.area_origen,
      codigoEstadoAnimal: 'vivo',
      idUsuarioActual: this.formulario.value.propietario_animales,
      codigoEstadoUbicacion: 'SIT',
      codigoTipoRegistro: 'n-general',
      codigoEstadoRegistro: 'DISP',
      estado: 1
    })*/

    this.servicioBovinoVacunado.obtenerBovinosVacunadosWs({
      idUsuarioActual: this.formulario.value.propietario_animales,
      idAreaActual: this.formulario.value.area_origen,
      estadoUbicacion: 'SIT'
    })

    .subscribe( (listaBovinosVacunados: BovinoCertificadoVacunacion[]) => {
      this.listaBovinosVacunadosDisponibles = listaBovinosVacunados;
      this.listaBovinosVacunadosDisponibles.forEach( (itemBovino: BovinoCertificadoVacunacion) => {
        if ( itemBovino.codigoCategoria === 'ternera' ) {
          this.ternerasDisponibles++;
        } else if ( itemBovino.codigoCategoria === 'ternero' ) {
          this.ternerosDisponibles++;
        } else if ( itemBovino.codigoCategoria === 'vacona' ){
          this.vaconasDisponibles++;
        } else if ( itemBovino.codigoCategoria === 'torete' ) {
          this.toretesDisponibles++;
        } else if ( itemBovino.codigoCategoria === 'vaca' ){
          this.vacasDisponibles++;
        } else if ( itemBovino.codigoCategoria === 'toro' ) {
          this.torosDisponibles++;
        } else if ( itemBovino.codigoSexo === 'macho' && itemBovino.codigoTaxonomia === 'bubalus_bubalis') {
          this.bufalosMachosDisponibles++;
        } else if ( itemBovino.codigoSexo === 'hembra' && itemBovino.codigoTaxonomia === 'bubalus_bubalis') {
          this.bufalosHembrasDisponibles++;
        } else {
          console.log('Bovino categoriza: ', itemBovino);
        }
      });
      Swal.close();
    });
    this.obtenerBovinosDescarte();
  }

   /**
   * Obtenemos los terneros no vacunados para enviarlos al centro de faenamiento.
   */
    obtenerBovinosDescarte(){
     // this.listaTernerosDescarte = [];

      // Disponibles
    this.ternerasDescarteDisponibles = 0;
    this.ternerosDescarteDisponibles = 0;
    this.bufalosHembrasDescarteDisponibles = 0;
    this.bufalosMachosDescarteDisponibles = 0;
    // Agregados
    this.ternerasDescarteAgregados = 0;
    this.ternerosDescarteAgregados = 0;
    this.bufalosHembrasDescarteAgregados = 0;
    this.bufalosMachosDescarteAgregados = 0;
    this.ternerosDescarteAgregados = 0;

      Swal.fire({
        title: 'Buscando nacimientos de bovinos y búfalos aprobados en este sitio...',
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
        this.listaTernerosDescarte = listaBovinosNacimientos;
        //this.ternerosDescarteDisponibles = this.listaTernerosDescarte.length;

        this.listaTernerosDescarte.forEach( (itemBovino: Bovino) => {
          if ( itemBovino.codigoCategoria === 'ternera' ) {
            this.ternerasDescarteDisponibles++;
          } else if ( itemBovino.codigoCategoria === 'ternero' ) {
            this.ternerosDescarteDisponibles++;
          } else if ( itemBovino.codigoSexo === 'macho' && itemBovino.codigoTaxonomia === 'bubalus_bubalis') {
            this.bufalosMachosDescarteDisponibles++;
          } else if ( itemBovino.codigoSexo === 'hembra' && itemBovino.codigoTaxonomia === 'bubalus_bubalis') {
            this.bufalosHembrasDescarteDisponibles++;
          } else {
            console.log('Bovino categoriza: ', itemBovino);
          }
        });

        Swal.close();
      });
  
    }

    /**
   * Carga los datos de los bovinos
   */
     actualizarTickets(){
      
      Swal.fire({
        title: 'Actualizando Tickets del sitio...',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
  
      this.servicioBovinoVacunado.obtenerBovinosVacunadosWs({
        idUsuarioActual: this.formulario.value.propietario_animales,
        idAreaActual: this.formulario.value.area_origen,
        estadoUbicacion: 'SIT'
      })
  
      .subscribe( (listaBovinosVacunados: BovinoCertificadoVacunacion[]) => {
        this.listaBovinosVacunadosDisponibles = listaBovinosVacunados;
        Swal.close();
      });

      this.servicioBovino.obtenerBovinosNacimientos({
        estadoUbicacion:'SIT',
        idAreaActual: this.formulario.value.area_origen
      })

      .subscribe( ( listaBovinosNacimientos: Bovino[]) => {
        this.listaTernerosDescarte = listaBovinosNacimientos;
        Swal.close();
      });
    }

  /**
   * Obtenemos los terneros no vacunados para enviarlos al centro de faenamiento.
   */
  obtenerBovinosDescarte2(){
    this.listaTernerosDescarte = [];
    this.ternerosDescarteAgregados = 0;
    this.ternerosDescarteDisponibles = 0;
    Swal.fire({
      title: 'Buscando terneros para descarte en el predio...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioBovino.filtrarBovinos({
      idUsuarioActual: this.formulario.value.propietario_animales,
      idAreaActual: this.formulario.value.area_origen,
      codigoEstadoAnimal: 'vivo',
      codigoEstadoUbicacion:'SIT',
      codigoCategoria: 'ternero',
      codigoTipoRegistro: 'n-descarte',
      codigoEstadoRegistro: 'DISP'
    })
    .subscribe( ( terneros: Bovino[]) => {
      this.listaTernerosDescarte = terneros;
      this.ternerosDescarteDisponibles = this.listaTernerosDescarte.length;
      Swal.close();
    });

  }

  /**
   * Obtenemos los datos de un bovino
   */
   obtenerBovinoTicketAntiguo(){
    this.BovinoTicket = [];
    
    Swal.fire({
      title: 'Buscando información del Ticket...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioBovino.filtrarBovinos({
      codigoEstadoAnimal: 'vivo',
      codigoTipoRegistro: 'n-general',
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
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#CC0000" size="+1">NO DISPONIBLE</font></b> <br><br> <b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "MOVIMIENTO")){
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#FF9900" size="+1">EN USO</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "EN SITIO")){
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#006600" size="+1">DISPONIBLE</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br> <b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+' <br><br> Por favor, actualizar Tickets disponibles...', 'warning');
        }

        } );
      } else
      {
        Swal.fire('¡Alerta!', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">NO EXISTE </font></b>', 'warning');
        this.formulario.controls.numero_ticket.setValue(null);
      }
    });
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
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#CC0000" size="+1">NO DISPONIBLE</font></b> <br><br> <b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "MOVIMIENTO")){
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#FF9900" size="+1">EN USO</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br><b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+'', 'warning');
          this.formulario.controls.numero_ticket.setValue(null);
          return;
        }

        if((itemBovino.idAreaActual == this.formulario.value.area_origen) && (itemBovino.nombreEstadoUbicacion.toUpperCase() == "EN SITIO")){
          Swal.fire('¡Alerta!', '<b>TICKET '+itemBovino.idBovino+' | <font color="#006600" size="+1">DISPONIBLE</font></b> <br><br><b>CC/CI/RUC: </b>'+itemBovino.numeroIdentificacionUsuarioActual+'<br><b>PROPIETARIO: </b>'+itemBovino.nombresUsuarioActual+'<br> <b>CATEGORÍA: </b>'+cat.toUpperCase()+' <br><b>SITIO ACTUAL: </b>'+itemBovino.nombreAreaActual.toUpperCase()+'<br><b>ESTADO: </b>'+itemBovino.nombreEstadoUbicacion.toUpperCase()+' <br><br> Por favor, actualizar Tickets disponibles...', 'warning');
        }

        } );
      } else
      {
        Swal.fire('¡Alerta!', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">NO EXISTE </font></b>', 'warning');
        this.formulario.controls.numero_ticket.setValue(null);
      }
    });
  }

  /**
   * Busca el bovino y lo agrega a la lista para ser movilizados
   */
   agregarBovinoTicket(){

    console.log('Bovinos del predio', this.listaBovinosVacunadosDisponibles);
    console.log('Nacimientos del predio', this.listaTernerosDescarte);
    console.log('Número de ticket: ', this.formulario.value.numero_ticket);

    if (this.formulario.value.area_origen === null){
      Swal.fire('Alerta', 'Por favor, seleccione un predio de origen...', 'warning');
      this.formulario.controls.numero_ticket.setValue(null);
      return;
    }

    if (this.formulario.value.numero_ticket == null || this.formulario.value.numero_ticket.trim() == "" ){
      Swal.fire('Alerta', 'Ingrese un número de Ticket', 'warning');
      this.formulario.controls.numero_ticket.setValue(null);
      return;
    }

    if ((this.listaBovinosVacunadosDisponibles.findIndex( (item: BovinoCertificadoVacunacion) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 ) && (this.listaTernerosDescarte.findIndex( (item: Bovino) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 )){
    
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
        Swal.fire('¡Alerta!', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">YA REGISTRADO </font></b>', 'warning');
    } 

    // Si no lo encuentra entonces lo agrega
    if (this.listaBovinosTicketsD.findIndex( (item: Bovino) => Number(item.idBovino) === Number(this.formulario.value.numero_ticket.trim()) ) === -1 ){
      this.listaTernerosDescarte.forEach( ( itemBovino: Bovino) => {
        if (Number(this.formulario.value.numero_ticket.trim()) === Number(itemBovino.idBovino) ) {
          this.listaBovinosTicketsD.push(itemBovino);
        }
      } );
    } else {
        Swal.fire('¡Alerta!', '<b>TICKET '+this.formulario.value.numero_ticket.trim()+' | <font color="#CC0000" size="+1">YA REGISTRADO </font></b>', 'warning');
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

  /**
   * Aumenta o disminuye la cantidad de terneras movilizarse
   * @param cantidad 
   */
  cambioTerneras(cantidad: number){
    if ( cantidad > 0 ) {
      this.ternerasDisponibles--;
      this.ternerasAgregados++;
    } else {
      this.ternerasDisponibles++;
      this.ternerasAgregados--;
    }
  }

  /**
   * Aumenta o disminuye la cantidad de terneros para movilizarse
   * @param cantidad 
   */
  cambioTerneros(cantidad: number){
    if ( cantidad > 0 ) {
      this.ternerosDisponibles--;
      this.ternerosAgregados++;
    } else {
      this.ternerosDisponibles++
      this.ternerosAgregados--;
    }

  }

  /**
   * Aumenta o disminuye la cantidad de vacunas para movilizarse
   * @param cantidad 
   */
  cambioVaconas(cantidad: number){
    if ( cantidad > 0 ) {
      this.vaconasDisponibles--;
      this.vaconasAgregados++;
    } else {
      this.vaconasDisponibles++;
      this.vaconasAgregados--;

    }
  }

  /**
   * Aumenta o disminuye la cantidad de toretes para movilizarse
   * @param cantidad 
   */
  cambioToretes(cantidad: number){
    if ( cantidad > 0 ) {
      this.toretesDisponibles--;
      this.toretesAgregados++;
    } else {
      this.toretesDisponibles++;
      this.toretesAgregados--;

    }
  }

  /**
   * Aumenta o disminuye la cantidad de vacas para movilizarse
   * @param cantidad 
   */
  cambioVacas(cantidad: number){
    if ( cantidad > 0) {
      this.vacasDisponibles--;
      this.vacasAgregados++;
    } else {
      this.vacasDisponibles++;
      this.vacasAgregados--;

    }
  }
  
  /**
   * Aumenta o disminuye la cantidad de toros para movilizarse
   * @param cantidad 
   */
  cambioToros(cantidad: number){
    if ( cantidad > 0 ) {
      this.torosDisponibles--;
      this.torosAgregados++;
    } else {
      this.torosDisponibles++;
      this.torosAgregados--;
    }
  }

  /**
   * Aumenta o disminuye la cantidad de búfalos hembras para movilizarse
   * @param cantidad 
   */
  cambioBufalosHembras(cantidad: number){
    if ( cantidad > 0 ) {
      this.bufalosHembrasDisponibles--;
      this.bufalosHembrasAgregados++;
    } else {
      this.bufalosHembrasDisponibles++;
      this.bufalosHembrasAgregados--;

    }
  }

  /**
   * Aumenta o disminuye la cantidad de búfalos machos para movilizarse
   * @param cantidad 
   */
  cambioBufalosMachos(cantidad: number){
    if ( cantidad > 0 ) {
      this.bufalosMachosDisponibles--;
      this.bufalosMachosAgregados++;
    } else {
      this.bufalosMachosDisponibles++;
      this.bufalosMachosAgregados--;

    }
  }

  /**
   * Aumenta o disminuye la cantidad de terneras para descarte para movilizarse
   * @param cantidad 
   */
   cambioTernerasDescarte(cantidad: number){
    if ( cantidad > 0 ) {
      this.ternerasDescarteDisponibles--;
      this.ternerasDescarteAgregados++;
    } else {
      this.ternerasDescarteDisponibles++;
      this.ternerasDescarteAgregados--;
    }
  }

  /**
   * Aumenta o disminuye la cantidad de terneros para descarte para movilizarse
   * @param cantidad 
   */
  cambioTernerosDescarte(cantidad: number){
    if ( cantidad > 0 ) {
      this.ternerosDescarteDisponibles--;
      this.ternerosDescarteAgregados++;
    } else {
      this.ternerosDescarteDisponibles++;
      this.ternerosDescarteAgregados--;
    }
  }

  /**
   * Aumenta o disminuye la cantidad de búfalos hembras de descarte para movilizarse
   * @param cantidad 
   */
   cambioBufalosDescarteHembras(cantidad: number){
    if ( cantidad > 0 ) {
      this.bufalosHembrasDescarteDisponibles--;
      this.bufalosHembrasDescarteAgregados++;
    } else {
      this.bufalosHembrasDescarteDisponibles++;
      this.bufalosHembrasDescarteAgregados--;

    }
  }

  /**
   * Aumenta o disminuye la cantidad de búfalos de descarte machos para movilizarse
   * @param cantidad 
   */
  cambioBufalosDescarteMachos(cantidad: number){
    if ( cantidad > 0 ) {
      this.bufalosMachosDescarteDisponibles--;
      this.bufalosMachosDescarteAgregados++;
    } else {
      this.bufalosMachosDescarteDisponibles++;
      this.bufalosMachosDescarteAgregados--;

    }
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
    //if(this.formulario.value.tickets){

    //}
  }

  // Método que obtiene los datos de provincias.
cargarProvinciasPorPais(idPais: number) {
  this._provinciaService.getProvinciasPorPais(idPais)
  .subscribe( respuesta => this.listaProvincias = respuesta );
}

}
