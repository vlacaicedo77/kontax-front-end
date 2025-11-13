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
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';

@Component({
  selector: 'app-registro-centros-hospedaje',
  templateUrl: './registro-centros-hospedaje.component.html',
  styleUrls: []
})
export class RegistroCentrosHospedajeComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public detalleVisible = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  mascaraTelefono: string;
  constructor(
    private _sitioService: SitioService,
    private _areaService: AreaService,
    private router: Router,
    private servicioscript: ScriptsService
    ) { 
    }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.mascaraTelefono = "telefonoFijo";
    this.servicioscript.inicializarScripts();
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
     inputSitio: new FormControl(null, [Validators.required]),
     inputNombre: new FormControl(null, [Validators.required, Validators.maxLength(256), Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
     inputSuperficieHa: new FormControl(null, [Validators.required, Validators.min(0),Validators.max(999999999), Validators.pattern(mascaras.MASK_DECIMAL)]),
     inputCapacidad: new FormControl(null, [Validators.required,Validators.min(0),Validators.max(999999999), Validators.pattern(mascaras.MASK_NUMERICO)]),
     inputTipoTelefono: new FormControl(null, [Validators.required]),
     inputTelefono: new FormControl(null, [Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_FIJO)])
    });
  }

  // Método que permite registrar un centro de hospedaje
registrarCentroHospedaje() {
   let formularioInvalido = false;
   let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formulario.value.inputSitio == null || this.formulario.value.inputSitio == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione un sitio</li>";
    }

    if(this.formulario.value.inputNombre == null || this.formulario.value.inputNombre == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese nombre del centro</li>";
    }

    if(this.formulario.value.inputSuperficieHa == null || this.formulario.value.inputSuperficieHa == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese superficie total (ha)</li>";
    }

    if(this.formulario.value.inputCapacidad == null || this.formulario.value.inputCapacidad == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese capacidad</li>";
    }

    if(this.formulario.value.inputTelefono == null || this.formulario.value.inputTelefono == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese teléfono de contacto</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

  /*if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }*/
  
  Swal.fire({
    title: 'Espere...',
    text: 'Sus datos se están registrando',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
        Swal.showLoading();
    }
  });

  //Mensaje de confirmación
  Swal.fire({
    title: '¿Está seguro de registrar el centro de hospedaje?',
    text: "Una vez registrado no podrá modificarlo",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
    
      let area = new Area();

      area.idSitio = this.formulario.value.inputSitio;
      area.nombre = this.formulario.value.inputNombre.toUpperCase();
      area.superficieHa = this.formulario.value.inputSuperficieHa;
      area.capacidad = this.formulario.value.inputCapacidad;
      area.telefono = this.formulario.value.inputTelefono;
      
      this._areaService.registrarCentroHospedaje(area)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'El Centro de Hospedaje fue registrado correctamente', 'success');
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

  // Método que obtiene el listado de sitios por el id del usuario
  buscarSitios(numeroIdentificacion: string) {
    this.detalleVisible = false;
    if ( numeroIdentificacion === null) {
      return;
    }

    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });

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

  // Método que cambia la máscara del campo teléfono
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
