import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { Sitio } from 'src/app/modelos/sitio.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { CantonService } from 'src/app/servicios/canton/canton.service';
import { ParroquiaService } from 'src/app/servicios/parroquia/parroquia.service';
import { TipoPropiedadService } from 'src/app/servicios/tipo-propiedad/tipo-propiedad.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({

  selector: 'app-registro-sitios',
  templateUrl: './registro-sitios.component.html',
  styleUrls: ['./registro-sitios.component.css']
})
export class RegistroSitiosComponent implements OnInit {

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
    private _sitioService: SitioService,
    private _provinciaService: ProvinciaService,
    private _cantonService: CantonService,
    private _parroquiaService: ParroquiaService,
    private _tipoPropiedad: TipoPropiedadService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.cargarTiposPropiedad();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.inicializarFormulario();
    this.mascaraTelefono = "telefonoFijo";
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputNombre: new FormControl(null, [Validators.required, Validators.maxLength(256) /*, Validators.pattern(mascaras.MASK_ALFANUMERICO)*/]),
      inputSuperficieHa: new FormControl(null, [Validators.required, Validators.min(0),Validators.max(999999999) , Validators.pattern(mascaras.MASK_DECIMAL)]),
      //inputPais: new FormControl(null, [Validators.required]),
      inputProvincia: new FormControl(null, [Validators.required]),
      inputCanton: new FormControl(null, [Validators.required]),
      inputParroquia: new FormControl(null, [Validators.required]),
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
      inputTipoTelefono: new FormControl(null, [Validators.required]),
      documentoPropiedad: new FormControl(null)
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

//Método para inicializar el mapa.
cargarMapaParroquia()
{
  this.mapaVisible= true;
  //Cambiar por la posición de la parroquia
  this.centroMapa = {
    lat: -1.831239,
    lng: -78.183406,
  };
  this.zoom = 10;
  this.latitudMarcador = -1.831239;
  this.longitudMarcador = -78.183406;
}

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
registrarSitio() {
  let formularioInvalido = false;
  let mensaje = "El formulario de registro contiene errores<ul></br>";

  /*if(this.formulario.get('documentoPropiedad').value=== null || this.formulario.get('documentoPropiedad').value=== undefined || this.formulario.get('documentoPropiedad').value=== ''){
    formularioInvalido = true;
    mensaje += "<li>No se ha cargado ningún documento de propiedad o arriendo válido </li>";
  }*/

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

 //Mensaje de confirmación
Swal.fire({
  title: 'Está seguro de enviar la solicitud de pre-registro del predio?',
  text: "Una vez enviada no podrá modificar la solicitud",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Si, enviar',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.value) {
  
    let sitio = new Sitio();
    sitio.nombre=this.formulario.value.inputNombre;
    sitio.superficieHa=this.formulario.value.inputSuperficieHa;
    sitio.idPais=19;//Ecuador por defecto
    sitio.idProvincia=this.formulario.value.inputProvincia;
    sitio.idCanton=this.formulario.value.inputCanton;
    sitio.idParroquia=this.formulario.value.inputParroquia;
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
          this.llamarServicioCrearSitio(sitio);
        }
        else
        {
          Swal.fire('Error', resp1.mensaje , 'error');
        }
      });
    }
    else
    {
      this.llamarServicioCrearSitio(sitio);
    }
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
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
  });
  
  this._sitioService.registrarSitio(sitio)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'El predio fue registrado correctamente. La información será revisada y deberá ser aprobada por Agrocalidad.', 'success');
      this.router.navigate(['inicio']);
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
     this.router.navigate(['inicio']);
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

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}