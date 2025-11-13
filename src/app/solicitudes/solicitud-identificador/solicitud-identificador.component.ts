import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudIdentificador } from 'src/app/modelos/solicitud-identificador.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { ReporteIdentificadoresDisponibles } from 'src/app/modelos/reporte-identificadores-disponibles.modelo';
// Importación de servicios.
//import { ProveedorIdentificadorService } from 'src/app/servicios/proveedor-identificador/proveedor-identificador.service';
import { SolicitudIdentificadorService } from 'src/app/servicios/solicitud-identificador/solicitud-identificador.service';
import { UsuarioService} from 'src/app/servicios/usuario/usuario.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-solicitud-identificador',
  templateUrl: './solicitud-identificador.component.html',
  styleUrls: []
})
export class SolicitudIdentificadorComponent implements OnInit {

  //Objetos para gestionar catálogos
  //public listaProveedores = [];

  //Objeto para obtener el reporte de identificadores disponibles
  public reporteIdentificadores = new ReporteIdentificadoresDisponibles();
  public identificadoresDisponibles = 0;
  public formularioVisible = false;
  public ganadero:Usuario;

    // Objeto que maneja el formulario.
    formulario: FormGroup;
    formularioBusqueda: FormGroup;

  constructor(
    private scriptServicio: ScriptsService,
   //private _proveedorService: ProveedorIdentificadorService,
    private _solicitudService: SolicitudIdentificadorService,
    private _usuarioService: UsuarioService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.inicializarFormularioBusqueda();
    //this.cargarProveedores();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputCantidad: new FormControl(null, [Validators.required])
      //,inputProveedores: new FormControl(null, [Validators.required])
    });
  }

  // Inicializar formulario de búsqueda.
  inicializarFormularioBusqueda() {
    this.formularioBusqueda = new FormGroup({
      inputIdentificacionGanadero: new FormControl(null, [Validators.required])
    });
  }

// Método que permite registrar un sitio.
registrarSolicitudIdentificadores() {
  let formularioInvalido = false;
  let mensaje = "El formulario de solicitud contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   if(this.formulario.value.inputCantidad > this.identificadoresDisponibles){
      formularioInvalido = true;
      mensaje += "<li>El número máximo de identificadores que puede solicitar es: " + this.identificadoresDisponibles + "</li>";
    }
   if(this.formulario.value.inputCantidad <= 0){
    formularioInvalido = true;
    mensaje += "<li>El número máximo de identificadores debe ser mayor a cero.</li>";
  }
  if(this.ganadero.idUsuario == null){
    formularioInvalido = true;
    mensaje += "<li>Ha ocurrido un error al obtener el id del ganadero solicitante.</li>";
  }
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
  let solicitud = new SolicitudIdentificador();
  
  solicitud.idGanaderoSolicitante = this.ganadero.idUsuario;
  solicitud.idUsuarioCreador = parseInt(localStorage.getItem('idUsuario'));
  solicitud.idProveedor =   parseInt(localStorage.getItem('idUsuario'));
  solicitud.numeroIdentificadores = this.formulario.value.inputCantidad;
  solicitud.observaciones = "Solicitud creada";

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

// Método que permite buscar un Ganadero
buscarGanadero() {
  let formularioInvalido = false;
  let mensaje = "El formulario de búsqueda contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   if ( this.formularioBusqueda.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  let numeroIdentificacion = this.formularioBusqueda.value.inputIdentificacionGanadero;
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
        this.cargarReporteIdentificadoresDisponibles(this.ganadero.idUsuario);
      }
      else
      {
        this.formularioVisible = false;
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

// Método que obtiene los datos de identificadores disponibles
cargarReporteIdentificadoresDisponibles(idUsuario: number) {
  this._solicitudService.consultarReporteIdentificadoresDisponibles(idUsuario)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
      this.reporteIdentificadores = resp.resultado;
      this.identificadoresDisponibles = this.reporteIdentificadores.disponibles;
      this.formularioVisible = true;
      Swal.fire('Éxito', 'La búsqueda se ha realizado con éxito', 'success');
    }
    else {
    this.formularioVisible = false;
    this.ganadero.idUsuario = null;
    Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}

