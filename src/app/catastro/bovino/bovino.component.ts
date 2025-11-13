import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SitioService } from '../../servicios/sitio/sitio.service';
import { Sitio } from '../../modelos/sitio.modelo';
import { AreaService } from '../../servicios/area/area.service';

import { Area } from '../../modelos/area.modelo';
import { SexoService } from '../../servicios/sexo/sexo.service';
import { Sexo } from '../../modelos/sexo.modelo';
import { RazaService } from '../../servicios/raza/raza.service';
import { Raza } from '../../modelos/raza.modelo';
import { TipoServicio } from 'src/app/modelos/tipo-servicio.modelo';
import { TipoServicioService } from '../../servicios/tipo_servicio/tipo-servicio.service';
import { Bovino } from '../../modelos/bovino.modelo';
import { CategoriaService } from 'src/app/servicios/categoria/categoria.service';
import { Categoria } from 'src/app/modelos/categoria.modelo';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { PurezaService } from 'src/app/servicios/pureza/pureza.service';
import { Pureza } from 'src/app/modelos/pureza.modelo';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { TipoRegistro } from '../../modelos/tipo-registro.modelo';
import { TipoRegistroService } from '../../servicios/tipo-registro/tipo-registro.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { IdentificadorBovino } from 'src/app/modelos/identificador-bovino.modelo'
import { IdentificadorBovinoService } from 'src/app/servicios/identificador-bovino/identificador-bovino.service'
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { TaxonomiaService } from '../../servicios/taxonomia.service';
import { Taxonomia } from '../../modelos/taxonomia.modelo';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bovino',
  templateUrl: './bovino.component.html',
  styles: []
})
export class BovinoComponent implements OnInit {

  modo: string;
  listaIdentificadores: IdentificadorBovino[] = [];
  controlFinca = false;
  sitios: Sitio[] = [];
  areas: Area[] = [];
  sexos: Sexo[] = [];
  razas: Raza[] = [];
  purezas: Pureza[] = [];
  tiposServicios: TipoServicio[] = [];
  tiposRegistros: TipoRegistro[] = [];
  categorias: Categoria[] = [];
  formulario: FormGroup;
  bovinosMadres: Bovino[] = [];
  bovinosPadres: Bovino[] = [];
  tipoServicioSeleccionado: string;
  categoriaToro: Categoria;
  categoriaVaca: Categoria;
  macho: Sexo;
  hembra: Sexo;
  codigoOficial: string;
  listaTaxonomias: Taxonomia[] = [];
  bufalo: boolean = false;
  bovinoEdicion: Bovino;
  // Constructor de la clase
  constructor(
    public servicioScript: ScriptsService,
    public _sitiosServicio: SitioService,
    public _areasServicio: AreaService,
    public _sexosServicio: SexoService,
    public _razasService: RazaService,
    public _tiposServiciosService: TipoServicioService,
    public _categoriaServicio: CategoriaService,
    public servicioBovino: BovinoService,
    public _purezaServicio: PurezaService,
    public _tipoRegistroServicio: TipoRegistroService,
    public router: Router,
    private activatedRouter: ActivatedRoute,
    public usuarioServicio: UsuarioService,
    public _identificadorServicio: IdentificadorBovinoService,
    private servicioTaxonomia: TaxonomiaService,
    private datePipe: DatePipe
  ) { 
    this.modo = 'nuevo';
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    this.activatedRouter.params.subscribe((params: any) => {
      if (params.id === 'nuevo'){
        this.modo = params.id;
      } else {
        this.modo = 'edicion';
        this.obtenerBovinoEdicion(params.id);
      }
      console.log(this.modo);
    });
    this.tipoServicioSeleccionado = 'ND';
    //this.cargarSitiosPorNumeroIdentificacionUsuario(this.usuarioServicio.usuarioExterno.numeroIdentificacion);
    this.buscarAreasProductor();
    this.cargarCatalogos();
    //this.cargarIdentificadoresDisponibles();
    this.inicializarFormulario();
    this.obtenerTaxonomias();
    this.servicioScript.inicializarScripts();
  }
  // Método que inicializa el formulario
  inicializarFormulario() {
    this.formulario = new FormGroup({
      id_tipo_registro: new FormControl(null, Validators.required),
      //id_sitio_nacimiento: new FormControl(null, Validators.required),
      id_area_nacimiento: new FormControl(null, Validators.required),
      fecha_nacimiento: new FormControl(null, Validators.required),
      id_identificador: new FormControl(null),
      id_sexo: new FormControl(null, Validators.required),
      id_pureza: new FormControl(false),
      taxonomia: new FormControl(null, Validators.required),
      id_raza: new FormControl(null),
      registro_nacimiento_provisional: new FormControl(''),
      registro_nacimiento_definitivo: new FormControl(''),
      tatuaje: new FormControl(''),
      marca: new FormControl(''),
      caracteristicas: new FormControl(''),
      peso_nacimiento_kg: new FormControl(0.0, Validators.required),
      id_tipo_servicio: new FormControl(null, Validators.required),
      // ------------------Inseminación------------------
      // Obligatorio
      codigo_pajuela_padre_inseminacion: new FormControl(''),
      // No es obligatoria
      id_bovino_madre_inseminacion: new FormControl('null'),
      // ------------------Monta------------------
      // No es obligatoria
      id_bovino_madre_monta: new FormControl('null'),
      // No es obligatorio
      id_bovino_padre: new FormControl('null'),
      // ------------------Embrión------------------
      // Obligatorio
      codigo_pajuela_padre_embrion: new FormControl(''),
      // No es obligatorio
      id_bovino_madre_donadora_embrion: new FormControl(null),
      // Obligatorio
      id_bovino_madre_receptora_embrion: new FormControl(null),
    }, [
      //this.codigoPajuelaInseminacion('codigo_pajuela_padre_inseminacion', 'id_tipo_servicio'),
      //this.codigoPajuelaEmbrion('codigo_pajuela_padre_embrion', 'id_tipo_servicio'),
      //this.madreReceptoraEmbrion('id_bovino_madre_receptora_embrion', 'id_tipo_servicio'),
      this.fechaNacimiento('fecha_nacimiento'),
      this.nacimientoTemporal('fecha_nacimiento', 'id_tipo_registro'),
      this.razaRequerida('id_raza', 'taxonomia')
    ]);
  }

  /**
   * Buscamos los predios del productor
   */
 buscarAreasProductor(){
  let idUsuario = parseInt(localStorage.getItem('idUsuario'));
  let parametros: any = {};
  parametros.idUsuariosExternos = idUsuario;
  parametros.estado = 1;
  parametros.codigoTipoArea='ex_pec_bov';
  this.areas = [];
  this._areasServicio.obtenerAreasPorFiltro(parametros)
  .subscribe( (area: Area[]) => {
    this.areas = area;
    console.log(area);
  });
}


  /**
   * Solicita que la raza sea requerida cuando no sea un búfalo
   */
  razaRequerida(raza: string, taxonomia: string){
    return (formularioBovino: FormGroup) => {
      const valorRaza = formularioBovino.controls[raza].value;
      const valorTaxonomia = formularioBovino.controls[taxonomia].value;
      if ( valorRaza === null && this.bufalo === false && valorTaxonomia !== null) {
        return {
          razaRequerida: true
        };
      }
      return null;
    };
  }

  // Método que valida si la fecha de nacimiento es mayor a la fecha actual.
  fechaNacimiento(fechaNacimiento: string) {
    return (formularioBovino: FormGroup) => {
      const fechaNacimientoBovino = formularioBovino.controls[fechaNacimiento].value;
      if (fechaNacimientoBovino !== null) {
        const fecha = new Date(fechaNacimientoBovino);
        const fechaActual = new Date();
        // Cuando la fecha de nacimiento es mayor a la fecha actual
        if (fecha.getTime() > fechaActual.getTime()) {
          return {
            fechaNacimiento: true
          };
        }
      }
      return null;
    };
  }
  // Verifica que si se ha seleccionado el tipo de registro temporal la fecha de nacimiento no sea
  // tres meses atras de la fecha actual.
  nacimientoTemporal(fechaNacimiento: string, tipoRegistro: string) {
    return (formularioBovino: FormGroup) => {
      const fechaNacimientoBovino = formularioBovino.controls[fechaNacimiento].value;
      const tipoRegistroBovino = formularioBovino.controls[tipoRegistro].value;
      if (fechaNacimientoBovino !== null && tipoRegistroBovino !== null) {
        // Verificamos que el tipo de registro sea temporal
        const tipoRegistroItem = this.tiposRegistros.find(item => {
          return (tipoRegistroBovino == item.id_tipo_registro);
        });
        if (!tipoRegistroItem) {
          return null;
        }
        if (tipoRegistroItem.codigo === 'n-descarte') {
          // Verificamos la fecha
          let fechaActual = new Date();
          let fechaTresMeses = new Date(fechaNacimientoBovino);
          fechaTresMeses.setDate(fechaTresMeses.getDate() + 90);//Tres meses estándar son 90 días

          if (fechaTresMeses.getTime() < fechaActual.getTime()) {
            return {
              nacimientoTemporal : true
            };
          }
        }
      }
      return null;
    };
  }
  // Método que valida si se ha seleccionado la madre receptora cuando el tipo de servicio es embrión.
  madreReceptoraEmbrion(madreReceptora: string, tipoServicio: string) {
    return (formmularioBovino: FormGroup) => {
      const madreReceptoraValor = formmularioBovino.controls[madreReceptora].value;
      const tipoServicioValor = formmularioBovino.controls[tipoServicio].value;
      let codigo = '';
      this.tiposServicios.find((item: TipoServicio) => {
        if (String(item.id_tipo_servicio) === String(tipoServicioValor)) {
          codigo = item.codigo;
          return item;
        }
        return null;
      });
      if (madreReceptoraValor === null && codigo === 'embrion') {
        return {
          madreReceptoraEmbrion: true
        };
      }
      return null;
    };
  }
  // Método que valida si el código de pajuela está vacio si se ha seleccionado Embrión.
  codigoPajuelaEmbrion(codigoPajuela: string, tipoServicio: string) {
    return (formularioBovino: FormGroup) => {
      const codPajuela = formularioBovino.controls[codigoPajuela].value;
      const tipoServicioSeleccionado = formularioBovino.controls[tipoServicio].value;
      let codigo = '';
      this.tiposServicios.find((item: TipoServicio) => {
        if (String(item.id_tipo_servicio) === tipoServicioSeleccionado) {
          codigo = item.codigo;
          return item;
        }
        return null;
      });
      if (codigo === 'embrion' && codPajuela === '') {
        return {
          codigoPajuelaEmbrion: true
        };
      }
      return null;
    };
  }
  // Método que permite validar si el codigo de pajuela no está vacio si se ha seleccionado Inseminación.
  codigoPajuelaInseminacion(codigoPajuela: string, tipoServicio: string) {
    return (formularioBovino: FormGroup) => {
      const codPajuela = formularioBovino.controls[codigoPajuela].value;
      const tipoServicioSelecionado = formularioBovino.controls[tipoServicio].value;
      let codigo = '';
      this.tiposServicios.find((item: TipoServicio) => {
        if (String(item.id_tipo_servicio) === tipoServicioSelecionado) {
          codigo = item.codigo;
          return item;
        }
        return null;
      });
      if (codigo === 'inseminacion' && codPajuela === '') {
        return {
          codigoPajuelaInseminacion: true
        };
      }
      return null;
    };
  }

  // Método que obtiene los datos de los sitios.
  //cargarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacionUsuario: string) {
  //  this._sitiosServicio.consultarSitiosPorFiltros({numeroIdentificacionUsuario : numeroIdentificacionUsuario, estado : 3})//Solamente predios es estado Activo
  //    .subscribe(respuesta => this.sitios = respuesta.resultado);
  //}

  // Método que obtiene los identificadores disponibles ("inactivos") del usuario
  cargarIdentificadoresDisponibles() {
    let idUsuario = parseInt(localStorage.getItem('idUsuario'));
    this._identificadorServicio.obtenerIdentificadoresDisponiblesPorUsuario(idUsuario)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {

          this.listaIdentificadores = resp.resultado;
          //if (this.listaIdentificadores.length < 1)
          //  Swal.fire('Advertencia', 'Ustede no tiene identificadores disponibles para asignar', 'warning');

        }
        else {
          Swal.fire('Error', resp.mensaje, 'error');
        }
      });
  }

  // Método que carga los catálogos
  cargarCatalogos() {
    this.obtenerSexos();
    //this.obtenerTorosPadres();
    //this.obtenerVacasMadres();
    this.obtenerRazas();
    this.obtenerTiposServicios();
    this.obtenerPurezas();
    this.obtenerTiposRegistros();
  }
  // Método que obtiene los sexos del catálogo.
  obtenerSexos() {
    this._sexosServicio.obtenerSexos()
      .subscribe((respuesta: Sexo[]) => this.sexos = respuesta);
  }
  // Método que obtiene las vacas madres.
  obtenerVacasMadres() {
    this.servicioBovino.obtenerBovinosPorFiltro({
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      fechaUltimoParto: 'IS NULL',
      categoria: 'vaca',
      sexo: 'hembra'
    })
      .subscribe((resultado: Bovino[]) => {
        resultado.forEach(bovino => {
          this.bovinosMadres.push(bovino);
        });
      });
    const fechaActual = new Date();
    fechaActual.setFullYear( fechaActual.getFullYear() - 1);
    //const fechaBusqueda = [
    //  `${fechaActual.getFullYear()}`,
    //  `0${fechaActual.getMonth()}`.substr(-2),
    //  `0${fechaActual.getDate()}`.substr(-2)
    //].join('-');
    
    console.log('Fecha de último parto: ',this.datePipe.transform(fechaActual, 'y-M-d h:mm:ss'));
    this.servicioBovino.obtenerBovinosPorFiltro({
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      '<fechaUltimoParto': this.datePipe.transform(fechaActual, 'y-M-d h:mm:ss') ,
      categoria: 'vaca',
      sexo: 'hembra'
    })
      .subscribe((resultado: Bovino[]) => {
        resultado.forEach(bovino => {
          this.bovinosMadres.push(bovino);
        });
      });
  }
  // Método que obtiene los toros padres.
  obtenerTorosPadres() {
    this.servicioBovino.obtenerBovinosPorFiltro({
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      categoria: 'toro',
      sexo: 'macho'
    })
      .subscribe((resultado: Bovino[]) => this.bovinosPadres = resultado);
  }
  // Método que carga las purezas de los animales.
  obtenerPurezas() {
    this._purezaServicio.obtenerPurezas()
      .subscribe((respuesta: Pureza[]) => this.purezas = respuesta);
  }
  // Método que permite obtener los tipos de servicios.
  obtenerTiposServicios() {
    this._tiposServiciosService.obtenerTiposServicios()
      .subscribe(respuesta => this.tiposServicios = respuesta);
  }
  // Método que permite obtener las razas de los bovinos.
  obtenerRazas() {
    this._razasService.obtenerRazas()
      .subscribe(respuesta => this.razas = respuesta);
  }
  // Método que permite obtener los tipos de registros.
  obtenerTiposRegistros() {
    this._tipoRegistroServicio.obtenerTiposRegistros()
      .subscribe(respuesta => this.tiposRegistros = respuesta);
  }
  // Método que detecta cuando se ha cambiado de finca y carga las explotaciones pecuarias.
  cambioFinca(valor: number) {
    if (valor === null) {
      return;
    }
    this.areas = [];
    this.controlFinca = true;
    this._areasServicio.obtenerAreasPorIdSitio(valor)
      .subscribe(respuesta => {
        this.areas = respuesta;
        this.controlFinca = false;
      });
  }
  // Registrar bovino
  registrarBovino() {
    console.log(this.formulario);
    this.formulario.markAsTouched();
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    const bovinoNuevo = new Bovino();
    bovinoNuevo.idTipoRegistro = this.formulario.value.id_tipo_registro;
    //bovinoNuevo.idSitioNacimiento = this.formulario.value.id_sitio_nacimiento;
    bovinoNuevo.idAreaNacimiento = this.formulario.value.id_area_nacimiento;
    this.areas.find( (item: Area ) => {
      if ( Number(bovinoNuevo.idAreaNacimiento) === Number(item.idArea) ){
        bovinoNuevo.idSitioNacimiento = item.idSitio;
      }
    });
    
    bovinoNuevo.fechaNacimiento = this.formulario.value.fecha_nacimiento;
    bovinoNuevo.idSexo = this.formulario.value.id_sexo;
    bovinoNuevo.idPureza = this.determinarPureza();
    bovinoNuevo.idTaxonomia = this.formulario.value.taxonomia;
    if ( this.formulario.value.id_raza ){
      bovinoNuevo.idRaza = this.formulario.value.id_raza;
    }
    bovinoNuevo.caracteristicas = this.formulario.value.caracteristicas;
    bovinoNuevo.pesoNacimientoKg = this.formulario.value.peso_nacimiento_kg;
    bovinoNuevo.idTipoServicio = this.formulario.value.id_tipo_servicio;
    bovinoNuevo.codigoPajuelaPadre = this.determinarCodigoPajuela();
    bovinoNuevo.idCategoria = this.determinarCategoria();
    bovinoNuevo.idPaisNacimiento = 19;
    bovinoNuevo.idUsuarioActual = this.usuarioServicio.usuarioExterno.idUsuario;
    if (this.formulario.value.id_identificador ) {
      bovinoNuevo.idIdentificador = this.formulario.value.id_identificador;
      this.listaIdentificadores.find( (item: IdentificadorBovino ) => {
        if ( Number(bovinoNuevo.idIdentificador) === Number(item.idIdentificadorBovino) ){
          bovinoNuevo.codigoIdentificacion = item.codigoOficial;
        }
      });
    }
    if (this.formulario.value.registro_nacimiento_provisional !== null || this.formulario.value.registro_nacimiento_provisional !== '') {
      bovinoNuevo.registroNacimientoProvisional = this.formulario.value.registro_nacimiento_provisional;
    }
    if (this.formulario.value.registro_nacimiento_definitivo !== null || this.formulario.value.registro_nacimiento_definitivo !== '') {
      bovinoNuevo.registroNacimientoDefinitivo = this.formulario.value.registro_nacimiento_definitivo;
    }
    if (this.formulario.value.tatuaje !== null || this.formulario.value.tatuaje !== '') {
      bovinoNuevo.tatuaje = this.formulario.value.tatuaje;
    }
    if (this.formulario.value.marca !== null || this.formulario.value.marca !== '') {
      bovinoNuevo.marca = this.formulario.value.marca;
    }
    switch (this.tipoServicioSeleccionado) {
      case 'inseminacion':
        if (this.formulario.value.id_bovino_madre_inseminacion !== 'null') {
          bovinoNuevo.idBovinoMadre = this.formulario.value.id_bovino_madre_inseminacion;
        }
        break;
      case 'embrion':
        if (this.formulario.value.id_bovino_madre_donadora_embrion !== null) {
          bovinoNuevo.idBovinoMadreDonadora = this.formulario.value.id_bovino_madre_donadora_embrion;
        }
        if (this.formulario.value.id_bovino_madre_receptora_embrion !== null) {
          bovinoNuevo.idBovinoMadre = this.formulario.value.id_bovino_madre_receptora_embrion;
        }
        break;
      case 'monta':
        if (this.formulario.value.id_bovino_madre_monta !== 'null') {
          bovinoNuevo.idBovinoMadre = this.formulario.value.id_bovino_madre_monta;
        }
        if (this.formulario.value.id_bovino_padre !== 'null') {
          bovinoNuevo.idBovinoPadre = this.formulario.value.id_bovino_padre;
        }
        break;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando el nuevo bovino.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioBovino.registrarBovinoDescarte(bovinoNuevo)
      .subscribe((respuesta: any) => {
        if (respuesta.hasOwnProperty('estado')) {
          if (respuesta.estado === 'OK') {
            Swal.fire('Éxito', 'Nacimiento registrado con éxito. Este animal estará disponible para movilización cuando un técnico de Agrocalidad apruebe su registro durante las próximas horas.', 'success').then(() => {
              this.formulario.reset();
              //this.router.navigate(['catastro']);
            });
          }
        }
      }, (err: HttpErrorResponse) => {
        if (err.error.estado === 'ERR') {
          Swal.fire('Error', err.error.mensaje, 'error');
        }
      });
  }
  // CambioTipoServicio
  cambioTipoServicio(valor: any) {
    if (valor === 'null') {
      this.tipoServicioSeleccionado = 'ND';
      return;
    }
    const elementoSeleccionado = this.tiposServicios.find((item: TipoServicio) => {
      if (item.id_tipo_servicio == valor) {
        return item;
      }
      return null;
    });
    this.tipoServicioSeleccionado = elementoSeleccionado.codigo;
  }

  // Cambio Identificador
  cambioIdentificador($event) {
    console.log($event);
    this.codigoOficial = $event.target.options[$event.target.options.selectedIndex].text;
  }

  // Método que devuelve la pureza del animal en base a la selección realizada en el formulario.
  
  determinarPureza() {
    let id_pureza = 1;
    let pureza: Pureza;
    if (this.formulario.value.id_pureza) {
      pureza = this.purezas.find((item_pureza) => item_pureza.codigo == 'puro');
    } else {
      pureza = this.purezas.find((item_pureza) => item_pureza.codigo == 'mestizo');
    }
    if (pureza) {
      id_pureza = pureza.id_pureza;
    }
    return id_pureza;
  }
  // Método que devuelve el código de pajuela en base a la selección del tipo de servicio.
  determinarCodigoPajuela() {
    let codigo_pajuela = '';
    switch (this.tipoServicioSeleccionado) {
      case 'inseminacion':
        codigo_pajuela = this.formulario.value.codigo_pajuela_padre_inseminacion;
        break;
      case 'embrion':
        codigo_pajuela = this.formulario.value.codigo_pajuela_padre_embrion;
        break;
      default:
        codigo_pajuela = '';
        break;
    }
    return codigo_pajuela;
  }
  // Método que devuelve la categoría del bovino en base al sexo seleccionado.
  //determinarCategoria() {
  //  // 1 = hembra
  //  // 2 = macho
  //  let id_categoria = 1;
  //  let categoria: Categoria;
  //  if (this.formulario.value.id_sexo == 1) {
  //    categoria = this.categorias.find((item_categoria: Categoria) => item_categoria.nombre.toLocaleLowerCase() == 'ternera');
  //  } else {
  //    categoria = this.categorias.find((item_categoria: Categoria) => item_categoria.nombre.toLocaleLowerCase() == 'ternero');
  //  }
  //  if (categoria) {
  //    id_categoria = categoria.id_categoria;
  //  }
  //  return id_categoria;
  //}

  // Método que devuelve la categoría del bovino en base al sexo seleccionado.
  determinarCategoria() {
    // 1 = hembra
    // 2 = macho
    let id_categoria = 1;

    if ((this.formulario.value.id_sexo == 1) && (this.formulario.value.taxonomia != 13)) {
      id_categoria = 1;
    } 
    if ((this.formulario.value.id_sexo == 2) && (this.formulario.value.taxonomia != 13)) {
      id_categoria = 4;
    }
    if (this.formulario.value.taxonomia == 13) {
      id_categoria = null;
    }

    return id_categoria;
  }

  /**
   * Cambio de tipo de registro
   */
  cambioTipoRegistro(){
    this.formulario.controls.id_identificador.setValue(null);
    this.formulario.controls.registro_nacimiento_provisional.setValue(null);
    this.formulario.controls.registro_nacimiento_definitivo.setValue(null);
    this.formulario.controls.tatuaje.setValue(null);
    this.formulario.controls.marca.setValue(null);
    this.cargarIdentificadoresDisponibles();
  }

  /**
   * Obtiene las taxonomías disponibles
   */
  obtenerTaxonomias(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando especies.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.listaTaxonomias = [];
    this.servicioTaxonomia.obtenerTaxonomias().subscribe( (taxonomias: Taxonomia[]) => {
      this.listaTaxonomias = taxonomias.filter( (item: Taxonomia) => {
        //return item.codigo === 'bubalus_bubalis' || item.codigo === 'bos_taurus_taurus' || item.codigo === 'bos_taurus_indicus' || item.codigo === 'bos_taurus_primigenius';
        return item.codigo === 'bubalus_bubalis' || item.codigo === 'bos_taurus_primigenius';
      });
      Swal.close();
    });
  }

  /**
   * Se ejecuta cuando se cambia de taxonomía o especie
   */
  cambioTaxonomia(){
    this.bufalo = false;
    this.listaTaxonomias.forEach( (item: Taxonomia) => {
      if ( Number(item.id_taxonomia) === Number(this.formulario.value.taxonomia) ) {
        if (item.codigo === 'bubalus_bubalis') {
          this.bufalo = true;
          this.formulario.controls.id_raza.setValue(null);
        }
      }
    });
   
  }

  obtenerBovinoEdicion(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información del bovino.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    const parametros: Bovino = new Bovino();
    parametros.idBovino = id;
    this.servicioBovino.filtrarBovinos(parametros).subscribe( (bovinos: Bovino[]) => {
      this.bovinoEdicion = bovinos[0];
      this.establecerDatosEdicion();
      console.log(this.bovinoEdicion);
      Swal.close();
    });
  }
  establecerDatosEdicion(){
    //this.formulario.controls.


    //id_tipo_registro
    //id_sitio_nacimiento
    //id_area_nacimiento
    //fecha_nacimiento
    //id_identificador
    //id_sexo
    //id_pureza
    //taxonomia
    //id_raza
    //registro_nacimiento_provisional
    //registro_nacimiento_definitivo
    //tatuaje
    //marca
    //caracteristicas
    //peso_nacimiento_kg
    //id_tipo_servicio
    ////
    ////
    //codigo_pajuela_padre_inseminacion
    ////
    //id_bovino_madre_inseminacion
    ////
    ////
    //id_bovino_madre_monta
    ////
    //id_bovino_padre
    ////
    ////
    //codigo_pajuela_padre_embrion
    ////
    //id_bovino_madre_donadora_embrion
    ////
    //id_bovino_madre_receptora_embrion
  }

}
