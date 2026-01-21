import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { showLoading, showWarning, showSuccessAutoClose, showError } from '../../config/alertas';
import { JSEncrypt } from 'jsencrypt';
import { clavePublica } from '../../config/config';
// Importación de servicios
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
import { SesionVerificacionService } from '../../servicios/autenticacion/sesion-verificacion.service';
import { AlertaSesionService } from '../../servicios/autenticacion/alerta-sesion.service';
// Importamos las máscaras de validacion
import * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-login-externo',
  templateUrl: './login-externo.component.html',
  styleUrls: ['./login-externo.component.css']
})
export class LoginExternoComponent implements OnInit, AfterViewInit {

  formulario: UntypedFormGroup;
  encriptar: any;
  ipPublica: string = '';
  mostrarPassword = false;

  constructor(
    public  autenticacionService: AutenticacionService,
    private sesionVerificacionService: SesionVerificacionService,
    private alertaSesionService: AlertaSesionService,
    private ngZone: NgZone,
    private router: Router,
    private scriptService: ScriptsService
  ) { }

  ngOnInit(): void {
    this.alertaSesionService.resetearEstado();
    this.inicializarFormulario();
    if (this.autenticacionService.sesionIniciada()) {
      this.router.navigate(['/inicio']);
    }
    this.encriptar = new JSEncrypt();
  }

  ngAfterViewInit() {
      this.scriptService.inicializarScripts();
  }

  inicializarFormulario() {
    this.formulario = new UntypedFormGroup({
      identificacion: new UntypedFormControl(null, Validators.required),
      password: new UntypedFormControl(null, Validators.required)
    }, {
      validators: this.validarCredenciales('identificacion', 'password')
    });
  }

  validarCredenciales(formControlUser: string, formControlPassWord: string) {
    return (formulario_login: UntypedFormGroup) => {
      const user = formulario_login.get(formControlUser)?.value;
      const password = formulario_login.get(formControlPassWord)?.value;
      if ((!user || user.trim() === '') || (!password || password.trim() === '')) {
        return { credencialesObligatorias: true };
      }
      return null;
    };
  }

  iniciarSesion() {
    
    if (this.formulario.invalid) { return; }

    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.formulario.value.password);
    showLoading('Autenticando...');
    this.autenticacionService.autenticar(this.formulario.value.identificacion, claveEncriptada)
      .subscribe({
        next: (resp: any) => {
          if (resp.estado === 'OK') {
            showSuccessAutoClose('¡Hola, bienvenido/a!', 1500);
            // Guardar flag si hubo sesión anterior cerrada
            if (resp.resultado.sesionActivaAnterior) {
              localStorage.setItem('mostrarAlertaSesionAnterior', 'true');
              localStorage.setItem('alertaSesionAnteriorTimestamp', Date.now().toString());
            }
            // Iniciar verificación periódica en todos los dispositivos
            this.ngZone.runOutsideAngular(() => {
              setTimeout(() => {
                this.ngZone.run(() => {
                  this.sesionVerificacionService.iniciarVerificacionPeriodica();
                });
              }, 500);
            });

            // Manejar navegación según escenario
            this.ngZone.run(() => {
              if (resp.resultado['contraseñaExpirada'] == 'SI') {
                showWarning('Su contraseña ha expirado, por favor cámbiela.');
                this.router.navigate(['/cambiar-clave-caducada-externo']);
              } else {
                this.navegarAlInicio();
              }
            });
          } else {
            showError('Error', resp.mensaje || 'Error desconocido');
          }
        },
        error: (error: any) => {
          showError('Error', error.mensaje || 'Error de autenticación');
        }
      });
  }

  /**
   * Maneja la navegación a la página de inicio según el dispositivo
   */
  private navegarAlInicio(): void {
    const esMovil = window.innerWidth <= 768;

    if (esMovil) {
      // En móvil: usar recarga controlada
      this.recargarParaMovil();
    } else {
      // En desktop: navegación normal de Angular
      this.router.navigate(['inicio']);
    }
  }

  /**
 * Recarga controlada para dispositivos móviles
 */
  private recargarParaMovil(): void {
    // Primero navegar normalmente
    this.router.navigate(['inicio']).then(() => {
      // Usar ngZone.run para operaciones asíncronas que puedan afectar la UI
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          // Verificar si necesitamos recargar
          this.ngZone.run(() => {
            // Solo recargar si estamos realmente en la página de inicio
            if (this.router.url.includes('/inicio')) {
              window.location.reload();
            }
          });
        }, 300);
      });
    });
  }

  mascara(event: KeyboardEvent, mascara: string) {
    mascaras.Mascara(event, mascara);
  }

  cambiarVisibilidadPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

}