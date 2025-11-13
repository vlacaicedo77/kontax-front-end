import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
// Importamos la función de fondos aleatorios
import  * as fondos from 'src/app/config/random-background';

// Importamos las máscaras de validacion
import * as mascaras from 'src/app/config/mascaras';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiar-clave-caducada-externo',
  templateUrl: './cambiar-clave-caducada-externo.component.html',
  styleUrls: []
})
export class CambiarClaveCaducadaExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  regExpPassword :RegExp = mascaras.MASK_PASSWORD_EXT;
  encriptar: any;
  mostrarPassword1 = false;
  mostrarPassword2 = false;
  mostrarPassword3 = false;
  randomBackground = fondos.RandomBackground();

  constructor(
    public _servicioUsuario: UsuarioService,
    private router: Router
    ) { }

    ngOnInit(): void {
      this.encriptar = new JSEncrypt();
      this.inicializarFormulario();
      this.bloquearBotonAtras();
    }
  
     // Inicializar formulario.
     inicializarFormulario() {
      this.formulario = new FormGroup({
        password_actual: new FormControl(null, [Validators.required]),
        confirmar_password: new FormControl(null, [Validators.required]),
        nuevo_password: new FormControl(null, [Validators.required])
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
        text: "Recuerde que su nueva contraseña no puede ser igual a su contraseña anterior.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, enviar!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          
          Swal.fire({
            title: 'Espere...',
            text: 'Sus datos se están registrando',
            confirmButtonText: '',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });
        this._servicioUsuario.cambiarContraseñaUsuarioExterno(parseInt(localStorage.getItem('idUsuario')), claveEncriptada, claveAnteriorEncriptada)
          .subscribe((resp: any) => {
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

  // Método para bloquear el botón atrás del navegador
  bloquearBotonAtras(): void {
    // Reemplaza el estado actual en el historial
    window.history.pushState(null, null, window.location.href);
    // Escucha cuando el usuario intenta navegar hacia atrás
    window.onpopstate = () => {
      window.history.pushState(null, null, window.location.href);
      Swal.fire({
        icon: 'warning',
        title: '¡Advertencia!',
        text: 'Debe completar el cambio de contraseña para continuar',
        confirmButtonText: 'OK'
      });
    };
  }

  // Limpiar el evento cuando el componente se destruya
  ngOnDestroy(): void {
    window.onpopstate = null;
  }

}
