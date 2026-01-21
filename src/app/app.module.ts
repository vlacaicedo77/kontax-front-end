// Módulos de Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';

// Módulos de terceros
import { NgxMaskModule } from 'ngx-mask';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Rutas de la aplicación
import { APP_ROUTES } from './app.routes';

// Módulos de la aplicación
import { PaginasModule } from './paginas/paginas.module';
import { GeneralModule } from './general/general.module';

// Componentes de la aplicación
// Componentes de Login
import { AppComponent } from './app.component';
import { HomeComponent } from './login/home.component';
import { LoginExternoComponent } from './login/login-externo/login-externo.component';
import { RegistrarUsuarioExternoComponent } from './login/registrar-usuario-externo/registrar-usuario-externo.component';
import { CambiarClaveCaducadaExternoComponent } from './login/cambiar-clave-caducada-externo/cambiar-clave-caducada-externo.component';
import { RecuperarContrasenaExternoComponent } from './login/recuperar-contrasena-externo/recuperar-contrasena-externo.component';
import { PasswordRecoveryComponent } from './login/password-recovery/password-recovery.component';
import { VerificarEmailExternoComponent } from './login/verificar-email-externo/verificar-email-externo.component';

// Componentes de Usuarios Externos
import { CrearUsuarioExternoComponent } from './usuarios-externos/crear-usuario-externo/crear-usuario-externo.component';
import { CambiarContrasenaExternoComponent } from './usuarios-externos/cambiar-contrasena-externo/cambiar-contrasena-externo.component';
import { GenerarVerificacionEmailComponent } from './usuarios-externos/generar-verificacion-email/generar-verificacion-email.component';
import { ActualizarPerfilUsuarioExternoComponent } from './usuarios-externos/actualizar-perfil-usuario-externo/actualizar-perfil-usuario-externo.component';

// Componentes de Notificaciones
import { ListarNotificacionesComponent } from './notificaciones/listar-notificaciones/listar-notificaciones.component';

// Componentes de Administración
import { RegistrarEmpresaComponent } from './administracion/registrar-empresa/registrar-empresa.component';

// Interceptores
import { InterceptorAutenticacion } from './servicios/autenticacion/interceptor';

@NgModule({
  declarations: [
    // Componente raíz
    AppComponent,
    
    // Componentes de Login (agrupados)
    HomeComponent,
    LoginExternoComponent,
    RegistrarUsuarioExternoComponent,
    CambiarClaveCaducadaExternoComponent,
    RecuperarContrasenaExternoComponent,
    PasswordRecoveryComponent,
    VerificarEmailExternoComponent,
    
    // Componentes de Usuarios Externos (agrupados)
    CrearUsuarioExternoComponent,
    CambiarContrasenaExternoComponent,
    GenerarVerificacionEmailComponent,
    ActualizarPerfilUsuarioExternoComponent,
    
    // Componentes de Notificaciones
    ListarNotificacionesComponent,
    
    // Componentes de Administración
    RegistrarEmpresaComponent
  ],
  imports: [
    // Módulos de Angular
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    // Módulos de la aplicación
    GeneralModule,
    PaginasModule,
    
    // Rutas
    APP_ROUTES,
    
    // Módulos de terceros
    FontAwesomeModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    // Solo quedan servicios que NO tienen providedIn: 'root'
    DatePipe, // DatePipe no es un servicio @Injectable, es de Angular
    
    // Interceptores HTTP (necesitan registro manual)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorAutenticacion,
      multi: true
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }