import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Importación de modelos.
import { DelegacionInterno } from 'src/app/modelos/delegacion-interno.modelo';

// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-delegar-roles-internos',
  templateUrl: './delegar-roles-internos.component.html',
  styleUrls: []
})
export class DelegarRolesInternosComponent implements OnInit {

  listaFuncionarios = [];
  
  // Objeto que maneja el formulario.
  formulario: FormGroup;

  constructor(    
    private _usuarioService: UsuarioService,
    private router: Router) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarFuncionariosOficina();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputFuncionario: new FormControl(null, [Validators.required]),
      inputFechaInicio: new FormControl(null, [Validators.required]),
      inputFechaFin: new FormControl(null, [Validators.required]),
      inputObservaciones: new FormControl(null, [Validators.required])
    });
  }

  // Método que obtiene los funcionarios activos de una oficina
  cargarFuncionariosOficina()
  {
    this._usuarioService.consultarReporteUsuarioInternoFiltros({
      idOficina: parseInt(localStorage.getItem('oficina')),
      estado : 2 //estado de usuario Activo
    }).subscribe( (resp:any) =>{
          if (resp.estado === 'OK') 
          {
            this.listaFuncionarios = resp.resultado;
            //Eliminamos al usuario logeado de la lista, no tiene sentido que se delege a si mismo
            this.listaFuncionarios.forEach((funcionario,index)=>{
              if(funcionario.id_usuarios_internos==parseInt(localStorage.getItem('idUsuario'))) this.listaFuncionarios.splice(index,1);
           });
          }
          else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
    });
  }

    //Método para realizar el registro de la delegación del rol
    registrarDelegacion()
    {
      let formularioInvalido = false;
      let mensaje = "El formulario de delegación contiene errores<ul></br>";
      let fechaInicio = new Date(this.formulario.value.inputFechaInicio);
      let fechaFin = new Date(this.formulario.value.inputFechaFin);
      let fechaActual = new Date();
      let fechaMaximoAnterioridad = new Date();
      let fechaMaximoDelegacion = new Date(this.formulario.value.inputFechaInicio);
      fechaActual.setHours(0,0,0,0); //Se encera la hora.
      fechaInicio.setDate(fechaInicio.getDate() + 1); //Pasar la fecha tomada del datepicker a la zona horaria de Ecuador.
      fechaInicio.setHours(0,0,0,0); //Se encera la hora
      fechaFin.setDate(fechaFin.getDate() + 1); //Pasar la fecha tomada del datepicker a la zona horaria de Ecuador.
      fechaFin.setHours(0,0,0,0); //Se encera la hora.
      fechaMaximoAnterioridad.setDate(fechaMaximoAnterioridad.getDate() + 30); //Un mes estándar
      fechaMaximoAnterioridad.setHours(0,0,0,0); //Se encera la hora.
      fechaMaximoDelegacion.setDate(fechaMaximoDelegacion.getDate() + 30); //Un mes estándar
      fechaMaximoDelegacion.setHours(0,0,0,0); //Se encera la hora.

      //Validaciones de lógica de negocio.
      if(fechaMaximoDelegacion.getTime() < fechaFin.getTime()){
        formularioInvalido = true;
        mensaje += "<li>La delegación debe durar máximo 30 días</li>";
      }
      if(fechaInicio.getTime() >= fechaFin.getTime()){
        formularioInvalido = true;
        mensaje += "<li>La fecha de inicio debe ser anterior a la fecha fin</li>";
      }
      if(fechaInicio.getTime() > fechaMaximoAnterioridad.getTime()){
        formularioInvalido = true;
        mensaje += "<li>La delegación puede generarse hasta con un mes de anterioridad</li>";
      }
      if(fechaInicio.getTime() < fechaActual.getTime()){
        formularioInvalido = true;
        mensaje += "<li>La fecha de inicio no puede ser anterior a hoy</li>";
      }

      if ( this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
      }

      let delegacion = new DelegacionInterno();
      delegacion.idUsuarioPrincipal = parseInt(localStorage.getItem('idUsuario'));
      delegacion.idUsuarioDelegado = this.formulario.value.inputFuncionario;
      delegacion.fechaInicio = this.formulario.value.inputFechaInicio;
      delegacion.fechaFin = this.formulario.value.inputFechaFin;
      delegacion.observaciones = this.formulario.value.inputObservaciones;

      //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de generar la delegación?',
      text: "Una vez enviada la delegación no podrá modificarla",
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

        this._usuarioService.crearDelegacionInterno(delegacion)
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
  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }
}
