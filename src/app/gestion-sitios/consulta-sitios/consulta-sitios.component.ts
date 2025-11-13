import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-consulta-sitios',
  templateUrl: './consulta-sitios.component.html',
  styleUrls: ['./consulta-sitios.component.css']
})

export class ConsultaSitiosComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public listaCertificaciones = [];
  public listaAreas = [];
  public sitio;
  public mapaVisible = false;
  public markerVisible = false;
  public latitudMarcador;
  public longitudMarcador;
  public detalleVisible = false;
  public prediosVisible = false;
  public usuarioInterno = false;

  encriptar: any;

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
    private router: Router
  ) { }

  ngOnInit() {
    this.validarTipoUsuario();
  }

// Método que valida si el usuario es interno o externo (usuario externos solamente pueden ver sus predios)
validarTipoUsuario()
{
  if(this._usuarioService.usuarioExterno)
  {
    let identificacionUsuario = localStorage.getItem('identificacion');
    this.buscarSitios(identificacionUsuario);
  }
  else if(this._usuarioService.usuarioInterno)
  {
    this.usuarioInterno = true;
  }
  else{
    Swal.fire('Error', 'Ha ocurrido un error al intentar identificar el tipo de usuario (externo/interno)' , 'error');
      this.router.navigate(['inicio']);
    }
}

// Método que obtiene los datos las certificaciones
buscarDetallesSitio(idSitio: number) {
  this.sitio = this._sitioService.consultaSitioReporte(idSitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.sitio !== null) {
        this.detalleVisible = true;
        this.sitio = resp.resultado.sitio;
        this.listaAreas = resp.resultado.areas;
        this.listaCertificaciones = resp.resultado.certificaciones;
        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
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

// Método que detecta cuando se ha cambiado de finca y carga las explotaciones pecuarias.
buscarSitios(numeroIdentificacionUsuario: string) {
  this.prediosVisible = false;
  this.detalleVisible = false;
  if ( numeroIdentificacionUsuario === null) {
    return;
  }
  this.listaSitios = [];
  this._sitioService.consultarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacionUsuario)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaSitios = resp.resultado;
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
   })}

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

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}

