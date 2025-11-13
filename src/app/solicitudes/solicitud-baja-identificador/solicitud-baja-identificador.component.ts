import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// Importación de modelos.
import { SolicitudBajaIdentificador } from 'src/app/modelos/solicitud-baja-identificador.modelo';

// Importación de servicios.
import { SolicitudBajaIdentificadorService } from 'src/app/servicios/solicitud-baja-identificador/solicitud-baja-identificador.service';
import { IdentificadorBovinoService } from 'src/app/servicios/identificador-bovino/identificador-bovino.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';


@Component({
  selector: 'app-solicitud-baja-identificador',
  templateUrl: './solicitud-baja-identificador.component.html',
  styleUrls: []
})
export class SolicitudBajaIdentificadorComponent implements OnInit {

  public listaIdentificadores = [];
  public listaIdentificadoresOrg = [];
  public listaVacia = false;
  
  // Objeto que maneja el formulario.
  formulario: FormGroup;

  constructor(
    private scriptServicio: ScriptsService,
    private _solicitudService: SolicitudBajaIdentificadorService,
    private _identificadorService: IdentificadorBovinoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.cargarIdentificadoresSinUsar();
  }

// Inicializar formulario.
inicializarFormulario() {
  this.formulario = new FormGroup({
    inputIdentificador: new FormControl(null, [Validators.required]),
    inputObservaciones: new FormControl(null, [Validators.required])
  });
}

//Método que permite registrar una solicitud de baja de identificador
registrarSolicitudBajaIdentificador(){
  let formularioInvalido = false;
  let mensaje = "El formulario de solicitud contiene errores<ul></br>";
  
  if(this.listaVacia){
    formularioInvalido = true;
    mensaje += "<li>Debe seleccionar el identificador a dar de baja</li>";
  }

  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
  let solicitud = new SolicitudBajaIdentificador();
  
  solicitud.idGanaderoSolicitante = parseInt(localStorage.getItem('idUsuario'));
  solicitud.idUsuarioCreador = parseInt(localStorage.getItem('idUsuario'));
  solicitud.idIdentificador = this.formulario.value.inputIdentificador;
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

// Método que obtiene los datos de los identificadores sin usar del ganadero.
cargarIdentificadoresSinUsar() {
  let idGanadero = parseInt(localStorage.getItem('idUsuario'));
  this._identificadorService.obtenerIdentificadoresSinUsarPorUsuario(idGanadero)
  .subscribe(respuesta => {
        this.listaIdentificadores = respuesta.resultado; 
        if(this.listaIdentificadores.length > 0)
        {
          this.listaIdentificadoresOrg = this.listaIdentificadores;
          Swal.fire('Éxito', 'La búsqueda se ha ejecutado exitosamente', 'success');
        }
        else
        {
          Swal.fire('Advertencia', 'El ganadero no tiene identificadores sin usar que puedan ser dados de baja', 'warning');
        }
    }
    );
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
