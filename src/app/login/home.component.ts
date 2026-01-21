import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../servicios/scripts/scripts.service';
import { PopupGeneralService } from 'src/app/servicios/popup-general/popup-general.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  isModalOpen = false;
  popupData: any = null;
  
  constructor(
    private scriptServicio: ScriptsService,
    private popupService: PopupGeneralService
  ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.verificarYMostrarPopup();
  }

  // Método principal para verificar y mostrar el popup
  verificarYMostrarPopup() {
    this.popupService.obtenerPopupGeneral({}).subscribe({
      next: (response: any[]) => {
        if (response?.length > 0) {
          this.procesarPopupData(response[0]);
        }
      },
      error: () => {
      }
    });
  }

  // Procesar datos para el popUp
  private procesarPopupData(popup: any) {
    if (popup.estado !== 1) {
      return;
    }
    
    if (popup.fechaInicio && popup.fechaFin) {
      const hoy = new Date().toLocaleDateString('en-CA');
      
      if (hoy >= popup.fechaInicio && hoy <= popup.fechaFin) {
        setTimeout(() => {
          this.popupData = popup;
          this.isModalOpen = true;
        });
      }
    } else {
      setTimeout(() => {
        this.popupData = popup;
        this.isModalOpen = true;
      });
    }
  }

  // Obtener imagen
  getImageUrl(imagenName: string): string {
    return `assets/images/${imagenName}`;
  }

  // Método para cerrar el modal
  closeModal() {
    this.isModalOpen = false;
    this.popupData = null;
  }
}