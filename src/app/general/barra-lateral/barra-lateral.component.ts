import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Importación de servicios.
import { MenuService } from 'src/app/servicios/menu/menu.service';

@Component({
  selector: 'app-barra-lateral',
  templateUrl: './barra-lateral.component.html',
  styles: []
})
export class BarraLateralComponent implements OnInit {

  //Objetos para gestionar catálogos
  public menu = [];

  public rutaTerminos = `${environment.URL_DOCUMENTOS_PUBLICOS}Términos y Condiciones.pdf`;
  public rutaManual = `${environment.URL_DOCUMENTOS_PUBLICOS}SIFAE2.0_Manual_usuario.pdf`;;

  constructor(
    private _menuService: MenuService,    
    private rutas: Router,
    private autenticacionServicio: AutenticacionService) 
  {}

  ngOnInit() {
    this.buscarMenu();
  }

  // Método que obtiene los datos del menu
buscarMenu() {
  this.menu = this._menuService.consultaMenu();
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

}
