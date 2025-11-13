import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Rol } from '../../modelos/rol.modelo';
import { TipoRol } from '../../modelos/tipo-rol.modelo';
import { TipoRolService } from '../../servicios/tipo-rol/tipo-rol.service';
import Swal from 'sweetalert2';
import { RolService } from '../../servicios/rol/rol.service';

@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
  styles: [
  ]
})
export class RolComponent implements OnInit {

  modo?: string;
  formulario?: FormGroup;
  rol?: Rol;
  listaTiposRoles: TipoRol[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioRutaActiva: ActivatedRoute,
    private servicioTipoRol: TipoRolService,
    private servicioRol: RolService,
    private servicioEnrutador: Router
  ) { }

  ngOnInit(): void {
    this.servicioRutaActiva.params.subscribe( (parametros: any) => {
      if ( parametros?.id === 'nuevo') {
        this.modo = 'nuevo';
        this.obtenerTiposRoles();
      } else {
        this.modo = 'consulta';
        this.obtenerRol(parametros?.id);
      }
    });
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
  }

  // Método que inicializa un formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      nombre_rol: new FormControl(null, Validators.required),
      id_tipos_roles: new FormControl(null, Validators.required),
      descripcion_rol: new FormControl(null, Validators.required),
      codigo: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(16)])
    });
  }

  // Método que registra el nuevo rol de usuario
  registrarRol(){
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando el rol de usuario.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const rol = new Rol();
    rol.nombreRol = this.formulario.value.nombre_rol;
    rol.idTiposRoles = this.formulario.value.id_tipos_roles;
    rol.descripcionRol = this.formulario.value.descripcion_rol;
    rol.codigo = this.formulario.value.codigo;
    this.servicioRol.crearRol(rol).subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se creó correctamente el rol de usuario.',
        'success'
      ).then(() => {
        this.servicioEnrutador.navigate(['roles']);
      });
    });
  }

  // Método que permite obtener los tipos de roles
  obtenerTiposRoles(){
    this.servicioTipoRol.obtenerTiposRoles({}).subscribe( (tiposRoles: TipoRol []) => this.listaTiposRoles = tiposRoles );
  }

  // Método que permite obtener un rol de usuario
  obtenerRol(idRoles: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioRol.obtenerRoles({
      idRoles
    }).subscribe( (roles: Rol[]) => {
      if (roles.length > 0) {
        this.rol = roles[0];
      }
      Swal.close();
    });
  }

}