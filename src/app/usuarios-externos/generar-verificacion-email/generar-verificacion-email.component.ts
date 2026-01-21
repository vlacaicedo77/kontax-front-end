import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
//Importación de modelos
import { Usuario } from 'src/app/modelos/usuario.modelo';
// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generar-verificacion-email',
  templateUrl: './generar-verificacion-email.component.html',
  styleUrls: []
})
export class GenerarVerificacionEmailComponent implements OnInit {

  public usuario : Usuario;
  public detalleVisible = false;
  
  constructor(
    private _usuarioService: UsuarioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  // Método que busca el usuario por su identificación
  buscarUsuario(numeroIdentificacionUsuario: string) {
  if ( numeroIdentificacionUsuario === null) {
    return;
  }
 
  this._usuarioService.consultarUsuarioExtFiltros(null,null, null, numeroIdentificacionUsuario, null)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length ===1) 
      {
        //Cargar usuario
        this.usuario = new Usuario();
        this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
        this.usuario.nombres = resp.resultado[0].nombres;
        this.usuario.apellidos = resp.resultado[0].apellidos;
        this.usuario.email = resp.resultado[0].email;
        this.usuario.estado = resp.resultado[0].estado;

        this.detalleVisible = true;

        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
      }
      else
      {
        if(resp.resultado.length >1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un resultado' , 'error');
        else
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');

          this.detalleVisible = false;
      }
    }
    else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
   })}

   // Método que permite reenviar el correo de verficicación de email
   reenviarCorreoVerificacion() {
  let formularioInvalido = false;
  let mensaje = "<ul>";

  //Validaciones de lógica de negocio.
  if(this.usuario.idUsuario===null){
      formularioInvalido = true;
      mensaje += "<li>Ocurrió un problema al obtener los datos del usuario</li>";
    }
  if(this.usuario.estado != 1){
      formularioInvalido = true;
      mensaje += "<li>El usuario no está en estado Pendiente de Verificación. No se puede generar un token de verificación de correo.</li>";
    }
  if (formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
//Mensaje de confirmación
Swal.fire({
  title: 'Está seguro de continuar con el envío?',
  text: "Se enviará un nuevo correo de confirmación de email al usuario. El anterior quedará invalidado.",
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

        this._usuarioService.reenviarConfirmacionEmailExterno(this.usuario.idUsuario)
        .subscribe( (resp: any) => {
          if ( resp.estado === 'OK') {
            Swal.fire('Éxito', 'Se ha enviado exitosamente el nuevo correo de verificación de email al usuario. Recuerde revisar su SPAM', 'success');
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

   //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

}
