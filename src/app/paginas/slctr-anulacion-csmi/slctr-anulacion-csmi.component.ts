import { Component, OnInit } from '@angular/core';
declare function funciones_index();
declare function funcion_js_custom();
// Función para inicializar el menú en horizontal pantalla completa.
declare function initHorizontalFullWitdth();
// Función para inicializar el menú izquierdo al cambio de tamaño de pantall.
declare function styleSwitcherHorizontal();
@Component({
  selector: 'app-slctr-anulacion-csmi',
  templateUrl: './slctr-anulacion-csmi.component.html',
  styles: []
})
export class SlctrAnulacionCsmiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.inicializarScripts();
  }
  // Carga los scripts necesarios para establecer configuraciones visuales.
  inicializarScripts(){
    funcion_js_custom();
    initHorizontalFullWitdth();
    styleSwitcherHorizontal();
    funciones_index();
  }

}
