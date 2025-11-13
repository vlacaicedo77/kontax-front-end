import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute, Params } from '@angular/router';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { OficinaInternaService } from 'src/app/servicios/oficina-interna/oficina-interna.service';
// Importacion de modelos
import { Sitio } from 'src/app/modelos/sitio.modelo';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { trim } from 'jquery';
import { isNull } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-aprobacion-registro-sitios',
  templateUrl: './aprobacion-registro-sitios.component.html',
  styleUrls: []
})
export class AprobacionRegistroSitiosComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public historial = [];
  public sitio;
  public detalleVisible = false;
  public prediosVisible = false;
  public mapaVisible = false;
  public markerVisible = false;
  public latitudMarcador;
  public longitudMarcador;
  public aprobadorNacional = false;
  public idProvincia = null;
  public busquedaDirecta = false;
  public idSitioDirecto = null;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  formularioPredio : FormGroup;

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


  constructor(
    private _sitioService: SitioService,
    private _usuarioService: UsuarioService,
    private _oficinaService: OficinaInternaService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }
  
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputObservaciones: new FormControl(null,[Validators.required,Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
    });
  }
  inicializarFormularioPredio() {
    this.formularioPredio = new FormGroup({
      inputSitio: new FormControl(null,[Validators.required]),
    });
  }

  ngOnInit() {
    
    this.inicializarFormulario();
    this.verificarRolUsuario();
    this.inicializarFormularioPredio();

    let idPredio = this.activatedRoute.snapshot.paramMap.get('id');
    if( idPredio !== undefined && idPredio !== null)
    {
      this.busquedaDirecta = true;
      this.idSitioDirecto = idPredio;
      this.buscarDetallesSitio();
    }
  }
// Método que obtiene los datos las certificaciones
buscarDetallesSitio() {

  let idSitio;

  //Si la búsqueda se realiza desde un redireccionamiento, se obtiene el id del sitio del querystring cargado al inicio y no se utiliza el formulario
  if(this.busquedaDirecta)
    idSitio = this.idSitioDirecto;
  //Caso contrario, se realiza el proceso normal con la consulta mediante formulario
  else
  {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";
    idSitio = this.formularioPredio.value.inputSitio;

    if ( this.formularioPredio.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('Error', mensaje, 'error');
     return;
    }
  }
  
  

  this.sitio = this._sitioService.consultaSitioReporte(idSitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.sitio !== null) {

        this.sitio = resp.resultado.sitio;
        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');

        //Validar si el funcionario no es aprobador nacional, que el predio esté en la misma provincia del funcionario
        if(this.busquedaDirecta && !this.aprobadorNacional)
        {
          if(this.sitio.id_provincia != this.idProvincia)
            {
              console.log ('intento aerróneo atrapado');
              Swal.fire('Error', 'Usted no tiene permisos para aprobar un predio que no se encuentra en su provincia', 'error');
              this.router.navigate(['inicio']);
            }
        }
        this.detalleVisible = true;
        this.sitio.idSitio = idSitio;
        this.historial = resp.resultado.historico;
        this.cargarLocalizacionSitio();
      }
      else {
        Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
      }
    }
    else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
   })}

// Método que permite buscar los predios activos de un usuario por su número de identificación.
buscarSitios(numeroIdentificacionUsuario: string) {
  this.prediosVisible = false;
  this.detalleVisible = false;
  if ( typeof numeroIdentificacionUsuario =='undefined' || trim(numeroIdentificacionUsuario) == '') {
    Swal.fire('Advertencia', 'Ingrese un número de identificación.', 'warning');
    return;
  }

  this.listaSitios = [];

  if(this.aprobadorNacional)
  {
    //Se pueden aprobar las solicitudes de predio de todo el país.
    this._sitioService.consultarSitiosPorFiltros({numeroIdentificacionUsuario : numeroIdentificacionUsuario})//Sitios en estado Activo
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK')  {
        this.listaSitios = resp.resultado;
        //Se filtran los predios que están en estado 1 y 2 (pendientes y en visita)
        this.filtrarPredios();
        if(this.listaSitios.length > 0) {

          this.prediosVisible = true;
          Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
        }
        else {
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
        }
      }
      else {
        Swal.fire('Error', resp.mensaje , 'error');
      }
     });
  }
  else
  {
    //Se pueden aprobar las solicitudes de predio solamente de la provincia a la que pertenece el usuario.
    this._sitioService.consultarSitiosPorFiltros({numeroIdentificacionUsuario : numeroIdentificacionUsuario, idProvincia : this.idProvincia})//Sitios en estado Activo
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK')  {
        this.listaSitios = resp.resultado;
        //Se filtran los predios que están en estado 1 y 2 (pendientes y en visita)
        this.filtrarPredios();
        if(this.listaSitios.length > 0) {
          this.prediosVisible = true;
          Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
        }
        else {
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados (recuerde que solamente puede aprobar predios dentro de su provincia)', 'success');
        }
      }
      else {
        Swal.fire('Error', resp.mensaje , 'error');
      }
     });
  }
}

// Método que detecta cuando se ha cambiado de finca y carga las explotaciones pecuarias.
descargarDocumentoSitio(urlDocumentoPropiedad: string, codigoSitio: string) {
  this._sitioService.descargarDocumentoPropiedad(urlDocumentoPropiedad)
  .subscribe( (data) => {
    var downloadURL = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = "DocumentoPredio_"+codigoSitio+".pdf";
    link.click();
  })
}

//setea el punto del mapa en la locación actual
cargarLocalizacionSitio()
{
  let latitud = Number(this.sitio.latitud);
  let longitud = Number(this.sitio.longitud);

  this.latitudMarcador = latitud;
  this.longitudMarcador = longitud;

  if(isNaN(latitud) || isNaN(longitud))
  {
    Swal.fire('Advertencia', 'Se han obtenido los datos del predio pero no se ha podido cargar la ubicación GPS en el mapa', 'warning');
    this.centroMapa = {
      lat: -1.831239,
      lng: -78.183406,
    };
  }
  else
  {
    this.centroMapa = {
      lat: latitud,
      lng: longitud,
    };
    this.posicionMarcador = {
      lat: this.latitudMarcador,
      lng: this.longitudMarcador,
    };
  }
  this.mapaVisible=true;
}

// Método que permite tramitar una solicitud.
tramitarSolicitud(accion: string) {
  let formularioInvalido = false;
  let mensaje = "El formulario de solicitud contiene errores<ul></br>";

  //Validaciones de lógica de negocio.
  if(this.sitio.idSitio===null || this.sitio.idSitio === undefined){
      formularioInvalido = true;
      mensaje += "<li>Ocurrió un problema al obtener el código del predio</li>";
    }
  if(this.sitio.estado>=3){
      formularioInvalido = true;
      mensaje += "<li>El sitio no está en estado Pre-registro o Visita Física </li>";
    }
  if(accion===null || accion === undefined || accion ===''){
      formularioInvalido = true;
      mensaje += "<li>Acción inválida</li>";
    }
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
  let sitio = new Sitio();
  sitio.idSitio = this.sitio.idSitio;
  sitio.observaciones = this.formulario.value.inputObservaciones;
  var accionTexto = "";

  switch(accion)
  {
    case 'aprobar': { 
      sitio.estado = 3;
      accionTexto = "aprobar";
      break; 
   }
    case 'rechazar': { 
      sitio.estado = 6; 
      accionTexto = "rechazar";
    break; 
  } 
    case 'visitar': { 
      sitio.estado = 2;
      accionTexto = "realizar una visita física";
    break; 
  } 
   default: { 
      break; 
   } 
  }

//Mensaje de confirmación
Swal.fire({
  title: 'Está seguro de ' + accionTexto+' al predio?',
  text: "Esta acción no podrá ser reversada",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Si, enviar',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
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
            Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
            this.router.navigate(['inicio']);
          }
          else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
      });
    }
    else
      Swal.close();
  })
}

  // Método que obtiene los datos de roles del usuario
  verificarRolUsuario()
  {
    if(this._usuarioService.usuarioInterno)
    {
      let idUsuario = parseInt(localStorage.getItem('idUsuario'));

      this._usuarioService.consultarRolesUsuarioInternoId(idUsuario)
      .subscribe( (resp:any) =>{
            if (resp.estado === 'OK') 
            {
              let rolesUsuario = resp.resultado;
              let aprobadorNacional = false
              rolesUsuario.forEach(rol => {
                if(rol.idRoles == 18)//Rol de aprobador nacional de predios
                  aprobadorNacional = true;  
              })

              if(aprobadorNacional)
                  this.aprobadorNacional = true;  
                else
                {
                  this.aprobadorNacional = false;
                }

              //Cargar la provincia de la oficina del usuario
              this.cargarProvinciaOficina();
            }
            else {
            Swal.fire('Error', resp.mensaje , 'error');
          }
        } );
    }
    else
    {
      Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad' , 'error');
      this.router.navigate(['inicio']);
    }
  }

  // Método que obtiene el código de provincia de una oficina por su id.
  cargarProvinciaOficina() {
    this._oficinaService.getOficinasInternasPorId(parseInt(localStorage.getItem('oficina')))
    .subscribe( resp => {
      if(resp.length <= 0) 
      {
        Swal.fire('Error', resp.mensaje , 'error');
      }
      else 
      {
        let oficina = resp[0];
        this.idProvincia = oficina.id_provincia;
      }
    });
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

  //Función para filtrar los sitios que estén en estado 1 y 2 que son lo que se puede aprobar
  filtrarPredios()
  {
    this.listaSitios = this.listaSitios.filter(  sitio  => sitio.estado < 3);
  }

}
