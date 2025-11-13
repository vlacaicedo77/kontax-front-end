import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { RolService } from '../../servicios/rol/rol.service';
import { Rol } from '../../modelos/rol.modelo';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styles: [
  ]
})
export class RolesComponent implements OnInit {

  listaRoles?: Rol[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioRoles: RolService
  ) { }

  ngOnInit(): void {
    this.obtenerRolesUsuarios();
    this.servicioScript.inicializarScripts();
  }

  // Método que consulta los roles de usuario
  obtenerRolesUsuarios() {
    this.servicioRoles.obtenerRoles({}).subscribe(
      ( roles: Rol[]) => this.listaRoles = roles );
  }

}
