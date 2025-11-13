import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { Sitio } from 'src/app/modelos/sitio.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { TipoPropiedadService } from 'src/app/servicios/tipo-propiedad/tipo-propiedad.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-actualizacion-sitios',
  templateUrl: './actualizacion-sitios.component.html',
  styleUrls: ['./actualizacion-sitios.component.css']
})
export class ActualizacionSitiosComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaTiposPropiedad = [];
  public mapaVisible = false;
  public markerVisible = false;
  public latitudMarcador;
  public longitudMarcador;
  public extensionArchivo: string;
  public listaSitios = [];
  public sitio;
  public detalleVisible = false;

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
  formularioPredio : FormGroup;
  mascaraTelefono: string;
  
  encriptar: any;

  constructor(
    public scriptServicio: ScriptsService,
    private _sitioService: SitioService,
    private _tipoPropiedad: TipoPropiedadService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.cargarTiposPropiedad();
    this.inicializarFormularioPredio();
    this.inicializarFormulario();
    this.buscarSitios();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputIdSitio: new FormControl(null),
      inputNombre: new FormControl(null, [Validators.required, Validators.maxLength(256) /*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputSuperficieHa: new FormControl(null, [Validators.required, Validators.min(0),Validators.max(999999999) , Validators.pattern(mascaras.MASK_DECIMAL)]),
      inputCallePrincipal: new FormControl(null, [Validators.required, Validators.maxLength(128) /*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputInterseccion: new FormControl(null, [/*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputNumeracion: new FormControl(null, [/*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputReferencia: new FormControl(null, [Validators.required,Validators.maxLength(256)/*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputTelefono: new FormControl(null, [Validators.required, Validators.maxLength(32)]),
      inputLatitud: new FormControl(null, []),
      inputLongitud: new FormControl(null, []),
      inputCodigoPredial: new FormControl(null, [Validators.required, Validators.maxLength(128)/*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputTipoPropiedad: new FormControl(null, [Validators.required]),
      inputPoligono: new FormControl(null, []),
      inputTipoTelefono: new FormControl(null),
      documentoPropiedad: new FormControl(null)
    });
  }

  inicializarFormularioPredio() {
    this.formularioPredio = new FormGroup({
      inputSitio: new FormControl(null,[Validators.required]),
    });
  }

// Método que obtiene los datos de tipos de propiedad.
cargarTiposPropiedad() {
  this._tipoPropiedad.getTiposPropiedad()
  .subscribe( respuesta => this.listaTiposPropiedad = respuesta );
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

//setea el punto del mapa en la locación actual
centrarUbicacionActual()
{
  navigator.geolocation.getCurrentPosition(position => {
    this.centroMapa = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    this.latitudMarcador = position.coords.latitude;
    this.longitudMarcador = position.coords.longitude;
    this.posicionMarcador = {
      lat: this.latitudMarcador,
      lng: this.longitudMarcador,
    };
  })
}

// Método que permite buscar los predios activos de un usuario por su número de identificación.
buscarSitios() {
  this.detalleVisible = false;
  
  let idUsuario = localStorage.getItem('idUsuario');

  this.listaSitios = [];

    this._sitioService.consultarSitiosPorFiltros({idUsuariosExternos : idUsuario})//Sitios en estado Activo
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK')  {
        this.listaSitios = resp.resultado;
        
        //Se filtran los predios en estado pendiente y activo.
        this.filtrarPredios();

        if(this.listaSitios.length > 0) {
          Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
        }
        else {
          Swal.fire('Éxito', 'El usuario no cuenta con predios registrados', 'success');
        }
      }
      else {
        Swal.fire('Error', resp.mensaje , 'error');
      }
     });

}

// Método que obtiene los datos del predio
buscarDetallesSitio() {

  let formularioInvalido = false;
  let mensaje = "El formulario de registro contiene errores<ul></br>";

  if ( this.formularioPredio.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  this.sitio = this._sitioService.consultaSitioReporte(this.formularioPredio.value.inputSitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.sitio !== null) {
        this.detalleVisible = true;
        this.sitio = resp.resultado.sitio;
        this.sitio.idSitio = this.formularioPredio.value.inputSitio;
        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
        this.cargarDatosSitio();
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

clicMapa(event: google.maps.MouseEvent) {
  this.markerVisible = true;
  this.latitudMarcador = event.latLng.lat();
  this.longitudMarcador = event.latLng.lng();
  this.posicionMarcador = {
    lat: this.latitudMarcador,
    lng: this.longitudMarcador,
  };
}

// Método que permite registrar un sitio.
actualizarSitio() {
  let formularioInvalido = false;
  let mensaje = "El formulario de registro contiene errores<ul></br>";

  if(isNaN(this.formulario.value.inputSuperficieHa) ||  this.formulario.value.inputSuperficieHa.trim() == '')
  {
    formularioInvalido = true;
    mensaje += "<li>Ingrese un número decimal válido en el campo superficie.</li>";
  }

  if(isNaN(this.latitudMarcador) ||  isNaN(this.longitudMarcador))
  {
    formularioInvalido = true;
    mensaje += "<li>Las coordenadas GPS seleccionadas contienen errores</li>";
  }

 if ( this.formulario.invalid || formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('Error', mensaje, 'error');
  return;
 }

 Swal.fire({
  title: 'Espere...',
  text: 'Sus datos se están registrando',
  confirmButtonText: '',
  allowOutsideClick: false,
  onBeforeOpen: () => {
      Swal.showLoading();
  }
});

//Mensaje de confirmación
Swal.fire({
  title: 'Está seguro de actualizar la información del predio?',
  text: "Revise la información antes de guardarla",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Si, enviar',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.value) {
  
    let sitio = new Sitio();
    sitio.idSitio = this.formulario.value.inputIdSitio;
    sitio.nombre=this.formulario.value.inputNombre;
    sitio.superficieHa=this.formulario.value.inputSuperficieHa;
    sitio.callePrincipal=this.formulario.value.inputCallePrincipal;
    sitio.interseccion=this.formulario.value.inputInterseccion;
    sitio.numeracion=this.formulario.value.inputNumeracion;
    sitio.referencia=this.formulario.value.inputReferencia;
    sitio.telefono=this.formulario.value.inputTelefono;
    sitio.latitud=this.latitudMarcador;
    sitio.longitud=this.longitudMarcador;
    sitio.codigoPredial=this.formulario.value.inputCodigoPredial;
    sitio.idTipoPropiedad=this.formulario.value.inputTipoPropiedad;
    sitio.poligono=this.formulario.value.inputPoligono;

    if(this.formulario.get('documentoPropiedad').value!== null && this.formulario.get('documentoPropiedad').value!== undefined && this.formulario.get('documentoPropiedad').value!== ''){ 
      //Se cargará el archivo solamente si es válido
      let fecha = new Date();
      let nombreArchivo = 'DP' + Math.floor((Math.random() * 100) + 1) + fecha.getFullYear()+fecha.getMonth()+fecha.getDay()+fecha.getTime() + this.extensionArchivo;
      sitio.urlDocumentoPropiedad = nombreArchivo;
      
      const formData = new FormData();
      formData.append('documentoPropiedad', this.formulario.get('documentoPropiedad').value);
      this._sitioService.cargarDocumentoPropiedad(nombreArchivo,formData).subscribe(
      (resp1: any) => {
  
        if ( resp1.estado === 'OK') {
          this.llamarServicioActualizarSitio(sitio);
        }
        else
        {
          Swal.fire('Error', resp1.mensaje , 'error');
        }
      });
    }
    else
    {
      this.llamarServicioActualizarSitio(sitio);
    }
  }
  else
  Swal.close();
})
}

//Método que llama al servicio de creación de sitios/predios
llamarServicioActualizarSitio(sitio: Sitio)
{

  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
  });

  this._sitioService.actualizarSitio(sitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'El predio fue actualizado correctamente.', 'success');
      this.router.navigate(['inicio']);
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
     //this.router.navigate(['inicio']);
   }
 } );
}

// Método que obtiene el listado de sitios por el id del usuario
cambiarMascaraTelefono() {
  if(this.formulario.value.inputTipoTelefono == "fijo")
  {
    this.mascaraTelefono = "telefonoFijo";
    this.formulario.controls.inputTelefono.setValidators([Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_FIJO)]);
  }
  else
  {
    this.mascaraTelefono = "telefonoMovil";
    this.formulario.controls.inputTelefono.setValidators([Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_MOVIL)]);
  }
}

//Método que prepara el formulario cuando un archivo ha sido seleccionado
seleccionarArchivoPropiedad(event)
{
  if (event.target.files.length > 0) {
    const archivo = event.target.files[0];
    let archivoValido = true;
    let tamañoMaximoMb = 5;
    let mensaje = "El archivo cargado tiene errores<ul></br>";
    //Validaciones del archivo
    if(archivo.size >(tamañoMaximoMb*1024*1024)){
      archivoValido = false;
      mensaje += "<li>El tamaño del archivo excede el máximo permitido ("+tamañoMaximoMb+" Mb)</li>";
    }
    if(archivo.type !== 'application/pdf'){
      archivoValido = false;
      mensaje += "<li>El tipo de archivo debe ser PDF</li>";
    }
    if (archivoValido) {
      if(archivo.type == 'application/pdf')
        this.extensionArchivo ='.pdf';
      
      this.formulario.get('documentoPropiedad').setValue(archivo);
    }
    else{
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
    }
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

//Función que inicializa los datos del sitio en el formulario
cargarDatosSitio()
{
  //Cargar los datos del usuario en el formulario
  this.formulario.controls.inputIdSitio.setValue(this.sitio.id_sitio);
  this.formulario.controls.inputNombre.setValue(this.sitio.nombre);
  this.formulario.controls.inputSuperficieHa.setValue(this.sitio.superficie_ha);
  this.formulario.controls.inputCallePrincipal.setValue(this.sitio.calle_principal);
  this.formulario.controls.inputInterseccion.setValue(this.sitio.interseccion);
  this.formulario.controls.inputNumeracion.setValue(this.sitio.numeracion);
  this.formulario.controls.inputReferencia.setValue(this.sitio.referencia);
  this.formulario.controls.inputTelefono.setValue(this.sitio.telefono);
  this.formulario.controls.inputLatitud.setValue(this.sitio.latitud);
  this.formulario.controls.inputLongitud.setValue(this.sitio.longitud);
  this.formulario.controls.inputCodigoPredial.setValue(this.sitio.codigo_predial);
  this.formulario.controls.inputTipoPropiedad.setValue(this.sitio.id_tipo_propiedad);
}

}