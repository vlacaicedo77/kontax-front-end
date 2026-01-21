import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    private enrutador: Router
  ) { }

  canActivate(): boolean {
    // Verificación MUY básica - solo que exista un token
    const token = localStorage.getItem('token');
    const tieneTokenValido = token && token.length > 20;
    
    if (tieneTokenValido) {
      return true;
    }
    
    // Si no hay token, redirigir a home
    this.enrutador.navigate(['/home']);
    return false;
  }
}