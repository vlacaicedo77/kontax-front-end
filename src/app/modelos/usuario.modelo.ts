/**
 * Modelo que se usa para crear un usuario.
 */

export class Usuario {

    public idUsuario?: number;
    public idTipoIdentificacion?: number;
    public numeroIdentificacion?: string;
    public nombreCompleto?: string;
    public razonSocial?: string;
    public nombreComercial?: string;
    public identificacionRepresentanteLegal?: string;
    public nombreCompletoRepresentanteLegal?: string;
    public email?: string;
    public telefonoMovil?: string;
    public contrasenia?: string;
    public salt?: string;
    public fechaCreacionContrasenia?: string;
    public contraseniaAnterior?: string;
    public intentosFallidosContrasenia?: number;
    public ultimoIntentoContrasenia?: string;
    public estado?: number;
    public fechaCreacion?: string;

    //public idUsuario?: number;
    public tipoIdentificacion: number;
    //public numeroIdentificacion: string;
    public nombres: string;
    public apellidos: string;
    //public razonSocial: string;
    //public nombreComercial: string;
    //public identificacionRepresentanteLegal: string;
    public nombresRepresentanteLegal: string;
    public apellidosRepresentanteLegal: string;
    //public email: string;
    public contraseña: string;
    //public estado: number;
    public idProvincia?: number;
    public idOficina?: number;
    public idCoordinacion?: number;
    public idDireccion?: number;
    public idGestion?: number;
    public idPuesto?: number;
    public contraseñaExpirada?: string;
    public idPais?: number;
    public bandera?: number;

    // Datos para notificacion por correo
    public emailAnterior: string;
    public emailUsuarioInterno: string;
    public nombresUsuarioInterno: string;
    public oficinaUsuarioInterno: string;
    public provinciaUsuarioInterno: string;

    // Campos para modelo usuario - Consultoria SIFAE Aretes Oficiales
    public banderaDatos?: number;
    public banderaRoles?: number;
    public idTiposProveedoresAretes?: number;

    constructor(
    ) { }
}
