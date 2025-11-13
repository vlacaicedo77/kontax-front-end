import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import Swal from 'sweetalert2';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { CertificadoVacunacion } from '../../modelos/certificado-vacunacion.modelo';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-eliminar-certificado-vacunacion',
  templateUrl: './eliminar-certificado-vacunacion.component.html',
  styleUrls: ['./eliminar-certificado-vacunacion.component.css']
})
export class EliminarCertificadoVacunacionComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaFasesVacunacion: FaseVacunacion[] = [];
  listaCertificados: CertificadoVacunacion[] = [];

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService,
    private servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    if (this.servicioUsuario.usuarioInterno) {
      this.obtenerFasesVacunaciones();
    }
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormulario(){
    this.formularioBusqueda = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      secuencia: new FormControl(null, Validators.required)
    });
  }

  obtenerFasesVacunaciones(){
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
    }).subscribe( (fasesVacunacion: FaseVacunacion[]) => {
      this.listaFasesVacunacion = fasesVacunacion;
      Swal.close();
    });
  }

  /**
   * Busca el certificado de vacunación generado.
   */
  buscar(){
    this.formularioBusqueda.markAllAsTouched();
    if ( this.formularioBusqueda.invalid ) {
      Swal.fire('Error', 'El formulario de búsqueda contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Certificados de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioCertificadoVacunacion.obtenerCertificadosVacunaciones({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      secuencia: `%${this.formularioBusqueda.value.secuencia}%`
    }).subscribe( (certificados: CertificadoVacunacion[]) => {
      this.listaCertificados = certificados;
      Swal.close();
    });
  }

  /**
   * Elimina un Certificado de Vacunación
   * @param idCertificadoVacunacion 
   */
  eliminarCertificadoVacunacion(certificado: CertificadoVacunacion){
    Swal.fire({
      title: `¿Desea eliminar el Certificado de Vacunación ${certificado.secuencia}?`,
      text: 'Esta acción no se puede revertir',
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
          text: 'Eliminando Certificado de Vacunación.',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioCertificadoVacunacion.eliminarCertificadoVacunacion(certificado.idCertificadoVacunacion)
        .subscribe( ( respuesta: any ) => {
          console.log(respuesta);
          this.listaCertificados = [];
          this.formularioBusqueda.reset();
          Swal.fire(
            'Éxito',
            `Se eliminó correctamente el Certificado de Vacunación ${certificado.secuencia}`,
            'success'
          )
        });
      }
    });
  }

}
