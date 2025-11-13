import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from './autenticacion/autenticacion.service';
import { UsuarioService } from './usuario/usuario.service';
import { MenuService } from './menu/menu.service';
import { Menu } from '../modelos/menu.modelo';


@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivateChild {

  constructor(
    private enrutador: Router,
    private servicioUsuario: UsuarioService,
    private servicioAutenticacion: AutenticacionService,
    private servicioMenu: MenuService
  ) { }
  
  /**
   * Método para verificar que tenga los menús correctos
   * @param route 
   * @param state 
   * @returns 
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if ( this.servicioUsuario.sesionIniciada() ) {
      if ( this.servicioAutenticacion.tokenExpirado() ) {
        this.servicioAutenticacion.limpiarSesion();
        Swal.fire('Alerta', 'Se encontró una sesión expirada sin cerrar. Al salir del sistema no olvide cerrar su sesión.' , 'warning');
        this.enrutador.navigate(['/login']);
        return false;
      } else {
        // Buscamos el menú en el localStorage
        console.log('Ruta hija: ', route.routeConfig.path  );
        //if (this.buscarMenu(route.routeConfig.path, this.servicioMenu.consultaMenu()) ) {
          return true;
        //} else {
        //  Swal.fire('Notificación', 'No tiene permisos para acceder a esta opción', 'warning');
        //  return false;
        //}
      }
    } else {
      console.log('No ha iniciado sesión.');
      this.enrutador.navigate(['/login']);
      return false;
    }
  }

  /**
   * Busca la ruta en el menú
   * @param ruta 
   */
  buscarMenu(ruta: string, listaMenus: Menu[]): boolean{
    let respuesta: boolean = false;
    if ( ruta === 'inicio' ){
      respuesta = true;
    }
    for (let i =0 ; i < listaMenus.length; i++ ){
      let itemMenu: Menu = listaMenus[i];
      if (itemMenu?.ruta === ruta) {
        respuesta = true;
        break;
      }
      if ( itemMenu?.hijos?.length > 0 ) {
        if (this.buscarMenu(ruta, itemMenu.hijos)) {
          respuesta = true;
          break;
        }
      }
    }
    return respuesta;
  }

}
