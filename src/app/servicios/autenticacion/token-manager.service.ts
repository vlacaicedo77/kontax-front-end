import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {
  private currentToken = new BehaviorSubject<string | null>(null);
  
  constructor() {
    // Inicializar con token de localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this.currentToken.next(savedToken);
    }
  }
  
  // Obtener token actual (para peticiones)
  getToken(): string | null {
    return this.currentToken.value || localStorage.getItem('token');
  }
  
  // Actualizar token (cuando llega del backend)
  updateToken(newToken: string): void {
    localStorage.setItem('token', newToken);
    this.currentToken.next(newToken);
  }
  
  // Observable para escuchar cambios
  getTokenObservable(): Observable<string | null> {
    return this.currentToken.asObservable();
  }
  
  // Limpiar token (logout)
  clearToken(): void {
    localStorage.removeItem('token');
    this.currentToken.next(null);
  }
}