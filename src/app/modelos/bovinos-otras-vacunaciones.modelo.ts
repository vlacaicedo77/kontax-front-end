/**
 * Modelo que se usa para registrar otras vacunaciones aplicadas a bovinos
 */
export class BovinosOtrasVacunaciones {
    public idOtrasVacunaciones?: number;
    public idBovino?: number;
    public codigoIdentificacion?: string;
    public idVacunasOficiales?: number;
    public codigoVacuna?: string;
    public nombreVacuna?: string;
    public idUsuarioProductor?: number;
    public identificacionProductor?: string;
    public nombreProductor?: string;
    public idUsuarioOperador?: number;
    public identificacionOperador?: string;
    public nombreOperador?: string;
    public idSitio?: number;
    public codigoSitio?: string;
    public nombreSitio?: string;
    public provincia?: string;
    public canton?: string;
    public parroquia?: string;
    public laboratorio?: string;
    public lote?: string;
    public fechaVacunacion?: string;
    public fechaCreacion?: string;
    public fechaVacunacionFormateada?: string;
    public fechaCreacionFormateada?: string;
    public estado?: number;
    public nombreCategoria?: string;

    constructor() {}
}