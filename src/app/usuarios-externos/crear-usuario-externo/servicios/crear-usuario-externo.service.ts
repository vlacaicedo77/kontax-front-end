import { EventEmitter, Injectable } from '@angular/core';
import { Usuario } from '../../../modelos/usuario.modelo';

@Injectable({
  providedIn: 'root'
})
export class CrearUsuarioExternoService {

  visibilidad: boolean;
  public usuarioExterno: Usuario;
  public notificacion = new EventEmitter<any>();

  constructor() {
    this.visibilidad = true;
   }

  /**
   * Muestra el panel para crear un usuario
   */
  abrir(){
    this.visibilidad = false;
    console.log('Servicio abrir');
  }
  /**
   * Oculta el panel para crar un usuario
   */
  cerrar(){
    this.visibilidad = true;
  }

}
