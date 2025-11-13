import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../servicios/scripts/scripts.service';
// Importamos la función de fondos aleatorios
import  * as fondos from 'src/app/config/random-background';
import { PopupGeneralService } from 'src/app/servicios/popup-general/popup-general.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  isModalOpen = false;
  popupData: any = null;
  
  constructor(
    private scriptServicio: ScriptsService,
    private popupService: PopupGeneralService
  ) { }

  randomBackground = fondos.RandomBackground();

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

  getImageUrl(imagenName: string): string {
    return `assets/images/${imagenName}`;
  }

  // Método para cerrar el modal
  closeModal() {
    this.isModalOpen = false;
    this.popupData = null;
  }
}