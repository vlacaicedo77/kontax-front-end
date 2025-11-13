export class Incidente
{
    public idIncidente?: number;
    public idProcesoAfectado?: number;
    public idCriterioAfectacion?: number;
    public codigoCriterio?: string;
    public idUsuarioReporte?: number;
    public fechaReporte?: string;
    public fechaIncidente?: string;
    public idSitioIncidente?: number;
    public detalleIncidente?: string;
    public fechaCreacion?:string;
    public idEstadoIncidente?: number;
    public idUsuarioReportado?: number;
    public observaciones?: string;

constructor(){};
}
