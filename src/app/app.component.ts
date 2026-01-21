import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SesionVerificacionService } from './servicios/autenticacion/sesion-verificacion.service';
import { AutenticacionService } from './servicios/autenticacion/autenticacion.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'KONTAXPRO';
  
  constructor(
    private sesionVerificacionService: SesionVerificacionService,
    private autenticacionService: AutenticacionService,
    private router: Router
  ) {}
  
  ngOnInit() {
    console.log('AppComponent inicializado');
    
    // Iniciar verificación automáticamente si hay sesión
    if (this.autenticacionService.sesionIniciada()) {
      this.sesionVerificacionService.iniciarVerificacionPeriodica();
    }
    
    // Escuchar cambios de ruta para iniciar/detener verificación
    this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.manejarCambioRuta(event.url);
      });
  }
  
  ngOnDestroy() {
    this.sesionVerificacionService.forzarDetencion();
  }
  
  private manejarCambioRuta(url: string): void {
    const esRutaLogin = url.includes('/home');
    
    if (esRutaLogin) {
      // Detener verificación cuando va al login
      this.sesionVerificacionService.forzarDetencion();
    } else if (this.autenticacionService.sesionIniciada()) {
      // Iniciar verificación si hay sesión y va a cualquier otra ruta
      this.sesionVerificacionService.iniciarVerificacionPeriodica();
    }
  }
}