import { Component, OnInit } from '@angular/core';
import { showLoading, showConfirmCustom, showSuccessAutoClose, showError, closeAlert } from '../../config/alertas';
import { Router, NavigationEnd } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
// Importación de modelos.
import { Usuario } from '../../modelos/usuario.modelo';
// Importación de servicios.
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
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
  isMobileMenuOpen = false;
  
  // Para almacenar referencias
  private overlay: HTMLElement | null = null;
  private clickOutsideListener: any;
  private routerSubscription: any;
  private menuLinksListener: any;
  private togglerClickListener: any;
  private isProcessingClick = false; // Bandera para evitar múltiples clics rápidos

  constructor(
    private autenticacionServicio: AutenticacionService,
    private router: Router,
    public usuarioServicio: UsuarioService,
    public _notificacionServicio: NotificacionService
  ) { }

  ngOnInit() {
    this.usuario = new Usuario();
    this.consultarInformacionUsuarioPorId();
  }


  // ==================== FUNCIONALIDAD EXISTENTE ====================

  //**** Cerrar Sesión ****/
  cerrarSesion() {
    showConfirmCustom(
      '¿Desea salir del sistema?',
    ).then((resultado) => {
      if (resultado.isConfirmed) {
        showLoading('Cerrando sesión...');
        this.autenticacionServicio.logout()
          .subscribe(
            (respuesta: any) => {
              closeAlert();
              showSuccessAutoClose('¡Hasta pronto!', 1500);
              this.router.navigate(['home']);
            },
            (err: HttpErrorResponse) => {
              closeAlert();
              if (err.error.estado === 'ERR') {
                showError('Error', err.error.mensaje);
              }
            }
          );
      }
    });
  }

  consultarInformacionUsuarioPorId() {
    let idUsuario: number;
    this.cantidadNotificaciones = 0;

    if (this.usuarioServicio.usuarioExterno) {
      idUsuario = this.usuarioServicio.usuarioExterno.idUsuario;

      this.usuarioServicio.consultarUsuarioExternoId(this.usuarioServicio.usuarioExterno.idUsuario)
        .subscribe((respuesta: any) => {
          if (respuesta.estado === 'OK') {
            this.usuario = respuesta.resultado.find(e => true);
          };
        });

    }
    else {
      showError('Error', 'Usuario loggeado inválido');
    }
  }

}