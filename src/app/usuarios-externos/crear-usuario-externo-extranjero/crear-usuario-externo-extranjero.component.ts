import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { PaisService } from 'src/app/servicios/pais/pais.service';

// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';

@Component({
  selector: 'app-crear-usuario-externo-extranjero',
  templateUrl: './crear-usuario-externo-extranjero.component.html',
  styleUrls: ['./crear-usuario-externo-extranjero.component.css']
})
export class CrearUsuarioExternoExtranjeroComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  usuario : Usuario = new Usuario();
  contrasenaTemporal: string = '';
  listaPaisesOriginal = [];
  listaPaises = [];
  listaVacia = false;

  encriptar: any;

  constructor(
    public _servicioUsuario: UsuarioService,
    public _servicioPaises: PaisService,
    private router: Router,
    private servicioscript: ScriptsService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.verificarRolUsuario();//Se valida el acceso del usuario, en base a su rol
    this.cargarPaises();
    this.encriptar = new JSEncrypt();
    this.servicioscript.inicializarScripts();
    //Generar la contraseña aleatoria temporal
    this.contrasenaTemporal = this.generarClaveAleatoria();
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputNombres: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputApellidos: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputNumeroIdentificacion: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputEmail: new FormControl(null, [Validators.required]),
      inputPais: new FormControl(null, [Validators.required]),
    });
  }

  //Función para crear usuarios externos
  crearUsuario()
  {
    console.log(this.formulario);
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formulario.value.inputPais == null || this.formulario.value.inputPais == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione país de origen</li>";
    }

    if(this.formulario.value.inputNumeroIdentificacion == null || this.formulario.value.inputNumeroIdentificacion == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de identificación</li>";
    }

    if(this.formulario.value.inputApellidos == null || this.formulario.value.inputApellidos == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese apellidos</li>";
    }

    if(this.formulario.value.inputNombres == null || this.formulario.value.inputNombres == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese nombres</li>";
    }

    if(this.formulario.value.inputEmail == null || this.formulario.value.inputEmail == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese un correo electrónico válido</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    Swal.fire({
      title: '¡Entregue la contraseña temporal '+this.contrasenaTemporal+' al usuario antes de crear!',
      text: "Entregue la contraseña temporal al usuario y verifique que el correo electrónico sea correcto. La contraseña temporal será enviada al correo electrónico del usuario. Recuerde pedirle que revise su bandeja de correo no deseado o SPAM",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        
        Swal.fire({
          title: 'Espere...',
          text: 'El usuario se está creando',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
      });

      this.encriptar.setPublicKey(clavePublica);
      let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
      
      let usuario = new Usuario();

      usuario.tipoIdentificacion = 5; //Tipo de identificación Pasaporte
      usuario.idPais = this.formulario.value.inputPais;
      usuario.numeroIdentificacion = this.formulario.value.inputNumeroIdentificacion;
      usuario.nombres = this.formulario.value.inputApellidos +' '+ this.formulario.value.inputNombres;
      usuario.apellidos = this.formulario.value.inputApellidos.toUpperCase() +' '+ this.formulario.value.inputNombres.toUpperCase();
      usuario.email = this.formulario.value.inputEmail.toLowerCase();
      usuario.contraseña = claveEncriptada;
      
      this._servicioUsuario.registrarUsuarioExterno(usuario)
        .subscribe((resp: any) => {
          if (resp.estado === 'OK') {
            Swal.fire('Éxito', 'El usuario ha sido registrado correctamente. La contraseña temporal del usuario es: '+ this.contrasenaTemporal, 'success');
            this.formulario.reset();
            this.router.navigate(['inicio']);
          }
          else {
           Swal.fire('Error', resp.mensaje , 'error');
           this.router.navigate(['inicio']);
         }
       } );
      }
      else
      Swal.close();
    }) 
  }

// Método que obtiene los datos de tipos de propiedad.
cargarPaises() {
  this._servicioPaises.getPaises()
  .subscribe( respuesta => {
    this.listaPaisesOriginal = respuesta;
    //Eliminar Ecuador de la lista
    for( var i = 0; i < this.listaPaisesOriginal.length; i++){ 
    
      if ( this.listaPaisesOriginal[i].codigo == 'EC') { 
  
        this.listaPaisesOriginal.splice(i, 1); 
      }
    }
    this.listaPaises = this.listaPaisesOriginal;
    });
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

    // Método que obtiene los datos de roles del usuario
    verificarRolUsuario()
    {
      if(!this._servicioUsuario.usuarioInterno)
      {
        Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad' , 'error');
        this.router.navigate(['inicio']);
      }
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

    //Función para filtrar países del dropDown
    filtrarPaises(event: KeyboardEvent) {
      let elemento = event.target as HTMLInputElement;
      let cadena = elemento.value;
      if (typeof cadena === 'string') 
      {
        this.listaPaises = this.listaPaisesOriginal.filter(pais => pais.codigo.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
        //Agregar el control para cuando el filtrado de identificadores resulta en una lista vacía
        this.listaPaises.length == 0 ? this.listaVacia = true : this.listaVacia = false;
      }
    }
}


