import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-actualizar-perfil-usuario-externo',
  templateUrl: './actualizar-perfil-usuario-externo.component.html',
  styleUrls: []
})
export class ActualizarPerfilUsuarioExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: UntypedFormGroup;
  idUsuario : number;
  identificacion : string;
  tipoIdentificacion: string;
  ruc: boolean = false;
  formularioVisible= true;
  usuario : Usuario = new Usuario();

  constructor(
    public _servicioUsuario: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.idUsuario = parseInt(localStorage.getItem('idUsuario'));
    this.buscarUsuario();
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new UntypedFormGroup({
      inputRazonSocial: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputNombreComercial: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputIdentificacionRepresentante: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_NUMERICO)]),
      inputNombresRepresentante: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputApellidosRepresentante: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)])
    });
  }

  actualizarUsuario()
  {
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    Swal.fire({
      title: 'Desea actualizar los datos de su perfil?',
      text: "Verifique la información antes de realizar la actualización.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        
        /*Swal.fire({
          title: 'Espere...',
          text: 'Sus datos se están registrando',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
      });*/

      let usuario = new Usuario();

      usuario.idUsuario = this.idUsuario;

      //Campos exclusivos del tipo de dato RUC
      if(this.usuario.tipoIdentificacion != 1)
      {
        usuario.razonSocial = this.formulario.value.inputRazonSocial;
        usuario.identificacionRepresentanteLegal =  this.formulario.value.inputIdentificacionRepresentante;
        usuario.nombresRepresentanteLegal = this.formulario.value.inputNombresRepresentante
        usuario.apellidosRepresentanteLegal = this.formulario.value.inputApellidosRepresentante;
        usuario.nombreComercial = this.formulario.value.inputNombreComercial;
      }

      this._servicioUsuario.actualizarUsuarioExterno(usuario)
        .subscribe((resp: any) => {
          if (resp.estado === 'OK') {
            Swal.fire('Éxito', 'Su perfil fue actualizado correctamente.', 'success');
            this.formulario.reset();
            this.router.navigate(['inicio']);
          }
          else {
           Swal.fire('Error', resp.mensaje , 'error');
         }
       } );
      }
      else
      Swal.close();
    }) 
  }
  
  buscarUsuario()
  {
    this._servicioUsuario.consultarUsuarioExternoId(this.idUsuario)
    .subscribe( (resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado.length == 1)
        {
          this.formularioVisible = true;

          //Cargar resumen
          this.usuario = new Usuario();
          this.usuario.idUsuario = resp.resultado[0].idUsuarioExterno;
          this.usuario.nombres = resp.resultado[0].nombres;
          this.usuario.apellidos = resp.resultado[0].apellidos;
          this.usuario.tipoIdentificacion = resp.resultado[0].tipoIdentificacion;
          this.usuario.numeroIdentificacion = resp.resultado[0].numeroIdentificacion;
          this.usuario.email = resp.resultado[0].email; 
          this.usuario.razonSocial = resp.resultado[0].razonSocial; 
          this.usuario.nombreComercial = resp.resultado[0].nombreComercial; 
          this.usuario.identificacionRepresentanteLegal = resp.resultado[0].identificacionRepresentanteLegal; 
          this.usuario.nombresRepresentanteLegal = resp.resultado[0].nombresRepresentanteLegal; 
          this.usuario.apellidosRepresentanteLegal = resp.resultado[0].apellidosRepresentanteLegal;

          //Cargar los datos del usuario en el formulario
          this.formulario.controls.inputRazonSocial.setValue(this.usuario.razonSocial);
          this.formulario.controls.inputNombreComercial.setValue(this.usuario.nombreComercial);
          this.formulario.controls.inputIdentificacionRepresentante.setValue(this.usuario.identificacionRepresentanteLegal);
          this.formulario.controls.inputNombresRepresentante.setValue(this.usuario.nombresRepresentanteLegal);
          this.formulario.controls.inputApellidosRepresentante.setValue(this.usuario.apellidosRepresentanteLegal);

          switch(this.usuario.tipoIdentificacion)
          {
            case 1:
              this.ruc = false;
              this.tipoIdentificacion = "Cédula";
              this.cambiarValidacionesIdentificacion('cedula');
              break;
            case 2:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Natural";
              this.cambiarValidacionesIdentificacion('ruc');
              break;
            case 3:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Jurídica Privada";
              this.cambiarValidacionesIdentificacion('ruc');
              break;
            case 4:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Jurídica Pública";
              this.cambiarValidacionesIdentificacion('ruc');
              break;
            default:
              Swal.fire('Error', 'El tipo de identificación del usuario no es válido' , 'error');
              this.formularioVisible = false;
            break;
          }
        }
        else
        {
          this.formularioVisible = false;
          Swal.fire('Error', 'No se han podido encontrar los datos del usuario' , 'error');
        } 
      }
      else 
      {
      Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

  //Función para cambiar los validadores de los campos del formulario según el tipo de identificación
  cambiarValidacionesIdentificacion(tipoIdentificacion :string)
  {
    if(tipoIdentificacion == "cedula")
    {
      this.formulario.controls.inputRazonSocial.clearValidators();
      this.formulario.controls.inputRazonSocial.updateValueAndValidity();
      this.formulario.controls.inputNombreComercial.clearValidators();
      this.formulario.controls.inputNombreComercial.updateValueAndValidity();
      this.formulario.controls.inputIdentificacionRepresentante.clearValidators();
      this.formulario.controls.inputIdentificacionRepresentante.updateValueAndValidity();
      this.formulario.controls.inputNombresRepresentante.clearValidators();
      this.formulario.controls.inputNombresRepresentante.updateValueAndValidity();
      this.formulario.controls.inputApellidosRepresentante.clearValidators();
      this.formulario.controls.inputApellidosRepresentante.updateValueAndValidity();
    }
    else
    {
      this.formulario.controls.inputRazonSocial.setValidators([Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputRazonSocial.updateValueAndValidity();
      this.formulario.controls.inputNombreComercial.setValidators([Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputNombreComercial.updateValueAndValidity();
      this.formulario.controls.inputIdentificacionRepresentante.setValidators([Validators.required, Validators.pattern(mascaras.MASK_NUMERICO)]);
      this.formulario.controls.inputIdentificacionRepresentante.updateValueAndValidity();
      this.formulario.controls.inputNombresRepresentante.setValidators([Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputNombresRepresentante.updateValueAndValidity();
      this.formulario.controls.inputApellidosRepresentante.setValidators([Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputApellidosRepresentante.updateValueAndValidity();
    }
  }
}


