import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// Importación de servicios.
import { IdentificadorBovinoService } from 'src/app/servicios/identificador-bovino/identificador-bovino.service';
import { HistoriaBovinoService } from 'src/app/servicios/historia-bovino/historia-bovino.service';
import { TipoHistoriaService } from 'src/app/servicios/tipo-historia/tipo-historia.service';
import { BovinoService } from 'src/app/servicios/bovino/bovino.service';

// Importacion de modelos
import { HistoriaBovino } from 'src/app/modelos/historia-bovino.modelo';
import { Bovino } from 'src/app/modelos/bovino.modelo';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-registro-evento-bovino',
  templateUrl: './registro-evento-bovino.component.html',
  styleUrls: []
})
export class RegistroEventoBovinoComponent implements OnInit {

  //Objetos para gestionar la búsqueda
  public listaBovinos = [];
  public listaTiposHistoria = [];
  public listaIdentificadores = [];
  public listaIdentificadoresOrg = [];
  public bovino:Bovino;
  public formularioVisible = false;
  public listaVacia = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  formularioBusquedaBovino: FormGroup;

  constructor(
    private _historiaService: HistoriaBovinoService,
    private _tipoHistoriaService: TipoHistoriaService,
    private _bovinoService: BovinoService,
    private _identificadorService: IdentificadorBovinoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.inicializarFormularioBusquedaBovino();
    this.consultarTiposHistoria();
    this.cargarIdentificadoresActivos(parseInt(localStorage.getItem('idUsuario')));
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputTipoHistoria: new FormControl(null,[Validators.required]),
      inputDetalle: new FormControl(null,[Validators.required,Validators.pattern(mascaras.MASK_ALFANUMERICO)])
    });
  }

  // Inicializar formulario de búsqueda.
  inicializarFormularioBusquedaBovino() {
    this.formularioBusquedaBovino = new FormGroup({
      inputIdentificador: new FormControl(null, [Validators.required])
    });
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
            Swal.fire('Advertencia', 'El ganadero no tiene bovinos con identificadores activos para registrar un evento', 'warning');
          }
      }
      );
  }

  // Método que permite buscar un Bovino.
  buscarBovino() {
    let formularioInvalido = false;
    let mensaje = "El formulario de búsqueda contiene errores<ul></br>";

    if(this.listaVacia){
      formularioInvalido = true;
      mensaje += "<li>Debe seleccionar el identificador del bovino</li>";
    }

    //Validaciones de lógica de negocio.
    if ( this.formularioBusquedaBovino.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('Error', mensaje, 'error');
    return;
    }

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
    });
  }

  // Método que obtiene los datos de tipos de historia.
  consultarTiposHistoria()
  {
    this._tipoHistoriaService.getTiposHistoria()
    .subscribe( respuesta => {
    this.listaTiposHistoria = respuesta;
    //Filtramos los tipos de historia válidos para autoregistro del ganadero
    this.listaTiposHistoria = this.listaTiposHistoria.filter(h  => (h.codigo == 'ATEN-VET' || h.codigo == 'VAC-BR51' || h.codigo == 'VAC-BR19' || h.codigo == 'VAC-EV' || h.codigo == 'VAC-RB'));  
    });
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

  //Método que permite registrar un evento de historia de bovino
  registrarEventoBovino(){
    let formularioInvalido = false;
    let mensaje = "El formulario de solicitud contiene errores<ul></br>";
    
    //Validaciones de lógica de negocio.
    if(this.bovino.idBovino == null){
      formularioInvalido = true;
      mensaje += "<li>No se ha podido obtener la información del bovino seleccionado. </li>";
    }

    if ( this.formulario.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('Error', mensaje, 'error');
    return;
    }
    
    let historia = new HistoriaBovino();
    
    historia.idTipoHistoriaBovino = this.formulario.value.inputTipoHistoria;
    historia.idBovino = this.bovino.idBovino;
    historia.detalle = this.formulario.value.inputDetalle;
    historia.numeroIdUsuarioActual = localStorage.getItem('identificacion');
    historia.numeroIdUsuarioGenerador = localStorage.getItem('identificacion');

    //Mensaje de confirmación
    Swal.fire({
      title: 'Está seguro de registrar el evento?',
      text: "Una vez registrado no podrá ser eliminado",
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
        this._historiaService.crearHistoriaBovino(historia)
        .subscribe( (resp: any) => {
          if ( resp.estado === 'OK') {
            Swal.fire('Éxito', 'Se ha registrado el evento de bovino exitosamente', 'success');
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

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }
}
