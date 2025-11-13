/**
 * Modelo que se usa para crear un usuario.
 */

export class Usuario {
        public idUsuario?: number;
        public tipoIdentificacion: number;
        public numeroIdentificacion: string;
        public nombres: string;
        public apellidos: string;
        public razonSocial: string;
        public nombreComercial: string;
        public identificacionRepresentanteLegal: string;
        public nombresRepresentanteLegal: string;
        public apellidosRepresentanteLegal: string;
        public email: string;
        public contraseña: string;
        public estado: number;
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
    ) {}
}
