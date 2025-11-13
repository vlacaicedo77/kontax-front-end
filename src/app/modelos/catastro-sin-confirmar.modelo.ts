import { Bovino } from './bovino.modelo';
export class CatastroSinConfirmar {

    public idUsuario?: number;
    public idProvincia?: number;
    public nombreProvincia?: string;
    public idCanton?: number;
    public nombreCanton?: string;
    public idParroquia?: number;
    public nombreParroquia?: string;
    public idSitio?: number;
    public idArea?: number;
    public terneras?: number;
    public terneros?: number;
    public toretes?: number;
    public vaconas?: number;
    public vacas?: number;
    public toros?: number;
    public bovinos?: Bovino[] = [];

    constructor() {}
}
