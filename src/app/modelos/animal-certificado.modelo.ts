export class AnimalCertificado {
    public idAnimalCertificado?: number;
    public idFaseVacunacion?: number;
    public nombreFaseVacunacion?: string;
    public descripcionFaseVacunacion?: string;
    public idCertificadoVacunacion?: number;
    public idSecuenciaCertificadoVacunacion?: number;
    public secuenciaCertificadoVacunacion?: string;
    public idTaxonomia?: number;
    public idTipoTaxonomia?: number;
    public codigoTaxonomia?: string;
    public nombreCientificoTaxonomia?: string;
    public nombreComunTaxonomia?: string;
    public idCategoria?: number;
    public grupoCategoria?: string;
    public codigoCategoria?: string;
    public nombreCategoria?: string;
    public idSexo?: number;
    public codigoSexo?: string;
    public nombreSexo?: string;
    public cantidadAnimal?: number = 0;
    public vacunado?: number = 0;
    public noVacunado?: number = 0;
    public fechaCreacion?: string;

    constructor(){}
}