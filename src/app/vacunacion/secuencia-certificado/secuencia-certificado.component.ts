import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import Swal from 'sweetalert2';
import { FaseVacunacion } from 'src/app/modelos/fase-vacunacion.modelo';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OficinaService } from '../../servicios/oficina.service';
import { Oficina } from 'src/app/modelos/oficina.modelo';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { EstadoRegistroService } from '../../servicios/estado-registro.service';
import { EstadoRegistro } from 'src/app/modelos/estado-registro-modelo';

@Component({
  selector: 'app-secuencia-certificado',
  templateUrl: './secuencia-certificado.component.html',
  styleUrls: ['./secuencia-certificado.component.css']
})
export class SecuenciaCertificadoComponent implements OnInit {

  formulariBusqueda: FormGroup;
  listaFasesVacunacion: FaseVacunacion[] = [];
  listaPersonalOficinas: PersonaOficina[] = [];
  listaSecuenciasCertificados: SecuenciaCertificado[] = [];
  listaEstadosRegistros: EstadoRegistro[] = [];
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioPersonaOficina: PersonaOficinaService,
    private servicioUsuario: UsuarioService,
    private servicioSecuenciaCertificado: SecuenciaCertificadoService,
    private servicioEstadoRegistro: EstadoRegistroService
  ) {
    this.inicio = 0;
    this.fin = 100;
    this.rango = 100;
  }

  ngOnInit(): void {
    this.inicializarFormularioBusqueda();
    this.servicioScript.inicializarScripts();
    this.obtenerEstadosRegistros();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.obtenerFasesVacunacion();
    }
  }

  /**
   * Inicializa el formulario de búsqueda de certificados de vacuanción.
   */
  inicializarFormularioBusqueda(){
    this.formulariBusqueda = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_vacunacion: new FormControl(null, Validators.required),
      estado_registro: new FormControl(null, Validators.required)
    });
  }

  /**
   * Obtenemos los estados de los registros
   */
  obtenerEstadosRegistros(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando los estados de los certificados de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaEstadosRegistros = [];
    this.servicioEstadoRegistro.obtenerEstadosRegistros()
    .subscribe( (estados: EstadoRegistro[]) => {
      this.listaEstadosRegistros = estados.filter( (estado: EstadoRegistro) => {
        return estado.grupo === 'S-CERVAC';
      });
      Swal.close();
    });
  }

  /**
   * Obtenemos las fases de vacunación disponibles.
   */
  obtenerFasesVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando fases de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaFasesVacunacion = [];
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( (fasesVacunacion: FaseVacunacion[]) => {
      this.listaFasesVacunacion = fasesVacunacion;
      Swal.close();
    });
  }

  /**
   * Obtenemos las oficinas asignadas a la operadora actual
   */
  cambioFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Oficinas de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaPersonalOficinas = [];
    this.servicioPersonaOficina.obtenerPersonalDeOficina({
      idFaseVacunacion: this.formulariBusqueda.value.fase_vacunacion,
      idUsuarioExternoPersona: this.servicioUsuario.usuarioExterno.idUsuario,
      codigoTipoPersona: 'DIG'
    })
    .subscribe( (personaOficinas: PersonaOficina[]) => {
      this.listaPersonalOficinas = personaOficinas;
      console.log(this.listaPersonalOficinas);
      Swal.close();
    });

  }

  /**
   * Busca los números de certificados de vacunación
   */
  buscar(){
    this.formulariBusqueda.markAllAsTouched();
    if ( this.formulariBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando secuencias asignadas a la oficina.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaSecuenciasCertificados = [];
    this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados({
      idFaseVacunacion: this.formulariBusqueda.value.fase_vacunacion,
      idOficina: this.formulariBusqueda.value.oficina_vacunacion,
      idEstadoSecuencia: this.formulariBusqueda.value.estado_registro,
      INICIO: this.inicio,
      LIMITE: this.rango,
    })
    .subscribe( (secuencias: SecuenciaCertificado[]) => {
      this.listaSecuenciasCertificados = secuencias;
      Swal.close();
    });

  }

  /**
   * Vacía la lista de certificados
   */
  cambioEstadoRegistro(){
    this.listaSecuenciasCertificados = [];
  }
  /**
   * Vacía la lista de certificados
   */
  cambioOficina(){
    this.listaSecuenciasCertificados = [];
  }

  cambiarEstado(tipo: string, idSecuencia: number, secuencia: string){
    let mensaje = '';
    switch (tipo) {
      case 'anulado':
        mensaje = 'anulado';
        break;
      case 'deteriorado':
        mensaje = 'dañado';
        break;
      case 'perdido':
        mensaje = 'perdido';
        break;
    }
    Swal.fire({
      title: `¿Desea marcar como ${mensaje} el certificado ${secuencia}?`,
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Aplicando cambios a Certificado de Vacunación.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        switch (tipo) {
          case 'anulado':
            this.servicioSecuenciaCertificado.marcarSecuenciaAnulada(idSecuencia)
            .subscribe( (respuesta: any) => {
              Swal.fire(
                'Éxito',
                'Se anuló correctamente el Certificado de Vacunación.',
                'success'
              ).then( () => {
                this.listaSecuenciasCertificados = [];
              });
            });
            break;
          case 'deteriorado':
            this.servicioSecuenciaCertificado.marcarSecuenciaDeteriorada(idSecuencia)
            .subscribe( (respuesta: any) => {
              Swal.fire(
                'Éxito',
                'Se marcó como dañado el Certificado de Vacunación.',
                'success'
              ).then( () => {
                this.listaSecuenciasCertificados = [];
              });
            });
            break;
          case 'perdido':
            this.servicioSecuenciaCertificado.marcarSecuenciaPerdida(idSecuencia)
            .subscribe( (respuesta: any) => {
              Swal.fire(
                'Éxito',
                'Se marcó como peridido el Certificado de Vacunación.',
                'success'
              ).then( () => {
                this.listaSecuenciasCertificados = [];
              });
            });
            break;
        }
      }
    });
  }

  /**
   * 
   */
   devolverNumeracion(secuencia: SecuenciaCertificado){
    Swal.fire({
      title: `¿Desea devolver el Certificado de Vacunación?`,
      text: `Número a devolver: ${secuencia.secuencia}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar!',
      cancelButtonText: 'No'
    }).then( (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Devolviendo Certificado de Vacunación.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        const devolverNumeracion: any = {};
        devolverNumeracion.idFaseVacunacion = secuencia.idFaseVacunacion;
        devolverNumeracion.idOficina = secuencia.idOficina;
        this.listaPersonalOficinas.forEach( (item: PersonaOficina) => {
          if ( Number(item.idOficina) === Number(this.formulariBusqueda.value.oficina_vacunacion)) {
            devolverNumeracion.idOficinaDestino = item.idOficinaSuperior;
          }
        });
        devolverNumeracion.secuencias = [ secuencia  ];
        this.servicioSecuenciaCertificado.asignarSecuenciaOficina(devolverNumeracion)
        .subscribe( (respuesta: any) => {
          console.log(respuesta);
          Swal.fire(
            'Éxito',
            `Se devolvió correctamente el Certificado de Vacunación ${secuencia.secuencia}.`,
            'success'
          ).then( () => {
            this.buscar();
          });
        });
      }
    });
  }

  /**
   * Método que permite retroceder en la búsqueda de certificados de vacunación
   */
  anterior(){
    this.listaSecuenciasCertificados = [];
    this.inicio = this.inicio - this.rango;
    this.buscar();
  }
  /**
   * Método que permite avanzar en la búsqueda de certificados de vacunación
   */
  siguiente(){
    this.listaSecuenciasCertificados = [];
    this.inicio = this.inicio + this.rango;
    this.buscar();
  }

}
