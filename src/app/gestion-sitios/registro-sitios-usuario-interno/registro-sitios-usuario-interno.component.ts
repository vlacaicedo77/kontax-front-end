import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { Sitio } from  'src/app/modelos/sitio.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { TipoActividad } from '../../modelos/tipo-actividad.modelo';
import { Area } from '../../modelos/area.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { CantonService } from 'src/app/servicios/canton/canton.service';
import { ParroquiaService } from 'src/app/servicios/parroquia/parroquia.service';
import { TipoPropiedadService } from 'src/app/servicios/tipo-propiedad/tipo-propiedad.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CrearUsuarioExternoService } from '../../usuarios-externos/crear-usuario-externo/servicios/crear-usuario-externo.service';
import { AreaService } from '../../servicios/area/area.service';
import { TipoActividadAreaService } from '../../servicios/tipo-actividad-area/tipo-actividad-area.service';


// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({

  selector: 'app-registro-sitios-usuario-interno',
  templateUrl: './registro-sitios-usuario-interno.component.html',
  styleUrls: ['./registro-sitios-usuario-interno.component.css']
})
export class RegistroSitiosUsuarioInternoComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaProvincias = [];
  public listaCantones = [];
  public listaParroquias = [];
  public listaTiposPropiedad = [];
  public mapaVisible = false;
  public markerVisible = false;
  public latitudMarcador;
  public longitudMarcador;
  public extensionArchivo: string;

  listaUsuariosPropietariosAnimales: UsuarioExterno[];
  usuarioPropietarioSeleccionado: UsuarioExterno;
  mostrarCorreo: boolean = false;
  listaPredios: Area[] = [];
  predioSeleccionado: Area;
  listaTiposActividades: TipoActividad[] = [];

  //Variables auxiliares
  idUsuario : number;
  usuario : Usuario = new Usuario();

  //Objetos para manejar el mapa
  lat: number = -1.831239;
  lng: number = -78.183406;
  zoom: number = 7;
  centroMapa: google.maps.LatLngLiteral;
  posicionMarcador: google.maps.LatLngLiteral;
  opcionesMapa: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
    //disableDefaultUI: true,
    fullscreenControl: false,
    //mapTypeControl: false,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  opcionesMarcador: { animation: google.maps.Animation.BOUNCE };
  etiquetaMarcador: { color: 'blue', text: 'Predio'};

   formulario: FormGroup;
   mascaraTelefono: string;
  
  encriptar: any;

  constructor(
    public scriptServicio: ScriptsService,
    private servicioUsuario: UsuarioService,
    private _sitioService: SitioService,
    private _provinciaService: ProvinciaService,
    private _cantonService: CantonService,
    private _parroquiaService: ParroquiaService,
    private _tipoPropiedad: TipoPropiedadService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
    private servicioArea: AreaService,
    private servicioTipoActividadArea: TipoActividadAreaService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.cargarTiposPropiedad();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.inicializarFormulario();
    this.mascaraTelefono = "telefonoFijo";
    this.obtenerTiposActividades();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      //propietario_animales: new FormControl(null, Validators.required),
      inputIdUsuario: new FormControl(null),
      inputNombres: new FormControl(null, Validators.required),
      area: new FormControl(null),
      nuevo_predio: new FormControl(false, Validators.required),
      nombre_predio: new FormControl(null, Validators.required),
      inputTipoPropiedad: new FormControl(null, Validators.required),
      tipo: new FormControl(null, Validators.required),
      inputTelefono: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      inputSuperficieHa: new FormControl(null, [Validators.required, Validators.min(0),Validators.max(999999999) , Validators.pattern(mascaras.MASK_DECIMAL)]),
      latitud: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      longitud: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$')),
      inputProvincia: new FormControl(null, [Validators.required]),
      inputCanton: new FormControl(null, [Validators.required]),
      inputParroquia: new FormControl(null, [Validators.required]),
      sitio_via: new FormControl(null, Validators.required)
    });
  }

// Método que obtiene los datos de tipos de propiedad.
cargarTiposPropiedad() {
  this._tipoPropiedad.getTiposPropiedad()
  .subscribe( respuesta => this.listaTiposPropiedad = respuesta );
}
  // Método que obtiene los datos de provincias.
cargarProvinciasPorPais(idPais: number) {
  this._provinciaService.getProvinciasPorPais(idPais)
  .subscribe( respuesta => this.listaProvincias = respuesta );
}
// Método que obtiene los datos de cantones.
cargarCantonesPorProvincia(idProvincia: number) {
  this._cantonService.getCantonesPorProvincia(idProvincia)
  .subscribe( respuesta => this.listaCantones = respuesta );
}
// Método que obtiene los datos de parroquias.
cargarParroquiasPorCanton(idCanton: number) {
  this._parroquiaService.getParroquiasPorCanton(idCanton)
  .subscribe( respuesta => this.listaParroquias = respuesta );
}

borraDatosUsuario(){
  this.formulario.controls.inputNombres.reset();
  this.idUsuario = null;
 }

/**
   * Buscar usuario externo
*/

buscarUsuario(ci: string)
  {
    let formularioInvalido = false;
    let mensaje = "Por favor, ingrese # de identificación<ul>";

  if(this.formulario.value.inputIdUsuario == null || this.formulario.value.inputIdUsuario == ""){
    formularioInvalido = true;
  }

  if (formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('¡Advertencia!', mensaje, 'warning');
    return;
  }

  let identificacionUsuario = ci;

  this.servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, null, null)
    .subscribe( (resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado.length == 1)
        {
          Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');

          //Cargar resumen
          this.usuario = new Usuario();
          this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
          this.usuario.nombres = resp.resultado[0].nombres;
          //this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
          //this.usuario.email = resp.resultado[0].email; 
          //this.usuario.estado = resp.resultado[0].estado;
          //Cargar los datos del usuario en el formulario y variables
          this.idUsuario = this.usuario.idUsuario;
          this.formulario.controls.inputNombres.setValue(this.usuario.nombres);

          this.listaPredios = null;
          this.formulario.controls.nuevo_predio.setValue(false);
          this.nuevoPredio();

          this.buscarAreasProductor();

        }
        else
        {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
        } 
      }
      else 
      {
        Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

// Método que permite registrar un sitio.
registrarSitio() {
  let formularioInvalido = false;

  let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

  if(this.formulario.value.nuevo_predio == false){
    formularioInvalido = true;
    mensaje += "<li>Marcar casilla de sitio nuevo</li>";
    Swal.fire('Error', mensaje, 'error');
    return;
  }

    if(this.formulario.value.inputNombres == null || this.formulario.value.inputNombres == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese apellidos y nombres / razón social del productor</li>";
    }

    if(this.formulario.value.nombre_predio == null || this.formulario.value.nombre_predio == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese nombre del sitio</li>";
    }

    if(this.formulario.value.inputTipoPropiedad == null || this.formulario.value.inputTipoPropiedad == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de propiedad</li>";
    }

    if(this.formulario.value.tipo == null || this.formulario.value.tipo == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de explotación</li>";
    }

    if(this.formulario.value.inputTelefono == null || this.formulario.value.inputTelefono == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de teléfono</li>";
    }

    if(this.formulario.value.inputSuperficieHa == null || this.formulario.value.inputSuperficieHa == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese superficie (ha)</li>";
    }
  
  if(this.formulario.value.inputProvincia == null || this.formulario.value.inputProvincia == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione provincia origen</li>";
  }

  if(this.formulario.value.inputCanton == null || this.formulario.value.inputCanton == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione cantón origen</li>";
  }

  if(this.formulario.value.inputParroquia == null || this.formulario.value.inputParroquia == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione parroquia origen</li>";
  }

  if(this.formulario.value.sitio_via == null || this.formulario.value.sitio_via == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese calle principal origen</li>";
  }

 if ( this.formulario.invalid || formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('Error', mensaje, 'error');
  return;
 }

 //Mensaje de confirmación
Swal.fire({
  title: '¿Está seguro de enviar la solicitud de pre-registro de este sitio?',
  text: "Una vez enviada no podrá modificar la solicitud",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí, enviar',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.value) {
  
    let sitio = new Sitio();
    sitio.idUsuariosExternos=this.idUsuario;//this.formulario.value.propietario_animales;
    sitio.nombre=this.formulario.value.nombre_predio.toUpperCase();
    sitio.idTipoPropiedad=this.formulario.value.inputTipoPropiedad;
    sitio.idActividadPrincipal=this.formulario.value.tipo;
    sitio.telefono=this.formulario.value.inputTelefono.trim();
    sitio.superficieHa=this.formulario.value.inputSuperficieHa.trim();

    console.log('Lat: '+this.formulario.value.latitud.trim());
    console.log('Lon: '+this.formulario.value.longitud.trim());
    
    if(this.formulario.value.latitud.trim() == null || this.formulario.value.latitud.trim() ==''){
      sitio.latitud=0;
    }else{
      sitio.latitud=this.formulario.value.latitud.trim();
    }

    if(this.formulario.value.longitud.trim()==null || this.formulario.value.longitud.trim()==''){
      sitio.longitud=0;
    }else{
      sitio.longitud=this.formulario.value.longitud;
    }

    sitio.idPais=19;//Ecuador por defecto
    sitio.idProvincia=this.formulario.value.inputProvincia;
    sitio.idCanton=this.formulario.value.inputCanton;
    sitio.idParroquia=this.formulario.value.inputParroquia;
    sitio.callePrincipal=this.formulario.value.sitio_via.toUpperCase().trim();
    sitio.referencia= 'ND';
    sitio.crearArea = true;
    sitio.idTipoArea = 1;
    sitio.observaciones = 'Pre-registro del sitio por un usuario interno.';

    /*sitio.interseccion=this.formulario.value.inputInterseccion;
    sitio.numeracion=this.formulario.value.inputNumeracion;
    sitio.codigoPredial=this.formulario.value.inputCodigoPredial;
    sitio.poligono=this.formulario.value.inputPoligono;*/

    this.llamarServicioCrearSitio(sitio);

  }
  else
  Swal.close();
})
}

//Método que llama al servicio de creación de sitios/predios
llamarServicioCrearSitio(sitio: Sitio)
{
  Swal.fire({
    title: 'Espere...',
    text: 'El sitio se está registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
  });
  
  this._sitioService.registrarSitio(sitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'El sitio fue registrado correctamente. La información será revisada y deberá ser aprobada por Agrocalidad.', 'success');
      this.router.navigate(['inicio']);
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
     this.router.navigate(['inicio']);
   }
 } );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

/**
   * Buscar productor
   */
/* buscarPropietario(ci: string){
  this.usuarioPropietarioSeleccionado = null;
  this.formulario.controls.propietario_animales.setValue(null);
  console.log('CI/RUC: ', ci);
  this.listaUsuariosPropietariosAnimales = [];
  if ( ci.length === 0) {
    Swal.fire('Error', 'Ingrese un número de CC/CI/RUC', 'error');
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
  
  this.listaPredios = null;
  this.formulario.controls.nuevo_predio.setValue(false);
  this.nuevoPredio();
}*/

/**
   * Cuando se selecciona otro productor.
   */
 /*cambioPropietario(){
  this.listaUsuariosPropietariosAnimales.forEach( (item: UsuarioExterno) => {
    console.log('Identificador: ', this.formulario.value.propietario_animales);
    console.log('Usuario: ', item);
    if (Number(item.idUsuariosExternos) === Number(this.formulario.value.propietario_animales)) {
      this.usuarioPropietarioSeleccionado = item;
    }
  });
  
  this.buscarAreasProductor();
}*/

/**
 * Permite agregar un ciudadano si no se lo encuentra.
 */
agregarCiudadano(){
  this.mostrarCorreo = false;
  this.servicioCrearUsuario.abrir();
  }

/**
   * Buscamos los predios del productor
   */
 buscarAreasProductor(){
  if ( this.idUsuario === null ) {
    Swal.fire('Error', 'Seleccione un productor', 'error');
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
  parametros.idUsuariosExternos = this.idUsuario;//this.formulario.value.propietario_animales;
  parametros.estado = 1;
  parametros.codigoTipoArea='ex_pec_bov';
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
  this.formulario.controls.area.setValue(null);
  this.formulario.controls.nombre_predio.setValue(null);
  this.formulario.controls.inputTipoPropiedad.setValue(null);
  this.formulario.controls.tipo.setValue(null);
  this.formulario.controls.inputTelefono.setValue(null);
  this.formulario.controls.inputSuperficieHa.setValue(null);
  this.formulario.controls.inputProvincia.setValue(null);
  this.formulario.controls.inputCanton.setValue(null);
  this.formulario.controls.inputParroquia.setValue(null);
  this.formulario.controls.sitio_via.setValue(null);
  this.formulario.controls.latitud.setValue('0');
  this.formulario.controls.longitud.setValue('0');
}
/**
 * Establece el predio seleccionado
 */
cambioPredioProductor(){
  this.predioSeleccionado = null;
  this.listaPredios.forEach( (itemArea: Area) => {
    if ( Number(itemArea.idArea) === Number(this.formulario.value.area) ){
      this.predioSeleccionado = itemArea;
    }
  });
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

}