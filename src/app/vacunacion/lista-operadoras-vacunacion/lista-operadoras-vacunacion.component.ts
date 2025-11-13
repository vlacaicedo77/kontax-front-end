import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { OficinaService } from '../../servicios/oficina.service';
import { Oficina } from '../../modelos/oficina.modelo';
import { FormGroup, FormControl } from '@angular/forms';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';

@Component({
  selector: 'app-lista-operadoras-vacunacion',
  templateUrl: './lista-operadoras-vacunacion.component.html',
  styles: [
  ]
})
export class ListaOperadorasVacunacionComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaFasesVacunacion: FaseVacunacion[] = [];
  listaOficinasAsignadas: Oficina[] = [];



  listaOperadorasVacunacion: OperadoraVacunacion[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioOficina: OficinaService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.inicializarFormularioBusqueda();
    this.servicioScript.inicializarScripts();
    this.obtenerFasesVacunacion();
  }

  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      fase_vacunacion: new FormControl(null),
      provincia: new FormControl(null)
    });
  }

  /**
   * Obtiene las fases de vacunación habilitadas
   */
  obtenerFasesVacunacion(){
    this.listaFasesVacunacion = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando fases de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( (fases: FaseVacunacion[]) => {
      this.listaFasesVacunacion = fases;
      Swal.close();
    });
  }

  /**
   * Carga las oficinas provinciales de vacunación asignadas al usuario
   */
  cambioFaseVacunacion(){
    this.formularioBusqueda.controls.provincia.setValue(null);
    this.listaOficinasAsignadas = [];
    if ( this.formularioBusqueda.value.fase_vacunacion) {
      Swal.fire({
        title: 'Espere...',
        text: 'Buscando oficinas asignadas.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      this.servicioOficina.obtenerOficinas({
        idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
        idUsuariosInternos: this.servicioUsuario.usuarioInterno.idUsuario,
        grupoOficina: 'VAC',
        codigoOficina: 'O-PROV',
        codigoEstadoRegistro: 'HAB'
      }).subscribe( (oficinas: Oficina[]) => {
        this.listaOficinasAsignadas = oficinas;
        Swal.close();
      });
    }
  }

  /**
   * Busca las operadoras por provincia en base a las oficinas
   */
  cambioOficina(){
    this.listaOperadorasVacunacion = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando las operadoras de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idProvincia: this.formularioBusqueda.value.provincia
    })
    .subscribe( ( operadoras: OperadoraVacunacion[]) => {
      this.listaOperadorasVacunacion = operadoras;
      Swal.close();
    });
  }

}
