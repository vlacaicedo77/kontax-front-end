/**
 * Clase que representa al modelo de usuario externo
 */
export class UsuarioExterno {
    public apellidos?: string;
    public apellidos_representante_legal?: string;
    public contraseña?: string;
    public contraseña_anterior?: string;
    public email?: string;
    public estado?: string;
    public fecha_creacion_contraseña?: string;
    public id_roles?: number;
    public id_tipos_identificacion?:number;
    public id_usuarios_externos?: number;
    public identificacion_representante_legal?: string;
    public nombre_comercial?: string;
    public nombre_rol?: string;
    public nombres?: string;
    public nombres_representante_legal?: string;
    public numero_identificacion?: string;
    public razon_social?: string;
    public salt?: string;

    // Para la consulta de datos nuevos
    public numeroIdentificacion?: string;
    public nombresRepresentanteLegal?: string;
    public apellidosRepresentanteLegal?: string;
    public razonSocial?: string;
    public idUsuariosExternos?: number;
    public identificacionRepresentanteLegal?: string;
    public nombreComercial?: string;
    public idTiposIdentificacion?: string;
    public codigoTipoIdentificacion?: string;
    public nombreTipoIdentificacion?: string;
    public descripcionTipoIdentificacion?: string;
    public nombreEstado?: string;
    public descripcionEstado?: string;

    // Para usuarios de centros de concentración de animales
    public idUsuariosExternosCca?: number;
    public nombresCca?: string;
    public nombreCentro?: string;
    public tipoArea?: string;
    public bandera?: number;

    // Para aceptación de anuncios
    public tipo?: number;


    constructor(){}
}