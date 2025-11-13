/**
 * Modelo que se usa para crear un proveedor de aretes.
 */

export class ProveedoresAretes {
    public idProveedoresAretes?: number;
    public idUsuariosExternos?: number;
    public idProvincia?: string;
    public nombreProvincia?: string;
    public idCanton?: string;
    public nombreCanton?: string;
    public idParroquia?: string;
    public nombreParroquia?: string;
    public telefono?: string;
    public direccion?: string;
    public estado?: number;
    public aomz?: number;
    public idTiposProveedores?: number;
    public nombreTipoProveedor?: string;
    public nombresUsuario?: string;
    public apellidosUsuario?: string;
    public nombresRepresentanteLegalUsuario?: string;
    public apellidosRepresentanteLegalUsuario?: string;
    public identificacionRepresentanteLegalUsuario?: string;
    public nombreComercialUsuario?: string;
    public numeroIdentificacionUsuario?: string;
    public razonSocialUsuario?: string;
    public fechaCreacion?: string;
    public banderaUsuarioNuevo?: boolean;

    //Datos de usuario
    public email?: string;
    public contraseña?: string;
    public estadoUsuario?: number;
    constructor() {}
}
