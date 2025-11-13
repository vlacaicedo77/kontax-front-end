import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { RolService } from 'src/app/servicios/rol/rol.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-asignar-roles-internos',
  templateUrl: './asignar-roles-internos.component.html',
  styleUrls: []
})
export class AsignarRolesInternosComponent implements OnInit {

  // Objeto que maneja el formulario.
  formularioPrincipal: FormGroup;
  formularioBusqueda: FormGroup;
  listaRoles: any;
  rolesPreviosUsuario: any;
  rolesUsuario:number[];
  encriptar: any;
  usuarioReporte: any;
  formularioVisible = false;
  
  constructor(
    private _rolService: RolService,
    private _usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormularioPrincipal();
    this.inicializarFormularioBusqueda();
    this.cargarRolesInternos();
  }

   // Inicializar formulario principal.
   inicializarFormularioPrincipal() {
    this.formularioPrincipal = new FormGroup({
    });
  }
  // Inicializar formulario de búsqueda.
  inicializarFormularioBusqueda() {
    this.formularioBusqueda = new FormGroup({
      inputIdentificacionUsuarioInterno: new FormControl(null,[Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(mascaras.MASK_CEDULA)])
    });
  }

  // Método que obtiene el catálogo de roles internos.
  cargarRolesInternos() {
    this._rolService.obtenerRoles({idTiposRoles:1,estado:1})//Roles Internos = 2, estado activo = 1.
    .subscribe( respuesta => this.listaRoles = respuesta );
  }
  // Método que obtiene los datos de tipos de actividad
  cargarRolesUsuario(idUsuario: number){
    this._usuarioService.consultarRolesUsuarioInternoId(idUsuario)
    .subscribe( (resp:any) =>{
      if (resp.estado === 'OK') 
      {
          this.rolesPreviosUsuario = resp.resultado;
          for (let rolUsuario of this.rolesPreviosUsuario) 
          {
            if(rolUsuario.idRoles != 4)//El rol de usuario interno genérico no se presenta, ya que no puede ser eliminado
            {
              var element = <HTMLInputElement> document.getElementById("inputCheckRol"+rolUsuario.idRoles);
              if(element == null)
                console.log('no se pudo encontrar el check del rol '+rolUsuario.idRoles);
              else  
              element.checked = true;
            }
          }
      }
      else {
       Swal.fire('Error', resp.mensaje , 'error');
     }
   } );
  }

  // Método que obtiene los datos de tipos de actividad
  buscarUsuarioInterno() {
    let formularioInvalido = false;
    let mensaje = "El formulario de búsqueda contiene errores<ul></br>";
  
     //Validaciones de lógica de negocio.
     if ( this.formularioBusqueda.invalid || formularioInvalido)
     {
     mensaje += "</ul>"
     Swal.fire('Error', mensaje, 'error');
     return;
    }
  
    let numeroIdentificacionUsuario:string = this.formularioBusqueda.value.inputIdentificacionUsuarioInterno;
  
    Swal.fire({
      title: 'Espere...',
      text: 'Se está ejecutando la búsqueda',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });
  this._usuarioService.consultarReporteUsuarioInternoFiltros({numeroIdentificacion:numeroIdentificacionUsuario})
  .subscribe((resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado[0] != null && typeof( resp.resultado[0]) != 'undefined')
        {
          //Cargar resumen
          this.usuarioReporte = resp.resultado[0];
          this.cargarRolesUsuario(this.usuarioReporte.id_usuarios_internos);
          this.formularioVisible = true;
          Swal.fire('Éxito', 'Se han obtenidos los datos con éxito', 'success');
        }
        else
        {
          this.formularioVisible = false;
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');
        }
      }
      else {
       Swal.fire('Error', resp.mensaje , 'error');
     }
   } );
  }

  asginarRolesUsuarioInterno()
  {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";
  
    if ( this.formularioPrincipal.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    try
    {

      //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de cambiar la asinación de roles?',
      text: "No se podrán reversar los cambios. Los permisos de usuario genérico interno no serán eliminados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
      
        this.rolesUsuario = new Array();
        for (let rolUsuario of this.listaRoles) 
        {
          if (rolUsuario.idRoles !== 4)//El rol usuario genérico interno, con id 4, no se incluye en el formulario.
          {
            var element = <HTMLInputElement> document.getElementById("inputCheckRol"+rolUsuario.idRoles);
            if(element.checked)
            this.rolesUsuario.push(parseInt(element.value));
          }
        }
    
        Swal.fire({
          title: 'Espere...',
          text: 'Sus datos se están registrando',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
      });
    
        this.usuarioReporte.id_usuarios_internos
          this._usuarioService.asignarRolesUsuarioInterno(this.usuarioReporte.id_usuarios_internos,this.rolesUsuario).subscribe(
          (resp1: any) => {
    
              if ( resp1.estado === 'OK') {
                Swal.fire('Éxito', 'Los roles han sido actualizados exitosamente', 'success');
                this.router.navigate(['inicio']);
              }
              else {
              Swal.fire('Error', resp1.mensaje , 'error');
            }
    
          });
        }
        else
        Swal.close();
      });

    }
    catch (error) 
    {
      Swal.fire('Error', "Ha ocurrido un error inesperado." , 'error');
      console.error(error);
    }
  }

}
