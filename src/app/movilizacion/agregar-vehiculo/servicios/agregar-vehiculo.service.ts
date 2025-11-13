import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgregarVehiculoService {

  visibilidad: boolean;
  public notificacion = new EventEmitter<any>();


  constructor() { 
    this.visibilidad = true;
  }

  /**
   * Muestra el panel para crear un usuario
   */
  abrir(){
    this.visibilidad = false;
  }
  /**
   * Oculta el panel para crar un usuario
   */
  cerrar(){
    this.visibilidad = true;
  }

}
