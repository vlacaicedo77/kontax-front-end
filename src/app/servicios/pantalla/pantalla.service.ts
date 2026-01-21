import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PantallaService {
  private esMovilSubject = new BehaviorSubject<boolean>(this.detectarMovil());
  esMovil$ = this.esMovilSubject.asObservable();

  constructor() {
    this.detectarCambioPantalla();
  }

  private detectarMovil(): boolean {
    return window.innerWidth <= 1024; // O el breakpoint que uses
  }

  @HostListener('window:resize', [])
  private detectarCambioPantalla() {
    this.esMovilSubject.next(this.detectarMovil());
  }

  esMovil(): boolean {
    return this.esMovilSubject.value;
  }

  esDesktop(): boolean {
    return !this.esMovilSubject.value;
  }
}