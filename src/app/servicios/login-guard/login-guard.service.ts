import { Injectable } from '@angular/core';
import { UsuarioService } from '../usuario/usuario.service';
import { Router, CanActivate } from '@angular/router';
import { AutenticacionService } from 'src/app/servicios/autenticacion/autenticacion.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    public usuarioServicio: UsuarioService,
    public enrutador: Router,
    public servicioAutenticacion: AutenticacionService
  ) { }

  canActivate(){
    if (this.usuarioServicio.sesionIniciada()) {
      /*25APR2021 DSRE Se incluye validación de token expirada en el control de login */
      if ( this.servicioAutenticacion.tokenExpirado() ) {
        this.servicioAutenticacion.limpiarSesion();
        Swal.fire('Alerta', 'Se encontró una sesión expirada sin cerrar. Al salir del sistema no olvide cerrar su sesión.' , 'warning');
        this.enrutador.navigate(['/login']);
        return false;
      }
      else {
        return true;
      }
    } else {
      this.enrutador.navigate(['/login']);
      return false;
    }
  }
}
