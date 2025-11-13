import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioExterno } from 'src/app/modelos/usuario-externo.modelo';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import Swal from 'sweetalert2';
import { CrearUsuarioExternoService } from '../crear-usuario-externo/servicios/crear-usuario-externo.service';

@Component({
  selector: 'app-usuarios-externos',
  templateUrl: './usuarios-externos.component.html',
  styleUrls: ['./usuarios-externos.component.css']
})
export class UsuariosExternosComponent implements OnInit {

  formularioBusqueda: FormGroup;
  usuariosExternos: UsuarioExterno[] = [];

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuarioExterno: UsuarioService,
    private servicioCrearUsuarioExterno: CrearUsuarioExternoService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.servicioScript.inicializarScripts();
  }

  /**
   * Método que inicializa el formulario de búsqueda
   */
  inicializarFormulario(){
    this.formularioBusqueda = new FormGroup({
      ci: new FormControl(null, Validators.required)
    });
  }

  buscarUsuariosExternos() {
    this.usuariosExternos = [];
    if ( this.formularioBusqueda.value.ci === null || this.formularioBusqueda.value.ci?.length === 0 ) {
      Swal.fire('Error', 'Ingrese el número de cédula o RUC', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioUsuarioExterno.filtrarUsuariosExternos({
      numeroIdentificacion: this.formularioBusqueda.value.ci
    }).subscribe( (usuarios: UsuarioExterno[]) => {
      this.usuariosExternos = usuarios;
      Swal.close();
    });
  }

  /**
   * Abre el panel para registrar un nuevo usuario externo
   */
  agregarUsuario(){
    this.servicioCrearUsuarioExterno.abrir();
  }

}
