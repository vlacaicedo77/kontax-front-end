//Esta clase se utiliza para obtener la información de funcionarios del sistema GUIA
export class Funcionario {
    
    public idFuncionario?: number;
    public cedula?: string;
    public nombres?: string;
    public apellidos?: string;
    public idProvincia?: number;
    public provincia?: string;
    public idCanton?: number;
    public canton?: string;
    public idOficina?: number;
    public oficina?: string;
    public idCoordinacion?: number;
    public coordinacion?: string;
    public idDireccion?: number;
    public direccion?: string;
    public idGestion?: number;
    public gestion?: string;
    public idPuesto?: number;
    public puesto?: string;
    public estado?: number;
    public email?: string;

    constructor() {}
}
