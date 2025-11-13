import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { Area } from 'src/app/modelos/area.modelo';
// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { AreaService } from 'src/app/servicios/area/area.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-registro-comercios-identificadores',
  templateUrl: './registro-comercios-identificadores.component.html',
  styleUrls: []
})
export class RegistroComerciosIdentificadoresComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public detalleVisible = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  mascaraTelefono: string;
  constructor(
    private _sitioService: SitioService,
    private _areaService: AreaService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.mascaraTelefono = "telefonoFijo";
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputSitio: new FormControl(null, [Validators.required]),
      inputNombre: new FormControl(null, [Validators.required, Validators.maxLength(256), Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputSuperficieHa: new FormControl(null, [Validators.required, Validators.min(0),Validators.max(999999999), Validators.pattern(mascaras.MASK_DECIMAL)]),
      inputPermisoOperacion: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      inputFechaVigencia: new FormControl(null, [Validators.required]),
      inputFechaFin: new FormControl(null, [Validators.required]),
      inputTipoTelefono: new FormControl(null, [Validators.required]),
      inputTelefono: new FormControl(null, [Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_FIJO)])
    });
  }

  // Método que permite registrar un comercio de identificadores.
registrarComercioIdentificadores() {
  let formularioInvalido = false;
   let mensaje = "El formulario de registro contiene errores<ul></br>";

   //Validaciones de lógica de negocio.
   if(!((this.formulario.value.inputFechaVigencia as Date) <= (this.formulario.value.inputFechaFin as Date))){
      formularioInvalido = true;
      mensaje += "<li>La fecha de inicio no puede ser mayor que la fecha de fin</li>";
    }
  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

  let area = new Area();

  area.idSitio = this.formulario.value.inputSitio;
  area.nombre = this.formulario.value.inputNombre;
  area.superficieHa = this.formulario.value.inputSuperficieHa;
  area.permisoOperacion = this.formulario.value.inputPermisoOperacion;
  area.fechaVigencia = this.formulario.value.inputFechaVigencia;
  area.fechaFin = this.formulario.value.inputFechaFin;
  area.telefono = this.formulario.value.inputTelefono;

  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
});
  this._areaService.registrarComercioIdentificadores(area)
  .subscribe( (resp: any) => {
   if ( resp.estado === 'OK') {
      Swal.fire('Éxito', 'El Comercio de Identificadores fue registrado correctamente', 'success');
      this.router.navigate(['inicio']);
    }
    else {
     Swal.fire('Error', resp.mensaje , 'error');
   }
 } );
}
  // Método que obtiene el listado de sitios por el id del usuario
  buscarSitios(numeroIdentificacion: string) {
    this.detalleVisible = false;
    if ( numeroIdentificacion === null) {
      return;
    }
    this._sitioService.consultarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacion)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK')  {
        if(resp.resultado.length > 0) {
          this.listaSitios = resp.resultado;
          Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
          this.detalleVisible= true;
        }
        else {
          Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
        }
      }
      else {
        Swal.fire('Error', resp.mensaje , 'error');
      }
     })}

 // Método que obtiene el listado de sitios por el id del usuario
 cambiarMascaraTelefono() {
  if(this.formulario.value.inputTipoTelefono == "fijo")
  {
    this.mascaraTelefono = "telefonoFijo";
    this.formulario.controls.inputTelefono.setValidators([Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_FIJO)]);
  }
  else
  {
    this.mascaraTelefono = "telefonoMovil";
    this.formulario.controls.inputTelefono.setValidators([Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_MOVIL)]);
  }
}

//Función que aplica la máscara a un input al presionarse una tecla
mascara(event: KeyboardEvent, mascara: string)
{
  mascaras.Mascara(event, mascara);
}

}
