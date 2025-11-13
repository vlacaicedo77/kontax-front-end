import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { RucContribuyente } from '../../modelos/ruc-contribuyente.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-cambiar-cedula-ruc-externo',
  templateUrl: './cambiar-cedula-ruc-externo.component.html',
  styleUrls: []
})
export class CambiarCedulaRucExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  regExpRUC : RegExp = mascaras.MASK_RUC;
  idUsuario : number;
  identificacion : string;
  ruc : string;

  constructor(
    public _servicioUsuario: UsuarioService,
    public _servicioDinardap:DinardapService,
    private router: Router
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.idUsuario = parseInt(localStorage.getItem('idUsuario'));
    this.identificacion = localStorage.getItem('identificacion');

    if(this.identificacion.trim().length != 10)
    {
      Swal.fire('Error', 'Para realizar el cambio la identificación del usuario debe ser una cédula válida. Su identificación es: '+ this.identificacion +'.' , 'warning');
      this.router.navigate(['inicio']);
    }
    else
    {
      this.ruc = this.identificacion + '001';
      this.buscarRUC(this.ruc);
    }
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      razon_social: new FormControl(null, [Validators.required]),
      nombre_comercial: new FormControl(null, [Validators.required]),
      identificacion_representante: new FormControl(null, [Validators.required]),
      nombre_representante: new FormControl(null, [Validators.required]),
      apellido_representante: new FormControl(null, [Validators.required])
    });
  }

  actualizarUsuario()
  {
    //Se agregan tres dígitos 001 para el cambio de la cédula a un RUC de persona natural y se valida el mismo
    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";

    //Validaciones de lógica de negocio.
    if(!this.regExpRUC.test(this.ruc)){
      formularioInvalido = true;
      mensaje += "<li>El RUC resultante ("+ this.ruc +") no tiene un formato válido</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('Error', mensaje, 'error');
    return;
    }
    Swal.fire({
      title: 'Desea actualizar la identificación de su usuario a RUC con la información provista?',
      text: "Se pasará la identificación a un RUC de persona natural agregando 001 a su cédula. Se le otorgarán permisos de usuario externo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar',
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

      let usuario = new Usuario();

      usuario.idUsuario = this.idUsuario;
      usuario.numeroIdentificacion = this.ruc;
      usuario.tipoIdentificacion = 2; //De una cédula solamente se puede pasar a un RUC de persona natural (código 2)
      usuario.razonSocial = this.formulario.value.razon_social;
      usuario.identificacionRepresentanteLegal =  this.formulario.value.identificacion_representante;
      usuario.nombresRepresentanteLegal = this.formulario.value.nombre_representante;
      usuario.apellidosRepresentanteLegal = this.formulario.value.apellido_representante;
      usuario.nombreComercial = this.formulario.value.nombre_comercial;

      this._servicioUsuario.actualizarUsuarioExterno(usuario)
        .subscribe((resp: any) => {
          if (resp.estado === 'OK') {
            //Se procede a asignar el rol de usuario externo genérico, código 1
            //this._servicioUsuario.asignarRolUsuarioExterno(this.idUsuario, 1)
            //.subscribe((resp: any) => {
             // if (resp.estado === 'OK') {
                Swal.fire('Éxito', 'Su cuenta fue actualizada correctamente.', 'success');
                this.formulario.reset();
                this.router.navigate(['inicio']);
              /*}
              else {
               Swal.fire('Error', resp.mensaje , 'error');
             }
           } );*/
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

//Función que busca los datos de un RUC con el WS de la DINARDAP
buscarRUC(identificacion : string)
{
  if(!this.regExpRUC.test(identificacion)){
    Swal.fire('Error', "El RUC no tiene un formato válido", 'error');
    return;
  }
  else
  {
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información del SRI',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    
    this._servicioDinardap.obtenerRucContribuyente(identificacion)
      .subscribe( (respuesta: RucContribuyente[]) => {
        console.log('Datos', respuesta);
        if ( respuesta == null) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'No se ha podido extraer información del SRI, por favor ingrese manualmente sus datos.',
            showConfirmButton: true
          });
        }
        else
        {
          /*const datoDemografico: DatoDemografico = respuesta[0];
          let nombres: string[] = datoDemografico.nombre.split(' ').map( (item: string) => {
            let cadena = item.toLowerCase();
            return cadena.charAt(0).toUpperCase() + cadena.slice(1);
          });
          const nombresCompletos = nombres.slice(2, nombres.length);
          console.log('Nombres completos', nombresCompletos);
          const apellidosCompletos =  nombres.slice(0, 2);
          console.log('Apellidos completos', apellidosCompletos);
          this.formularioUsuario.controls.nombres.setValue(nombresCompletos.join(' '));
          this.formularioUsuario.controls.apellidos.setValue(apellidosCompletos.join(' '));*/
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Se han extraído exitosamente los datos de usuario desde el SRI.',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
  }
}

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }
}


