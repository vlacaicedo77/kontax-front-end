import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Importación de modelos.
import { DelegacionInterno } from 'src/app/modelos/delegacion-interno.modelo';

// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

@Component({
  selector: 'app-gestionar-delegaciones',
  templateUrl: './gestionar-delegaciones.component.html',
  styleUrls: []
})
export class GestionarDelegacionesComponent implements OnInit {

  listaDelegaciones = [];
  listaDelegacionesOriginal = [];
  
  constructor(    
    private _usuarioService: UsuarioService,
    private router: Router) { }

  ngOnInit(): void {
    this.cargarDelegacionesUsuario();
  }

  // Método que obtiene los funcionarios activos de una oficina
  cargarDelegacionesUsuario()
  {
    this._usuarioService.consultarDelegacionInternoFiltros({
      idUsuarioPrincipal: parseInt(localStorage.getItem('idUsuario'))
    }).subscribe( (resp:any) =>{
          if (resp.estado === 'OK') 
          {
            this.listaDelegacionesOriginal = resp.resultado;
            this.listaDelegaciones = this.listaDelegacionesOriginal;
          }
          else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
    });
  }

    //Método para realizar el registro de la delegación del rol
    anularDelegacion(idDelegacion : number)
    {
      let delegacion = new DelegacionInterno();
      delegacion.idDelegacion = idDelegacion;
      delegacion.fechaFin = new Date();
      delegacion.estado = 2; //Estado Anulado

      //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de anular la delegación?',
      text: "Esta acción no se puede reversar",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.value) {
          
          Swal.fire({
            title: 'Espere...',
            text: 'Sus datos se están registrando',
            confirmButtonText: '',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        this._usuarioService.actualizarDelegacionInterno(delegacion)
        .subscribe( (resp: any) => {
          if ( resp.estado === 'OK') {
            Swal.fire('Éxito', 'La operación ha sido ejecutada exitosamente', 'success');
            this.router.navigate(['inicio']);
          }
          else {
            Swal.fire('Error', resp.mensaje , 'error');
          }
        });
        }
        else
        Swal.close();
      })
    }

  //Función para filtrar Delegaciones por el número de identificación del delegado
  filtrarDelegacionesDelegado(event: KeyboardEvent) {
    let elemento = event.target as HTMLInputElement;
    let cadena = elemento.value;
    if (typeof cadena === 'string') 
    {
      this.listaDelegaciones = this.listaDelegacionesOriginal.filter(delegacion => delegacion.identificacion_delegado.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
    }
  }

  //Funcion para filtrar Delegaciones por su estado
  filtrarDelegacionesEstado(filtro : string)
  {
     switch(filtro)
     {
       case "0"://todas
        this.listaDelegaciones = this.listaDelegacionesOriginal;
       break;
       case "1"://Aeptadas
        this.listaDelegaciones = this.listaDelegacionesOriginal.filter(  delegacion  => delegacion.estado == 1);
       break;
       case "2"://Anuladas
        this.listaDelegaciones = this.listaDelegacionesOriginal.filter(  delegacion  => delegacion.estado == 2);
       break;
       default:
        Swal.fire('Error', "Filtro inválido" , 'error');
        this.listaDelegaciones = this.listaDelegacionesOriginal;
       break;
     }
  }
}
