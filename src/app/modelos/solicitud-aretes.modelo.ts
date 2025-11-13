export class SolicitudAretes
{
    public idSolicitudesAretes?: number;
    public idProveedoresAretes?: number;
    public idUsuarioSolicitante?: number;
    public idTiposSolicitantes?: number;
    public idEstadosSolicitudes?: number;
    public idPasosSolicitudesAretes?: number;
    public idTiposAretes?: number;
    public cantidadAretes?: number;
    public fechaCreacion?: string;
    public fechaCreacionFormateada?: string;
    public fechaUltimaModificacion?: string;
    public fechaUltimaModificacionFormateada?: string;
    public usuarioModificador?: string;
    public observaciones?: string;
    public origen?: number;
    // datos proveedor
    public idUsuarioExternoProveedor?: string;
    public numeroIdentificacionProveedor?: string;
    public nombresProveedor?: string;
    public telefonoProveedor?: string;
    public emailProveedor?: string;
    // datos solicitante
    public numeroIdentificacionSolicitante?: string;
    public nombresSolicitante?: string;
    public telefonoSolicitante?: string;
    public emailSolicitante?: string;
    public nombreTipoSolicitante?: string;
    // datos solicitud
    public nombreEstadoSolicitud?: string;
    public nombrePasoSolicitud?: string;
    public nombreTipoArete?: string;
    public nombreOrigen?: string;
    public accion: string;
    public rangoCodigoOficial: string;
    public numeroInicial?: number;
    public fechaEntrega?: string;

    //paginación
    public inicio?: number;
    public limite?: number;

    constructor(){};
}