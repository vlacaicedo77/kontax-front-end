import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { Zona } from '../../modelos/zona.modelo';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { ZonaService } from '../../servicios/zona.service';
import { Router } from '@angular/router';
import { Oficina } from '../../modelos/oficina.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { OficinaService } from '../../servicios/oficina.service';

@Component({
  selector: 'app-lista-zonas',
  templateUrl: './lista-zonas.component.html',
  styles: [
  ]
})
export class ListaZonasComponent implements OnInit {

  public listaZonas: Zona[];
  public panelZonaNueva: Boolean;
  public listaFasesVacunaciones: FaseVacunacion[];
  // Nueva
  public fasesVacunaciones: FaseVacunacion [];
  public oficinaProvincial: Oficina;
  public formularioFasesVacunaciones: FormGroup;
  public formularioZonas: FormGroup;

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioZona: ZonaService,
    private servicioEnrutador: Router,
    private servicioUsuario: UsuarioService,
    private servicioOficina: OficinaService
  ) { }

  ngOnInit(): void {
    this.panelZonaNueva = false;
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioFasesVacunacion();
    if (this.servicioUsuario.usuarioInterno) {
      this.inicializarFormulario();
      this.obtenerOficinaProvincial();
    }
  }
  
  // Inicializa el formulario de la fase de vacunación
  inicializarFormularioFasesVacunacion(){
    this.formularioFasesVacunaciones = new FormGroup({
      fase_vacunacion: new FormControl(null,Validators.required)
    });
  }

  // Obtenemos la oficina provincial
  obtenerOficinaProvincial(){
    this.servicioOficina.obtenerOficinas({
      codigoOficina: 'O-PROV',
      codigoEstadoRegistro: 'HAB',
      idUsuariosInternos: this.servicioUsuario?.usuarioInterno?.idUsuario
    })
    .subscribe( (respuesta: Oficina[]) => {
      if (respuesta.length > 0) {
        this.oficinaProvincial = respuesta[0];
        this.obtenerFasesVacunacion();
      }
    });
  }

  // Obtiene las fases de vacunación
  obtenerFasesVacunacion(){
    this.listaFasesVacunaciones = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    }).subscribe( ( fases: FaseVacunacion[]) => {
      this.fasesVacunaciones = fases;
      console.log(fases);
      Swal.close();
    });
  }

  // Inicializar el formulario
  inicializarFormulario(){
    this.formularioZonas = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      descripcion: new FormControl(null)
    });
  }
  obtenerZonas(parametros: any){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioZona.obtenerZonas(parametros)
    .subscribe( (zonas: Zona[]) => {
      this.listaZonas = zonas;
      Swal.close();
    });
  }

  // Abre el panel para crear una nueva zona
  abrirPanel(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      
    })
    .subscribe( (fases: FaseVacunacion[]) =>{
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
    //Swal.fire()
  }
  // Cierra el panel
  cerrarPanel(){
    this.panelZonaNueva = false;
    this.formularioZonas.reset();
  }
  
  // Llama al servicio para registrar una nueva zona
  registrarNuevaZona(){
    this.formularioZonas.markAllAsTouched();
    if (this.formularioZonas.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    const zona = new Zona();
    zona.idFaseVacunacion = this.formularioFasesVacunaciones.value.fase_vacunacion;
    zona.nombre = this.formularioZonas.value.nombre;
    zona.descripcion = this.formularioZonas.value.descripcion;
    zona.idProvincia = this.oficinaProvincial.idProvincia;
    console.log(zona);
    this.servicioZona.crearZona(zona)
    .subscribe( (idZona: any) =>{
      Swal.close()
      this.servicioEnrutador.navigate([`zona-cobertura/${idZona.idZona}`]);
    });
  }

  // Se ejecuta cuando se cambia la fase de vacunación
  cambioFaseVacunacio(){
    this.listaZonas = [];
    this.obtenerZonas({
      idProvincia: this.oficinaProvincial.idProvincia,
      estado: 1,
      idFaseVacunacion: this.formularioFasesVacunaciones.value.fase_vacunacion
    });
  }

  // Se 
  agregarZona(){
    if ( this.formularioFasesVacunaciones.invalid ) {
      Swal.fire('Error', 'Seleccione una fase de vacunación', 'error');
      return;
    }
    this.panelZonaNueva = true;
  }

}
