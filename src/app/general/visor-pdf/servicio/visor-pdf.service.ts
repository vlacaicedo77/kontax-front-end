import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisorPdfService {

  visibilidad: boolean;
  public notificacion = new EventEmitter<any>();

  constructor() {
    this.visibilidad = true;
   }

   /**
    * Establecemos el archivo
    * @param cadena 
    */
   establecerArchivoDesdeBase64(cadena: string){
     this.notificacion.emit(cadena);
   }

   /**
   * Muestra el panel para crear un usuario
   */
  abrir(){
    this.visibilidad = false;
    this.notificacion.emit('abrir');
  }
  /**
   * Oculta el panel para crar un usuario
   */
  cerrar(){
    this.visibilidad = true;
    this.notificacion.emit('cerrar');
  }
}
