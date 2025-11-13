import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

// Importación de modelos.
import { RegistroMarca } from 'src/app/modelos/registro-marca.modelo';
// Importación de servicios.
import { RegistroMarcaService } from 'src/app/servicios/registro-marca/registro-marca.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-gestion-registro-marca',
  templateUrl: './gestion-registro-marca.component.html',
  styleUrls: []
})
export class GestionRegistroMarcaComponent implements OnInit {

 //Objetos para gestionar catálogos
 public registroMarca;
 public listaMarcas = [];
 public detalleVisible = false;
 public extensionArchivo: string;
 public rutaImagen : SafeUrl;

 //Objeto para gestionar el formulario
 formulario: FormGroup;

 constructor(    
   private _registroMarcaServicio: RegistroMarcaService,
   private router: Router,
   private domSanitizer: DomSanitizer
   ) { }

 ngOnInit(): void {
   this.inicializarFormulario();
 }

 inicializarFormulario() {
   this.formulario = new FormGroup({
    inputMarca: new FormControl(null, [Validators.required]),
    inputRuc: new FormControl(null),
    inputCodigo: new FormControl(null)
   });
 }

 // Método que obtiene los datos de tipos de propiedad.
 cargarRegistrosMarca() {
   
  this.detalleVisible = false;

    let parametros = {};
    if(this.formulario.value.inputCodigo != '' && this.formulario.value.inputCodigo != null && this.formulario.value.inputRuc == '' && this.formulario.value.inputRuc == null)
    {
      parametros = {codigo : this.formulario.value.inputCodigo, rucProductor : this.formulario.value.inputRuc, estado : 1};
      this.llamarConsultaMarcas(parametros);
    }  
    else if(this.formulario.value.inputCodigo != '' && this.formulario.value.inputCodigo != null && (this.formulario.value.inputRuc == '' || this.formulario.value.inputRuc == null))
    {
      parametros = {codigo : this.formulario.value.inputCodigo, estado : 1};
      this.llamarConsultaMarcas(parametros);
    }
    else if((this.formulario.value.inputCodigo == '' || this.formulario.value.inputCodigo == null) && this.formulario.value.inputRuc != '' && this.formulario.value.inputRuc != null)
    {
      parametros = {rucProductor : this.formulario.value.inputRuc, estado : 1};
      this.llamarConsultaMarcas(parametros);
    }  
    else
      Swal.fire('Error', 'Ingrese el RUC del productor o el código de la marca a buscar' , 'error');

 }

  //Método para llamar al servicio de consulta de registros
 llamarConsultaMarcas(parametros : {})
 {
  this._registroMarcaServicio.consultarReporteRegistrosMarcasPorFiltros(parametros) //Solamente registros activos, código 1
    .subscribe( (resp: any) => {
     if ( resp.estado === 'OK') {
       if(resp.resultado.length == 0)
       {
         Swal.fire('Éxito', 'La búsqueda no ha generado resultados.', 'success');
         this.detalleVisible = false;
         this.listaMarcas = [];
       }
       else
       {
        Swal.fire('Éxito', 'Se ha realizado la búsqueda con éxito.', 'success');
        this.listaMarcas = resp.resultado;
       }
     }
     else 
     {
       this.detalleVisible = false;
       this.listaMarcas = [];
       Swal.fire('Error', resp.mensaje , 'error');
     }
    });
 }

  // Método que obtiene los datos de tipos de propiedad.
  cargarDetalleRegistro(idMarca : string) {
    this.registroMarca =  this.listaMarcas.find(marca => marca.id_registro_marca == idMarca);
    if(this.registroMarca == null || typeof this.registroMarca == 'undefined') 
    {
      this.detalleVisible = false;
    }
    else
    {
      this.detalleVisible = true;
      this.rutaImagen = this.domSanitizer.bypassSecurityTrustUrl(environment.URL_IMAGENES+'/imagenesMarca/'+this.registroMarca.url_marca);
    }  
  }

 // Método que permite registrar un sitio.
 anularMarca() {
   let formularioInvalido = false;
   let mensaje = "El formulario de registro contiene errores<ul></br>";
  
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
    title: 'Está seguro de anular la marca?',
    text: "Esta acción no podrá ser revertida",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, anular',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
    
      let registro = new RegistroMarca();
      registro.idRegistroMarca=this.formulario.value.inputMarca;
      registro.estado = 0; //Se anula el registro, código de estado = 0

      this._registroMarcaServicio.actualizarRegistroMarca(registro)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'La marca ha sido anulada exitosamente.', 'success');
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

  // Método que detecta cuando se ha cambiado de finca y carga las explotaciones pecuarias.
  descargarImagenMarca(urlImagenMarca: string, codigoMarca: string) {
    this._registroMarcaServicio.descargarImagenMarca(urlImagenMarca)
    .subscribe( (data) => {

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "ImagenMarca_"+codigoMarca+(urlImagenMarca.substring(urlImagenMarca.lastIndexOf('.'), urlImagenMarca.length) || '');
      link.click();
    })
  }
 
 //Función que aplica la máscara a un input al presionarse una tecla
 mascara(event: KeyboardEvent, mascara: string)
 {
   mascaras.Mascara(event, mascara);
 }
}

