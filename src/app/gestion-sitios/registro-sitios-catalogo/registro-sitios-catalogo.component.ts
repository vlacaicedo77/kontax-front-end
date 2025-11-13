import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { Sitio } from  'src/app/modelos/sitio.modelo';
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
import { TiposAreasService } from '../../servicios/tipos-areas/tipos-areas.service';

// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
import { JSEncrypt } from 'jsencrypt';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({

  selector: 'app-registro-sitios-catalogo',
  templateUrl: './registro-sitios-catalogo.component.html',
  styleUrls: ['./registro-sitios-catalogo.component.css']
})
export class RegistroSitiosCatalogoComponent implements OnInit {
  
  
  //Objetos para gestionar catálogos
  listaTiposAreas: any[] = [];
  listaAreas: Area[];
  public listaTiposPropiedad = [];
  public listaProvincias = [];
  public listaCantones = [];
  public listaParroquias = [];
  // variables auxiliares
  idUsuario : number;
  idUsuarioExterno : number;
  idTipoArea : number;
  idSitio : number;
  usuario : Usuario = new Usuario();
  tablaVisible : boolean = false;
  pvigencia : boolean = false;
  codigo: string = '';
  nombreArea: string = '';
  nombreTipoArea: string = '';
  estadoUsuario : number;
  contrasenaTemporal: string = '';
  nombreUsuario: string = '';
  estadoArea: number = 0;

  mostrarCorreo: boolean = false;
  //listaPredios: Area[] = [];
  //predioSeleccionado: Area;
  listaTiposActividades: TipoActividad[] = [];

  formulario: FormGroup;
  formularioBusqueda: FormGroup;
  //mascaraTelefono: string;
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
    private tipoAreaServicio: TiposAreasService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.cargarTiposPropiedad();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.inicializarFormulario();
    //this.mascaraTelefono = "telefonoFijo";
    this.obtenerTiposActividades();
    this.obtenerTiposAreas();
    this.encriptar = new JSEncrypt();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputIdUsuario: new FormControl(null),
      inputNombres: new FormControl(null, [Validators.required]),
      inputEmail: new FormControl(null,[Validators.email]),
      inputEmailLock: new FormControl(null,[Validators.email]),
      tipo_area: new FormControl(null, Validators.required),
      nombre_predio: new FormControl(null, Validators.required),
      latitud: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      longitud: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$')),
      inputProvincia: new FormControl(null, [Validators.required]),
      inputCanton: new FormControl(null, [Validators.required]),
      inputParroquia: new FormControl(null, [Validators.required]),
      sitio_via: new FormControl(null, Validators.required),
      fecha_inicio: new FormControl(null),
      fecha_fin: new FormControl(null)
    });

    this.formularioBusqueda = new FormGroup({
      provincia: new FormControl('-1'),
      tipo_area: new FormControl(null, Validators.required),
      estado: new FormControl('1'),
      dato: new FormControl(null)
      //fecha_inicio: new FormControl(null, Validators.required),
      //fecha_fin: new FormControl(null, Validators.required)
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
    this.listaTiposAreas = respuesta.filter( ( item: any ) => {
      return item.codigo !== 'com_ident' && item.codigo !== 'cen_enfr' && item.codigo !== 'ex_pec_bov';
    });
  });
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

          //Generar la contraseña aleatoria temporal
          this.contrasenaTemporal = this.generarClaveAleatoria();
          //Cargar resumen
          this.usuario = new Usuario();
          this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
          this.usuario.nombres = resp.resultado[0].nombres;
          this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
          this.usuario.email = resp.resultado[0].email; 
          this.usuario.estado = resp.resultado[0].estado;
          //Cargar los datos del usuario en el formulario y variables
          this.idUsuario = this.usuario.idUsuario;
          this.nombreUsuario = this.usuario.nombres;
          this.formulario.controls.inputNombres.setValue(this.usuario.nombres);
          this.formulario.controls.inputEmail.setValue(this.usuario.email);
          this.formulario.controls.inputEmailLock.setValue(this.usuario.email);
          this.estadoUsuario = this.usuario.estado;
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

/**
   * Método que permite obtener las áreas dado sus parámetros.
   */
 obtenerAreas(parametros: any){
  this.listaAreas = [];
  Swal.fire({
    title: 'Buscando sitios...',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
      Swal.showLoading();
    }
  });
  this.listaAreas = [];
  this.servicioArea.obtenerAreasPorFiltro(parametros)
  .subscribe( (resultado: Area[]) => {
    Swal.close();
    this.listaAreas = resultado;
    if(this.listaAreas.length > 0)
    {
      this.tablaVisible = true;
    }
    else
    {
      this.tablaVisible = false;
      Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
    }
  });
}

borraDatosUsuario(){
  this.formulario.controls.inputNombres.reset();
  this.idUsuario = null;
  this.estadoUsuario = 0;
 }

 panelVigencia(){
  if(this.formulario.value.tipo_area == 'cen_faen')
  {
    this.pvigencia = false
  }else
  {
    this.pvigencia = true
  }
 }

cargarAreas(){
    
  this.listaAreas = [];

  if(this.formularioBusqueda.value.provincia === '-1')
  {
    if(this.formularioBusqueda.value.dato !== null && this.formularioBusqueda.value.dato !== "")
    {
      this.obtenerAreas({ codigoTipoArea: this.formularioBusqueda.value.tipo_area, estado: this.formularioBusqueda.value.estado, numeroIdentificacion: this.formularioBusqueda.value.dato});
    }else
    {
      this.obtenerAreas({ codigoTipoArea: this.formularioBusqueda.value.tipo_area, estado: this.formularioBusqueda.value.estado});
    }
  }else
  {
    if(this.formularioBusqueda.value.dato !== null && this.formularioBusqueda.value.dato !== "")
    {
      this.obtenerAreas({ codigoTipoArea: this.formularioBusqueda.value.tipo_area, estado: this.formularioBusqueda.value.estado, idProvinciaSitio: this.formularioBusqueda.value.provincia, numeroIdentificacion: this.formularioBusqueda.value.dato});
    }else
    {
      this.obtenerAreas({ codigoTipoArea: this.formularioBusqueda.value.tipo_area, estado: this.formularioBusqueda.value.estado, idProvinciaSitio: this.formularioBusqueda.value.provincia,});
    }
  }
}

limpiarTabla(){
  this.tablaVisible = false;
  this.listaAreas = [];
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
  .subscribe( respuesta => {
    this.listaCantones = respuesta
    this.listaParroquias = [];
    this.formulario.controls.inputCanton.setValue(null);
    this.formulario.controls.inputParroquia.setValue(null);
  });
}
// Método que obtiene los datos de parroquias.
cargarParroquiasPorCanton(idCanton: number) {
  this._parroquiaService.getParroquiasPorCanton(idCanton)
  .subscribe( respuesta => {
    this.listaParroquias = respuesta 
    this.formulario.controls.inputParroquia.setValue(null);
  });
}

// Método que permite registrar un sitio.
registrarSitio() {
  let formularioInvalido = false;

  let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

  if(this.formulario.value.inputNombres == null || this.formulario.value.inputNombres == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese apellidos y nombres del propietario</li>";
  }

  if(this.formulario.value.tipo_area == null || this.formulario.value.tipo_area == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de área</li>";
  }

  if(this.formulario.value.nombre_predio.trim() == null || this.formulario.value.nombre_predio.trim() == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese nombre del sitio</li>";
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

  if(this.formulario.value.sitio_via.trim() == null || this.formulario.value.sitio_via.trim() == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese sitio/vía origen</li>";
  }

  if(this.formulario.value.tipo_area !== 'cen_faen'){
    if(this.formulario.value.fecha_inicio == null || this.formulario.value.fecha_inicio == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese fecha de inicio de vigencia</li>";
    }
  }

  if(this.formulario.value.tipo_area !== 'cen_faen'){
    if(this.formulario.value.fecha_fin == null || this.formulario.value.fecha_fin == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese fecha de fin de vigencia</li>";
    }
  }

 if ( this.formulario.invalid || formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('Error', mensaje, 'error');
  return;
 }

 //Mensaje de confirmación
Swal.fire({
  title: '¿Está seguro de registrar este sitio?',
  text: "Una vez registrado, se notificarán las credenciales de acceso al propietario.",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.value) {
  
    let sitio = new Sitio();
    sitio.idUsuariosExternos = this.idUsuario;//this.formulario.value.propietario_animales;
    sitio.nombre = this.formulario.value.nombre_predio.toUpperCase().trim();
    sitio.idTipoPropiedad = 1;
    sitio.telefono = '0000000000';
    sitio.superficieHa = 0;

    console.log('Lat: '+this.formulario.value.latitud);
    console.log('Lon: '+this.formulario.value.longitud);
    
    if(this.formulario.value.latitud==null || this.formulario.value.latitud==''){
      sitio.latitud=0;
    }else{
      sitio.latitud=this.formulario.value.latitud.trim();
    }

    if(this.formulario.value.longitud==null || this.formulario.value.longitud==''){
      sitio.longitud=0;
    }else{
      sitio.longitud=this.formulario.value.longitud.trim();
    }

    sitio.idPais = 19;//Ecuador por defecto
    sitio.idProvincia = this.formulario.value.inputProvincia;
    sitio.idCanton = this.formulario.value.inputCanton;
    sitio.idParroquia = this.formulario.value.inputParroquia;
    sitio.callePrincipal = this.formulario.value.sitio_via.toUpperCase().trim();
    sitio.referencia = 'ND';
    sitio.crearArea = true;

    if(this.estadoUsuario == 1){
      sitio.email = this.formulario.value.inputEmail.toLocaleLowerCase();
    }else{
      sitio.email = this.formulario.value.inputEmailLock.toLocaleLowerCase();
    }
    
    sitio.nombresUsuario = this.nombreUsuario;
    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
    sitio.contraseña = claveEncriptada;
    sitio.estadoUsuario = this.estadoUsuario;

    this.listaTiposAreas.forEach( (item: any) => {
      if ( Number(item.codigo) === Number(this.formulario.value.tipo_area) ) {
        sitio.idTipoArea = item.idTipoArea;
      }
    });

    switch(this.formulario.value.tipo_area)
        {
            case 'cen_faen':
              sitio.idTipoArea = 2;
              break;
            case 'fer_com':
              sitio.idTipoArea = 3;
              break;
            case 'fer_exp':
              sitio.idTipoArea = 6;
              break;
            case 'cen_hos':
              sitio.idTipoArea = 7;
              break;
            default:
        }

    sitio.observaciones = "Registrado por catálogo - admin";

    if(this.formulario.value.tipo_area !== 'cen_faen'){
      sitio.fechaVigencia = this.formulario.value.fecha_inicio + ' 00:00:00';
      sitio.fechaFin = this.formulario.value.fecha_fin + ' 23:59:59';
    }

    if(this.estadoUsuario == 1)
      {
        this.encriptar.setPublicKey(clavePublica);
        let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
        let usuario = new Usuario();
        usuario.idUsuario = this.idUsuario;
        usuario.email = this.formulario.value.inputEmail;
        usuario.contraseña = claveEncriptada;
        usuario.bandera = 0;
        this.servicioUsuario.activarUsuarioExterno(usuario)
        .subscribe((resp: any) => {} );
      }

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

      Swal.fire('Éxito', 'Sitio registrado con éxtito', 'success');
      this.formulario.reset();
      this.formularioBusqueda.reset();
      this.listaAreas = [];
      this.tablaVisible = false;
      this.formularioBusqueda.controls.provincia.setValue('-1');
      this.formularioBusqueda.controls.estado.setValue('1');
      this.listaCantones = [];
      this.listaParroquias = [];
      this.formulario.controls.latitud.setValue('0');
      this.formulario.controls.longitud.setValue('0');
      this.estadoUsuario = 0;
    }
    else {
    Swal.fire('Error', resp.mensaje , 'error');
    Swal.close();
    //this.router.navigate(['inicio']);
   }
 } );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

/**
 * Permite agregar un ciudadano si no se lo encuentra.
 */
agregarCiudadano(){
  this.mostrarCorreo = false;
  this.servicioCrearUsuario.abrir();
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

buscar(){

  let formularioInvalido = false;

  let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

  if(this.formularioBusqueda.value.tipo_area == null || this.formularioBusqueda.value.tipo_area == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione un tipo de área</li>";
  }

 if ( this.formularioBusqueda.invalid || formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('¡Adventencia!', mensaje, 'warning');
  return;
 }

  this.cargarAreas();
}

//Funcion para generar la clave aleatoria del usuario
generarClaveAleatoria() {
  let text = "";
  let possible = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890";

  for (let i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
    return text;
}

/**
   * Actualiza el estado de un certificado de movilización
   * @param id 
   * @param accion
   */
 actualizarEstado(id: number, accion: string){

  let area = new Area();
  area.idArea = id;

  this.listaAreas.filter( (item: Area) => {
    if ( Number(id) === Number(item.idArea) ) {
      area.idUsuariosExternos = item.idUsuariosExternos;
      area.idTiposAreas = item.idTiposAreas;
    } 
  });
  
  //certificado.usuarioEstado = localStorage.getItem('identificacion');
  var accionTexto = "";

  this.listaAreas.forEach( (item: Area) => {
   if (item.idArea == id ) {
    this.codigo = item.codigoSitio;
    this.nombreArea = item.nombre.toLocaleUpperCase();
    this.nombreTipoArea = item.nombreTipoArea.toLocaleUpperCase();
   }
 });

switch(accion)
{
  case 'Activar': { 
    area.estado = 1;
    accionTexto = "activado";
    break; 
 }
  case 'Inactivar': { 
    area.estado = 0;
    accionTexto = "inactivado";
    break; 
 }
 default: { 
    break; 
 } 
}

//Mensaje de confirmación
Swal.fire({
title: '¿'+accion.toLocaleUpperCase()+' '+this.nombreTipoArea+'?',
text: this.nombreArea,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#3085d6',
cancelButtonColor: '#d33',
confirmButtonText: 'Sí, ¡ '+accion.toLocaleLowerCase()+' !',
cancelButtonText: 'Cancelar'
}).then((result) => {
if (result.isConfirmed) {
  Swal.fire({
    title: 'Actualizando estado del sitio...',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
      Swal.showLoading();
    }
  });
       this.servicioArea.actualizarEstadoArea(area)
      .subscribe( (respuesta: any) => {
        this.buscar();
        //this.cargarAreas();
        Swal.fire('Éxito', 'SITIO '+this.codigo+' '+accionTexto.toLocaleUpperCase(), 'success');
        
      });

      //this.buscar();
    }
  });
}


// Actualizae estado del sitio 
// Método que permite actualizar el estado de un sitio.
actualizarEstadoSitio(id: number, accion: string) {

  let area = new Area();
  area.idArea = id;

  this.listaAreas.filter( (item: Area) => {
    if ( Number(id) === Number(item.idArea) ) {
      area.idUsuariosExternos = item.idUsuariosExternos;
      area.idTiposAreas = item.idTiposAreas;
    } 
  });

  this.listaAreas.forEach( (item: Area) => {
    if (item.idArea == id ) {
     this.codigo = item.codigoSitio;
     this.nombreArea = item.nombre.toLocaleUpperCase();
     this.nombreTipoArea = item.nombreTipoArea.toLocaleUpperCase();
     this.idUsuarioExterno = item.idUsuariosExternos;
     this.idTipoArea = item.idTiposAreas;
     this.idSitio = item.idSitio;
    }
  });

  var accionTexto = '';
  let sitio = new Sitio();
  sitio.idSitio = this.idSitio;//this.formularioBusqueda.value.sitio;//this.sitio.idSitio;
  sitio.observaciones = 'Inactivado por catálogo';
  
  switch(accion)
  {
    case 'Activar': { 
      sitio.estado = 3;
      this.estadoArea = 1;
      accionTexto = "activado";
      break; 
    }
    case 'Inactivar': { 
      sitio.estado = 6;
      this.estadoArea = 0;
      accionTexto = "inactivado";
      break; 
    }
  }
  
//Mensaje de confirmación

//Mensaje de confirmación
Swal.fire({
  title: '¿'+accion.toLocaleUpperCase()+' '+this.nombreTipoArea+'?',
  text: this.nombreArea,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí, ¡ '+accion.toLocaleLowerCase()+' !',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Actualizando estado del sitio...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this._sitioService.actualizarSitio(sitio)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        this.actualizarEstadoArea(id,this.estadoArea);
        //this.buscar();
        Swal.fire({
          title: `Éxito`,
          text: `SITIO ${this.codigo} ${accionTexto.toLocaleUpperCase()}`,
          icon: 'success',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then(() => {
          // Esta función se ejecuta después de que el usuario presiona "OK"
          this.buscar(); // Llama a la función buscar aquí
        });
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  });


      /*   this.servicioArea.actualizarEstadoArea(area)
        .subscribe( (respuesta: any) => {
          this.buscar();
          //this.cargarAreas();
          Swal.fire('Éxito', 'SITIO '+this.codigo+' '+accionTexto.toLocaleUpperCase(), 'success');
          
        });*/
  
        this.buscar();
      }
    });

    //this.buscar();

/*Swal.fire({
  title: '¿'+accion.toLocaleUpperCase()+' '+this.nombreTipoArea+'?',
text: this.nombreArea,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#3085d6',
cancelButtonColor: '#d33',
confirmButtonText: 'Sí, ¡ '+accion.toLocaleLowerCase()+' !',
cancelButtonText: 'Cancelar'
}).then((result) => {
  Swal.fire({
    title: 'Espere...',
    text: 'Actualizando datos',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
      if (result.value) {
        this._sitioService.actualizarSitio(sitio)
        .subscribe( (resp: any) => {
          if ( resp.estado === 'OK') {
            this.actualizarEstadoArea(id,this.estadoArea);
            this.buscar();
            Swal.fire('Éxito', 'SITIO '+this.codigo+' '+accionTexto.toLocaleUpperCase(), 'success');
            //this.buscar();
            console.log("llega aquí")
          }
          else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
      });
    }
    else
      Swal.close();
  })*/


}

//Actualizar estado área

/**
   * Actualiza el estado de una área
   */
actualizarEstadoArea(id: number, estado: number){
  let area = new Area();
  area.idArea = id;
  area.estado = estado;
  area.idUsuariosExternos = this.idUsuarioExterno;
  area.idTiposAreas = this.idTipoArea;

  this.servicioArea.actualizarEstadoArea(area)
      .subscribe( (respuesta: any) => {
      });

      
}

}