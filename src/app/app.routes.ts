// Módulos de Angular
import { RouterModule, Routes } from '@angular/router';

// Componentes principales
import { PaginasComponent } from './paginas/paginas.component';
import { NopagefoundComponent } from './general/nopagefound/nopagefound.component';
import { HomeComponent } from './login/home.component';

// Componentes de Login/Autenticación
import { LoginExternoComponent } from './login/login-externo/login-externo.component';
import { RegistrarUsuarioExternoComponent } from './login/registrar-usuario-externo/registrar-usuario-externo.component';
import { CambiarClaveCaducadaExternoComponent } from './login/cambiar-clave-caducada-externo/cambiar-clave-caducada-externo.component';
import { RecuperarContrasenaExternoComponent } from './login/recuperar-contrasena-externo/recuperar-contrasena-externo.component';
import { PasswordRecoveryComponent } from './login/password-recovery/password-recovery.component';
import { VerificarEmailExternoComponent } from './login/verificar-email-externo/verificar-email-externo.component';

// Componentes de Páginas protegidas
import { InicioComponent } from './paginas/inicio/inicio.component';

// Componentes de Usuarios Externos
import { CambiarContrasenaExternoComponent } from './usuarios-externos/cambiar-contrasena-externo/cambiar-contrasena-externo.component';
import { GenerarVerificacionEmailComponent } from './usuarios-externos/generar-verificacion-email/generar-verificacion-email.component';
import { ActualizarPerfilUsuarioExternoComponent } from './usuarios-externos/actualizar-perfil-usuario-externo/actualizar-perfil-usuario-externo.component';

// Componentes de Notificaciones
import { ListarNotificacionesComponent } from './notificaciones/listar-notificaciones/listar-notificaciones.component';

// Componentes de Administración
import { RegistrarEmpresaComponent } from './administracion/registrar-empresa/registrar-empresa.component';

// Guards de seguridad
import { LoginGuardService } from './servicios/login-guard/login-guard.service';
import { AdminGuardService } from './servicios/admin-guard.service';

// Configuración de rutas
const appRoutes: Routes = [
  // ===========================================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ===========================================================
  { path: 'home', component: HomeComponent },
  { path: 'login-externo', component: LoginExternoComponent },
  { path: 'registrar', component: RegistrarUsuarioExternoComponent },
  { path: 'cambiar-clave-caducada-externo', component: CambiarClaveCaducadaExternoComponent },
  { path: 'recuperar-contrasena-externo', component: RecuperarContrasenaExternoComponent },
  { path: 'password-recovery', component: PasswordRecoveryComponent },
  { path: 'verificar-email-externo', component: VerificarEmailExternoComponent },
  
  // ===========================================================
  // RUTAS PROTEGIDAS (requieren autenticación)
  // ===========================================================
  {
    path: '',
    component: PaginasComponent,
    canActivate: [LoginGuardService],
    canActivateChild: [AdminGuardService], // Si solo admin puede acceder a las rutas hijas
    children: [
      // Dashboard / Inicio
      { path: 'inicio', component: InicioComponent },
      
      // ===========================================================
      // MÓDULO: ADMINISTRACIÓN
      // ===========================================================
      { path: 'registrar-empresa', component: RegistrarEmpresaComponent },
      
      // ===========================================================
      // MÓDULO: NOTIFICACIONES
      // ===========================================================
      { path: 'listado-notificaciones', component: ListarNotificacionesComponent },
      
      // ===========================================================
      // MÓDULO: GESTIÓN DE USUARIOS
      // ===========================================================
      { path: 'cambiar-contrasena-externo', component: CambiarContrasenaExternoComponent },
      { path: 'generar-verificacion-email', component: GenerarVerificacionEmailComponent },
      { path: 'actualizar-perfil-externo', component: ActualizarPerfilUsuarioExternoComponent },
      
      // Redirección por defecto dentro del área protegida
      { path: '', redirectTo: '/inicio', pathMatch: 'full' }
    ]
  },
  
  // ===========================================================
  // RUTAS ESPECIALES
  // ===========================================================
  
  // Ruta raíz: redirige a home (puedes cambiarlo según tu lógica)
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Ruta 404 - debe ser la última
  { path: '**', component: NopagefoundComponent }
];

// Exportamos el módulo de rutas configurado
export const APP_ROUTES = RouterModule.forRoot(appRoutes, { 
  useHash: true,
  // Opcional: scrollPositionRestoration para mejor UX
  scrollPositionRestoration: 'enabled'
  //scrollPositionRestoration: 'disabled' | 'enabled' | 'top'
});