import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { Transportista } from '../../modelos/transportista.modelo';
import { FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { TransportistaService } from '../../servicios/transportista/transportista.service';
import { AgregarTransportistaService } from '../agregar-transportista/servicios/agregar-transportista.service';

@Component({
  selector: 'app-lista-transportistas',
  templateUrl: './lista-transportistas.component.html',
  styleUrls: ['./lista-transportistas.component.css']
})
export class ListaTransportistasComponent implements OnInit {

  listaTransportista: Transportista[] = [];
  formularioBusqueda: FormGroup;

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioTransportista: TransportistaService,
    private servicioAgregarTransportista: AgregarTransportistaService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioBusqueda();
    this.buscarTransportista();
    this.servicioAgregarTransportista.notificacion.subscribe( (respuesta: any) => {
      this.buscarTransportista();
    });
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      ci_transportista: new FormControl(null)
    });
  }

  /**
   * Buscar transportistas registrados por el operador
   */
  buscarTransportista(){
    this.listaTransportista = [];
    if ( this.servicioUsuario.usuarioExterno ){
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando transportistas.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      const transportistaParametros = new Transportista();
      if (this.servicioUsuario.usuarioExterno.idUsuario ) {
        transportistaParametros.idUsuarioExterno = this.servicioUsuario.usuarioExterno.idUsuario;
      }
      if ( this.formularioBusqueda.value.ci_transportista ) {
        transportistaParametros.cedula = this.formularioBusqueda.value.ci_transportista;
      }
      this.servicioTransportista.obtenerTransportistasPorFiltro(transportistaParametros)
      .subscribe( ( transportistas: Transportista[] ) => {
        this.listaTransportista = transportistas;
        Swal.close();
      });

    }
  }

  /**
   * Abre el panel para agregar un transportista
   */
  agregarTransportista(){
    this.servicioAgregarTransportista.abrir();
  }

}
