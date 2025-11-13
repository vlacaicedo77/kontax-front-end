import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { RegistroMarca } from 'src/app/modelos/registro-marca.modelo';
// Importación de servicios.
import { RegistroMarcaService } from 'src/app/servicios/registro-marca/registro-marca.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-creacion-registro-marca',
  templateUrl: './creacion-registro-marca.component.html',
  styleUrls: []
})
export class CreacionRegistroMarcaComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaGanaderos = [];
  public extensionArchivo: string;

  //Objeto para gestionar el formulario
  formulario: FormGroup;

  constructor(    
    private _registroMarcaServicio: RegistroMarcaService,
    private _usuarioService: UsuarioService,
    private router: Router) { }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputCodigo: new FormControl(null, [Validators.required, Validators.maxLength(24), Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputRuc: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_RUC)]),
      imagenMarca: new FormControl(null)
    });
  }

  // Método que obtiene los datos de tipos de propiedad.
  cargarGanaderos(numeroIdentificacion: string) {
    this._usuarioService.consultarUsuarioExtFiltros(null, null, null, numeroIdentificacion, 2 /*Estado Activo*/, 2/*Rol de productores pecuarios*/)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        Swal.fire('Éxito', 'Se ha realizado la búsqueda con éxito.', 'success');
        if(resp.resultado.length == 0)
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados.', 'success');
        else
        {
          this.listaGanaderos = resp.resultado;
        }
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }
  // Método que permite registrar un sitio.
  registrarMarca() {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

    if(this.formulario.get('imagenMarca').value=== null || this.formulario.get('imagenMarca').value=== undefined || this.formulario.get('imagenMarca').value=== ''){
      formularioInvalido = true;
      mensaje += "<li>No se ha cargado ningún archivo imagen de la marca</li>";
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
    title: 'Está seguro de registrar la marca?',
    text: "Asegúrese de que la información esté correcta, después no podrá modificarla",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, registrar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
    
      let registro = new RegistroMarca();
      registro.codigo=this.formulario.value.inputCodigo;
      registro.rucProductor=this.formulario.value.inputRuc;

      if(this.formulario.get('imagenMarca').value!== null && this.formulario.get('imagenMarca').value!== undefined && this.formulario.get('imagenMarca').value!== ''){ 
        //Se cargará el archivo solamente si es válido
        let nombreArchivo = 'RM' + registro.codigo + Math.floor((Math.random() * 100) + 1) + this.extensionArchivo;
        registro.urlMarca = nombreArchivo;
        
        const formData = new FormData();
        formData.append('imagenMarca', this.formulario.get('imagenMarca').value);
        this._registroMarcaServicio.cargarImagenMarca(nombreArchivo,formData).subscribe(
        (resp1: any) => {
    
          if ( resp1.estado === 'OK') {
            this.llamarServicioCrearRegistro(registro);
          }
          else
          {
            Swal.fire('Error', resp1.mensaje , 'error');
          }
        });
      }
    }
    else
    Swal.close();
  })
  }

  //Método que llama al servicio de creación de registro
  llamarServicioCrearRegistro(registro: RegistroMarca)
  {
    this._registroMarcaServicio.crearRegistroMarca(registro)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        Swal.fire('Éxito', 'La marca ha sido registrada correctamente.', 'success');
        this.router.navigate(['inicio']);
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  } );
  }

  //Método que prepara el formulario cuando un archivo ha sido seleccionado
  seleccionarArchivoImagen(event)
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
      
      if(archivo.type !== 'image/jpeg' && archivo.type !== 'image/png' && archivo.type !== 'image/gif'){
        archivoValido = false;
        mensaje += "<li>El tipo de archivo debe ser JPEG, PNG o GIF</li>";
      }
      if (archivoValido) {
        if(archivo.type == 'image/jpeg')
          this.extensionArchivo ='.jpeg';
        if(archivo.type == 'image/png')
          this.extensionArchivo ='.png';
        if(archivo.type == 'image/gif')
          this.extensionArchivo ='.gif';
        
        this.formulario.get('imagenMarca').setValue(archivo);
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
