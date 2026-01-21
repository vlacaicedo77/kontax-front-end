import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';

// Importamos las máscaras de validacion
import * as mascaras from 'src/app/config/mascaras';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-cambiar-contrasena-externo',
  templateUrl: './cambiar-contrasena-externo.component.html',
  styleUrls: []
})
export class CambiarContrasenaExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: UntypedFormGroup;
  regExpPassword :RegExp = mascaras.MASK_PASSWORD_EXT;
  encriptar: any;
  mostrarPassword1 = false;
  mostrarPassword2 = false;
  mostrarPassword3 = false;

  constructor(
    public _servicioUsuario: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.encriptar = new JSEncrypt();
    this.inicializarFormulario();
  }

   // Inicializar formulario.
   inicializarFormulario() {
    this.formulario = new UntypedFormGroup({
      password_actual: new UntypedFormControl(null, [Validators.required]),
      confirmar_password: new UntypedFormControl(null, [Validators.required]),
      nuevo_password: new UntypedFormControl(null, [Validators.required])
    });
  }

  // Método que permite cambiar la contraseña de un usuario externo.
  cambiarContrasena() {
    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.formulario.value.nuevo_password);
    let claveAnteriorEncriptada = this.encriptar.encrypt(this.formulario.value.password_actual);
    
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   if(this.formulario.value.nuevo_password !== this.formulario.value.confirmar_password){
      formularioInvalido = true;
      mensaje += "<li>La contraseña nueva y la confirmación de contraseña no coinciden</li>";
    }
    if(this.formulario.value.nuevo_password === this.formulario.value.password_actual){
      formularioInvalido = true;
      mensaje += "<li>La nueva contraseña no puede ser igual a la contraseña actual</li>";
    }
    if (!this.regExpPassword.test(this.formulario.value.nuevo_password)){
      formularioInvalido = true;
      mensaje += "<li>"+mascaras.MASK_FORMAT_MESSAGE_EXT+"</li>";
    }

  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

    //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de guardar los cambios?',
      text: "Recuerde que su nueva contraseña no puede ser igual a su contraseña anterior ni a la actual",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        
        /*Swal.fire({
          title: 'Espere...',
          text: 'Sus datos se están registrando',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
      });*/
      this._servicioUsuario.cambiarContraseñaUsuarioExterno(parseInt(localStorage.getItem('idUsuario')), claveEncriptada, claveAnteriorEncriptada)
        .subscribe( (resp: any) => {
          if ( resp.estado === 'OK') {
            Swal.fire('Éxito', 'La contraseña ha sido cambiada exitosamente', 'success');
            this.router.navigate(['inicio']);
          }
          else {
           Swal.fire('Error', resp.mensaje , 'error');
         }
       } );
  
      }
      else
      Swal.close();
    })
}

    //Función para activar y desactivar la visibilidad del password
    cambiarVisibilidadPassword(controlAfectado : number) {
      switch(controlAfectado)
      {
        case 1: this.mostrarPassword1 = !this.mostrarPassword1;
        break;
        case 2: this.mostrarPassword2 = !this.mostrarPassword2;
        break;
        case 3: this.mostrarPassword3 = !this.mostrarPassword3;
        break;
        default:
          break;
      }
    }
}
