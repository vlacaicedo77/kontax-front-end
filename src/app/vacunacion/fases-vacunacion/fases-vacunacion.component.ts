import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-fases-vacunacion',
  templateUrl: './fases-vacunacion.component.html',
  styles: [
  ]
})
export class FasesVacunacionComponent implements OnInit {

  listaFasesVacunacion: FaseVacunacion[];

  constructor(
    private scriptServicio: ScriptsService,
    private faseVacunacionServicio: FaseVacunacionService,
    private usuarioServicio: UsuarioService
  ) { }

  ngOnInit(): void {
    this.scriptServicio.inicializarScripts();
    this.obtenerFasesVacunacion();
  }

  // Método que obtiene las fases de vacunación asignadas al técnico.
  obtenerFasesVacunacion(){
    if( this.usuarioServicio.usuarioInterno == null ){
      return;
    }
    this.faseVacunacionServicio.obtenerFasesVacunacion({
      idTecnico: this.usuarioServicio.usuarioInterno.idUsuario
    })
    .subscribe( (fasesVacunacion: FaseVacunacion[]) => this.listaFasesVacunacion = fasesVacunacion );
  }

}
