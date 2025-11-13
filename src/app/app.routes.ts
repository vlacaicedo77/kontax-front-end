import { RouterModule, Routes, CanActivate } from '@angular/router';

// Página principal
import { PaginasComponent } from './paginas/paginas.component';
// Páginas secundarias.
import { InicioComponent } from './paginas/inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { LoginInternoComponent } from './login/login-interno/login-interno.component';
import { RegistrarUsuarioExternoComponent } from './login/registrar-usuario-externo/registrar-usuario-externo.component';
import { NopagefoundComponent } from './general/nopagefound/nopagefound.component';
import { BovinoComponent } from './catastro/bovino/bovino.component';
//ak import { BovinoMasivoComponent } from './catastro/bovino/bovino-masivo.component';
import { BajaBovinoComponent } from './catastro/baja-bovino/baja-bovino.component';
import { SolicitudIdentificadorComponent } from './solicitudes/solicitud-identificador/solicitud-identificador.component';
import { CrearCsmiComponent } from './movilizacion/crear-csmi/crear-csmi.component';
import { CrearCzpmCcaComponent } from './movilizacion/crear-czpm-cca/crear-czpm-cca.component';
import { SlctrAnulacionCsmiComponent } from './paginas/slctr-anulacion-csmi/slctr-anulacion-csmi.component';
import { CatastroComponent } from './catastro/catastro/catastro.component';
import { ConsultaSitiosComponent } from './gestion-sitios/consulta-sitios/consulta-sitios.component';
import { RegistroCertificacionesComponent } from './gestion-sitios/registro-certificaciones/registro-certificaciones.component';
import { RegistroExplotacionesPecuariasComponent } from './gestion-sitios/registro-explotaciones-pecuarias/registro-explotaciones-pecuarias.component';
import { RegistroSitiosComponent } from './gestion-sitios/registro-sitios/registro-sitios.component';
import { RegistroSitiosUsuarioInternoComponent } from './gestion-sitios/registro-sitios-usuario-interno/registro-sitios-usuario-interno.component';
import { RegistroSitiosCatalogoComponent } from './gestion-sitios/registro-sitios-catalogo/registro-sitios-catalogo.component';
import { CrearUsuarioInternoComponent } from './usuarios-internos/crear-usuario-interno/crear-usuario-interno.component';
import { SlctdAcreditacionVetComponent } from './paginas/slctd-acreditacion-vet/slctd-acreditacion-vet.component';
import { AprbrAcreditacionVetComponent } from './paginas/aprbr-acreditacion-vet/aprbr-acreditacion-vet.component';
import { RegistroCentrosFaenamientoComponent } from './gestion-sitios/registro-centros-faenamiento/registro-centros-faenamiento.component';
import { RegistroFeriasComercializacionComponent } from './gestion-sitios/registro-ferias-comercializacion/registro-ferias-comercializacion.component';
import { RegistroComerciosIdentificadoresComponent } from './gestion-sitios/registro-comercios-identificadores/registro-comercios-identificadores.component';
import { ConsultaSolicitudesIdentificacionComponent } from './solicitudes/consulta-solicitudes-identificacion/consulta-solicitudes-identificacion.component';
import { HistorialSolicitudesIdentificacionComponent } from './solicitudes/historial-solicitudes-identificacion/historial-solicitudes-identificacion.component';
import { TramiteSolicitudIdentificadorComponent } from './solicitudes/tramite-solicitud-identificador/tramite-solicitud-identificador.component';
import { TramiteSolicitudIdentificadorAprobComponent } from './solicitudes/tramite-solicitud-identificador-aprob/tramite-solicitud-identificador-aprob.component';
import { TramiteSolicitudIdentificadorProvComponent } from './solicitudes/tramite-solicitud-identificador-prov/tramite-solicitud-identificador-prov.component';
import { LoginGuardService } from './servicios/login-guard/login-guard.service';
import { LoginExternoComponent } from './login/login-externo/login-externo.component';
import { DirectorioProveedoresComponent } from './informacion/directorio-proveedores/directorio-proveedores.component';
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
import { CorreccionesCatastroComponent } from './solicitudes/correcciones-catastro/correcciones-catastro.component';
import { CorreccionCatastroComponent } from './solicitudes/correccion-catastro/correccion-catastro.component';
import { FasesVacunacionComponent } from './vacunacion/fases-vacunacion/fases-vacunacion.component';
import { RolesComponent } from './sistema/roles/roles.component';
import { RolComponent } from './sistema/rol/rol.component';
import { ListaOperadorasVacunacionComponent } from './vacunacion/lista-operadoras-vacunacion/lista-operadoras-vacunacion.component';
import { ListaZonasComponent } from './vacunacion/lista-zonas/lista-zonas.component';
import { ZonaCoberturaComponent } from './vacunacion/zona-cobertura/zona-cobertura.component';
import { OficinasFasesVacunacionesComponent } from './vacunacion/oficinas-fases-vacunaciones/oficinas-fases-vacunaciones.component';
import { AsignarRolesInternosComponent } from './usuarios-internos/asignar-roles-internos/asignar-roles-internos.component';
import { OficinasOperadorasComponent } from './vacunacion/oficinas-operadoras/oficinas-operadoras.component';
import { PersonalOperadoraComponent } from './vacunacion/personal-operadora/personal-operadora.component';
import { PersonalOficinaOperadoraComponent } from './vacunacion/personal-oficina-operadora/personal-oficina-operadora.component';
import { CambiarContrasenaExternoComponent } from './usuarios-externos/cambiar-contrasena-externo/cambiar-contrasena-externo.component';
import { CambiarContrasenaInternoComponent } from './usuarios-internos/cambiar-contrasena-interno/cambiar-contrasena-interno.component';
import { CambiarClaveCaducadaExternoComponent } from './login/cambiar-clave-caducada-externo/cambiar-clave-caducada-externo.component';
import { CambiarClaveCaducadaInternoComponent } from './login/cambiar-clave-caducada-interno/cambiar-clave-caducada-interno.component';
import { RecuperarContrasenaExternoComponent } from './login/recuperar-contrasena-externo/recuperar-contrasena-externo.component';
import { RecuperarContrasenaInternoComponent } from './login/recuperar-contrasena-interno/recuperar-contrasena-interno.component';
import { VerificarEmailExternoComponent } from './login/verificar-email-externo/verificar-email-externo.component';
import { GenerarVerificacionEmailComponent } from './usuarios-externos/generar-verificacion-email/generar-verificacion-email.component';
import { CambiarCedulaRucExternoComponent } from './usuarios-externos/cambiar-cedula-ruc-externo/cambiar-cedula-ruc-externo.component';
import { ListaCertificadosVacunacionComponent } from './vacunacion/lista-certificados-vacunacion/lista-certificados-vacunacion.component';
import { CambioDominioBovinoComponent } from './catastro/cambio-dominio-bovino/cambio-dominio-bovino.component';
import { ListaTransportistasComponent } from './movilizacion/lista-transportistas/lista-transportistas.component';
import { ListaVehiculosComponent } from './movilizacion/lista-vehiculos/lista-vehiculos.component';
import { VehiculosComponent } from './movilizacion/vehiculos/vehiculos.component';
import { VerificarCatastroComponent } from './catastro/verificar-catastro/verificar-catastro.component';
import { ListarNotificacionesComponent } from './notificaciones/listar-notificaciones/listar-notificaciones.component';
import { AsignacionSolicitudesComponent } from './solicitudes/asignacion-solicitudes/asignacion-solicitudes.component';
import { ConsultaSitiosPendientesComponent } from './gestion-sitios/consulta-sitios-pendientes/consulta-sitios-pendientes.component';
import { ReasignacionSolicitudesComponent } from './solicitudes/reasignacion-solicitudes/reasignacion-solicitudes.component';
import { DelegarRolesInternosComponent } from './usuarios-internos/delegar-roles-internos/delegar-roles-internos.component';
import { GestionarDelegacionesComponent } from './usuarios-internos/gestionar-delegaciones/gestionar-delegaciones.component';
import { CreacionRegistroMarcaComponent } from './catastro/creacion-registro-marca/creacion-registro-marca.component';
import { GestionRegistroMarcaComponent } from './catastro/gestion-registro-marca/gestion-registro-marca.component';
import { RegistroEventoBovinoComponent } from './catastro/registro-evento-bovino/registro-evento-bovino.component';
import { RegistroFeriasExposicionComponent } from './gestion-sitios/registro-ferias-exposicion/registro-ferias-exposicion.component';
import { CertificadosMovilizacionComponent } from './movilizacion/certificados-movilizacion/certificados-movilizacion.component';
import { UsuariosExternosComponent } from './usuarios-externos/usuarios-externos/usuarios-externos.component';
import { CreacionIncidenteComponent } from './incidentes/creacion-incidente/creacion-incidente.component';
import { GestionIncidenteComponent } from './incidentes/gestion-incidente/gestion-incidente.component';
import { ActualizarPerfilUsuarioExternoComponent } from './usuarios-externos/actualizar-perfil-usuario-externo/actualizar-perfil-usuario-externo.component';
import { ActualizarDatosUsuarioExternoComponent } from './usuarios-externos/actualizar-datos-usuario-externo/actualizar-datos-usuario-externo.component';
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
import { AdminGuardService } from './servicios/admin-guard.service';
import { TramitarCertificadoMovilizacionComponent } from './movilizacion/tramitar-certificado-movilizacion/tramitar-certificado-movilizacion.component';
import { ConsultarCertificadoTicketComponent } from './movilizacion/consultar-certificado-ticket/consultar-certificado-ticket.component';
import { AutorizarMovilizacionCentrosComponent } from './movilizacion/autorizar-movilizacion-centros/autorizar-movilizacion-centros.component';
import { InformacionCatastroComponent } from './catastro/informacion-catastro/informacion-catastro.component';

// Imports Consultoria SIFAE Aretes Oficiales
import { RegistrarProveedorAretesComponent } from './usuarios-externos/registrar-proveedor-aretes/registrar-proveedor-aretes.component';
import { SolicitudAretesComponent } from './solicitudes/solicitud-aretes/solicitud-aretes.component';
import { SolicitudAretesOperadorComponent } from './solicitudes/solicitud-aretes-operador/solicitud-aretes-operador.component';
import { TramitarSolicitudAretesProveedorComponent } from "./solicitudes/tramitar-solicitud-aretes-proveedor/tramitar-solicitud-aretes-proveedor.component";
import { TramitarSolicitudAretesInternoComponent } from "./solicitudes/tramitar-solicitud-aretes-interno/tramitar-solicitud-aretes-interno.component";
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

// Especificamos las rutas que serán utilizadas en la aplicación.
const appRoutes: Routes = [
    // Página principal con las rutas hijas luego de iniciar sesión.
    {
        path: '',
        component: PaginasComponent,
        canActivate: [LoginGuardService],
        canActivateChild: [AdminGuardService],
        // Rutas hijas.
        children: [
            {path: 'inicio', component: InicioComponent},
            // ===========================================================
            // Catastro
            {path: 'catastro', component: CatastroComponent},
            {path: 'baja-bovino/:id', component: BajaBovinoComponent},
            {path: 'solicitudes-correcciones-catastro', component: CorreccionesCatastroComponent},
            {path: 'correccion-catastro/:id', component: CorreccionCatastroComponent},
            {path: 'verificar-catastro', component: VerificarCatastroComponent},
            {path: 'crear-registro-marca', component: CreacionRegistroMarcaComponent},
            {path: 'gestionar-registro-marca', component: GestionRegistroMarcaComponent},
            {path: 'registrar-evento-bovino', component: RegistroEventoBovinoComponent},
            //ak {path: 'bovino-masivo', component: BovinoMasivoComponent},
            // Consulta el catastro de un productor por predio
            {path: 'informacion-catastro', component: InformacionCatastroComponent},
            // Proceso de cambio de dominio de los bovinos
            {path: 'cambiar-dominio-bovino', component: CambioDominioBovinoComponent},
            // En proceso
            // Falta
            {path: 'bovino/:id', component: BovinoComponent},

            // ===========================================================
            // Identificación
            {path: 'solicitar-identificadores', component: SolicitudIdentificadorComponent},
            {path: 'solicitar-reareteo', component: SolicitudReareteoComponent},
            {path: 'solicitar-baja-identificador', component: SolicitudBajaIdentificadorComponent},
            {path: 'consulta-solicitudes-identificacion', component: ConsultaSolicitudesIdentificacionComponent},
            {path: 'consulta-solicitudes-reareteo', component: ConsultaSolicitudesReareteoComponent},
            {path: 'consulta-solicitudes-baja-identificador', component: ConsultaSolicitudesBajaIdentificadorComponent},
            {path: 'historial-solicitudes-identificacion', component: HistorialSolicitudesIdentificacionComponent},
            {path: 'historial-solicitudes-reareteo', component: HistorialSolicitudesReareteoComponent},
            {path: 'historial-solicitudes-baja-identificador', component: HistorialSolicitudesBajaIdentificadorComponent},
            {path: 'tramite-solicitud-identificador-ganadero', component: TramiteSolicitudIdentificadorComponent},
            {path: 'tramite-solicitud-identificador-agrocalidad', component: TramiteSolicitudIdentificadorAprobComponent},
            {path: 'tramite-solicitud-identificador-proveedor', component: TramiteSolicitudIdentificadorProvComponent},
            {path: 'tramite-solicitud-reareteo-ganadero', component: TramiteSolicitudReareteoComponent},
            {path: 'tramite-solicitud-reareteo-agrocalidad', component: TramiteSolicitudReareteoAprobComponent},
            {path: 'tramite-solicitud-reareteo-proveedor', component: TramiteSolicitudReareteoProvComponent},
            {path: 'tramite-solicitud-baja-identificador-agrocalidad', component: TramiteSolicitudBajaIdentificadorAprobComponent},

            // ===========================================================
            // Movilización
            // Lista de transportistas que se muestra a los usuarios externos
            { path: 'lista-transportistas', component: ListaTransportistasComponent },
            // Consulta la lista de vehículos asignados para habilitarlos o deshabilitarlos por el técnico de Agrocalidad
            {path: 'vehiculos', component: VehiculosComponent},
            // Consulta y permite agregar nuevos vehículos por parte del productor
            {path: 'lista-vehiculos', component: ListaVehiculosComponent},
            // Crear certificado de movilización
            {path: 'crear-csmi', component: CrearCsmiComponent},
            // Crear certificado de movilización centros de concentración de animales
            {path: 'crear-czpm-cca', component: CrearCzpmCcaComponent},
            // Muestra los certificados de Movilización al productor
            {path: 'certificados-movilizacion-emitidos', component: CertificadosMovilizacionComponent},
            // Muestra los Certificados de Movilización Recibidos para su confirmación
            {path: 'certificados-movilizacion-recibidos', component: CertificadosMovilizacionRecibidosComponent},
            // Muestra los certificados de movilización para autorizar su entrada, salida o anularlos
            {path: 'tramitar-certificados-movilizacion', component: TramitarCertificadoMovilizacionComponent},
            // Muestra los certificados de movilización según el número de ticket (identificación bovino)
            {path: 'consultar-certificados-ticket', component: ConsultarCertificadoTicketComponent},
            // Muestra los certificados emitidos por el centro para ser autorizados
            {path: 'autorizar-certificados-centros', component: AutorizarMovilizacionCentrosComponent},

            // ===========================================================
            // Falta
            {path: 'slctr-anulacion-csmi', component: SlctrAnulacionCsmiComponent},
            {path: 'slctd-acreditacion-vet', component: SlctdAcreditacionVetComponent},
            {path: 'aprbr-acreditacion-vet', component: AprbrAcreditacionVetComponent},

            // ===========================================================
            // Gestión de sitios
            {path: 'consulta-sitios', component: ConsultaSitiosComponent},
            {path: 'registro-certificaciones', component: RegistroCertificacionesComponent},
            {path: 'registro-explotaciones-pecuarias', component: RegistroExplotacionesPecuariasComponent},
            {path: 'registro-sitios', component: RegistroSitiosComponent},
            {path: 'registro-sitios-usuario-interno', component: RegistroSitiosUsuarioInternoComponent},
            {path: 'registro-sitios-catalogo', component: RegistroSitiosCatalogoComponent},
            {path: 'registro-centros-faenamiento', component: RegistroCentrosFaenamientoComponent},
            {path: 'registro-ferias-comercializacion', component: RegistroFeriasComercializacionComponent},
            {path: 'registro-comercios-identificadores', component: RegistroComerciosIdentificadoresComponent},
            {path: 'aprobacion-registro-sitios', component: AprobacionRegistroSitiosComponent},
            {path: 'aprobacion-registro-sitios/:id', component: AprobacionRegistroSitiosComponent},
            {path: 'consultar-sitios-pendientes', component: ConsultaSitiosPendientesComponent},
            {path: 'registro-ferias-exposicion', component: RegistroFeriasExposicionComponent},
            {path: 'registro-centros-hospedaje', component: RegistroCentrosHospedajeComponent},
            {path: 'actualizacion-sitios', component: ActualizacionSitiosComponent},
            // ===========================================================
            //Informacion
            {path: 'directorio-proveedores-identificacion', component: DirectorioProveedoresComponent},
            {path: 'listado-notificaciones', component: ListarNotificacionesComponent},
            // ===========================================================
            //Gestión de usuarios internos
            {path: 'crear-usuario-interno', component: CrearUsuarioInternoComponent},
            {path: 'slctd-acreditacion-vet', component: SlctdAcreditacionVetComponent},
            {path: 'roles', component: RolesComponent},
            {path: 'rol/:id', component: RolComponent},
            {path: 'asignacion-roles-internos', component: AsignarRolesInternosComponent},
            {path: 'cambiar-contrasena-interno', component: CambiarContrasenaInternoComponent},
            {path: 'asignar-solicitudes', component: AsignacionSolicitudesComponent},
            {path: 'reasignar-solicitudes', component: ReasignacionSolicitudesComponent},
            {path: 'delegar-rol-interno', component: DelegarRolesInternosComponent},
            {path: 'gestionar-delegacion-interno', component: GestionarDelegacionesComponent},
            // ===========================================================
            //Gestión de usuarios externos
            {path: 'cambiar-contrasena-externo', component: CambiarContrasenaExternoComponent},
            {path: 'generar-verificacion-email', component: GenerarVerificacionEmailComponent},
            {path: 'cambiar-cedula-ruc-externo', component: CambiarCedulaRucExternoComponent},
            {path: 'usuarios-externos', component: UsuariosExternosComponent},
            {path: 'actualizar-perfil-externo', component: ActualizarPerfilUsuarioExternoComponent},
            {path: 'actualizar-usuario-externo', component: ActualizarDatosUsuarioExternoComponent},
            {path: 'activar-usuario-externo', component: ActivarPreregistroExternoComponent},
            {path: 'cambiar-cedula-ruc-externo',component: CambiarCedulaRucExternoComponent},
            {path: 'crear-usuario-externo-extranjero',component: CrearUsuarioExternoExtranjeroComponent},
            {path: 'crear-usuario-externo-cca',component: CrearUsuarioExternoCcaComponent},
            {path: 'crear-usuario-externo-empleado',component: CrearUsuarioExternoEmpleadoComponent},
            {path: 'crear-usuario-externo-consulta',component: CrearUsuarioExternoConsultaComponent},
            // ===========================================================
            //Incidentes
            {path: 'crear-incidente', component: CreacionIncidenteComponent},
            {path: 'gestionar-incidente', component: GestionIncidenteComponent},
            // ===========================================================
            /* Vacunación */
            // Lista las fases de vacunación registradas
            {path: 'lista-fases-vacunacion', component: FasesVacunacionComponent},
            // Crea, actualiza o finaliza una fase de vacunación
            {path: 'fase-vacunacion/:id', component: FaseVacunacionComponent},
            // Lista las operadoras de vacunación
            {path: 'lista-operadoras-vacunacion', component: ListaOperadorasVacunacionComponent},
            // Crea, actualiza o habilita una operadora de vacunación
            {path: 'operadora-vacunacion/:id', component: OperadoraVacunacionComponent},
            // Asigna un técnico a una oficina provincial de Agrocalidad
            {path: 'lista-oficinas-fases', component: OficinasFasesVacunacionesComponent},
            // Asigna la numeración a las oficinas provinciales de Agrocalidad
            {path: 'asignar-numeracion-provincia', component: AsignarNumeracionProvinciaComponent},
            // Lista de las zonas que abarcará a las operadoras y a las ubicaciones(provinica, cantón, parroquia)
            {path: 'lista-zonas', component: ListaZonasComponent},
            // Agregar coberturas y operadoras a zonas
            {path: 'zona-cobertura/:id', component: ZonaCoberturaComponent},
            // Permite que la operadora agregue sus oficinas 
            {path: 'oficinas-operadoras', component: OficinasOperadorasComponent},
            // Permite agregar persona (digitadoras y brigadistas) a la operadora
            {path: 'personal-operadora', component: PersonalOperadoraComponent},
            // Permite que la operadora de vacunación agrega brigadistas, digitadores y coberturas a la oficina.
            {path: 'personal-oficina-operadora', component: PersonalOficinaOperadoraComponent},
            // Las oficinas provinciales asignan la numeración a las operadoras
            {path: 'asignar-numeracion-operadora', component: AsignarNumeracionOperadoraComponent},
            // Las operadoras de vacunación asignan las numeración de certificados a las oficinas
            {path: 'asignar-numeracion-oficina', component: AsignarNumeracionOficinaComponent},
            // Lista de certificados de vacunación emitidos por la oficina
            {path: 'lista-certificados-vacunacion', component: ListaCertificadosVacunacionComponent},
            // Crea un nuevo certificado de vacunación
            {path: 'certificado-vacunacion/:id', component: CertificadoVacunacionComponent},
            // Pantalla para listar y cambiar el estado de los números de certificados
            {path: 'numeracion-certificado', component: SecuenciaCertificadoComponent},
            // Pantalla para descargar los certificados de vacunación generados y asignados al usuario externo
            {path: 'descarga-certificado-vacunacion', component: CertificadosVacunacionProductorComponent},
            // Muestra la información de los predios vacunados
            {path: 'predios-vacunados', component: PrediosVacunadosComponent},
            // Muestra la información de los predios vacunados operadora
            {path: 'predios-vacunados-operadora', component: PrediosVacunadosOperadoraComponent},
            // Muestra la información de los predios vacunados operadora
            {path: 'dosis-aplicadas-operadora', component: DosisAplicadasOperadoraComponent},
            // Para eliminar un certificado de vacunación
            {path: 'eliminar-certificado_vacunacion', component: EliminarCertificadoVacunacionComponent},
            // Sin ruta
            {path: '', redirectTo: '/inicio', pathMatch: 'full'},

            //Paths Consultoria SIFAE Aretes Oficiales
            {path: 'tramitar-solicitud-aretes-proveedor', component: TramitarSolicitudAretesProveedorComponent},
            {path: 'tramitar-solicitud-aretes-interno', component: TramitarSolicitudAretesInternoComponent},
            {path: 'solicitar-aretes', component: SolicitudAretesComponent},
            {path: 'solicitar-aretes-operador', component: SolicitudAretesOperadorComponent},
            {path: 'registrar-proveedor-operador',component: RegistrarProveedorAretesComponent},
            {path: 'tramitar-solicitud-extempo-interno', component: TramitarSolicitudExtempoInternoComponent},
            {path: 'asignar-arete-bovino', component: AsignarAreteBovinoComponent},
            {path: 'asignar-aretes-operador', component: AsignarAreteBovinoOperadorComponent},
            {path: 'registrar-bajas-animales', component: RegistrarBajasAnimalesComponent},
            {path: 'consultar-animales-identificacion', component: ConsultarAnimalesIdentificacionComponent},
            {path: 'registrar-nacimientos', component: RegistrarNacimientosComponent},
            {path: 'crear-documento-movilizacion', component: CrearDocumentoMovilizacionComponent},
            {path: 'baja-aretes-bovino', component: BajaAretesBovinoComponent},
            {path: 'consultar-animales-operador', component: ConsultarAnimalesOperadorComponent},
            {path: 'fiscalizar-movilizacion-externo', component: FiscalizarMovilizacionExternoComponent},
            {path: 'crear-documento-movilizacion-cca', component: CrearDocumentoMovilizacionCcaComponent},
            {path: 'documentos-emitidos-cca', component: DocumentosEmitidosCcaComponent},
            {path: 'transferir-aretes-oficiales', component: TransferirAretesOficialesComponent},
            {path: 'registrar-certificado-vacunacion', component: RegistrarCertificadoVacunacionComponent},
            {path: 'actualizar-categorias-animales', component: ActualizarCategoriasAnimalesComponent},
        ]
    },
    // Rutas para iniciar sesión y registrarse.
    {path: 'login', component: LoginComponent},
    {path: 'login-interno', component: LoginInternoComponent},
    {path: 'login-externo', component: LoginExternoComponent},
    {path: 'registrar', component: RegistrarUsuarioExternoComponent},
    {path: 'cambiar-clave-caducada-interno', component: CambiarClaveCaducadaInternoComponent},
    {path: 'cambiar-clave-caducada-externo', component: CambiarClaveCaducadaExternoComponent},
    {path: 'recuperar-contrasena-interno', component: RecuperarContrasenaInternoComponent},
    {path: 'recuperar-contrasena-externo', component: RecuperarContrasenaExternoComponent},
    {path: 'verificar-email-externo', component: VerificarEmailExternoComponent},
    {path: '**', component: NopagefoundComponent}

];

export const APP_ROUTES = RouterModule.forRoot( appRoutes, { useHash: true} );
