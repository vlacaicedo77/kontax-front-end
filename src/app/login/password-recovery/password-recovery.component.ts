import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { showLoading, showWarning, showSuccessAutoClose, showError } from '../../config/alertas';
import { JSEncrypt } from 'jsencrypt';
import { clavePublica } from '../../config/config';
import Swal from 'sweetalert2';
// Importación de servicios
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
// Importamos las máscaras de validacion
import * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css']
})
export class PasswordRecoveryComponent implements OnInit, AfterViewInit {

  formulario: FormGroup;
  encriptar: any;
  ipPublica: string = '';
  mostrarPassword = false;

  constructor(
    public scriptServicio: ScriptsService,
    public _servicioUsuario: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngAfterViewInit() {
    this.scriptServicio.inicializarScripts();
  }

  inicializarFormulario() {
    this.formulario = new FormGroup({
      identificacion: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required])
    });
  }

  // Método que permite cambiar la contraseña de un usuario externo.
  recuperarContrasena() {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   /*if (!this.regExpRUC.test(this.formulario.value.identificacion)){
      formularioInvalido = true;
      mensaje += "<li>El RUC no tiene el formado correcto</li>";
    }*/

  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

    //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de continuar?',
      text: "Se enviará una nueva contraseña a su email registrado. Deberá cambiarla al ingresar. Recuerde revisar su bandeja de SPAM o correo no deseado.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
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
      this._servicioUsuario.recuperarContraseñaUsuarioExterno(this.formulario.value.identificacion,this.formulario.value.email)
        .subscribe((resp: any) => {
          if ( resp.estado === 'OK') {
            Swal.fire('Éxito', 'Recuperación exitosa. Se ha enviado una contraseña temporal a su correo electrónico', 'success');
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

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
   mascaras.Mascara(event, mascara);
  }

}