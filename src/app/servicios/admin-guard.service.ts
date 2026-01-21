import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { AutenticacionService } from './autenticacion/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivateChild {

  constructor(
    private enrutador: Router,
    private servicioAutenticacion: AutenticacionService
  ) { }
  
  /**
   * Método para verificar que tenga los menús correctos
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.servicioAutenticacion.sesionIniciada()) {
      if (this.servicioAutenticacion.tokenExpirado()) {
        // El interceptor manejará el error 401 cuando se haga una petición
        // Aquí solo redirigimos sin mostrar alerta (el interceptor la mostrará)
        this.servicioAutenticacion.limpiarSesion();
        this.enrutador.navigate(['/home']);
        return false;
      }
      return true;
    } else {
      console.log('No ha iniciado sesión.');
      this.enrutador.navigate(['/home']);
      return false;
    }
  }
}