/**
 * Modelo que se usa para crear empresas.
 */

export class Empresas {
    // Perfil de usuario
    public nombresUsuario?: string;
    public apellidosUsuario?: string;
    public nombresRepresentanteLegalUsuario?: string;
    public apellidosRepresentanteLegalUsuario?: string;
    public identificacionRepresentanteLegalUsuario?: string;
    public nombreComercialUsuario?: string;
    public numeroIdentificacionUsuario?: string;
    public razonSocialUsuario?: string;
    // Identificadores
    public idEmpresa?: number;
    public idUsuarioPropietario?: number;
    public idRegimenesTributarios?: number;
    public idPlanSuscripcion?: number;
    // Contribuyente Especial
    public esContribuyenteEspecial?: boolean;
    public numeroResolucionContribuyenteEspecial?: string;
    public fechaDesignacionContribuyenteEspecial?: string;
    // Agente de Retención
    public esAgenteRetencion?: boolean;
    public esAgenteRetencionRenta?: boolean;
    public esAgenteRetencionIva?: boolean;
    public esAgenteRetencionIsd?: boolean;
    public numeroResolucionAgenteRetencion?: string;
    public fechaDesignacionAgenteRetencion?: string;
    // Autorretenedor
    public esAutorretenedor?: boolean;
    public numeroResolucionAutorretenedor?: string;
    public fechaInicioAutoretencion?: string;
    public porcentajeAutorretencion?: number;
    // Actividad Económica
    public actividadEconomicaPrincipal?: string;
    public fechaInicioActividades?: string;
    // Información Financiera
    public ingresosAnualesEstimados?: number;
    public fechaUltimaActualizacionIngresos?: string;
    // Contabilidad
    public obligadoContabilidad?: boolean;
    public idTipoContabilidad?: number;
    // Obligaciones Tributarias
    public debePresentarRenta?: boolean;
    public idFrecuenciaRenta?: number;
    public debePresentarIva?: boolean;
    public idFrecuenciaIva?: number;
    // Certificado Digital
    public rutaCertificadoDigital?: string;
    public passwordCertificado?: string;
    public fechaVencimientoCertificado?: string;
    public estadoCertificado?: number;
    // Contacto Administrativo
    public emailContactoAdministrativo?: string;
    public telefonoContactoAdministrativo?: string;
    // Estados y Observaciones
    public estado?: number;
    public observaciones?: string;
    // Auditoría
    public fechaCreacion?: string;
    public fechaActualizacion?: string;
    // Auxiliares para crear usuario
    public banderaUsuarioNuevo?: boolean;
    public email?: string;
    public contraseña?: string;
    public estadoUsuario?: number;
    constructor() {}
}
