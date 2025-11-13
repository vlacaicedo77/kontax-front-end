/**
 * Modelo que se usa para crear un trámite de solicitud
 */

export class TramiteSolicitud {
    public idSolicitud: number;
    public accion: string;
    public observaciones: string;
    public nombreAdjunto?: string;
    public idUsuarioTecnico?: number;

constructor(
) {}
}