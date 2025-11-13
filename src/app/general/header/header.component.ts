import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { NotificacionService } from '../../servicios/notificacion/notificacion.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {

  usuario: Usuario;
  listaNotificaciones = [];
  cantidadNotificaciones: number = 0;

  constructor(
    private autenticacionServicio: AutenticacionService,
    private rutas: Router,
    public usuarioServicio: UsuarioService,
    public _notificacionServicio: NotificacionService
  ) { }

  ngOnInit() {
    this.usuario = new Usuario();
    this.consultarInformacionUsuarioPorId();
  }

  // Método que se usa para cerrar la sesión de un usuario.
  cerrarSesion(){
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Está seguro de cerrar la sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((resultado) => {
      if (resultado.value) {
        // Mostramos el mensaje espera para el cierre de sesión.
        Swal.fire({
          text: 'Cerrando sesión',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
        });
        this.autenticacionServicio.logout()
        .subscribe(
          ( respuesta: any ) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Sesión cerrada.',
              showConfirmButton: false,
              timer: 1500
            });
            this.rutas.navigate(['login']);
          }
        , (err: HttpErrorResponse) => {
          if (err.error.estado === 'ERR') {
            Swal.fire('Error', err.error.mensaje , 'error');
          }
        });
      }
    });
  }

  consultarInformacionUsuarioPorId(){
    let idUsuario : number;
    let máximoNotificaciones = 3;
    this.cantidadNotificaciones = 0;

    if (this.usuarioServicio.usuarioExterno) {
      idUsuario = this.usuarioServicio.usuarioExterno.idUsuario;

      this.usuarioServicio.consultarUsuarioExternoId(this.usuarioServicio.usuarioExterno.idUsuario)
      .subscribe( (respuesta: any) => {
        if (respuesta.estado === 'OK') {
          this.usuario = respuesta.resultado.find( e => true );

          /*this._notificacionServicio.consultarNotificacionesExternosFiltros({idUsuarioNotificado : idUsuario, estado : 1})
          .subscribe( (respuesta: any) => {
            if (respuesta.estado === 'OK') {
              
              this.listaNotificaciones = respuesta.resultado;
              
              this.cantidadNotificaciones = this.listaNotificaciones.length;
  
              if(this.cantidadNotificaciones > máximoNotificaciones)
                this.listaNotificaciones = this.listaNotificaciones.slice(0, máximoNotificaciones);
            };
          });*/

        };
      });

    }
    else if(this.usuarioServicio.usuarioInterno)
    {
      idUsuario = this.usuarioServicio.usuarioInterno.idUsuario;

      this.usuarioServicio.consultarUsuarioInternoId(this.usuarioServicio.usuarioInterno.idUsuario)
      .subscribe( (respuesta: any) => {
        if (respuesta.estado === 'OK') {
          this.usuario = respuesta.resultado.find( e => true );
        
          /*this._notificacionServicio.consultarNotificacionesInternosFiltros({idUsuarioNotificado : idUsuario, estado : 1})
          .subscribe( (respuesta: any) => {
            if (respuesta.estado === 'OK') {
              
              this.listaNotificaciones = respuesta.resultado;
              
              this.cantidadNotificaciones = this.listaNotificaciones.length;
  
              if(this.cantidadNotificaciones > máximoNotificaciones)
                this.listaNotificaciones = this.listaNotificaciones.slice(0, máximoNotificaciones);
            };
          });*/
        }
      });
    }
    else
    {
      Swal.fire('Error', "El tipo de usuario loggeado es inválido" , 'error');
    }
  }

}
