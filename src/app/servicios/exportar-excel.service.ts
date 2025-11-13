import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {

  constructor() {}

  exportAsExcelFileMovilizacion(jsonData: any[], fileName: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    
    // Definir las columnas personalizadas
    worksheet.columns = [
      { header: 'NRO_CERTIFICADO', key: 'codigo', width: 20 },
      { header: 'FECHA_EMISIÓN', key: 'fechaEmision', width: 20, style: { numFmt: 'dd-mm-yyyy' } },
      { header: 'F_MOVILIZACIÓN', key: 'fechaMovilizacion', width: 20 },
      { header: 'F_CONFIRMACIÓN', key: 'fechaHoraConfirmacion', width: 20 },
      { header: 'ESTADO', key: 'nombreEstadoDocumento', width: 15 },
      { header: 'ID_PRODUCTOR', key: 'numeroIdentificacion', width: 16 },
      { header: 'PRODUCTOR', key: 'nombresProductor', width: 60 },
      { header: 'ID_RECEPTOR', key: 'identificacionRecibe', width: 16 },
      { header: 'RECEPTOR', key: 'nombreRecibe', width: 60 },
      { header: 'ID_EMISOR', key: 'usuarioGenera', width: 16 },
      { header: 'EMISOR', key: 'nombresUsuarioGenera', width: 50 },
      { header: 'CÓDIGO_SITIO_ORIGEN', key: 'codigoSitioOrigen', width: 25 },
      { header: 'TIPO_SITIO_ORIGEN', key: 'nombreTiposAreasOrigen', width: 32 },
      { header: 'NOMBRE_SITIO_ORIGEN', key: 'nombreAreaOrigen', width: 40 },
      { header: 'PROVINCIA_ORIGEN', key: 'nombreProvinciaOrigen', width: 35 },
      { header: 'CANTÓN_ORIGEN', key: 'nombreCantonOrigen', width: 35 },
      { header: 'PARROQUIA_ORIGEN', key: 'nombreParroquiaOrigen', width: 35 },
      //{ header: 'DIRECCIÓN_ORIGEN', key: 'callePrincipalSitioOrigen', width: 40 },
      { header: 'CÓDIGO_SITIO_DESTINO', key: 'codigoSitioDestino', width: 25 },
      { header: 'TIPO_SITIO_DESTINO', key: 'nombreTiposAreasDestino', width: 32 },
      { header: 'NOMBRE_SITIO_DESTINO', key: 'nombreAreaDestino', width: 40 },
      { header: 'PROVINCIA_DESTINO', key: 'nombreProvinciaDestino', width: 35 },
      { header: 'CANTÓN_DESTINO', key: 'nombreCantonDestino', width: 35 },
      { header: 'PARROQUIA_DESTINO', key: 'nombreParroquiaDestino', width: 35 },
      //{ header: 'DIRECCIÓN_DESTINO', key: 'callePrincipalSitioDestino', width: 40 },
      { header: 'TRANSPORTE', key: 'codigoMedioTransporte', width: 12 },
      { header: 'PLACA', key: 'placaVehiculo', width: 10 },
      { header: 'DESCRIPCIÓN_VEHÍCULO', key: 'descripVehiculo', width: 30 },
      { header: 'ID_TRANSPORTISTA', key: 'cedulaTransportista', width: 16 },
      { header: 'TRANSPORTISTA', key: 'nombreTransportista', width: 40 },
      { header: 'ID_SOLICITANTE', key: 'identificacionSolicitante', width: 16 },
      { header: 'SOLICITANTE', key: 'solicitante', width: 40 },
      { header: 'TERNERAS', key: 'terneras', width: 10 },
      { header: 'VACONAS', key: 'vaconas', width: 10 },
      { header: 'VACAS', key: 'vacas', width: 10 },
      { header: 'TERNEROS', key: 'terneros', width: 10 },
      { header: 'TORETES', key: 'toretes', width: 10 },
      { header: 'TOROS', key: 'toros', width: 10 },
      { header: 'BÚFALO_H', key: 'bufalosHembras', width: 10 },
      { header: 'BÚFALO_M', key: 'bufalosMachos', width: 10 },
      { header: 'TOTAL', key: 'total', width: 10 }
    ];

    // Convertir las fechas y añadir datos al worksheet
    jsonData.forEach(item => {
      // Convertir la fecha string a un objeto Date
      const fechaEmision = new Date(item.fechaEmision);
      const fechaMovilizacion = new Date(item.fechaMovilizacion);
      let fechaHoraConfirmacion;
      if(item.fechaHoraConfirmacion !== '' && item.fechaHoraConfirmacion !== null)
      {
        fechaHoraConfirmacion = new Date(item.fechaHoraConfirmacion);
      }
      let terneras = 0;
      if(item.terneras !== '' && item.terneras !== null)
      {
        terneras = parseInt(item.terneras);
      }
      let vaconas = 0;
      if(item.terneras !== '' && item.vaconas !== null)
      {
        vaconas = parseInt(item.vaconas);
      }
      let vacas = 0;
      if(item.vacas !== '' && item.vacas !== null)
      {
        vacas = parseInt(item.vacas);
      }
      let terneros = 0;
      if(item.terneros !== '' && item.terneros !== null)
      {
        terneros = parseInt(item.terneros);
      }
      let toretes = 0;
      if(item.toretes !== '' && item.toretes !== null)
      {
        toretes = parseInt(item.toretes);
      }
      let toros = 0;
      if(item.toros !== '' && item.toros !== null)
      {
        toros = parseInt(item.toros);
      }
      let bufalosHembras = 0;
      if(item.bufalosHembras !== '' && item.bufalosHembras !== null)
      {
        bufalosHembras = parseInt(item.bufalosHembras);
      }
      let bufalosMachos = 0;
      if(item.bufalosMachos !== '' && item.bufalosMachos !== null)
      {
        bufalosMachos = parseInt(item.bufalosMachos);
      }
      let total = 0;
      if(item.total !== '' && item.total !== null)
      {
        total = parseInt(item.total);
      }
      let codigoMedioTransporte;
      if(item.codigoMedioTransporte === 'pie')
      {
        codigoMedioTransporte = 'A PIE';
      }else
      {
        codigoMedioTransporte = 'VEHÍCULO';
      }

      let marcaVehiculo = '';
      if(item.marcaVehiculo !== '' && item.marcaVehiculo !== null)
      {
        marcaVehiculo = item.marcaVehiculo;
      }
      let modeloVehiculo = '';
      if(item.modeloVehiculo !== '' && item.modeloVehiculo !== null)
      {
        modeloVehiculo = item.modeloVehiculo;
      }
      let tipoTransporte = '';
      if(item.tipoTransporte !== '' && item.tipoTransporte !== null)
      {
        tipoTransporte = item.tipoTransporte;
      }

      /*let cedulaTransportista = '';
      if(item.cedulaTransportista !== '' && item.cedulaTransportista !== null)
      {
        cedulaTransportista = item.cedulaTransportista.toString();
      }
      let identificacionSolicitante = '';
      if(item.identificacionSolicitante !== '' && item.identificacionSolicitante !== null)
      {
        identificacionSolicitante = item.identificacionSolicitante.toString();
      }*/
      
      // Añadir la fila con la fecha convertida a Date
      worksheet.addRow({ 
      codigo: item.codigo, 
      fechaEmision: fechaEmision, 
      fechaMovilizacion: fechaMovilizacion,
      fechaHoraConfirmacion: fechaHoraConfirmacion,
      nombreEstadoDocumento: item.nombreEstadoDocumento.toUpperCase(), 
      numeroIdentificacion: item.numeroIdentificacion,
      nombresProductor: item.nombresProductor,
      identificacionRecibe: item.identificacionRecibe,
      nombreRecibe: item.nombreRecibe,
      usuarioGenera: item.usuarioGenera,
      nombresUsuarioGenera: item.nombresUsuarioGenera,
      codigoSitioOrigen: item.codigoSitioOrigen,
      nombreTiposAreasOrigen: item.nombreTiposAreasOrigen,
      nombreAreaOrigen: item.nombreAreaOrigen.toUpperCase(),
      nombreProvinciaOrigen: item.nombreProvinciaOrigen.toUpperCase(),
      nombreCantonOrigen: item.nombreCantonOrigen.toUpperCase(),
      nombreParroquiaOrigen: item.nombreParroquiaOrigen.toUpperCase(),
      //callePrincipalSitioOrigen: item.callePrincipalSitioOrigen.toUpperCase(),
      codigoSitioDestino: item.codigoSitioDestino,
      nombreTiposAreasDestino: item.nombreTiposAreasDestino,
      nombreAreaDestino: item.nombreAreaDestino.toUpperCase(),
      nombreProvinciaDestino: item.nombreProvinciaDestino.toUpperCase(),
      nombreCantonDestino: item.nombreCantonDestino.toUpperCase(),
      nombreParroquiaDestino: item.nombreParroquiaDestino.toUpperCase(),
      //callePrincipalSitioDestino: item.callePrincipalSitioDestino.toUpperCase(),
      codigoMedioTransporte: codigoMedioTransporte,
      placaVehiculo: item.placaVehiculo,
      descripVehiculo: `${tipoTransporte} ${marcaVehiculo} ${modeloVehiculo}`,
      cedulaTransportista: item.cedulaTransportista,
      nombreTransportista: item.nombreTransportista,
      identificacionSolicitante: item.identificacionSolicitante,
      solicitante: item.solicitante,
      terneras: terneras,
      vaconas: vaconas,
      vacas: vacas,
      terneros: terneros,
      toretes: toretes,
      toros: toros,
      bufalosHembras: bufalosHembras,
      bufalosMachos: bufalosMachos,
      total: total
      });
    });

    // Formatear la columnas
    worksheet.getColumn('fechaEmision').numFmt = 'dd/mm/yyyy hh:mm:ss'; 
    worksheet.getColumn('fechaMovilizacion').numFmt = 'dd/mm/yyyy hh:mm:ss'; 
    worksheet.getColumn('fechaHoraConfirmacion').numFmt = 'dd/mm/yyyy hh:mm:ss'; 
    worksheet.getColumn('numeroIdentificacion').numFmt = '@'; 
    worksheet.getColumn('identificacionRecibe').numFmt = '@'; 
    worksheet.getColumn('usuarioGenera').numFmt = '@'; 
    worksheet.getColumn('cedulaTransportista').numFmt = '@'; 
    worksheet.getColumn('identificacionSolicitante').numFmt = '@'; 

    // Añadir las filas desde el JSON
    /*console.log(jsonData);
    jsonData.forEach((item) => {
      worksheet.addRow(item);
    });*/

    // Formatea la columna de fecha
    //worksheet.getColumn('fechaEmision').numFmt = 'dd/mm/yyyy hh:mm:ss';

    // Estilos de cabecera (primera fila)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' }, // Fondo azul
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generar el archivo Excel
    workbook.xlsx.writeBuffer({ useStyles: true }).then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    });
  }
}
