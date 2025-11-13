import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import Swal from 'sweetalert2';
import { Oficina } from '../../modelos/oficina.modelo';
import { OficinaService } from '../../servicios/oficina.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-oficinas-fases-vacunaciones',
  templateUrl: './oficinas-fases-vacunaciones.component.html',
  styles: [
  ]
})
export class OficinasFasesVacunacionesComponent implements OnInit {

  formularioOficina: FormGroup;
  fasesVacunaciones: FaseVacunacion[];
  listaOficinas: Oficina[];
  listaUsuariosInternos: any[];
  oficinaSeleccionada?: Oficina;
  panelFlotante: Boolean;
  idFaseSeleccionada: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioFasesActivas: FaseVacunacionService,
    private servicioOficinas: OficinaService,
    private servicioUsuarios: UsuarioService
  ) { }

  ngOnInit(): void {
    this.panelFlotante = false;
    this.obtenerFasesActivas();
    //this.obtenerUsuariosInternos();
    this.inicializarFormularioOficina();
    this.servicioScript.inicializarScripts();
  }

  // Inicializa el formulario para la oficina
  inicializarFormularioOficina(){
    this.formularioOficina = new FormGroup({
      id_oficina: new FormControl(null, Validators.required),
      id_tecnico: new FormControl(null, Validators.required)
    });
  }

  obtenerUsuariosInternos(){
    this.servicioUsuarios.consultarUsuariosInternos({
      idProvincia: this.oficinaSeleccionada.idProvincia//,
      //estado: 2
    })
    .subscribe( (usuarios: any) => {
      if ( usuarios.resultado ) {
        this.listaUsuariosInternos = usuarios.resultado;
      }
    });
  }

  // Obtiene las fases de vacunación activas
  obtenerFasesActivas(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFasesActivas.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( (fases: FaseVacunacion[]) => {
      this.fasesVacunaciones = fases;
      Swal.close();
    });
  }

  // Se ejecuta cuando se cambie de fase de vacunación
  cambioFase(idFase: number){
    this.idFaseSeleccionada = idFase;
    this.obtenerOficinas(idFase);
  }

  // Obtener las oficinas de la fase de vacunación
  obtenerOficinas(faseVacunacion: number){
    this.listaOficinas = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficinas.obtenerOficinas({
      idFaseVacunacion: faseVacunacion,
      codigoOficina: 'O-PROV'
    })
    .subscribe( (oficinas: Oficina[]) => {
      this.listaOficinas = oficinas;
      Swal.close();
    });
  }

  // Método que actualiza la oficina
  actualizarOficina(){
    this.formularioOficina.markAllAsTouched();
    if ( this.formularioOficina.invalid ) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Asignando técnico.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    let oficinaActualizar = new Oficina();
    oficinaActualizar.idUsuariosInternos = this.formularioOficina.value.id_tecnico;
    oficinaActualizar.idOficina = this.formularioOficina.value.id_oficina;
    this.servicioOficinas.asignarTecnicoAOficina(oficinaActualizar)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se asignó correctamente el técnico a la oficina.',
        'success'
      ).then(() => {
        this.cerrarPanel();
        this.obtenerOficinas(this.idFaseSeleccionada);
      });
    });

  }

  // Muestra la pantalla de edición para actualizar el técnico de la oficina.
  editarOficina(oficina: Oficina){
    this.panelFlotante = true;
    this.oficinaSeleccionada = oficina;
    this.formularioOficina.controls.id_oficina.setValue(oficina.idOficina);
    this.obtenerUsuariosInternos();
  }
  cerrarPanel(){
    this.panelFlotante = false;
    this.oficinaSeleccionada = null;
    this.formularioOficina.reset();
  }

}
