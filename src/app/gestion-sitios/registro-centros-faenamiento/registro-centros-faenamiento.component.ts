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
  selector: 'app-registro-centros-faenamiento',
  templateUrl: './registro-centros-faenamiento.component.html',
  styleUrls: []
})
export class RegistroCentrosFaenamientoComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public listaCentros = [];
  public centrosVisible = false;

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  mascaraTelefono: string;
  constructor(
    private _sitioService: SitioService,
    private _areaService: AreaService,
    private router: Router
    ) { 
    }

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
     inputCapacidad: new FormControl(null, [Validators.required,Validators.min(0),Validators.max(999999999), Validators.pattern(mascaras.MASK_NUMERICO)]),
     inputTipoTelefono: new FormControl(null, [Validators.required]),
     inputTelefono: new FormControl(null, [Validators.required , Validators.pattern(mascaras.MASK_TELEFONO_FIJO)]),
     inputSitioGUIA: new FormControl(null, [Validators.required])
    });
  }

  // Método que permite registrar un centro de faenamiento.
registrarCentroFaenamiento() {
   let formularioInvalido = false;
   let mensaje = "El formulario de registro contiene errores<ul></br>";

  if ( this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }
  
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
    title: 'Está seguro de registrar el centro de faenamiento?',
    text: "Una vez registrado no podrá modificarlo",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, enviar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
    
      let area = new Area();

      area.idSitio = this.formulario.value.inputSitio;
      area.nombre = this.formulario.value.inputNombre.toUpperCase();
      area.superficieHa = this.formulario.value.inputSuperficieHa;
      area.capacidad = this.formulario.value.inputCapacidad;
      area.telefono = this.formulario.value.inputTelefono;
      area.idSitioGuia = this.formulario.value.inputSitioGUIA;
      
      this._areaService.registrarCentroFaenamiento(area)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'El Centro de Faenamiento fue registrado correctamente', 'success');
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

  // Método que obtiene el listado de centros de faenamiento del sistema GUIA
  buscarCentrosFaenamiento(numeroIdentificacion: string) {
    this.centrosVisible = false;
    if ( numeroIdentificacion === null) {
      return;
    }
    this._sitioService.consultarCentrosFaenamientoGUIAPorNumeroIdentificacionUsuario(numeroIdentificacion)
   .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaCentros = resp.resultado;
        this.centrosVisible = true;
        this.buscarSitios(numeroIdentificacion);
      }
      else {
        Swal.fire('Éxito', 'El productor no tiene centros de faenamiento activos en el sistema GUIA', 'success');
      }
    }
    else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
   })}

  // Método que obtiene el listado de sitios por el id del usuario
  buscarSitios(numeroIdentificacion: string) {
    if ( numeroIdentificacion === null) {
      return;
    }
    this._sitioService.consultarSitiosPorNumeroIdentificacionUsuario(numeroIdentificacion)
   .subscribe( (resp: any) => {
    if ( resp.estado === 'OK')  {
      if(resp.resultado.length > 0) {
        this.listaSitios = resp.resultado;
        Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
      }
      else {
        Swal.fire('Éxito', 'La búsqueda de predios no ha generado resultados. El productor debe tener al menos un predio registrado para continuar.', 'success');
        this.centrosVisible = false;
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