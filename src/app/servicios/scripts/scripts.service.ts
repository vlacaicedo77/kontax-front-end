import { Injectable } from '@angular/core';

declare function funciones_index();
declare function funcion_js_custom();
// Función para inicializar el menú en horizontal pantalla completa.
declare function initHorizontalFullWitdth();
// Función para inicializar el menú izquierdo al cambio de tamaño de pantall.
declare function styleSwitcherHorizontal();

@Injectable({
  providedIn: 'root'
})
export class ScriptsService {

  constructor() { }

  // Carga los scripts necesarios para establecer configuraciones visuales.
  inicializarScripts(){
    funcion_js_custom();
    initHorizontalFullWitdth();
    styleSwitcherHorizontal();
    funciones_index();
  }
}
