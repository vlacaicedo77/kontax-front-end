import { Component, OnInit } from '@angular/core';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { Bovino } from '../../modelos/bovino.modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { Sitio } from 'src/app/modelos/sitio.modelo';
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { HistoriaBovinoService } from '../../servicios/historia-bovino/historia-bovino.service';
import { HistoriaBovino } from '../../modelos/historia-bovino.modelo';
import { AreaService } from '../../servicios/area/area.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SolicitudCorreccionCatastroService } from '../../servicios/solicitud-correccion-catastro/solicitud-correccion-catastro.service';
import { SolicitudCorreccionCatastroBovino } from 'src/app/modelos/solicitud-correccion-catastro-bovino.modelo';
import { CatastroSinConfirmar } from '../../modelos/catastro-sin-confirmar.modelo';

@Component({
  selector: 'app-catastro',
  templateUrl: './catastro.component.html',
  styles: []
})
export class CatastroComponent implements OnInit {

  panelSolicitud: boolean;
  catastroSinConfirmar: CatastroSinConfirmar[] = [];
  listaBovinos: Bovino[] = [];
  categorias: Categoria[] = [];
  sitios: Sitio[] = [];
  // Sección para buscar
  identificador: string;
  categoria: string;
  sitio: string;
  panelHistorico: boolean;
  listaHistoriasBovino: HistoriaBovino[];
  consultando: boolean;
  listaDestinos: any[];
  areaSeleccionada: any;
  // Cantidades de bovinos para solicitar corrección
  formularioSolicitud: FormGroup;

  constructor(
    private servicioScripts: ScriptsService,
    private bovinoServicio: BovinoService,
    private servicioCategoria: CategoriaService,
    private sitioServicio: SitioService,
    private usuarioServicio: UsuarioService,
    private historiaBovinoServicio: HistoriaBovinoService,
    private areaServicio: AreaService,
    private solicitudCorreccionCatastroBovinoServicio: SolicitudCorreccionCatastroService
  ) {
    this.panelSolicitud = false;
   }

  ngOnInit() {
    this.servicioScripts.inicializarScripts();
    this.identificador = '';
    this.categoria = 'null';
    this.sitio = 'null';
    this.panelHistorico = false;
    this.obtenerCategorias();
    this.obtenerBovinosPorProductor();
    this.obtenerSitiosPorProductor();
    this.obtenerBovinosSinConfirmar();
    this.obtenerAreas();
    this.consultando = false;
    this.inicializarFormularioSolicitud();
  }

  // Formulario para solicitud
  inicializarFormularioSolicitud(){
    this.formularioSolicitud = new FormGroup({
      id_usuario: new FormControl(null, Validators.required),
      id_provincia: new FormControl(null, Validators.required),
      nombre_provincia: new FormControl(null),
      id_canton: new FormControl(null, Validators.required),
      nombre_canton: new FormControl(null),
      id_parroquia: new FormControl(null, Validators.required),
      nombre_parroquia: new FormControl(null),
      id_sitio: new FormControl(null, Validators.required),
      id_area: new FormControl(null, Validators.required),
      // Actual
      terneras_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      terneros_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      vaconas_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      toretes_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      vacas_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      toros_actual: new FormControl(0, [Validators.required, Validators.min(0)]),
      // Solicitado
      terneras_solicitado: new FormControl(0, [Validators.required, Validators.min(0)]),
      terneros_solicitado: new FormControl(0, [Validators.required, Validators.min(0)]),
      vaconas_solicitado: new FormControl(0, [Validators.required, Validators.min(0)]),
      toretes_solicitado: new FormControl(0, [Validators.required, Validators.min(0)]),
      vacas_solicitado: new FormControl(0, [Validators.required, Validators.min(0)]),
      toros_solicitado: new FormControl(0, [Validators.required, Validators.min(0)])
    });
  }

  obtenerAreas(){
    this.areaServicio.obtenerAreasPorFiltro({
      idUsuariosExternos: this.usuarioServicio.usuarioExterno.idUsuario
    }).subscribe( (resultado: any[]) => {
      this.listaDestinos = resultado;
    });
  }

  // Método que permite obtener el catastro bovino por productor.
  obtenerBovinosPorProductor() {
    if (!this.usuarioServicio.usuarioExterno) {
      return;
    }
    this.bovinoServicio.filtrarBovinos({
      numeroIdentificacionUsuarioActual: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      codigoEstadoAnimal: 'vivo',
      codigoEstadoRegistro: 'DISP',
      codigoEstadoUbicacion: 'SIT'
    }).subscribe( (respuesta: []) => {
      this.listaBovinos = respuesta;
      console.log('Bovinos: ', this.listaBovinos);
    } );
  }
  obtenerBovinosSinConfirmar(){
    if (!this.usuarioServicio.usuarioExterno) {
      return;
    }
    this.bovinoServicio.obtenerBovinosPorFiltro({
      numeroIdentificacion: this.usuarioServicio.usuarioExterno.numeroIdentificacion,
      estadoAnimal: 'vivo',
      estadoRegistro: 'R-CONF'
    }).subscribe( (bovinos: Bovino[]) => {
      bovinos.forEach((bovino: Bovino) => {
        // Buscamos en el catastro sin confirmar si existe el item creado, caso contrario creamos uno nuevo
        if (this.catastroSinConfirmar.find( (catastro: CatastroSinConfirmar) => Number(catastro.idArea) === Number(bovino.idAreaActual)) ){
          let listaNueva = [];
          listaNueva = this.catastroSinConfirmar.map(
            (itemActual: CatastroSinConfirmar, index: number, arreglo: CatastroSinConfirmar[]) => {
              if ( Number(itemActual.idArea) === Number(bovino.idAreaActual) ) {
                itemActual.bovinos.push(bovino);
                switch (bovino.categoria.codigo){
                  case 'ternera':
                    itemActual.terneras += 1;
                    break;
                  case 'ternero':
                    itemActual.terneros += 1;
                    break;
                  case 'torete':
                    itemActual.toretes += 1;
                    break;
                  case 'toro':
                    itemActual.toros += 1;
                    break;
                  case 'vaca':
                    itemActual.vacas += 1;
                    break;
                  case 'vacona':
                    itemActual.vaconas += 1;
                    break;
                }
              }
              return itemActual;
          });
          this.catastroSinConfirmar = listaNueva;
        } else {
          // Sino encontramos el catastro lo agregamos como nuevo elemento.
          const catastro = new CatastroSinConfirmar();
          catastro.idUsuario = bovino.idUsuarioActual;
          catastro.idProvincia = bovino.idProvinciaActual;
          catastro.nombreProvincia = bovino.provinciaActual.nombre;
          catastro.idCanton = bovino.idCantonActual;
          catastro.nombreCanton = bovino.cantonActual.nombre;
          catastro.idParroquia = bovino.idParroquiaActual;
          catastro.nombreParroquia = bovino.parroquiaActual.nombre;
          catastro.idSitio = bovino.idSitioActual;
          catastro.idArea = bovino.idAreaActual;
          catastro.terneras = 0;
          catastro.terneros = 0;
          catastro.vaconas = 0;
          catastro.toretes = 0;
          catastro.vacas = 0;
          catastro.toros = 0;
          switch (bovino.categoria.codigo){
            case 'ternera':
              catastro.terneras += 1;
              break;
            case 'ternero':
              catastro.terneros += 1;
              break;
            case 'torete':
              catastro.toretes += 1;
              break;
            case 'toro':
              catastro.toros += 1;
              break;
            case 'vaca':
              catastro.vacas += 1;
              break;
            case 'vacona':
              catastro.vaconas += 1;
              break;
          }
          catastro.bovinos.push(bovino);
          this.catastroSinConfirmar.push(catastro);
        }


      });
    });
  }
  // Método que obtiene las categorías.
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
    .subscribe( (respuesta: Categoria[]) => this.categorias = respuesta );
  }
  // Método que obtiene las finca del productor
  obtenerSitiosPorProductor(){
    if (!this.usuarioServicio.usuarioExterno) {
      return;
    }
    this.sitioServicio.consultarSitiosPorNumeroIdentificacionUsuario(this.usuarioServicio.usuarioExterno.numeroIdentificacion)
    .subscribe( respuesta => this.sitios = respuesta.resultado);
  }
  // Método que busca los bovinos de un usuario.
  buscarBovinos(){
    if (!this.usuarioServicio.usuarioExterno) {
      return;
    }
    Swal.fire({
      text: 'Buscando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    const parametros: any = { numeroIdentificacionUsuarioActual: this.usuarioServicio.usuarioExterno.numeroIdentificacion };
    if ( this.identificador !== undefined && this.identificador !== '' ){
      parametros.codigoIdentificacion =  this.identificador;
    }
    if ( this.categoria !== undefined && this.categoria !== 'null'){
      parametros.idCategoria =  this.categoria;
    }
    if ( this.sitio !== undefined && this.sitio !== 'null' ){
      parametros.idSitioActual =  this.sitio;
    }
    this.bovinoServicio.filtrarBovinos(parametros)
    .subscribe( (respuesta: []) => {
      this.listaBovinos = respuesta;
      Swal.close();
    }
    , (err: HttpErrorResponse) => {
      if (err.error.estado === 'ERR') {
        Swal.fire('Error', err.error.mensaje , 'error');
      }
    });
  }

  // Método que muestra el panel de información del histórico de un bovino.
  mostrarHistoricoBovino(idBovinoParametro: number){
    this.panelHistorico = true;
    this.consultando = true;
    this.historiaBovinoServicio.obtenerHistoriaBovinoPorFiltro({idBovino: idBovinoParametro})
    .subscribe( (respuesta) => {
      this.listaHistoriasBovino = respuesta;
      this.consultando = false;
    });
  }
  cerrarPanel(){
    this.panelHistorico = false;
    this.listaHistoriasBovino = [];
  }

  // Método que reestablece los controles del formulario de búsqueda.
  reestablecerControles(){
    this.identificador = '';
    this.categoria = 'null';
    this.sitio = 'null';
  }

  // Método que confirma el catastro seleccionado
  confirmarCatastro(itemCatastroSinConfirmar: CatastroSinConfirmar){
    Swal.fire({
      title: 'Espere...',
      text: 'Confirmando el catastro.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.bovinoServicio.confirmarCatastroBovino(itemCatastroSinConfirmar)
    .subscribe( (respuesta: any) => {
      Swal.fire('Éxito', 'El catastro fue confirmado correctamente.', 'success').then( () => {
        this.catastroSinConfirmar = [];
        this.obtenerBovinosPorProductor();
        this.obtenerBovinosSinConfirmar();
      });
    });
  }

  // Método que muestra el panel de solicitud de corrección
  mostrarPanelSolicitud(itemSolicitud: CatastroSinConfirmar){
    console.log('Mostrar panel solicitud');
    this.panelSolicitud = true;
    this.formularioSolicitud.controls.nombre_provincia.setValue(itemSolicitud.nombreProvincia);
    this.formularioSolicitud.controls.nombre_canton.setValue(itemSolicitud.nombreCanton);
    this.formularioSolicitud.controls.nombre_parroquia.setValue(itemSolicitud.nombreParroquia);
    this.formularioSolicitud.controls.id_usuario.setValue(itemSolicitud.idUsuario);
    this.formularioSolicitud.controls.id_provincia.setValue(itemSolicitud.idProvincia);
    this.formularioSolicitud.controls.id_canton.setValue(itemSolicitud.idCanton);
    this.formularioSolicitud.controls.id_parroquia.setValue(itemSolicitud.idParroquia);
    this.formularioSolicitud.controls.id_sitio.setValue(itemSolicitud.idSitio);
    this.formularioSolicitud.controls.id_area.setValue(itemSolicitud.idArea);
    // Actual
    this.formularioSolicitud.controls.terneras_actual.setValue(itemSolicitud.terneras);
    this.formularioSolicitud.controls.terneros_actual.setValue(itemSolicitud.terneros);
    this.formularioSolicitud.controls.vaconas_actual.setValue(itemSolicitud.vaconas);
    this.formularioSolicitud.controls.toretes_actual.setValue(itemSolicitud.toretes);
    this.formularioSolicitud.controls.vacas_actual.setValue(itemSolicitud.vacas);
    this.formularioSolicitud.controls.toros_actual.setValue(itemSolicitud.toros);
    // Solicitado
    this.formularioSolicitud.controls.terneras_solicitado.setValue(itemSolicitud.terneras);
    this.formularioSolicitud.controls.terneros_solicitado.setValue(itemSolicitud.terneros);
    this.formularioSolicitud.controls.vaconas_solicitado.setValue(itemSolicitud.vaconas);
    this.formularioSolicitud.controls.toretes_solicitado.setValue(itemSolicitud.toretes);
    this.formularioSolicitud.controls.vacas_solicitado.setValue(itemSolicitud.vacas);
    this.formularioSolicitud.controls.toros_solicitado.setValue(itemSolicitud.toros);
  }
  // Método que cierra el panel de solicitud de corrección
  cerrarPanelSolicitud(){
    this.panelSolicitud = !this.panelSolicitud;
    this.formularioSolicitud.reset();
  }

  // Método para enviar la solicitud de corrección
  enviarSolicitudCorreccion(){
    this.formularioSolicitud.markAsTouched();
    if ( this.formularioSolicitud.invalid ) {
      Swal.fire('Error', 'La solicitud contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Generando solicitud de corrección.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    // Cargamos los datos en el objeto para enviarlo al API.
    const solicitudCorreccionCatastroBovino = new SolicitudCorreccionCatastroBovino();
    solicitudCorreccionCatastroBovino.idUsuario = this.usuarioServicio.usuarioExterno.idUsuario;
    solicitudCorreccionCatastroBovino.idProvincia = this.formularioSolicitud.value.id_provincia;
    solicitudCorreccionCatastroBovino.idCanton = this.formularioSolicitud.value.id_canton;
    solicitudCorreccionCatastroBovino.idParroquia = this.formularioSolicitud.value.id_parroquia;
    solicitudCorreccionCatastroBovino.idSitio = this.formularioSolicitud.value.id_sitio;
    solicitudCorreccionCatastroBovino.idArea = this.formularioSolicitud.value.id_area;
    // Actual
    solicitudCorreccionCatastroBovino.ternerasActual = this.formularioSolicitud.value.terneras_actual;
    solicitudCorreccionCatastroBovino.ternerosActual = this.formularioSolicitud.value.terneros_actual;
    solicitudCorreccionCatastroBovino.vaconasActual = this.formularioSolicitud.value.vaconas_actual;
    solicitudCorreccionCatastroBovino.toretesActual = this.formularioSolicitud.value.toretes_actual;
    solicitudCorreccionCatastroBovino.vacasActual = this.formularioSolicitud.value.vacas_actual;
    solicitudCorreccionCatastroBovino.torosActual = this.formularioSolicitud.value.toros_actual;
    // Solicitado
    solicitudCorreccionCatastroBovino.ternerasSolicitado = this.formularioSolicitud.value.terneras_solicitado;
    solicitudCorreccionCatastroBovino.ternerosSolicitado = this.formularioSolicitud.value.terneros_solicitado;
    solicitudCorreccionCatastroBovino.vaconasSolicitado = this.formularioSolicitud.value.vaconas_solicitado;
    solicitudCorreccionCatastroBovino.toretesSolicitado = this.formularioSolicitud.value.toretes_solicitado;
    solicitudCorreccionCatastroBovino.vacasSolicitado = this.formularioSolicitud.value.vacas_solicitado;
    solicitudCorreccionCatastroBovino.torosSolicitado = this.formularioSolicitud.value.toros_solicitado;
    console.log(solicitudCorreccionCatastroBovino);
    // Llamada al servicio
    this.solicitudCorreccionCatastroBovinoServicio.nuevaSolicitudCorreccionCatastro(solicitudCorreccionCatastroBovino)
    .subscribe( (respuesta: any) => {
      Swal.fire('Éxito', 'La nueva solicitud fue enviada.', 'success').then(() => {
          this.cerrarPanelSolicitud();
        });
    });
  }

}
