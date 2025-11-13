import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { Area } from 'src/app/modelos/area.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { AreaService } from 'src/app/servicios/area/area.service';
import { TipoActividadAreaService } from 'src/app/servicios/tipo-actividad-area/tipo-actividad-area.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-registro-explotaciones-pecuarias',
  templateUrl: './registro-explotaciones-pecuarias.component.html',
  styleUrls: []
})
export class RegistroExplotacionesPecuariasComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public listaTiposActividad = [];
  public superficiesVisible = false;
  public produccionLechera = false;
  public produccionCarnica = false;

  public superficieTotal = 0;
    // Objeto que maneja el formulario.
    formulario: FormGroup;

  constructor(
    private scriptServicio: ScriptsService,
    private _sitioService: SitioService,
    private _tipoActividadAreaService: TipoActividadAreaService,
    private _areaService: AreaService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.cargarTiposActividad();
    this.cargarSitiosPorNumeroIdentificacion(localStorage.getItem('identificacion'));
    this.inicializarFormulario();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputSuperficieLeche: new FormControl(),
      inputSuperficieCarne: new FormControl(),
      inputSitio: new FormControl(null, [Validators.required]),
      inputNombre: new FormControl(null, [Validators.required, Validators.maxLength(256)]),
      inputSuperficieHa: new FormControl(null),//, [Validators.required]),
      inputActividad: new FormControl(null, [Validators.required])
    });
  }

// Método que permite registrar una explotacion pecuaria.
registrarExplotacionPecuaria() {
  let formularioInvalido = false;
  let mensaje = "El formulario de registro contiene errores<ul></br>";

  if(isNaN(this.superficieTotal))
  {
    formularioInvalido = true;
    mensaje += "<li>Ingrese números decimales válidos en los campos de superficie.</li>";
  }

  if ( this.superficieTotal<= 0) {
    mensaje += "</ul> La superficie del área debe ser mayor a cero"
    formularioInvalido = true;
  }
  
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  let area = new Area();

  area.idSitio = this.formulario.value.inputSitio;
  area.nombre = this.formulario.value.inputNombre;
  area.superficieHa = this.superficieTotal;
  area.idActividadPrincipal = this.formulario.value.inputActividad;

  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._areaService.registrarExplotacionPecuaria(area)
  .subscribe( (resp: any) => {
    if ( resp.estado === 'OK') {
       Swal.fire('Éxito', 'La Explotación Pecuaria fue registrada correctamente', 'success');
       this.router.navigate(['inicio']);
     }
     else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  } );
 }
// Método que obtiene los datos de los sitios.
cargarSitiosPorNumeroIdentificacion(numeroIdentificacion: string) {
  this._sitioService.consultarSitiosPorFiltros({numeroIdentificacionUsuario : numeroIdentificacion, estado : 3})//Sitios en estado Activo
  .subscribe( respuesta => this.listaSitios = respuesta.resultado );
}
// Método que obtiene los datos de tipos de actividad
cargarTiposActividad() {
  this._tipoActividadAreaService.getTiposActividadArea()
  .subscribe( respuesta => this.listaTiposActividad = respuesta );
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

//Función que suma las superficies del área
sumaSuperficie()
{
  let superficieLeche = Number(this.formulario.value.inputSuperficieLeche);
  let superficieCarne = Number(this.formulario.value.inputSuperficieCarne);

  if(superficieCarne === NaN)
    superficieCarne = 0;
  if(superficieLeche === NaN)
    superficieLeche = 0;

  this.superficieTotal = superficieCarne + superficieLeche;
}

//Función que permite setear los campos de superficies
seteaSuperficies(idActividadTxT : number)
{
  let idActividad : number = +idActividadTxT;
  this.formulario.controls['inputSuperficieLeche'].setValue("");
  this.formulario.controls['inputSuperficieCarne'].setValue("");
  this.sumaSuperficie();

  switch(idActividad)
  {
    case 1://producción lechera
      this.superficiesVisible = true;
      this.produccionLechera = true;
      this.produccionCarnica = false;
      break;
    case 2://producción cárnica
      this.superficiesVisible = true;
      this.produccionLechera = false;
      this.produccionCarnica = true;
      break;
    case 3:
      this.superficiesVisible = true;
      this.produccionLechera = true;
      this.produccionCarnica = true;
      break;
    default:
      this.superficiesVisible = false;
      this.produccionLechera = false;
      this.produccionCarnica = false;
      break;
  }
}

}
