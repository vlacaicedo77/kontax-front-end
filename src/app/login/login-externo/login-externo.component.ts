import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from '../../config/config';
// Importación de servicios.
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
// Importamos la función de fondos aleatorios
import  * as fondos from 'src/app/config/random-background';

// Importamos las máscaras de validacion
import * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-login-externo',
  templateUrl: './login-externo.component.html',
  styles: [
  ]
})
export class LoginExternoComponent implements OnInit {

   // Objeto que maneja el formulario.
   formulario: FormGroup;
   encriptar: any;
   direccionIP: any;
   mostrarPassword = false;
   randomBackground = fondos.RandomBackground();

  constructor(
    private usuarioServicio: UsuarioService,
    public _servicioAutenticacion: AutenticacionService,
    private router: Router,
    private scriptServicio: ScriptsService
  ) { }

  ngOnInit(): void {
    if (this.usuarioServicio.sesionIniciada()){
      this.router.navigate(['/inicio']);
    }
    this.encriptar = new JSEncrypt();
    this.inicializarFormulario();
    this.obtenerDireccionIP();
    this.scriptServicio.inicializarScripts();
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      identificacion: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });
  }

  // Método que permite a un usuario iniciar sesion
  iniciarSesion() {
    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.formulario.value.password);
    if (this.formulario.invalid) {
      Swal.fire('Error', 'Existen errores en los datos de ingreso', 'error');
      return;
    }

    Swal.fire({
      title: 'Espere...',
      text: 'Autenticando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this._servicioAutenticacion.autenticarUsuarioExterno(this.formulario.value.identificacion, claveEncriptada, this.direccionIP)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'El usuario fue autenticado correctamente.',
            showConfirmButton: false,
            timer: 1500
          });
          if(resp.resultado['contraseñaExpirada'] == 'SI')
          {
            Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'Su contraseña ha expirado, por favor cambie su contraseña.',
              showConfirmButton: true
            });
            this.router.navigate(['/cambiar-clave-caducada-externo']);  
          }
          else
          {
            this.router.navigate(['inicio']);
          }
        }
        else {
          Swal.fire('Error', resp.mensaje, 'error');
        }
      }, (err: HttpErrorResponse) => {
        Swal.fire('Error', err.message, 'error');
      });
  }

  obtenerDireccionIP() {
    /*this.http.get<{ip:string}>('https://jsonip.com')
    .subscribe( data => {
      this.direccionIP = data.ip
    })*/
    this.direccionIP = '192.0.0.1';
  }

  // Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string) {
    mascaras.Mascara(event, mascara);
  }

  //Función para activar y desactivar la visibilidad del password
  cambiarVisibilidadPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

}
