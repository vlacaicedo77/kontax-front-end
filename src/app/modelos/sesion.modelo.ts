export class Sesion
{
    public idSesion: number;
    public token: string;
    public duracion: number;
    public refreshToken: string;
    public menu: [];
    public idUsuario: number;
    public sesionActivaAnterior: number;

    constructor(){}
}