/**
 * Modelo que se usa para los estados de los usuarios.
 */
export class EstadoUsuario {
    constructor(
        public _idEstadoUsuario?: number,
        public valor?: string,
        public descripcion?: string
    ) {}
}