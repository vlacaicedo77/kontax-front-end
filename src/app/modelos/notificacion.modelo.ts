export class Notificacion 
{
    public idNotificacion: number;
    public fechaNotificacion: Date;
    public titulo: string;
    public texto: string;
    public estado: number;
    public idUsuarioNotificado: number;
    public tipoRolGenerador: number;
    public numeroIdentificacionGenerador: string;

    constructor(){}
}