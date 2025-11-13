import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { ActivatedRoute, Router } from '@angular/router';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-fase-vacunacion',
  templateUrl: './fase-vacunacion.component.html',
  styles: [],
})
export class FaseVacunacionComponent implements OnInit {
  modo?: string;
  formulario: FormGroup;
  faseVacunacion?: FaseVacunacion;

  constructor(
    private servicioScript: ScriptsService,
    private servicioRutaActiva: ActivatedRoute,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioUsuario: UsuarioService,
    private servicioEnrutador: Router
  ) {}

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.servicioRutaActiva.params.subscribe((parametros: any) => {
      if (parametros?.id === 'nuevo') {
        this.modo = 'nuevo';
      } else {
        this.obtenerFaseVacunacion(parametros?.id);
      }
    });
  }

  // Método que inicializa el formulario
  inicializarFormulario() {
    this.formulario = new FormGroup(
      {
        nombre_fase: new FormControl(null, Validators.required),
        descripcion_fase: new FormControl(null, Validators.required),
        fecha_inicio: new FormControl(null, Validators.required),
        fecha_fin: new FormControl(null, Validators.required),
        numero_inicial: new FormControl(null, [
          Validators.required,
          Validators.min(0),
        ]),
        numero_final: new FormControl(null, [
          Validators.required,
          Validators.min(0),
        ]),
      },
      [
        this.validarNumeracion('numero_inicial', 'numero_final'),
        this.validarFechas('fecha_inicio', 'fecha_fin'),
      ]
    );
  }
  // Método que valida el número final de los certificados.
  validarNumeracion(numeroInicial: string, numeroFinal: string) {
    return (formularioFaseVacunacion: FormGroup) => {
      const valorInicial: number = Number( formularioFaseVacunacion.controls[numeroInicial].value );
      const valorFinal: number = Number( formularioFaseVacunacion.controls[numeroFinal].value );
      if (this.modo === 'nuevo') {
        if (valorInicial < 0 || valorFinal < 0) {
          return { validarNumeracion: true };
        }
        if (valorFinal < valorInicial) {
          return { valorFinalMenorInicial: true };
        }
      } else if ( this.modo === 'edicion' ){
        if ( valorFinal < this.faseVacunacion.numeroFinal ) {
          return { nuevoValorFinalMenor: true };
        }
      }
      return null;
    };
  }
  // Valida las fechas que no sean menores a la fecha actual y que la fecha final sea mayor que la fecha inicial
  validarFechas(fechaInicial: string, fechaFinal: string) {
    return (formularioFaseVacunacion: FormGroup) => {
      const fechaActual = Date.now();
      // Fecha inicial sea mayor a la fecha actual
      if (formularioFaseVacunacion.controls[fechaInicial].value !== null) {
        const fechaInicio: Date = new Date(
          `${formularioFaseVacunacion.controls[fechaInicial].value} 00:00`
        );
        if (fechaInicio.getTime() < fechaActual && this.modo === 'nuevo') {
          return { fechaInicioMenorActual: true };
        }
      }
      // Fecha final sea mayor a la fecha actual
      if (formularioFaseVacunacion.controls[fechaFinal].value !== null) {
        const fechaFin: Date = new Date(
          `${formularioFaseVacunacion.controls[fechaFinal].value} 00:00`
        );
        if (fechaFin.getTime() < fechaActual) {
          return { fechaFinMenorActual: true };
        }
      }
      // Fecha final sea mayor a la fecha inicial
      if (
        formularioFaseVacunacion.controls[fechaInicial].value !== null &&
        formularioFaseVacunacion.controls[fechaFinal].value
      ) {
        const fechaInicio: Date = new Date(
          `${formularioFaseVacunacion.controls[fechaInicial].value} 00:00`
        );
        const fechaFin: Date = new Date(
          `${formularioFaseVacunacion.controls[fechaFinal].value} 00:00`
        );
        if (fechaFin.getTime() < fechaInicio.getTime()) {
          return { fechaFinMenorFechaInicio: true };
        }
      }

      return null;
    };
  }

  // Método que consulta la fase de vacunación
  obtenerFaseVacunacion(id: number) {
    Swal.fire({
      title: 'Consultando información...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFaseVacunacion
      .obtenerFasesVacunacion({
        idFaseVacunacion: id,
      })
      .subscribe((respuesta: FaseVacunacion[]) => {
        if (respuesta.length > 0) {
          this.faseVacunacion = respuesta[0];
          console.log(this.faseVacunacion);
          if (this.faseVacunacion.codigoEstadoDocumento === 'CRD') {
            this.modo = 'edicion';
            this.establecerDatosParaEdicion();
          } else if (this.faseVacunacion.codigoEstadoDocumento === 'FNLZ') {
            this.modo = 'consulta';
          }
        }
        Swal.close();
      });
    console.log('Consulta fase: ', this.faseVacunacion);
    console.log('Modo: ',this.modo);
  }

  // Método que establece los datos para la edición
  establecerDatosParaEdicion() {
    this.formulario.controls['nombre_fase'].setValue(
      this.faseVacunacion.nombre
    );
    this.formulario.controls['descripcion_fase'].setValue(
      this.faseVacunacion.descripcion
    );
    const fechaInicio = new Date(this.faseVacunacion.fechaInicio);
    this.formulario.controls['fecha_inicio'].setValue(
      `${fechaInicio.getFullYear()}-${
        fechaInicio.getMonth() + 1 >= 10
          ? fechaInicio.getMonth() + 1
          : '0' + (fechaInicio.getMonth() + 1)
      }-${
        fechaInicio.getDate() >= 10
          ? fechaInicio.getDate()
          : '0' + fechaInicio.getDate()
      }`
    );
    const fechaFin = new Date(this.faseVacunacion.fechaFin);
    console.log(fechaFin);
    console.log(this.faseVacunacion.fechaFin);
    this.formulario.controls['fecha_fin'].setValue(
      `${fechaFin.getFullYear()}-${
        fechaFin.getMonth() + 1 >= 10
          ? fechaFin.getMonth() + 1
          : '0' + (fechaFin.getMonth() + 1)
      }-${
        fechaFin.getDate() >= 10 ? fechaFin.getDate() : '0' + fechaFin.getDate()
      }`
    );
    this.formulario.controls['numero_inicial'].setValue(
      this.faseVacunacion.numeroInicial
    );
    this.formulario.controls['numero_final'].setValue(
      this.faseVacunacion.numeroFinal
    );
  }

  // Método que registra la fase de vacunación
  registrarFaseVacunacion() {
    this.formulario.markAsTouched();
    console.log(this.formulario);
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando la fase de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const faseVacunacion = new FaseVacunacion();
    faseVacunacion.nombre = this.formulario.value.nombre_fase;
    faseVacunacion.descripcion = this.formulario.value.descripcion_fase;
    faseVacunacion.fechaInicio = this.formulario.value.fecha_inicio;
    faseVacunacion.fechaFin = this.formulario.value.fecha_fin;
    faseVacunacion.numeroInicial = this.formulario.value.numero_inicial;
    faseVacunacion.numeroFinal = this.formulario.value.numero_final;
    faseVacunacion.idTecnico = this.servicioUsuario.usuarioInterno.idUsuario;
    this.servicioFaseVacunacion
      .nuevaFaseVacunacion(faseVacunacion)
      .subscribe((respuesta: any) => {
        Swal.fire(
          'Éxito',
          'Se actualizó correctamente la Fase de Vacunación.',
          'success'
        ).then(() => {
          this.servicioEnrutador.navigate(['lista-fases-vacunacion']);
        });
      });
  }

  // Método que finaliza la fase de vacunación
  finalizarFaseVacunacion() {
    if (this.faseVacunacion) {
      Swal.fire({
        title: 'Espere...',
        text: 'Finalizando la fase de vacunación.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });
      this.servicioFaseVacunacion
        .finalizarFaseVacunacion(this.faseVacunacion.idFaseVacunacion)
        .subscribe((respuesta) => {
          Swal.fire(
            'Éxito',
            'Se finalizó correctamente la Fase de Vacunación.',
            'success'
          ).then(() => {
            this.servicioEnrutador.navigate(['lista-fases-vacunacion']);
          });
        });
    }
  }

  // Método que actualiza la fase de vacunación
  actualizarFaseVacunacion() {
    console.log(this.formulario);
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Actualizando la fase de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const faseVacunacion = new FaseVacunacion();
    faseVacunacion.idFaseVacunacion = this.faseVacunacion.idFaseVacunacion;
    faseVacunacion.nombre = this.formulario.value.nombre_fase;
    faseVacunacion.descripcion = this.formulario.value.descripcion_fase;
    faseVacunacion.fechaFin = this.formulario.value.fecha_fin;
    faseVacunacion.numeroFinal = this.formulario.value.numero_final;
    this.servicioFaseVacunacion.actualizarFaseVacunación(faseVacunacion)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se actualizó correctamente la Fase de Vacunación.',
        'success'
      ).then(() => {
        this.servicioEnrutador.navigate(['lista-fases-vacunacion']);
      });
    });

    
  }
}