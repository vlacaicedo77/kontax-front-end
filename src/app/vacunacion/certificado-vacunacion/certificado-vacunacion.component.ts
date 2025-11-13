import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import Swal from 'sweetalert2';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { CrearUsuarioExternoService } from '../../usuarios-externos/crear-usuario-externo/servicios/crear-usuario-externo.service';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { AnimalCertificado } from '../../modelos/animal-certificado.modelo';
import { SexoService } from '../../servicios/sexo/sexo.service';
import { Sexo } from '../../modelos/sexo.modelo';
import { TaxonomiaService } from '../../servicios/taxonomia.service';
import { Taxonomia } from '../../modelos/taxonomia.modelo';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { Categoria } from 'src/app/modelos/categoria.modelo';
import { InterrogantesService } from '../../servicios/interrogantes.service';
import { InterroganteFaseVacunacion } from '../../modelos/interrogante-fase-vacunacio.modelo';
import { InterroganteCertificadoVacunacion } from '../../modelos/interrogante-certificado-vacunacion.modelo';
import { CertificadoVacunacion } from '../../modelos/certificado-vacunacion.modelo';
import { CoberturaOficina } from '../../modelos/cobertura-oficina.modelo';
import { CoberturaOficinaService } from '../../servicios/cobertura-oficina.service';
import { FiguraPersonaService } from '../../servicios/figura-persona.service';
import { FiguraPersona } from '../../modelos/figura-persona.modelo';
import { Router } from '@angular/router';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';
import { TipoActividadAreaService } from '../../servicios/tipo-actividad-area/tipo-actividad-area.service';
import { TipoActividad } from '../../modelos/tipo-actividad.modelo';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { LaboratorioService } from '../../servicios/laboratorio.service';
import { LoteService } from '../../servicios/lote.service';
import { Laboratorio } from '../../modelos/laboratorio.modelo';
import { Lote } from '../../modelos/lote.modelo';
import { AreaService } from '../../servicios/area/area.service';
import { Area } from '../../modelos/area.modelo';

@Component({
  selector: 'app-certificado-vacunacion',
  templateUrl: './certificado-vacunacion.component.html',
  styles: [
  ]
})
export class CertificadoVacunacionComponent implements OnInit {

  nombrePDF: string = 'documento';
  formulario: FormGroup;
  usuarioExterno: Usuario;
  listaFasesVacunaciones: FaseVacunacion[];
  listaDigitadorasOficinas: PersonaOficina[];
  listaSecuenciasCertificados: SecuenciaCertificado[];
  listaSecuenciasCertificadosFiltrados: SecuenciaCertificado[] = [];
  listaBrigadistasOficinas: PersonaOficina[];
  brigadistaSeleccionado?: PersonaOficina;
  listaUsuariosPropietariosAnimales: UsuarioExterno[];
  usuarioPropietarioSeleccionado: UsuarioExterno;
  propietarioPredio: boolean;
  tecnicoVacunador: boolean;
  listaUsuariosInternos: any[];
  tecnicoAgrocalidadSeleccionado: any;
  // ---------------------------
  // Bovinos vacunados
  terneras: AnimalCertificado = new AnimalCertificado();
  terneros: AnimalCertificado = new AnimalCertificado();
  vacas: AnimalCertificado = new AnimalCertificado();
  vaconas: AnimalCertificado = new AnimalCertificado();
  toros: AnimalCertificado = new AnimalCertificado();
  toretes: AnimalCertificado = new AnimalCertificado();
  bufalosMachos: AnimalCertificado = new AnimalCertificado();
  bufalosHembras: AnimalCertificado = new AnimalCertificado();
  // Otras especies en el predio
  ovinosMachos: AnimalCertificado = new AnimalCertificado();
  ovinosHembras: AnimalCertificado = new AnimalCertificado();
  caprinosMachos: AnimalCertificado = new AnimalCertificado();
  caprinosHembras: AnimalCertificado = new AnimalCertificado();
  camelidosMachos: AnimalCertificado = new AnimalCertificado();
  camelidosHembras: AnimalCertificado = new AnimalCertificado();
  equinosMachos: AnimalCertificado = new AnimalCertificado();
  equinosHembras: AnimalCertificado = new AnimalCertificado();
  porcinosMachos: AnimalCertificado = new AnimalCertificado();
  porcinosHembras: AnimalCertificado = new AnimalCertificado();
  // ---------------------------
  otrasEspecies: AnimalCertificado[] = [];
  listaSexos: Sexo[] = [];
  listaTaxonomias: Taxonomia[] = [];
  listaCategorias: Categoria[] = [];
  listaCategoriasFiltradas: Categoria[] = [];
  mostrarCategoria: boolean;
  mostrarSexo: boolean;
  mostrarTotal: boolean;
  mostrarVacunados: boolean;
  taxonomiaSelecionada: Taxonomia = null;
  sexoSeleccionado: Sexo = null;
  listaInterrogantesFaseVacunacion: InterroganteFaseVacunacion[] = [];
  listaInterrogantesCertificadosVacunacion: InterroganteCertificadoVacunacion[] = [];
  listacoberturasOficinas: CoberturaOficina[];
  listaFigurasPersonas: FiguraPersona[];
  listaPersonasReceptoras: UsuarioExterno[];
  usuarioReceptorSeleccionado: UsuarioExterno;
  listaParroquias: Parroquia[] = [];
  coberturaSeleccionada?: CoberturaOficina;
  listaTiposActividades: TipoActividad[] = [];
  listaLaboratorios: Laboratorio[] = [];
  listaLotes: Lote[] = [];
  inicio: number;
  fin: number;
  diferencia: number;
  listaPredios: Area[] = [];
  predioSeleccionado: Area;
  mostrarCorreo: boolean = false;
  isVisible = false; // Variable para ocultar div

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioPersonaOficina: PersonaOficinaService,
    private servicioSecuenciaCertificado: SecuenciaCertificadoService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
    private servicioSexo: SexoService,
    private servicioTaxonomia: TaxonomiaService,
    private servicioCategoria: CategoriaService,
    private servicioInterrogante: InterrogantesService,
    private servicioCoberturaOficina: CoberturaOficinaService,
    private servicioFiguraPersona: FiguraPersonaService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService,
    private servicioParroquia: ParroquiaService,
    private servicioTipoActividadArea: TipoActividadAreaService,
    private enrutador: Router,
    private servicioVisorPdf: VisorPdfService,
    private servicioLaboratorio: LaboratorioService,
    private servicioLote: LoteService,
    private servicioArea: AreaService
  ) {
    this.inicializarObjetosBovinos();
    this.inicio = 0;
    this.fin = 100;
    this.diferencia = 100;
   }

  ngOnInit(): void {
    this.coberturaSeleccionada = null;
    this.mostrarCategoria = false;
    this.mostrarSexo = false;
    this.mostrarTotal = false;
    this.mostrarVacunados = false;
    this.propietarioPredio = false;
    this.tecnicoVacunador = false;
    this.brigadistaSeleccionado = null;
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerTiposActividades();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.usuarioExterno = this.servicioUsuario.usuarioExterno;
      this.obtenerFaseVacunacion();
      this.obtenerSexos();
      this.obtenerTaxonomias();
      this.obtenerCategorias();
      this.obtenerFigurasPersonas();
      this.obtenerLaboratorios();
    }
    this.servicioVisorPdf.notificacion.subscribe( (valor: any) => {
      if ( valor === 'cerrar') {
        console.log('Se cierra el panel');
        this.enrutador.navigate(['lista-certificados-vacunacion']);
      }
    });
  }

  /**
   * Método que inicializa el formulario
   */
  inicializarFormulario(){
    this.formulario = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_vacunacion: new FormControl(null, Validators.required),
      cobertura: new FormControl(null, Validators.required),
      numero_certificado: new FormControl(null, Validators.required),
      fecha_vacunacion: new FormControl(null, Validators.required),
      tecnico_vacunador: new FormControl(null),
      tecnico_agrocalidad: new FormControl(null),
      propietario_animales: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      canton: new FormControl(null, Validators.required),
      parroquia: new FormControl(null, Validators.required),
      nombre_predio: new FormControl(null),
      nombre_predio_ac: new FormControl(null),
      sitio_via: new FormControl(null),
      sitio_via_ac: new FormControl(null),
      telefono: new FormControl(null),
      telefono_ac: new FormControl(null),
      zona: new FormControl('ND'),
      latitud: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      longitud: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$')),
      latitud_ac: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      longitud_ac: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$')),
      marca: new FormControl(null),
      tipo: new FormControl(null, Validators.required),
      observacion: new FormControl(null),
      laboratorio: new FormControl(null, Validators.required),
      lote: new FormControl(null, Validators.required),
      valor_vacunas: new FormControl(0),
      receptor_certificado: new FormControl(null, Validators.required),
      figura: new FormControl(null, Validators.required),
      nuevo_predio: new FormControl(false, Validators.required),
      area: new FormControl(null)
    }, [
      this.brigadistaObligatorio('tecnico_vacunador'),
      this.tecnicoAgrocalidadObligatorio('tecnico_agrocalidad'),
      this.areaObligatoria('area', 'nuevo_predio'),
      this.datosNuevaAreaObligatorio('nombre_predio', 'sitio_via', 'telefono', 'latitud', 'longitud', 'nuevo_predio')
    ]);
  }

  /**
   * Si nuevo predio es falso entonces el área debe seleccionarse.
   */
  areaObligatoria(itemArea: string, itemPredio: string){
    return ( formulario_animal: FormGroup) => {
      const predio = formulario_animal.controls[itemPredio].value;
      const area = formulario_animal.controls[itemArea].value;
      if ( predio === false && area === null ) {
        return {
          areaObligatoria: true
        };
      }
      return null;
    };
  }
  /**
   * Determina que los campos del nueva área sean ingresados
   * @returns 
   */
  datosNuevaAreaObligatorio(nombrePredio: string, sitioVia: string, telefono: string, latitud: string, longitud: string, nuevoPredio: string){
    return (formularioAnimal: FormGroup) => {
      const valorNombrePredio  = formularioAnimal.controls[nombrePredio].value;
      const valorSitioVia = formularioAnimal.controls[sitioVia].value;
      const valorTelefono = formularioAnimal.controls[telefono].value;
      const valorLatitud = formularioAnimal.controls[latitud].value;
      const valorLongitud = formularioAnimal.controls[longitud].value;
      const valorPredioNuevo = Boolean(formularioAnimal.controls[nuevoPredio].value);
      if ( valorPredioNuevo ) {
        let parametros: any = {};
        if ( valorNombrePredio === null || valorNombrePredio.length === 0 ) {
          parametros.requiereNombrePredio = true;
        }
        if ( valorSitioVia === null || valorSitioVia.length === 0 ) {
          parametros.requiereSitioVia = true;
        }
        //console.log(parametros);
        if ( Object.keys(parametros).length > 0 ){
          return parametros;
        }
      }
      return null;
    };
  }

  noVacunadosObligatorio(control: string){
    return ( formulario_animal: FormGroup) => {
      const no_vacunados = formulario_animal.controls[control].value;
      if ( no_vacunados === null && this.mostrarVacunados) {
        return {
          noVacunadosObligatorio: true
        };
      }
      return null;
    };
  }

  vacunadosObligatorio(control: string){
    return ( formulario_animal: FormGroup) => {
      const vacunados = formulario_animal.controls[control].value;
      if ( vacunados === null && this.mostrarVacunados ) {
        return {
          vacunadosObligatorio: true
        };
      }
      return null
    }
  }

  categoriaObligatoria(control: string){
    return ( formulario_animal: FormGroup) => {
      const categoria = formulario_animal.controls[control].value;
      if ( this.mostrarCategoria && categoria === null) {
        return {
          categoriaObligatoria: true
        };
      }
      return null;
    };
  }

  totalObligatorio(control: string){
    return ( formulario_animal: FormGroup) => {
      const total = formulario_animal.controls[control].value;
      if( this.mostrarTotal && total === null){
        return {
          totalObligatorio: true
        };
      }
      return null;
    }
  }

  /**
   * Consulta las interrogantes disponibles
   */
  obtenerInterrogantesFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.listaInterrogantesFaseVacunacion = [];
    this.listaInterrogantesCertificadosVacunacion = [];
    this.servicioInterrogante.obtenerInterrotantesDeFaseVacunacion({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      estadoInterrogante: 1
    })
    .subscribe( (interrogantes: InterroganteFaseVacunacion[]) => {
      this.listaInterrogantesFaseVacunacion = interrogantes;
      this.listaInterrogantesFaseVacunacion.forEach( (item: InterroganteFaseVacunacion) => {
        const interrogante = new InterroganteCertificadoVacunacion();
        interrogante.idInterrogante = item.idInterrogante;
        interrogante.seleccionada = Boolean(0);
        this.listaInterrogantesCertificadosVacunacion.push(interrogante);
      });
      Swal.close();
    });
  }

  obtenerNombrePregunta(id: number){
    let pregunta = '';
    this.listaInterrogantesFaseVacunacion.forEach( (item: InterroganteFaseVacunacion) => {
      if(Number(id)=== Number(item.idInterrogante)) {
        pregunta = item.nombreInterrogante;
      }
    });
    return pregunta;
  }

  /**
   * Consulta el catálogo de categorías
   */
  obtenerCategorias(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.listaCategoriasFiltradas = [];
    this.servicioCategoria.obtenerCategorias()
    .subscribe( (categorias: Categoria[]) => {
      this.listaCategorias = categorias;
      Swal.close();
    });
  }

  /**
   * Consulta el catálogo de taxonomías
   */
  obtenerTaxonomias(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.listaTaxonomias = [];
    this.servicioTaxonomia.obtenerTaxonomias()
    .subscribe( ( taxonomias: Taxonomia[] ) => {
      console.log(taxonomias);
      this.listaTaxonomias = taxonomias.filter( (item: Taxonomia) => {
        return item.nombre_comun;
      });
      //this.listaTaxonomias = taxonomias;
      Swal.close();
    });
  }

  /**
   * Consulta el catálogo de sexos
   */
  obtenerSexos(){
    this.listaSexos = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioSexo.obtenerSexos().subscribe( (sexos: Sexo[]) => {
      this.listaSexos = sexos;
      console.log(this.listaSexos);
      Swal.close();
    });
  }

  /**
   * Valida la obligatoriedad del brigadista.
   * @param tecnico 
   */
  brigadistaObligatorio( tecnico: string){
    return ( formulario_cuv: FormGroup) => {
      const brigadista = formulario_cuv.controls[tecnico].value;
      if ( this.tecnicoVacunador === false && brigadista === null ){
        return {
          brigadistaObligatorio: true
        };
      }
      return null;
    };
  }

  /**
   * Valida la obligatoriedad del técnico de agrocalidad.
   * @param tecnico 
   */
  tecnicoAgrocalidadObligatorio( tecnico: string){
    return ( formulario_cuv: FormGroup) => {
      const tecnicoAgrocalidad = formulario_cuv.controls[tecnico].value;
      if ( this.tecnicoVacunador && tecnicoAgrocalidad === null ) {
        return {
          tecnicoAgrocalidadObligatorio: true
        };
      }
      return null;
    };
  }

  /**
   * Confirma que se aceptó el registro del certificado de vacunación.
   * @returns 
   */
  confirmar(){
    this.formulario.markAllAsTouched();
    console.log(this.formulario);
    if ( this.formulario.invalid ) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    if ( !this.formulario.value.nuevo_predio ) {
      if(this.formulario.value.sitio_via_ac == null || this.formulario.value.sitio_via_ac == '')
      {
        Swal.fire('¡Atención!', 'Por favor, ingrese Sitio/Vía', 'warning');
        return;
      }
    }
    // Verificamos que se haya ingresado animales para vacunar
    const cantidadTotal = this.terneras.vacunado + this.terneros.vacunado + this.vacas.vacunado + this.vaconas.vacunado + this.toretes.vacunado + 
    this.toros.vacunado + this.bufalosMachos.vacunado + this.bufalosHembras.vacunado;
    if (Number(cantidadTotal) === 0) {
      Swal.fire('Error', 'La cantidad de animales vacunados no puede ser cero.', 'error');
      return;
    }
    Swal.fire({
      title: '¿Está seguro de registrar el presente certificado de vacunación?',
      text: 'Una vez que registre el Certificado Único de Vacunación, no podrá editarlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, registrar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.registrarCertificadoVacunacion();
      } else {
        console.log('Se cancela el proceso de registro por el usuario.');
        return;
      }
    });
  }
  /**
   * Método que registra el certificado de vacunación
   */
  registrarCertificadoVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando Certificado de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const certificadoVacunacion = new CertificadoVacunacion();
    certificadoVacunacion.idFaseVacunacion = this.formulario.value.fase_vacunacion;
    certificadoVacunacion.idOficina = this.formulario.value.oficina_vacunacion;
    certificadoVacunacion.idSecuencia = this.formulario.value.numero_certificado;
    this.listaSecuenciasCertificados.forEach( (item: SecuenciaCertificado) => {
      if ( Number(item.idSecuencia) === Number(this.formulario.value.numero_certificado) ) {
        certificadoVacunacion.secuencia = item.secuencia;
      }
    });
    this.listaDigitadorasOficinas.forEach( (item: PersonaOficina) => {
      if ( Number(item.idOficina) === Number(this.formulario.value.oficina_vacunacion) ){
        certificadoVacunacion.idOperadora = item.idOperadora;
        certificadoVacunacion.idUsuarioOperadora = item.idUsuarioExternoOperadora;
      }
    });
    //certificadoVacunacion.secuencia = this.formulario.value.numero_certificado;
    certificadoVacunacion.fechaVacunacion = this.formulario.value.fecha_vacunacion;
    certificadoVacunacion.idUsuarioBrigadista = this.formulario.value.tecnico_vacunador;
    certificadoVacunacion.idUsuarioAgrocalidad = this.formulario.value.tecnico_agrocalidad;
    certificadoVacunacion.idUsuarioProductor = this.formulario.value.propietario_animales;
    certificadoVacunacion.idProvincia = this.formulario.value.provincia;
    certificadoVacunacion.idCanton = this.formulario.value.canton;
    certificadoVacunacion.idParroquia = this.formulario.value.parroquia;
    // Predio existente o nuevo
    certificadoVacunacion.idTipoActividad = this.formulario.value.tipo;
    if ( this.formulario.value.nuevo_predio ){
      certificadoVacunacion.nombrePredio = String(this.formulario.value.nombre_predio).toUpperCase();
      certificadoVacunacion.sitioVia = String(this.formulario.value.sitio_via).toUpperCase();
      certificadoVacunacion.telefono = this.formulario.value.telefono;
      certificadoVacunacion.latitud = Number(this.formulario.value.latitud);
      certificadoVacunacion.longitud = Number(this.formulario.value.longitud);
    } else {
      certificadoVacunacion.idSitio = this.predioSeleccionado.idSitio;
      certificadoVacunacion.idArea = this.predioSeleccionado.idArea;
      certificadoVacunacion.nombrePredio = String(this.formulario.value.nombre_predio_ac).toUpperCase();
      certificadoVacunacion.idTipoActividad = this.formulario.value.tipo;
      certificadoVacunacion.sitioVia = String(this.formulario.value.sitio_via_ac).toUpperCase();
      certificadoVacunacion.telefono = this.formulario.value.telefono_ac;
      certificadoVacunacion.latitud = Number(this.formulario.value.latitud_ac);
      certificadoVacunacion.longitud = Number(this.formulario.value.longitud_ac);
    }
    //certificadoVacunacion.zona = this.formulario.value.zona;
    certificadoVacunacion.zona = '';
    certificadoVacunacion.marca = this.formulario.value.marca;
    certificadoVacunacion.observacion = String(this.formulario.value.observacion).toUpperCase();
    certificadoVacunacion.idCobertura = this.formulario.value.cobertura;
    certificadoVacunacion.fechaVacunacion = this.formulario.value.fecha_vacunacion;
    if (this.formulario.value.tecnico_vacunador) {
      certificadoVacunacion.idUsuarioBrigadista = this.formulario.value.tecnico_vacunador;
    }
    certificadoVacunacion.idLaboratorio = this.formulario.value.laboratorio;
    //if ( this.formulario.value.laboratorio ) {
    //  certificadoVacunacion.laboratorio = this.formulario.value.laboratorio;
    //}
    certificadoVacunacion.idLote = this.formulario.value.lote;
    //if ( this.formulario.value.lote ) {
    //  certificadoVacunacion.lote = this.formulario.value.lote;
    //}
    certificadoVacunacion.idUsuarioDigitador = this.servicioUsuario.usuarioExterno.idUsuario;
    certificadoVacunacion.idUsuarioProductor = this.formulario.value.propietario_animales;
    //certificadoVacunacion.idArea = this.formulario.value.area;
    if ( this.formulario.value.observacion === null ) {
      certificadoVacunacion.observacion = this.formulario.value.observacion;
    } else {
      certificadoVacunacion.observacion = String(this.formulario.value.observacion).toUpperCase();
    }
    //certificadoVacunacion.costoVacunas = Number(this.formulario.value.valor_vacunas);
    certificadoVacunacion.costoVacunas = ((this.terneras.vacunado + this.terneros.vacunado + this.vacas.vacunado + this.vaconas.vacunado 
      + this.toretes.vacunado + this.toros.vacunado + this.bufalosMachos.vacunado + this.bufalosHembras.vacunado) * 0.60);
    certificadoVacunacion.idUsuarioResponsable = this.formulario.value.receptor_certificado;
    // Agregamos los animales
    //const listaAnimales: AnimalCertificado = [];
    this.terneras.idFaseVacunacion = this.formulario.value.fase_vacunacion;
    this.listaTaxonomias.forEach( (taxonomia: Taxonomia) => {
      if ( taxonomia.codigo === 'bubalus_bubalis' ) {
        this.bufalosMachos.idTaxonomia = taxonomia.id_taxonomia;
        this.bufalosHembras.idTaxonomia = taxonomia.id_taxonomia;
      }
      if ( taxonomia.codigo === 'capra_hircus_aegagrus' ) {
        this.caprinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.caprinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if ( taxonomia.codigo === 'camelidae' ) {
        this.camelidosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.camelidosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if ( taxonomia.codigo === 'equidae' ) {
        this.equinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.equinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if ( taxonomia.codigo === 'ovis_aries_orientalis' ) {
        this.ovinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.ovinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if ( taxonomia.codigo === 'sus_scrofa_scrofa' ) {
        this.porcinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.porcinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      // Todos los bovinos
      if ( taxonomia.codigo === 'bos_taurus_primigenius' ) {
        this.terneras.idTaxonomia = taxonomia.id_taxonomia;
        this.terneros.idTaxonomia = taxonomia.id_taxonomia;
        this.vaconas.idTaxonomia = taxonomia.id_taxonomia;
        this.toretes.idTaxonomia = taxonomia.id_taxonomia;
        this.vacas.idTaxonomia = taxonomia.id_taxonomia;
        this.toros.idTaxonomia = taxonomia.id_taxonomia;
      }
    });
    this.listaCategorias.forEach( (item: Categoria) => {
      if ( item.codigo === 'ternera' ) {
        this.terneras.idCategoria = item.id_categoria;
      }
      if ( item.codigo === 'ternero' ) {
        this.terneros.idCategoria = item.id_categoria;
      }
      if ( item.codigo === 'torete' ) {
        this.toretes.idCategoria = item.id_categoria;
      }
      if ( item.codigo === 'toro' ) {
        this.toros.idCategoria = item.id_categoria;
      }
      if ( item.codigo === 'vaca' ) {
        this.vacas.idCategoria = item.id_categoria;
      }
      if ( item.codigo === 'vacona' ) {
        this.vaconas.idCategoria = item.id_categoria;
      }
    });
    this.bufalosHembras.cantidadAnimal = this.bufalosHembras.vacunado + this.bufalosHembras.noVacunado;
    this.bufalosMachos.cantidadAnimal = this.bufalosMachos.vacunado + this.bufalosMachos.noVacunado;
    this.terneras.cantidadAnimal = this.terneras.vacunado + this.terneras.noVacunado;
    this.terneros.cantidadAnimal = this.terneros.vacunado + this.terneros.noVacunado;
    this.vaconas.cantidadAnimal = this.vaconas.vacunado + this.vaconas.noVacunado;
    this.toretes.cantidadAnimal = this.toretes.vacunado + this.toretes.noVacunado;
    this.vacas.cantidadAnimal = this.vacas.vacunado + this.vacas.noVacunado;
    this.toros.cantidadAnimal = this.toros.vacunado + this.toros.noVacunado;
    this.listaSexos.forEach( (sexo: Sexo) => {
      if ( sexo.codigo === 'hembra' ) {
        this.bufalosHembras.idSexo = sexo.id_sexo;
        this.caprinosHembras.idSexo = sexo.id_sexo;
        this.camelidosHembras.idSexo = sexo.id_sexo;
        this.equinosHembras.idSexo = sexo.id_sexo;
        this.ovinosHembras.idSexo = sexo.id_sexo;
        this.porcinosHembras.idSexo = sexo.id_sexo;
        this.terneras.idSexo = sexo.id_sexo;
        this.vaconas.idSexo = sexo.id_sexo;
        this.vacas.idSexo = sexo.id_sexo;
      } else if ( sexo.codigo === 'macho' ){
        this.bufalosMachos.idSexo = sexo.id_sexo;
        this.caprinosMachos.idSexo = sexo.id_sexo;
        this.camelidosMachos.idSexo = sexo.id_sexo;
        this.equinosMachos.idSexo = sexo.id_sexo;
        this.ovinosMachos.idSexo = sexo.id_sexo;
        this.porcinosMachos.idSexo = sexo.id_sexo;
        this.terneros.idSexo = sexo.id_sexo;
        this.toretes.idSexo = sexo.id_sexo;
        this.toros.idSexo = sexo.id_sexo;
      }
    });
    certificadoVacunacion.animales = [];
    certificadoVacunacion.animales.push(this.bufalosHembras, this.caprinosHembras, this.camelidosHembras, this.equinosHembras,
      this.ovinosHembras, this.porcinosHembras, this.terneras, this.vaconas, this.vacas, this.bufalosMachos, this.caprinosMachos,
      this.camelidosMachos, this.equinosMachos, this.ovinosMachos, this.porcinosMachos, this.terneros, this.toretes, this.toros);
    //certificadoVacunacion.animales = this.listaAnimales;
    certificadoVacunacion.interrogantes = this.listaInterrogantesCertificadosVacunacion;
    certificadoVacunacion.idFiguraPersona = this.formulario.value.figura;
    console.log('Registrar certificado vacunación: ', certificadoVacunacion);
    this.servicioCertificadoVacunacion.registrarCertificadoVacunacion(certificadoVacunacion)
    .subscribe( (respuesta: any) => {
      Swal.fire({
        title: 'Espere...',
        text: 'Se está registrando el Certificado Único de Vacunación.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.servicioCertificadoVacunacion.obtenerPdfCertificadoUnicoVacunacion(respuesta.idCertificadoVacunacion)
      .subscribe( (resp: any) => {
        Swal.fire(
          'Éxito',
          'Registró correctamente el Certificado Único de Vacunación.',
          'success'
        ).then( () => {
          this.nombrePDF = resp.nombreArchivo;
          this.servicioVisorPdf.establecerArchivoDesdeBase64(resp.contenido);
          this.servicioVisorPdf.abrir();
          //this.enrutador.navigate(['lista-certificados-vacunacion']);
        });
      });
      this.formulario.reset();
      this.listaDigitadorasOficinas = [];
      this.listacoberturasOficinas = [];
      this.listaSecuenciasCertificadosFiltrados = [];
      this.listaSecuenciasCertificados = [];
      this.listaUsuariosInternos = [];
      this.listaBrigadistasOficinas = [];
      this.listaUsuariosPropietariosAnimales = [];
      this.listaPersonasReceptoras = [];
      this.usuarioReceptorSeleccionado = null;
      this.brigadistaSeleccionado = null;
      this.tecnicoAgrocalidadSeleccionado = null;
      this.usuarioPropietarioSeleccionado = null;
    });
  }
  /**
   * Obtiene las fases de vacunación habilitadas.
   */
  obtenerFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Fases de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaFasesVacunaciones = [];
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    }).subscribe( (fases: FaseVacunacion[]) => {
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Buscamos las oficinas asignadas al digitador
   */
  cambioFaseVacunacion(){
    this.formulario.controls.oficina_vacunacion.setValue(null);
    this.formulario.controls.cobertura.setValue(null);
    this.listacoberturasOficinas = [];
    this.obtenerPersonalOficina();
    this.obtenerInterrogantesFaseVacunacion();
    this.formulario.controls.cobertura.setValue(null);
  }

  /**
   * Las oficinas asignadas por digitadoras
   */
  obtenerPersonalOficina(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Oficinas de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaDigitadorasOficinas = [];
    console.log('Consultando oficinas de vacunación');
    this.servicioPersonaOficina.obtenerPersonalDeOficina({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idUsuarioExternoPersona: this.usuarioExterno.idUsuario,
      codigoTipoPersona: 'DIG'
    })
    .subscribe( (personalOficinas: PersonaOficina[]) => {
      this.listaDigitadorasOficinas = personalOficinas;
      console.log(this.listaDigitadorasOficinas);
      Swal.close();
    });
  }

  /**
   * Cambio de la oficina de vacunación
   */
  cambioOficinaVacunacion(){
    //console.log('Digitadoras de oficinas', this.listaDigitadorasOficinas);
    //this.listaDigitadorasOficinas.forEach( (item: PersonaOficina) => {
    //  if ( Number(item.idOficina) === Number(this.formulario.value.oficina_vacunacion)) {
    //    this.obtenerCantones(item.idProvinciaOficina);
    //  }
    //});
    this.formulario.controls.tecnico_vacunador.setValue(null);
    this.formulario.controls.numero_certificado.setValue(null);
    this.obtenerSecuenciasCertificados({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idOficina: this.formulario.value.oficina_vacunacion,
      codigoEstadoSecuencia: 'CRD'
    });
    this.obtenerBrigadistas({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idOficina: this.formulario.value.oficina_vacunacion,
      codigoTipoPersona: 'BRIG',
      estado: 1
    });
    this.obtenerCoberturaOficina();
  }

  /**
   * Obtiene las coberturas por oficina
   */
  obtenerCoberturaOficina(){
    this.formulario.controls.cobertura.setValue(null);
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando coberturas.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const parametros = new CoberturaOficina();
    parametros.idOficina = this.formulario.value.oficina_vacunacion;
    parametros.idFaseVacunacion = this.formulario.value.fase_vacunacion;
    parametros.estado = 1;
    this.listaDigitadorasOficinas.forEach( (item: PersonaOficina) => {
      if( Number(item.idOficina) === Number(this.formulario.value.oficina_vacunacion) ){
        parametros.idOperadora = item.idOperadora;
        parametros.idProvinciaOficina = item.idProvinciaOficina;
        parametros.idCantonOficina = item.idCantonOficina;
        parametros.idParroquiaOficina = item.idParroquiaOficina;
      }
    });
    const cob = new CoberturaOficina();
    this.servicioCoberturaOficina.obtenerCoberturasDeOficina(parametros)
    .subscribe( (coberturasOficinas: CoberturaOficina[]) => {
      this.listacoberturasOficinas = coberturasOficinas;
      Swal.close();
    });
  }

  /**
   * Obtiene las secuencias de los certificados de vacunación de la oficina seleccionada.
   */
  obtenerSecuenciasCertificados(parametros: any){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando secuencias asignadas a la oficina.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    parametros.INICIO = 0;
    parametros.LIMITE = 100;
    this.listaSecuenciasCertificados = [];
    this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados(parametros)
    .subscribe( (secuencias: SecuenciaCertificado[]) => {
      this.listaSecuenciasCertificados = secuencias;
      this.listaSecuenciasCertificadosFiltrados = secuencias;
      Swal.close();
    });
  }

  /**
   * Filtra las secuencias
   */
  cambioFiltroNumeroCertificado(valor: string){
    this.formulario.controls.numero_certificado.setValue(null);
    if (valor.length === 0) {
      this.listaSecuenciasCertificadosFiltrados = this.listaSecuenciasCertificados;
      return;
    }
    const lista: SecuenciaCertificado[] = this.listaSecuenciasCertificadosFiltrados.filter( (item: SecuenciaCertificado) => {
      return item.secuencia.indexOf(valor) >= 0;
    });
    this.listaSecuenciasCertificadosFiltrados = lista;
  }

  /**
   * Obtiene la lista de brigadistas asignados
   */
  obtenerBrigadistas(parametros: any){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando brigadistas asignados a la Oficina de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonaOficina.obtenerPersonalDeOficina(parametros)
    .subscribe( (personalOficinas: PersonaOficina[]) => {
      this.listaBrigadistasOficinas = personalOficinas;
      Swal.close();
    });
  }
  cambioBrigadista(){
    this.brigadistaSeleccionado = null;
    this.listaBrigadistasOficinas.forEach( (item: PersonaOficina) => {
      if ( Number(item.idUsuarioExternoPersona) === Number(this.formulario.value.tecnico_vacunador)){
        this.brigadistaSeleccionado = item;
      }
    });
  }

  /**
   * Buscar propietario de animales
   */
  buscarPropietario(ci: string){
    this.usuarioPropietarioSeleccionado = null;
    this.formulario.controls.propietario_animales.setValue(null);
    console.log('CI/RUC: ', ci);
    this.listaUsuariosPropietariosAnimales = [];
    if ( ci.length === 0) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    })
    .subscribe( (resp: any) => {
      this.listaUsuariosPropietariosAnimales = resp;
      Swal.close();
    });

  }
  /**
   * Cuando se selecciona otro propietario de los animales.
   */
  cambioPropietario(){
    this.listaUsuariosPropietariosAnimales.forEach( (item: UsuarioExterno) => {
      console.log('Identificador: ', this.formulario.value.propietario_animales);
      console.log('Usuario: ', item);
      if (Number(item.idUsuariosExternos) === Number(this.formulario.value.propietario_animales)) {
        this.usuarioPropietarioSeleccionado = item;
      }
    });
    this.cambiarTipoReceptor();
    this.buscarAreasProductor();
  }

  /**
   * Permite agregar un ciudadano si no se lo encuentra.
   */
  agregarCiudadano(){
    this.mostrarCorreo = false;
    this.servicioCrearUsuario.abrir();

  }

  /**
   * Se ejecuta cuando se activa o desactiva la casilla de propietario
   * @param valor 
   */
  cambioPropietarioPredio(valor: boolean){
    this.formulario.controls.sitio.setValue(null);
    this.propietarioPredio = valor;
    console.log(valor);
    if ( this.usuarioPropietarioSeleccionado && !valor) {
      //this.obtenerSitiosPorFiltro({
      //  numeroIdentificacionUsuario: this.usuarioPropietarioSeleccionado.numero_identificacion
      //});
    }
  }

  /**
   * Consultamos los técnicos de Agrocalidad según la provincia
   * @param valor 
   */
  cambioTecnicoVacunador(valor: boolean) {
    this.listaUsuariosInternos = [];
    this.tecnicoAgrocalidadSeleccionado = null;
    this.brigadistaSeleccionado = null;
    this.tecnicoVacunador = valor;
    this.formulario.controls.tecnico_vacunador.setValue(null);
    this.formulario.controls.tecnico_agrocalidad.setValue(null);
    if ( this.tecnicoVacunador ) {
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando de técnicos de Agrocalidad.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      console.log('Consulta de usuarios internos...');
      // Obtenemos la provincia de la oficina seleccionada
      const parametros: any = {};
      //parametros.estado = 2;
      this.listaDigitadorasOficinas.forEach( (item: PersonaOficina) => {
        if ( Number(item.idOficina) === Number(this.formulario.value.oficina_vacunacion) ) {
          parametros.idProvincia = item.idProvinciaOficina;
        }
      });
      this.servicioUsuario.consultarUsuariosInternos(parametros).subscribe( (respuesta: any) => {
        if ( respuesta.resultado ) {
          this.listaUsuariosInternos = respuesta.resultado;
        }
        Swal.close();
      });


    }
  }

  /**
   * Establece el técnico de Agrocalidad seleccionado.
   */
  cambioTecnicoAgrocalidad(){
    this.tecnicoAgrocalidadSeleccionado = null;
    this.listaUsuariosInternos.forEach( (item: any) => {
      if ( Number(item.idUsuariosInternos) === Number(this.formulario.value.tecnico_agrocalidad) ){
        this.tecnicoAgrocalidadSeleccionado = item;
      }
    });
  }

  /**
   * Devuelve el nombre común de la especie
   * @param id 
   */
  obtenerEspeciePorId(id: number):string{
    let especie = '';
    this.listaTaxonomias.forEach( (item: Taxonomia) => {
      if ( Number(item.id_taxonomia) === Number(id) ) {
        especie = item.nombre_comun;
      }
    });
    return especie;
  }
  /**
   * Devuelve el nombre de la categoría
   * @param id 
   */
  obtenerCategoriaPorId(id: number){
    let categoria = '';
    this.listaCategorias.forEach( (item: Categoria) => {
      if ( Number(id) === Number(item.id_categoria) ) {
        categoria = item.nombre;
      }
    });
    return categoria;
  }

  /**
   * Obtiene el nombre del sexo
   * @param id 
   */
  obtenerSexoPorId(id: number) {
    let sexo = '';
    this.listaSexos.forEach( (item: Sexo) => {
      if ( Number(item.id_sexo) === Number(id) ) {
        sexo = item.nombre;
      }
    });
    return sexo;
  }

  /**
   * Obtiene las figuras de las personas
   */
  obtenerFigurasPersonas(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioFiguraPersona.obtenerFigurasPersonas()
    .subscribe( (figuras: FiguraPersona[]) => {
      this.listaFigurasPersonas = figuras;
      Swal.close();
    });
  }

  /**
   * Buscar persona que recibe el certificado
   * @param ci 
   */
  buscarReceptor(ci: string){
    this.usuarioReceptorSeleccionado = null;
    this.formulario.controls.receptor_certificado.setValue(null);
    this.listaPersonasReceptoras = [];
    if ( ci.length === 0) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    }).subscribe( (resp: UsuarioExterno[]) => {
      this.listaPersonasReceptoras = resp;
      Swal.close();
    });
  }

  /**
   * Se ejecuta cuando se selecciona a un reeptor.
   */
  cambioReceptor(){
    this.listaPersonasReceptoras.forEach( (item: UsuarioExterno) => {
      if (Number(item.idUsuariosExternos) === Number(this.formulario.value.receptor_certificado)) {
        this.usuarioReceptorSeleccionado = item;
      }
    });
  }

  /**
   * Buscamos los cantones de la zona de cobertura o las parroquias.
   */
  cambioZonaCobertura(){
    this.formulario.controls.provincia.setValue(null);
    this.formulario.controls.canton.setValue(null);
    this.formulario.controls.parroquia.setValue(null);
    this.coberturaSeleccionada = null;
    // listacoberturasOficinas
    // this.formulario.value.cobertura
    this.listacoberturasOficinas.forEach( (item: CoberturaOficina) => {
      if ( Number(item.idCobertura) === Number(this.formulario.value.cobertura) ) {
        this.coberturaSeleccionada = item;
        this.formulario.controls.provincia.setValue(this.coberturaSeleccionada.idProvinciaCobertura);
        this.formulario.controls.canton.setValue(this.coberturaSeleccionada.idCantonCobertura);
        if ( this.coberturaSeleccionada.idParroquiaCobetura ){
          this.formulario.controls.parroquia.setValue(this.coberturaSeleccionada.idParroquiaCobetura);
        } else {
          this.obtenerParroquias(this.coberturaSeleccionada.idCantonCobertura);
        }
      }
    });

  }

  /**
   * Obtener las parroquias
   * @param idCanton 
   */
  obtenerParroquias(idCanton: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando parroquias.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaParroquias = [];
    this.servicioParroquia.getParroquiasPorCanton(idCanton)
    .subscribe( (parroquias: Parroquia[]) => {
      this.listaParroquias = parroquias;
      Swal.close();
    });
  }

  inicializarObjetosBovinos() {
    // Bovinos
    this.terneras = { vacunado: 0, noVacunado: 0 };
    this.terneros = { vacunado: 0, noVacunado: 0 };
    this.vaconas = { vacunado: 0, noVacunado: 0 };
    this.toretes = { vacunado: 0, noVacunado: 0 };
    this.vacas = { vacunado: 0, noVacunado: 0 };
    this.toros = { vacunado: 0, noVacunado: 0 };
    this.bufalosHembras = { vacunado: 0, noVacunado: 0 };
    this.bufalosMachos = { vacunado: 0, noVacunado: 0 };
    // Otras especies
    this.ovinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.ovinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.caprinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.caprinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.camelidosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.camelidosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.equinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.equinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.porcinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.porcinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
  }

  /**
   * Obtiene los tipos de actividades
   */
  obtenerTiposActividades(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando catálogos.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioTipoActividadArea.getTiposActividadArea()
    .subscribe( (tiposActividades: TipoActividad[]) => {
      this.listaTiposActividades = tiposActividades;
      Swal.close();
    });
  }

  /**
   * Método que se ejecuta para verificar si el tipo de receptor es el propietario, cargar los mismos datos del propietario de los animales.
   */
  cambiarTipoReceptor(){
    this.usuarioReceptorSeleccionado = null;
    this.listaPersonasReceptoras = [];
    this.formulario.controls.receptor_certificado.setValue(null);
    this.listaFigurasPersonas.forEach( ( item: FiguraPersona) => {
      if ( Number(item.idFiguraPersona) === Number(this.formulario.value.figura) && item.grupo === 'FCV' && item.codigo === 'FPP' ) {
        this.listaPersonasReceptoras = this.listaUsuariosPropietariosAnimales;
        this.formulario.controls.receptor_certificado.setValue(this.formulario.value.propietario_animales);
        this.cambioReceptor();
      }
    });
  }

  /**
   * Obtiene los laboratorios registrados
   */
  obtenerLaboratorios(){
    this.listaLotes = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Obteniendo laboratorios.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioLaboratorio.obtenerLaboratorios({estado:1})
    .subscribe( (laboratorios: Laboratorio[]) => {
      this.listaLaboratorios = laboratorios;
      Swal.close();
    });
  }

  /**
   * Obtiene los lotes de un laboratorio
   */
  cambioLaboratorio(){
    this.listaLotes = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Obteniendo lotes.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioLote.obtenerLotes({
      idLaboratorio: this.formulario.value.laboratorio,
      estado:1
    })
    .subscribe( ( lotes: Lote[] ) => {
      this.listaLotes = lotes;
      Swal.close();
    });

  }

  /**
   * Busca todos los certificados que coincidan.
   * @param certificado 
   */
  buscarCertificado(certificado: string){
    if ( certificado.length === 0 ) {
      Swal.fire('Error', 'Ingrese el número del certificado para realizar la búsqueda.', 'error');
    }
    if ( this.formulario.value.oficina_vacunacion === null ) {
      Swal.fire('Error', 'Seleccione una oficina de vacunación para realizar la búsqueda.', 'error');
      return;
    }
    this.obtenerSecuenciasCertificados({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idOficina: this.formulario.value.oficina_vacunacion,
      secuencia: `%${certificado}%`,
      codigoEstadoSecuencia: 'CRD'
    });
    console.log(certificado);
  }

  /**
   * Buscamos los predios del productor
   */
  buscarAreasProductor(){
    if ( this.formulario.value.propietario_animales === null ) {
      Swal.fire('Error', 'Seleccione un productor', 'error');
      return;
    }
    if ( this.formulario.value.parroquia === null ) {
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando predios.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    let parametros: any = {};
    parametros.idParroquiaSitio = this.formulario.value.parroquia;
    parametros.idUsuariosExternos = this.formulario.value.propietario_animales;
    parametros.estado = 1;
    this.listaPredios = [];
    this.servicioArea.obtenerAreasPorFiltro(parametros)
    .subscribe( (predios: Area[]) => {
      this.listaPredios = predios;
      console.log(predios);
      Swal.close();
    });
  }

  /**
   * Cuando se actia o desactiva la selección de nuevo predio
   */
  nuevoPredio(){
    this.predioSeleccionado = null;
    //console.log(this.formulario.value.nuevo_predio);
    if ( this.formulario.value.nuevo_predio ){
      this.formulario.controls.tipo.setValue(null);
      this.formulario.controls.nombre_predio.setValue(null);
      this.formulario.controls.sitio_via.setValue(null);
      this.formulario.controls.telefono.setValue(null);
      this.formulario.controls.latitud.setValue(0);
      this.formulario.controls.longitud.setValue(0);
      this.formulario.controls.area.setValue(null);
    }else
    {
      this.formulario.controls.nombre_predio_ac.setValue(null);
      this.formulario.controls.sitio_via_ac.setValue(null);
      this.formulario.controls.telefono_ac.setValue(null);
      this.formulario.controls.latitud_ac.setValue(0);
      this.formulario.controls.longitud_ac.setValue(0);
      this.formulario.controls.area.setValue(null);
    }
  }
  /**
   * Establece el predio seleccionado
   */
  cambioPredioProductor(){
    this.predioSeleccionado = null;
    this.listaPredios.forEach( (itemArea: Area) => {
      if ( Number(itemArea.idArea) === Number(this.formulario.value.area) ){
        this.predioSeleccionado = itemArea;
        this.formulario.controls.tipo.setValue(itemArea?.idTipoActividad);
        this.formulario.controls.nombre_predio_ac.setValue(itemArea?.nombreSitio);
        this.formulario.controls.sitio_via_ac.setValue(itemArea?.callePrincipalSitio);
        this.formulario.controls.telefono_ac.setValue(itemArea?.telefono);
        this.formulario.controls.latitud_ac.setValue(itemArea?.latitudSitio);
        this.formulario.controls.longitud_ac.setValue(itemArea?.longitudSitio);
      }
    });
  }

}
