import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudReareteo } from 'src/app/modelos/solicitud-reareteo.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { Bovino } from 'src/app/modelos/bovino.modelo';

// Importación de servicios.
import { SolicitudReareteoService } from 'src/app/servicios/solicitud-reareteo/solicitud-reareteo.service';
import { UsuarioService} from 'src/app/servicios/usuario/usuario.service';
import { IdentificadorBovinoService } from 'src/app/servicios/identificador-bovino/identificador-bovino.service';
import { BovinoService } from 'src/app/servicios/bovino/bovino.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';


@Component({
  selector: 'app-solicitud-reareteo',
  templateUrl: './solicitud-reareteo.component.html',
  styleUrls: []
})
export class SolicitudReareteoComponent implements OnInit {

  public listaIdentificadores = [];
  public listaIdentificadoresOrg = [];
  public resultadoGanaderoVisible = false;
  public formularioVisible = false;
  public ganadero:Usuario;
  public bovino:Bovino;
  public idIdentificadorSeleccionado:number;
  public listaVacia = false;

    // Objeto que maneja el formulario.
    formulario: FormGroup;
    formularioBusquedaGanadero: FormGroup;
    formularioBusquedaBovino: FormGroup;

  constructor(
    private scriptServicio: ScriptsService,
    private _solicitudService: SolicitudReareteoService,
    private _usuarioService: UsuarioService,
    private _identificadorService: IdentificadorBovinoService,
    private _bovinoService: BovinoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.inicializarFormularioBusquedaGanadero();
    this.inicializarFormularioBusquedaBovino();
  }

// Inicializar formulario.
inicializarFormulario() {
  this.formulario = new FormGroup({
    inputObservaciones: new FormControl(null, [Validators.required])
  });
}

// Inicializar formulario de búsqueda.
inicializarFormularioBusquedaGanadero() {
  this.formularioBusquedaGanadero = new FormGroup({
    inputIdentificacionGanadero: new FormControl(null, [Validators.required])
  });
}

// Inicializar formulario de búsqueda.
inicializarFormularioBusquedaBovino() {
  this.formularioBusquedaBovino = new FormGroup({
    inputIdentificador: new FormControl(null, [Validators.required])
  });
}

//Método que permite registrar una solicitud de reareteo
registrarSolicitudReareteo(){
  let formularioInvalido = false;
  let mensaje = "El formulario de solicitud contiene errores<ul></br>";
  
  //Validaciones de lógica de negocio.
  if(this.idIdentificadorSeleccionado == null){
    formularioInvalido = true;
    mensaje += "<li>No se ha podido obtener la información del identificador a rearetear. </li>";
  }

  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
  let solicitud = new SolicitudReareteo();
  
  solicitud.idGanaderoSolicitante = this.ganadero.idUsuario;
  solicitud.idUsuarioCreador = parseInt(localStorage.getItem('idUsuario'));
  solicitud.idProveedor =   parseInt(localStorage.getItem('idUsuario'));
  solicitud.idIdentificador = this.idIdentificadorSeleccionado;
  solicitud.observaciones = this.formulario.value.inputObservaciones;

  //Mensaje de confirmación
  Swal.fire({
    title: 'Está seguro de enviar la solicitud?',
    text: "Una vez enviada la solicitud no podrá ser eliminada",
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
      this._solicitudService.registrarSolicitud(solicitud)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'La solicitud ha sido registrada exitosamente', 'success');
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

// Método que obtiene los datos de los identificadores activos del ganadero.
cargarIdentificadoresActivos(idUsuario: number) {
  this._identificadorService.obtenerIdentificadoresActivosPorUsuario(idUsuario)
  .subscribe(respuesta => {
        this.listaIdentificadores = respuesta.resultado;
        this.listaIdentificadoresOrg = this.listaIdentificadores;
        if(this.listaIdentificadores.length > 0)
        {
          Swal.fire('Éxito', 'La búsqueda se ha ejecutado exitosamente', 'success');
        }
        else
        {
          Swal.fire('Advertencia', 'El ganadero no tiene identificadores activos que puedan ser reareteados', 'warning');
        }
    }
    );
}

// Método que permite buscar un Ganadero.
buscarGanadero() {
  let formularioInvalido = false;
  let mensaje = "El formulario de búsqueda contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   if ( this.formularioBusquedaGanadero.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  let numeroIdentificacion = this.formularioBusquedaGanadero.value.inputIdentificacionGanadero;
  let idEstado = 2;//Solamente usuarios activos
  let idRol = 2;//Solamente ganaderos

  Swal.fire({
    title: 'Espere...',
    text: 'Se está ejecutando la búsqueda',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._usuarioService.consultarUsuarioExtFiltros(null,null, null, numeroIdentificacion, idEstado, idRol) 
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      if(resp.resultado.length == 1)
      {
        //Cargar resumen
        this.ganadero = new Usuario();
        this.ganadero.idUsuario = resp.resultado[0].id_usuarios_externos;
        this.ganadero.nombres = resp.resultado[0].nombres;
        this.ganadero.apellidos = resp.resultado[0].apellidos;
        this.ganadero.numeroIdentificacion = resp.resultado[0].numero_identificacion;
        this.cargarIdentificadoresActivos(resp.resultado[0].id_usuarios_externos);
        
        this.resultadoGanaderoVisible = true;
                
      }
      else
      {
        this.formularioVisible = false;
        this.resultadoGanaderoVisible = false;
        this.ganadero = new Usuario();
        this.ganadero.idUsuario = null;

        if(resp.resultado.length >1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un resultado' , 'error');
        else
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');
      }
      
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}

// Método que permite buscar un Bovino.
buscarBovino() {
  let formularioInvalido = false;
  let mensaje = "El formulario de búsqueda contiene errores<ul></br>";

  if(this.listaVacia){
    formularioInvalido = true;
    mensaje += "<li>Debe seleccionar el identificador a que desea rearetear</li>";
  }

   //Validaciones de lógica de negocio.
   if ( this.formularioBusquedaBovino.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  this.idIdentificadorSeleccionado = this.formularioBusquedaBovino.value.inputIdentificador;
 
  Swal.fire({
    title: 'Espere...',
    text: 'Se está ejecutando la búsqueda',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._bovinoService.obtenerBovinosPorFiltroResp({idIdentificador: this.formularioBusquedaBovino.value.inputIdentificador}) 
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      if(resp.resultado.length == 1)
      {
        //Cargar bovino
        this.bovino = resp.resultado[0] as Bovino;
        this.formularioVisible = true;
        Swal.fire('Éxito', 'La búsqueda se ha ejecutado exitosamente', 'success');   
      }
      else
      {
        this.formularioVisible = false;

        if(resp.resultado.length >1)
          Swal.fire('Error', 'La búsqueda ha retornado más de un resultado' , 'error');
        else
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');
      }
      
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}

//Función para filtrar identificadores del dropDown
filtrarIdentificadores(event: KeyboardEvent) {
  let elemento = event.target as HTMLInputElement;
  let cadena = elemento.value;
  if (typeof cadena === 'string') 
  {
    this.listaIdentificadores = this.listaIdentificadoresOrg.filter(a => a.codigoOficial.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
    //Agregar el control para cuando el filtrado de identificadores resulta en una lista vacía
    this.listaIdentificadores.length == 0 ? this.listaVacia = true : this.listaVacia = false;
  }
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}
