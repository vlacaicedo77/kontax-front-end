import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

// Importamos las máscaras de validacion
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-verificar-email-externo',
  templateUrl: './verificar-email-externo.component.html',
  styleUrls: []
})
export class VerificarEmailExternoComponent implements OnInit {

  constructor(
    public _servicioUsuario: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.validarEmail(this.route.snapshot.queryParams.idUsuario, this.route.snapshot.queryParams.token);
  }

  validarEmail(idUsuario : number, token : string)
  {
    if(idUsuario == null || token == null)
    {
      Swal.fire('Error', 'La URL no tiene el formato correcto' , 'error');
    }
    else
    {
      Swal.fire({
        title: 'Espere...',
        text: 'Se está realizando la validación',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
        Swal.showLoading();
        }
      });
        this._servicioUsuario.validarEmailExterno(idUsuario, token)
          .subscribe((resp: any) => {
            if ( resp.estado === 'OK') {
              Swal.fire('Éxito', 'Se ha verificado exitosamente su cuenta de correo', 'success');
            }
            else {
             Swal.fire('Error', 'No se pudo realizar la verificación. ' + resp.mensaje , 'error');
           }
           
         } );
      }
      this.router.navigate(['inicio']);
    }
  }


