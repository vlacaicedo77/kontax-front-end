import { Injectable } from '@angular/core';
import { showAlertWithCallback, showLoading, closeAlert } from '../../config/alertas';

@Injectable({
  providedIn: 'root'
})
export class AlertaSesionService {
  private alertaActiva = false;
  private tiempoEntreAlertas = 5000;
  private ultimaAlerta: number = 0;
  private instanciaAlertaActual: any = null;

  /**
   * Muestra alerta de sesión cerrada/vencida
   */
  mostrarAlertaSesion(
    titulo: string,
    mensaje: string,
    tipo: 'sesionCerrada' | 'tokenExpirado',
    callback?: () => void
  ): Promise<boolean> {
    const ahora = Date.now();
    // Prevenir alertas duplicadas o muy seguidas
    if (this.alertaActiva || (ahora - this.ultimaAlerta < this.tiempoEntreAlertas)) {
      return Promise.resolve(false);
    }
    
    this.alertaActiva = true;
    this.ultimaAlerta = ahora;
    
    return new Promise((resolve) => {
      this.instanciaAlertaActual = showAlertWithCallback(
        titulo,
        mensaje,
        'warning',
        'Entendido',
        false,
        false,
        true
      );
      
      this.instanciaAlertaActual.then(() => {
        this.alertaActiva = false;
        this.instanciaAlertaActual = null;
        
        if (callback) {
          callback();
        }
        
        resolve(true);
      }).catch(() => {
        this.alertaActiva = false;
        this.instanciaAlertaActual = null;
        resolve(false);
      });
    });
  }

  /**
   * Muestra alerta informativa
   */
  mostrarAlertaInformativa(
    titulo: string,
    mensaje: string,
    callback?: () => void
  ): Promise<boolean> {
    const ahora = Date.now();
    
    if (this.alertaActiva || (ahora - this.ultimaAlerta < this.tiempoEntreAlertas)) {
      return Promise.resolve(false);
    }
    
    this.alertaActiva = true;
    this.ultimaAlerta = ahora;
    
    return new Promise((resolve) => {
      this.instanciaAlertaActual = showAlertWithCallback(
        titulo,
        mensaje,
        'info',
        'Entendido',
        false,
        false,
        true
      );
      
      this.instanciaAlertaActual.then(() => {
        this.alertaActiva = false;
        this.instanciaAlertaActual = null;
        
        if (callback) {
          callback();
        }
        
        resolve(true);
      }).catch(() => {
        this.alertaActiva = false;
        this.instanciaAlertaActual = null;
        resolve(false);
      });
    });
  }

  /**
   * Verifica si ya hay una alerta activa
   */
  tieneAlertaActiva(): boolean {
    return this.alertaActiva;
  }
  /**
   * Resetea el estado del servicio
   */
  resetearEstado(): void {
    this.alertaActiva = false;
    this.ultimaAlerta = 0;
    this.instanciaAlertaActual = null;
  }
}