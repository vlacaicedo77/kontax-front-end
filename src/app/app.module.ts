// Módulos de Angular.
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


// Módulos de Google Maps
import { GoogleMapsModule } from '@angular/google-maps';
import { AgmCoreModule} from '@agm/core';

// Rutas de la aplicación.
import { APP_ROUTES } from './app.routes';

// Módulos centralizados
import { PaginasModule } from './paginas/paginas.module';


// Componentes de la aplicación.
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrarUsuarioExternoComponent } from './login/registrar-usuario-externo/registrar-usuario-externo.component';
// Necesario para los formularios con FormControl y FormGroup
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// Importación de Componentes
import { RegistroExplotacionesPecuariasComponent } from './gestion-sitios/registro-explotaciones-pecuarias/registro-explotaciones-pecuarias.component';
import { RegistroSitiosComponent } from './gestion-sitios/registro-sitios/registro-sitios.component';
import { RegistroSitiosUsuarioInternoComponent } from './gestion-sitios/registro-sitios-usuario-interno/registro-sitios-usuario-interno.component';
import { RegistroSitiosCatalogoComponent } from './gestion-sitios/registro-sitios-catalogo/registro-sitios-catalogo.component';
import { RegistroCertificacionesComponent } from './gestion-sitios/registro-certificaciones/registro-certificaciones.component';
import { BovinoComponent } from './catastro/bovino/bovino.component';
//ak import { BovinoMasivoComponent } from './catastro/bovino/bovino-masivo.component';
import { ConsultaSitiosComponent } from './gestion-sitios/consulta-sitios/consulta-sitios.component';
import { SolicitudIdentificadorComponent } from './solicitudes/solicitud-identificador/solicitud-identificador.component';
import { CatastroComponent } from './catastro/catastro/catastro.component';
import { RegistroCentrosFaenamientoComponent } from './gestion-sitios/registro-centros-faenamiento/registro-centros-faenamiento.component';
import { RegistroFeriasComercializacionComponent } from './gestion-sitios/registro-ferias-comercializacion/registro-ferias-comercializacion.component';
import { RegistroComerciosIdentificadoresComponent } from './gestion-sitios/registro-comercios-identificadores/registro-comercios-identificadores.component';
import { ConsultaSolicitudesIdentificacionComponent } from './solicitudes/consulta-solicitudes-identificacion/consulta-solicitudes-identificacion.component';
import { TramiteSolicitudIdentificadorComponent } from './solicitudes/tramite-solicitud-identificador/tramite-solicitud-identificador.component';
// Importación de Servicios
import { SitioService } from './servicios/sitio/sitio.service';
import { PaisService } from './servicios/pais/pais.service';
import { ProvinciaService } from './servicios/provincia/provincia.service';
import { CantonService } from './servicios/canton/canton.service';
import { ParroquiaService } from './servicios/parroquia/parroquia.service';
import { CertificacionService } from './servicios/certificacion/certificacion.service';
import { EstadoCertificacionService } from './servicios/estado-certificacion/estado-certificacion.service';
import { EstadoSolicitudService } from './servicios/estado-solicitud/estado-solicitud.service';
import { ProveedorIdentificadorService } from './servicios/proveedor-identificador/proveedor-identificador.service';
import { SolicitudIdentificadorService } from './servicios/solicitud-identificador/solicitud-identificador.service';
import { SolicitudReareteoService } from './servicios/solicitud-reareteo/solicitud-reareteo.service';
// Importación de Servicios de Autenticacion
//import { AutenticacionService } from './servicios/autenticacion/autenticacion.service';
import { InterceptorAutenticacion } from './servicios/autenticacion/interceptor';
import { CrearUsuarioInternoComponent } from './usuarios-internos/crear-usuario-interno/crear-usuario-interno.component';
import { LoginInternoComponent } from './login/login-interno/login-interno.component';
import { TramiteSolicitudIdentificadorProvComponent } from './solicitudes/tramite-solicitud-identificador-prov/tramite-solicitud-identificador-prov.component';
import { TramiteSolicitudIdentificadorAprobComponent } from './solicitudes/tramite-solicitud-identificador-aprob/tramite-solicitud-identificador-aprob.component';
//import { LstSlctdCorrecionCGComponent } from './catastro/lst-slctd-correcion-c-g/lst-slctd-correcion-c-g.component';
import { HistorialSolicitudesIdentificacionComponent } from './solicitudes/historial-solicitudes-identificacion/historial-solicitudes-identificacion.component';
import { CrearCsmiComponent } from './movilizacion/crear-csmi/crear-csmi.component';
import { CrearCzpmCcaComponent } from './movilizacion/crear-czpm-cca/crear-czpm-cca.component';
import { LoginExternoComponent } from './login/login-externo/login-externo.component';
import { DirectorioProveedoresComponent } from './informacion/directorio-proveedores/directorio-proveedores.component';
import { BajaBovinoComponent } from './catastro/baja-bovino/baja-bovino.component';
import { AprobacionRegistroSitiosComponent } from './gestion-sitios/aprobacion-registro-sitios/aprobacion-registro-sitios.component';
import { OperadoraVacunacionComponent } from './vacunacion/operadora-vacunacion/operadora-vacunacion.component';
import { CertificadoVacunacionComponent } from './vacunacion/certificado-vacunacion/certificado-vacunacion.component';
import { FaseVacunacionComponent } from './vacunacion/fase-vacunacion/fase-vacunacion.component';
import { AsignarNumeracionProvinciaComponent } from './vacunacion/asignar-numeracion-provincia/asignar-numeracion-provincia.component';
import { AsignarNumeracionOperadoraComponent } from './vacunacion/asignar-numeracion-operadora/asignar-numeracion-operadora.component';
import { AsignarNumeracionOficinaComponent } from './vacunacion/asignar-numeracion-oficina/asignar-numeracion-oficina.component';
import { SolicitudReareteoComponent } from './solicitudes/solicitud-reareteo/solicitud-reareteo.component';
import { SolicitudBajaIdentificadorComponent } from './solicitudes/solicitud-baja-identificador/solicitud-baja-identificador.component';
import { TramiteSolicitudReareteoComponent } from './solicitudes/tramite-solicitud-reareteo/tramite-solicitud-reareteo.component';
import { TramiteSolicitudReareteoProvComponent } from './solicitudes/tramite-solicitud-reareteo-prov/tramite-solicitud-reareteo-prov.component';
import { TramiteSolicitudReareteoAprobComponent } from './solicitudes/tramite-solicitud-reareteo-aprob/tramite-solicitud-reareteo-aprob.component';
import { TramiteSolicitudBajaIdentificadorAprobComponent } from './solicitudes/tramite-solicitud-baja-identificador-aprob/tramite-solicitud-baja-identificador-aprob/tramite-solicitud-baja-identificador-aprob.component';
import { ConsultaSolicitudesReareteoComponent } from './solicitudes/consulta-solicitudes-reareteo/consulta-solicitudes-reareteo.component';
import { ConsultaSolicitudesBajaIdentificadorComponent } from './solicitudes/consulta-solicitudes-baja-identificador/consulta-solicitudes-baja-identificador.component';
import { HistorialSolicitudesReareteoComponent } from './solicitudes/historial-solicitudes-reareteo/historial-solicitudes-reareteo.component';
import { HistorialSolicitudesBajaIdentificadorComponent } from './solicitudes/historial-solicitudes-baja-identificador/historial-solicitudes-baja-identificador.component';
import { AsignarRolesInternosComponent } from './usuarios-internos/asignar-roles-internos/asignar-roles-internos.component';
import { CorreccionesCatastroComponent } from './solicitudes/correcciones-catastro/correcciones-catastro.component';
import { CorreccionCatastroComponent } from './solicitudes/correccion-catastro/correccion-catastro.component';
import { FasesVacunacionComponent } from './vacunacion/fases-vacunacion/fases-vacunacion.component';
import { RolesComponent } from './sistema/roles/roles.component';
import { RolComponent } from './sistema/rol/rol.component';
import { ListaOperadorasVacunacionComponent } from './vacunacion/lista-operadoras-vacunacion/lista-operadoras-vacunacion.component';
import { ListaZonasComponent } from './vacunacion/lista-zonas/lista-zonas.component';
import { ZonaCoberturaComponent } from './vacunacion/zona-cobertura/zona-cobertura.component';
import { OficinasFasesVacunacionesComponent } from './vacunacion/oficinas-fases-vacunaciones/oficinas-fases-vacunaciones.component';
import { OficinasOperadorasComponent } from './vacunacion/oficinas-operadoras/oficinas-operadoras.component';
import { PersonalOperadoraComponent } from './vacunacion/personal-operadora/personal-operadora.component';
import { CrearUsuarioExternoComponent } from './usuarios-externos/crear-usuario-externo/crear-usuario-externo.component';
import { PersonalOficinaOperadoraComponent } from './vacunacion/personal-oficina-operadora/personal-oficina-operadora.component';
import { ListaCertificadosVacunacionComponent } from './vacunacion/lista-certificados-vacunacion/lista-certificados-vacunacion.component';
import { CambioDominioBovinoComponent } from './catastro/cambio-dominio-bovino/cambio-dominio-bovino.component';
import { RegistroSitioModalComponent } from './gestion-sitios/registro-sitio-modal/registro-sitio-modal.component';
import { RegistroAreaModalComponent } from './gestion-sitios/registro-area-modal/registro-area-modal.component';
import { GeneralModule } from './general/general.module';
import { CambiarContrasenaExternoComponent } from './usuarios-externos/cambiar-contrasena-externo/cambiar-contrasena-externo.component';
import { CambiarContrasenaInternoComponent } from './usuarios-internos/cambiar-contrasena-interno/cambiar-contrasena-interno.component';
import { CambiarClaveCaducadaExternoComponent } from './login/cambiar-clave-caducada-externo/cambiar-clave-caducada-externo.component';
import { CambiarClaveCaducadaInternoComponent } from './login/cambiar-clave-caducada-interno/cambiar-clave-caducada-interno.component';
import { RecuperarContrasenaExternoComponent } from './login/recuperar-contrasena-externo/recuperar-contrasena-externo.component';
import { RecuperarContrasenaInternoComponent } from './login/recuperar-contrasena-interno/recuperar-contrasena-interno.component';
import { VerificarEmailExternoComponent } from './login/verificar-email-externo/verificar-email-externo.component';
import { GenerarVerificacionEmailComponent } from './usuarios-externos/generar-verificacion-email/generar-verificacion-email.component';
import { CambiarCedulaRucExternoComponent } from './usuarios-externos/cambiar-cedula-ruc-externo/cambiar-cedula-ruc-externo.component';
import { ListarNotificacionesComponent } from './notificaciones/listar-notificaciones/listar-notificaciones.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AsignacionSolicitudesComponent } from './solicitudes/asignacion-solicitudes/asignacion-solicitudes.component';
import { ConsultaSitiosPendientesComponent } from './gestion-sitios/consulta-sitios-pendientes/consulta-sitios-pendientes.component';
import { ReasignacionSolicitudesComponent } from './solicitudes/reasignacion-solicitudes/reasignacion-solicitudes.component';
import { DelegarRolesInternosComponent } from './usuarios-internos/delegar-roles-internos/delegar-roles-internos.component';
import { GestionarDelegacionesComponent } from './usuarios-internos/gestionar-delegaciones/gestionar-delegaciones.component';
import { VerificarCatastroComponent } from './catastro/verificar-catastro/verificar-catastro.component';
import { VehiculosComponent } from './movilizacion/vehiculos/vehiculos.component';
import { ListaVehiculosComponent } from './movilizacion/lista-vehiculos/lista-vehiculos.component';
import { AgregarVehiculoComponent } from './movilizacion/agregar-vehiculo/agregar-vehiculo.component';
import { ListaTransportistasComponent } from './movilizacion/lista-transportistas/lista-transportistas.component';
import { AgregarTransportistaComponent } from './movilizacion/agregar-transportista/agregar-transportista.component';
import { CreacionRegistroMarcaComponent } from './catastro/creacion-registro-marca/creacion-registro-marca.component';
import { GestionRegistroMarcaComponent } from './catastro/gestion-registro-marca/gestion-registro-marca.component';
import { RegistroEventoBovinoComponent } from './catastro/registro-evento-bovino/registro-evento-bovino.component';
import { RegistroFeriasExposicionComponent } from './gestion-sitios/registro-ferias-exposicion/registro-ferias-exposicion.component';
import { CertificadosMovilizacionComponent } from './movilizacion/certificados-movilizacion/certificados-movilizacion.component';
import { UsuariosExternosComponent } from './usuarios-externos/usuarios-externos/usuarios-externos.component';
import { CreacionIncidenteComponent } from './incidentes/creacion-incidente/creacion-incidente.component';
import { GestionIncidenteComponent } from './incidentes/gestion-incidente/gestion-incidente.component';
import {DatePipe} from '@angular/common';
import { ActualizarDatosUsuarioExternoComponent } from './usuarios-externos/actualizar-datos-usuario-externo/actualizar-datos-usuario-externo.component';
import { ActualizarPerfilUsuarioExternoComponent } from './usuarios-externos/actualizar-perfil-usuario-externo/actualizar-perfil-usuario-externo.component';
import { ActivarPreregistroExternoComponent } from './usuarios-externos/activar-preregistro-externo/activar-preregistro-externo.component';
import { CrearUsuarioExternoExtranjeroComponent } from './usuarios-externos/crear-usuario-externo-extranjero/crear-usuario-externo-extranjero.component';
import { CrearUsuarioExternoCcaComponent } from './usuarios-externos/crear-usuario-externo-cca/crear-usuario-externo-cca.component';
import { CrearUsuarioExternoEmpleadoComponent } from './usuarios-externos/crear-usuario-externo-empleado/crear-usuario-externo-empleado.component';
import { CrearUsuarioExternoConsultaComponent } from './usuarios-externos/crear-usuario-externo-consulta/crear-usuario-externo-consulta.component';
import { SecuenciaCertificadoComponent } from './vacunacion/secuencia-certificado/secuencia-certificado.component';
import { CertificadosVacunacionProductorComponent } from './vacunacion/certificados-vacunacion-productor/certificados-vacunacion-productor.component';
import { PrediosVacunadosComponent } from './vacunacion/predios-vacunados/predios-vacunados.component';
import { PrediosVacunadosOperadoraComponent } from './vacunacion/predios-vacunados-operadora/predios-vacunados-operadora.component';
import { DosisAplicadasOperadoraComponent } from './vacunacion/dosis-aplicadas-operadora/dosis-aplicadas-operadora.component';
import { EliminarCertificadoVacunacionComponent } from './vacunacion/eliminar-certificado-vacunacion/eliminar-certificado-vacunacion.component';
import { RegistroCentrosHospedajeComponent } from './gestion-sitios/registro-centros-hospedaje/registro-centros-hospedaje.component';
import { ActualizacionSitiosComponent } from './gestion-sitios/actualizacion-sitios/actualizacion-sitios.component';
import { CertificadosMovilizacionRecibidosComponent } from './movilizacion/certificados-movilizacion-recibidos/certificados-movilizacion-recibidos.component';
import { TramitarCertificadoMovilizacionComponent } from './movilizacion/tramitar-certificado-movilizacion/tramitar-certificado-movilizacion.component';
import { ConsultarCertificadoTicketComponent } from './movilizacion/consultar-certificado-ticket/consultar-certificado-ticket.component';
import { AutorizarMovilizacionCentrosComponent } from './movilizacion/autorizar-movilizacion-centros/autorizar-movilizacion-centros.component';
import { InformacionCatastroComponent } from './catastro/informacion-catastro/informacion-catastro.component';

// Imports consultoria SIFAE Aretes Oficiales
import { NgxMaskModule } from "ngx-mask";
import { SolicitudAretesComponent } from "./solicitudes/solicitud-aretes/solicitud-aretes.component";
import { SolicitudAretesOperadorComponent } from "./solicitudes/solicitud-aretes-operador/solicitud-aretes-operador.component";
import { TramitarSolicitudAretesProveedorComponent } from "./solicitudes/tramitar-solicitud-aretes-proveedor/tramitar-solicitud-aretes-proveedor.component";
import { TramitarSolicitudAretesInternoComponent } from "./solicitudes/tramitar-solicitud-aretes-interno/tramitar-solicitud-aretes-interno.component";
import { RegistrarProveedorAretesComponent } from "./usuarios-externos/registrar-proveedor-aretes/registrar-proveedor-aretes.component";
import { TramitarSolicitudExtempoInternoComponent } from "./solicitudes/tramitar-solicitud-extempo-interno/tramitar-solicitud-extempo-interno.component";
import { AsignarAreteBovinoComponent } from "./catastro/asignar-arete-bovino/asignar-arete-bovino.component";
import { AsignarAreteBovinoOperadorComponent } from "./catastro/asignar-arete-bovino-operador/asignar-arete-bovino-operador.component";
import { RegistrarBajasAnimalesComponent } from "./catastro/registrar-bajas-animales/registrar-bajas-animales.component";
import { ConsultarAnimalesIdentificacionComponent } from "./catastro/consultar-animales-identificacion/consultar-animales-identificacion.component";
import { RegistrarNacimientosComponent } from "./catastro/registrar-nacimientos/registrar-nacimientos.component";
import { CrearDocumentoMovilizacionComponent } from './movilizacion/crear-documento-movilizacion/crear-documento-movilizacion.component';
import { BajaAretesBovinoComponent } from './solicitudes/baja-aretes-bovino/baja-aretes-bovino.component';
import { ConsultarAnimalesOperadorComponent } from "./catastro/consultar-animales-operador/consultar-animales-operador.component";
import { FiscalizarMovilizacionExternoComponent } from './movilizacion/fiscalizar-movilizacion-externo/fiscalizar-movilizacion-externo.component';
import { CrearDocumentoMovilizacionCcaComponent } from './movilizacion/crear-documento-movilizacion-cca/crear-documento-movilizacion-cca.component';
import { DocumentosEmitidosCcaComponent } from './movilizacion/documentos-emitidos-cca/documentos-emitidos-cca.component';
import { TransferirAretesOficialesComponent } from './solicitudes/transferir-aretes-oficiales/transferir-aretes-oficiales.component';
import { RegistrarCertificadoVacunacionComponent } from './vacunacion/registrar-certificado-vacunacion/registrar-certificado-vacunacion.component';
import { ActualizarCategoriasAnimalesComponent } from "./catastro/actualizar-categorias-animales/actualizar-categorias-animales.component";
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrarUsuarioExternoComponent,
    RegistroExplotacionesPecuariasComponent,
    BovinoComponent,
    //ak BovinoMasivoComponent,
    RegistroSitiosComponent,
    RegistroSitiosUsuarioInternoComponent,
    RegistroSitiosCatalogoComponent,
    RegistroSitiosComponent,
    RegistroCertificacionesComponent,
    ConsultaSitiosComponent,
    SolicitudIdentificadorComponent,
    CatastroComponent,
    CrearUsuarioInternoComponent,
    LoginInternoComponent,
    RegistroCentrosFaenamientoComponent,
    RegistroFeriasComercializacionComponent,
    RegistroComerciosIdentificadoresComponent,
    ConsultaSolicitudesIdentificacionComponent,
    TramiteSolicitudIdentificadorComponent,
    TramiteSolicitudIdentificadorProvComponent,
    TramiteSolicitudIdentificadorAprobComponent,
    HistorialSolicitudesIdentificacionComponent,
    CrearCsmiComponent,
    CrearCzpmCcaComponent,
    LoginExternoComponent,
    DirectorioProveedoresComponent,
    BajaBovinoComponent,
    AprobacionRegistroSitiosComponent,
    OperadoraVacunacionComponent,
    CertificadoVacunacionComponent,
    FaseVacunacionComponent,
    AsignarNumeracionProvinciaComponent,
    AsignarNumeracionOperadoraComponent,
    AsignarNumeracionOficinaComponent,
    SolicitudReareteoComponent,
    SolicitudBajaIdentificadorComponent,
    TramiteSolicitudReareteoComponent,
    TramiteSolicitudReareteoProvComponent,
    TramiteSolicitudReareteoAprobComponent,
    TramiteSolicitudBajaIdentificadorAprobComponent,
    ConsultaSolicitudesReareteoComponent,
    ConsultaSolicitudesBajaIdentificadorComponent,
    HistorialSolicitudesReareteoComponent,
    HistorialSolicitudesBajaIdentificadorComponent,
    AsignarRolesInternosComponent,
    CorreccionesCatastroComponent,
    CorreccionCatastroComponent,
    FasesVacunacionComponent,
    RolesComponent,
    RolComponent,
    ListaOperadorasVacunacionComponent,
    ListaZonasComponent,
    ZonaCoberturaComponent,
    OficinasFasesVacunacionesComponent,
    OficinasOperadorasComponent,
    PersonalOperadoraComponent,
    CrearUsuarioExternoComponent,
    OficinasOperadorasComponent,
    PersonalOficinaOperadoraComponent,
    ListaCertificadosVacunacionComponent,
    RegistroSitioModalComponent,
    RegistroAreaModalComponent,
    CambiarContrasenaExternoComponent,
    CambiarContrasenaInternoComponent,
    CambiarClaveCaducadaExternoComponent,
    CambiarClaveCaducadaInternoComponent,
    RecuperarContrasenaExternoComponent,
    RecuperarContrasenaInternoComponent,
    VerificarEmailExternoComponent,
    GenerarVerificacionEmailComponent,
    CambiarCedulaRucExternoComponent,
    ListarNotificacionesComponent,
    AsignacionSolicitudesComponent,
    ConsultaSitiosPendientesComponent,
    ReasignacionSolicitudesComponent,
    DelegarRolesInternosComponent,
    GestionarDelegacionesComponent,
    VerificarCatastroComponent,
    VehiculosComponent,
    ListaVehiculosComponent,
    AgregarVehiculoComponent,
    ListaTransportistasComponent,
    AgregarTransportistaComponent,
    CambioDominioBovinoComponent,
    CreacionRegistroMarcaComponent,
    GestionRegistroMarcaComponent,
    RegistroEventoBovinoComponent,
    RegistroFeriasExposicionComponent,
    CertificadosMovilizacionComponent,
    UsuariosExternosComponent,
    CreacionIncidenteComponent,
    GestionIncidenteComponent,
    ActualizarDatosUsuarioExternoComponent,
    ActualizarPerfilUsuarioExternoComponent,
    ActivarPreregistroExternoComponent,
    CrearUsuarioExternoExtranjeroComponent,
    CrearUsuarioExternoCcaComponent,
    CrearUsuarioExternoEmpleadoComponent,
    CrearUsuarioExternoConsultaComponent,
    SecuenciaCertificadoComponent,
    CertificadosVacunacionProductorComponent,
    PrediosVacunadosComponent,
    PrediosVacunadosOperadoraComponent,
    DosisAplicadasOperadoraComponent,
    EliminarCertificadoVacunacionComponent,
    RegistroCentrosHospedajeComponent,
    ActualizacionSitiosComponent,
    CertificadosMovilizacionRecibidosComponent,
    TramitarCertificadoMovilizacionComponent,
    ConsultarCertificadoTicketComponent,
    AutorizarMovilizacionCentrosComponent,
    InformacionCatastroComponent,
    //Declaraciones consultoría SIFAE Aretes Oficiales
    RegistrarProveedorAretesComponent,
    SolicitudAretesComponent,
    SolicitudAretesOperadorComponent,
    TramitarSolicitudAretesProveedorComponent,
    TramitarSolicitudAretesInternoComponent,
    TramitarSolicitudExtempoInternoComponent,
    AsignarAreteBovinoComponent,
    AsignarAreteBovinoOperadorComponent,
    RegistrarBajasAnimalesComponent,
    ConsultarAnimalesIdentificacionComponent,
    RegistrarNacimientosComponent,
    CrearDocumentoMovilizacionComponent,
    BajaAretesBovinoComponent,
    ConsultarAnimalesOperadorComponent,
    FiscalizarMovilizacionExternoComponent,
    CrearDocumentoMovilizacionCcaComponent,
    DocumentosEmitidosCcaComponent,
    TransferirAretesOficialesComponent,
    RegistrarCertificadoVacunacionComponent,
    ActualizarCategoriasAnimalesComponent
  ],
  imports: [
    BrowserModule,
    APP_ROUTES,
    PaginasModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    AgmCoreModule,
    GeneralModule,
    FontAwesomeModule,
    //Imports librerías consultoria SIFAE Aretes Oficiales
    NgxMaskModule.forRoot() // Importante: forRoot() para configuración global
  ],
  providers: [
    SitioService,
    PaisService,
    ProvinciaService,
    CantonService,
    ParroquiaService,
    CertificacionService,
    EstadoCertificacionService,
    ProveedorIdentificadorService,
    SolicitudIdentificadorService,
    EstadoSolicitudService,
    SolicitudReareteoService,
    DatePipe,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorAutenticacion, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
