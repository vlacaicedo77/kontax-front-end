/**
 * Modelo que se usa para crear un sitio.
 */

export class Sitio {
    public idUsuariosExternos?: number;
    public idSitio?: number;
    public nombre?: string;
    public superficieHa?: number;
    public idPais?: number;
    public idProvincia?: number;
    public idCanton?: number;
    public idParroquia?: number;
    public callePrincipal?: string;
    public interseccion?: string;
    public numeracion?: string;
    public referencia?: string;
    public telefono?: string;
    public latitud?: number;
    public longitud?: number;
    public codigoPredial?: string;
    public idTipoPropiedad?: number;
    public poligono?: string;
    public estado?: number;
    public codigoSitio?: string;
    public urlDocumentoPropiedad?: string;
    public observaciones?: string;
    public nombresUsuario?: string;
    public apellidosUsuario?: string;
    public nombresRepresentanteLegalUsuario?: string;
    public apellidosRepresentanteLegalUsuario?: string;
    public identificacionRepresentanteLegalUsuario?: string;
    public nombreComercialUsuario?: string;
    public numeroIdentificacionUsuario?: string;
    public razonSocialUsuario?: string;
    public codigoPais?: string;
    public nombrePais?: string;
    public codigoProvincia?: string;
    public nombreProvincia?: string;
    public codigoCanton?: string;
    public nombreCanton?: string;
    public codigoParroquia?: string;
    public nombreParroquia?: string;
    public codigoTipoPropiedad?: string;
    public nombreTipoPropiedad?: string;
    public fechaCreacion?: string;
    public codigoEstadoPredio?: string;
    public nombreEstadoPredio?: string;
    public descripcionEstadoPredio?: string;
    public crearArea?: boolean;
    public idActividadPrincipal?: number;
    public idTipoArea?: number;
    public fechaVigencia?: string;
    public fechaFin?: string;

    //Datos de usuario
    public email?: string;
    public contraseña?: string;
    public estadoUsuario?: number;
    constructor() {}
}
