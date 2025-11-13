import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistroAreaModalService {

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
    console.log('Abrir servicio.');
  }
  /**
   * Oculta el panel para crar un usuario
   */
  cerrar(){
    this.visibilidad = true;
    console.log('Cerrar servicio');
  }


}
