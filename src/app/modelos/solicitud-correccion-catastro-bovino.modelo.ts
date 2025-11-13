export class SolicitudCorreccionCatastroBovino {

    public idCorreccionCatastro?: number;
    public codigoSolicitud?: string;
    public idUsuario?: number;
    public idTecnico?: number;
    public idProvincia?: number;
    public idCanton?: number;
    public idParroquia?: number;
    public idSitio?: number;
    public idArea?: number;
    public idEstadoDocumento?: number;
    public observacion?: string;
    // Actuales
    public ternerasActual?: number;
    public ternerosActual?: number;
    public toretesActual?: number;
    public vaconasActual?: number;
    public vacasActual?: number;
    public torosActual?: number;
    // Solicitados
    public ternerasSolicitado?: number;
    public ternerosSolicitado?: number;
    public toretesSolicitado?: number;
    public vaconasSolicitado?: number;
    public vacasSolicitado?: number;
    public torosSolicitado?: number;
    public fechaCreacion?: string;
    public fechaModificacion?: string;
    public ubicacion?: any;
    public tecnico?: any;
    public productor?: any;
    public estadoDocumento?: any;

    constructor() {}
}