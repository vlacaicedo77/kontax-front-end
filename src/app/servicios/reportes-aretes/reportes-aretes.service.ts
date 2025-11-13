import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable'; // Forma correcta

@Injectable({
  providedIn: 'root',
})
export class ReportesAretesService {

  constructor() { }

  exportAsExcelFileSolicitudesAretes(jsonData: any[], fileName: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SOLICITUDES');


    // Definir las columnas personalizadas
    worksheet.columns = [
      { header: 'ID', key: 'idSolicitudesAretes', width: 10 },
      { header: 'FECHA_REGISTRO', key: 'fechaCreacion', width: 20 },
      { header: 'ID_PROVEEDOR', key: 'numeroIdentificacionProveedor', width: 16 },
      { header: 'PROVEEDOR', key: 'nombresProveedor', width: 60 },
      { header: 'TIPO_SOLICITANTE', key: 'nombreTipoSolicitante', width: 25 },
      { header: 'ID_SOLICITANTE', key: 'numeroIdentificacionSolicitante', width: 16 },
      { header: 'SOLICITANTE', key: 'nombresSolicitante', width: 60 },
      { header: 'CELULAR', key: 'telefonoSolicitante', width: 15 },
      { header: 'E_MAIL', key: 'emailSolicitante', width: 40 },
      { header: 'TIPO_ARETE', key: 'nombreTipoArete', width: 16 },
      { header: 'CANTIDAD', key: 'cantidadAretes', width: 12 },
      { header: 'ESTADO', key: 'nombreEstadoSolicitud', width: 16 },
      { header: 'FASE', key: 'nombrePasoSolicitud', width: 30 },
      { header: 'RANGO_APROBADO', key: 'rangoCodigoOficial', width: 30 }
    ];

    // Convertir las fechas y añadir datos al worksheet
    jsonData.forEach(item => {
      // Convertir la fecha string a un objeto Date
      const fechaCreacion = new Date(item.fechaCreacion);

      let cantidad = 0;

      if (item.cantidadAretes !== '' && item.cantidadAretes !== null) {
        cantidad = parseInt(item.cantidadAretes);
      }

      // Añadir la fila con la fecha convertida a Date
      worksheet.addRow({
        idSolicitudesAretes: item.idSolicitudesAretes,
        fechaCreacion: fechaCreacion,
        numeroIdentificacionProveedor: item.numeroIdentificacionProveedor,
        nombresProveedor: item.nombresProveedor.toUpperCase(),
        nombreTipoSolicitante: item.nombreTipoSolicitante.toLowerCase(),
        numeroIdentificacionSolicitante: item.numeroIdentificacionSolicitante,
        nombresSolicitante: item.nombresSolicitante.toUpperCase(),
        telefonoSolicitante: `09${item.telefonoSolicitante}`,
        emailSolicitante: item.emailSolicitante.toLowerCase(),
        nombreTipoArete: item.nombreTipoArete.toLowerCase(),
        cantidadAretes: item.cantidadAretes,
        nombreEstadoSolicitud: item.nombreEstadoSolicitud,
        nombrePasoSolicitud: item.nombrePasoSolicitud,
        rangoCodigoOficial: item.rangoCodigoOficial
      });
    });

    // Formatear la columnas
    worksheet.getColumn('fechaCreacion').numFmt = 'dd/mm/yyyy hh:mm:ss';
    worksheet.getColumn('numeroIdentificacionProveedor').numFmt = '@';
    worksheet.getColumn('numeroIdentificacionSolicitante').numFmt = '@';
    worksheet.getColumn('telefonoSolicitante').numFmt = '@';

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

  // Listado de aretes oficiales de cada solicitud
  exportAsExcelFileAretesListado(jsonData: any[], fileName: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ARETES');


    // Definir las columnas personalizadas
    worksheet.columns = [
      { header: 'ID_SOLICITUD', key: 'idSolicitudesAretes', width: 15 },
      { header: 'PROVEEDOR', key: 'nombresProveedor', width: 40 },
      { header: 'ID_SOLICITANTE', key: 'numeroIdentificacionSolicitante', width: 16 },
      { header: 'SOLICITANTE', key: 'nombresSolicitante', width: 60 },
      { header: 'TIPO_ARETE', key: 'nombreTipoArete', width: 16 },
      { header: 'CODIGO_OFICIAL', key: 'codigoOficial', width: 20 }
    ];

    // Convertir las fechas y añadir datos al worksheet
    jsonData.forEach(item => {

      // Añadir la fila con la fecha convertida a Date
      worksheet.addRow({
        idSolicitudesAretes: item.idSolicitudesAretes,
        nombresProveedor: item.nombresProveedor.toUpperCase(),
        numeroIdentificacionSolicitante: item.numeroIdentificacionSolicitante,
        nombresSolicitante: item.nombresSolicitante.toUpperCase(),
        nombreTipoArete: item.nombreTipoArete.toLowerCase(),
        codigoOficial: item.codigoOficial
      });
    });

    // Formatear la columnas
    worksheet.getColumn('numeroIdentificacionSolicitante').numFmt = '@';

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

  // Listado de aretes oficiales en PDF
  exportAsPdfFileAretesListado(jsonData: any, operador: boolean = false): void {

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración inicial
    const margin = 10;
    let yPos = 20;
    const lineHeight = 7;

    // Definir anchos de columnas basados en si es operador o no
    const colWidths = operador
      ? [8, 25, 20, 30, 15, 18, 18, 25, 15, 20, 18, 18, 0]
      : [8, 25, 15, 18, 18, 25, 20, 15, 20, 18, 18, 0]; 

    // Encabezados de columna
    const headers = operador
      ? [
        'N°', 'NRO. ARETE', 'C.C/C.I/RUC', 'PROPIETARIO',
        'CAT. ETARIA', 'F. NACIMIENTO', 'CODIGO SITIO', 'NOMBRE SITIO',
        'RAZA', 'TIPO SERVICIO', 'ARETE PADRE', 'ARETE MADRE', 'OBSERVACIONES'
      ]
      : [
        'N°', 'NRO. ARETE', 'CAT. ETARIA', 'F. NACIMIENTO',
        'CODIGO SITIO', 'NOMBRE SITIO', 'RAZA', 'PUREZA',
        'TIPO SERVICIO', 'ARETE PADRE', 'ARETE MADRE', 'OBSERVACIONES'
      ];

    // Función para dibujar encabezados
    const drawHeaders = () => {
      doc.setFontSize(6);
      doc.setFont(undefined, 'bold');

      let xPos = margin;
      headers.forEach((header, i) => {
        const width = colWidths[i] || (297 - margin * 2 - colWidths.reduce((a, b) => a + (b || 0), 0));

        // Centrar texto horizontal y verticalmente
        const textX = xPos + (width / 2);
        const textY = yPos - 2.5 + (lineHeight / 2);

        doc.text(header, textX, textY, { align: 'center', baseline: 'middle' });

        // Dibujar borde
        doc.rect(xPos, yPos - 5, width, lineHeight + 2);
        xPos += width;
      });

      yPos += lineHeight;
    };

    // Título
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('LISTADO DE ARETES OFICIALES - NO ASIGNADOS', 148, yPos, { align: 'center' });
    yPos += 10;

    // Fecha y usuario
    doc.setFontSize(10);
    const primerRegistro = jsonData.resultado?.[0] || {};
    const numeroIdentificacionActual = primerRegistro.numeroIdentificacionActual || "N/A";
    const nombresUsuarioActual = primerRegistro.nombresUsuarioActual || "N/A";
    const fechaActual = new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const textoFechaUsuario = `${numeroIdentificacionActual} ${nombresUsuarioActual} | ${fechaActual}`;
    doc.text(textoFechaUsuario, 148, yPos, { align: "center" });
    yPos += 15;

    // Dibujar encabezados iniciales
    drawHeaders();

    // Contenido de la tabla
    doc.setFont(undefined, 'normal');
    jsonData.resultado.forEach((item, rowIndex) => {
      if (yPos > 190) {
        doc.addPage();
        yPos = 20;
        drawHeaders();
      }

      let xPos = margin;

      const rowData = operador
        ? [
          (rowIndex + 1).toString(),
          item.codigoOficial || '',
          item.numeroIdentificacion || '',
          item.propietario || '',
          item.categoriaEdad || '',
          item.fechaNacimiento || '',
          item.codigoSitio || '',
          item.nombreSitio || '',
          item.raza || '',
          item.tipoServicio || '',
          item.aretePadre || '',
          item.areteMadre || '',
          item.observaciones || ''
        ]
        : [
          (rowIndex + 1).toString(),
          item.codigoOficial || '',
          item.categoriaEdad || '',
          item.fechaNacimiento || '',
          item.codigoSitio || '',
          item.nombreSitio || '',
          item.raza || '',
          item.pureza || '',
          item.tipoServicio || '',
          item.aretePadre || '',
          item.areteMadre || '',
          item.observaciones || ''
        ];

      // Dibujar fila
      rowData.forEach((cell, colIndex) => {
        const width = colWidths[colIndex] || (297 - margin * 2 - colWidths.reduce((a, b) => a + (b || 0), 0));

        if (rowIndex % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(xPos, yPos - 3, width, lineHeight, 'F');
        }

        const textX = xPos + (width / 2);
        const textY = yPos - 3 + (lineHeight / 2);

        doc.text(cell, textX, textY, {
          align: 'center',
          baseline: 'middle',
          maxWidth: width - 4
        });

        doc.rect(xPos, yPos - 3, width, lineHeight);
        xPos += width;
      });

      yPos += lineHeight;
    });

    doc.save(`LISTADO_ARETES_NO_ASIGNADOS_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // Listado de animales con arete oficial en PDF
  exportAsPdfFileBovinosVacunacion(jsonData: any): void {
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración inicial
    const margin = 10;
    let yPos = 20;
    const lineHeight = 8; // Aumentado de 7 a 8 para mayor altura de filas

    // Definir anchos de columnas (ajustados según solicitud)
    const colWidths = [8, 20, 30, 25, 40, 40, 35, 20, 25, 0]; // Aumentado ancho de NRO. ARETE, CODIGO SITIO y PROPIETARIO

    // Encabezados de columna
    const headers = [
      'N°', 'CAT. ETARIA', 'NRO. ARETE', 'C.C./C.I./RUC', 
      'PROPIETARIO', 'CODIGO SITIO', 'NOMBRE SITIO', 
      'F. VACUNACIÓN', 'NOMBRE VACUNA', 'OBSERVACIONES'
    ];

    // Función para dibujar encabezados
    const drawHeaders = () => {
      doc.setFontSize(6);
      doc.setFont(undefined, 'bold');
      
      let xPos = margin;
      headers.forEach((header, i) => {
        const width = colWidths[i] || (297 - margin * 2 - colWidths.reduce((a,b) => a + (b || 0), 0));
        
        // Centrar texto horizontal y verticalmente
        const textX = xPos + (width / 2);
        const textY = yPos - 3 + (lineHeight / 2); // Ajustado para mayor altura
        
        doc.text(header, textX, textY, { align: 'center', baseline: 'middle' });
        
        // Dibujar borde
        doc.rect(xPos, yPos - 5, width, lineHeight + 2);
        xPos += width;
      });
      
      yPos += lineHeight;
    };

    // Título
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('FORMATO DE REGISTRO DE VACUNACIÓN EN CAMPO – ANIMALES CON ARETE OFICIAL', 148, yPos, { align: 'center' });
    yPos += 12; // Aumentado espacio después del título
    
    // Fecha y usuario
    doc.setFontSize(10);
    const primerRegistro = jsonData.resultado?.[0] || {};
    const textoFechaUsuario = `${primerRegistro.numeroIdentificacionUsuarioActual || "N/A"} ${primerRegistro.nombresUsuarioActual || "N/A"} | ${new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    
    doc.text(textoFechaUsuario, 148, yPos, { align: "center" });
    yPos += 16; // Aumentado espacio después de la fecha

    // Dibujar encabezados iniciales
    drawHeaders();

    // Contenido de la tabla
    doc.setFont(undefined, 'normal');
    jsonData.resultado.forEach((item, rowIndex) => {
      if (yPos > 190) {
        doc.addPage();
        yPos = 20;
        drawHeaders();
      }
      
      let xPos = margin;
      const rowData = [
        (rowIndex + 1).toString(),
        item.nombreCategoria || '',
        item.codigoIdentificacion || '',
        item.numeroIdentificacionUsuarioActual || '',
        item.nombresPropietarioSitioActual || item.nombresPropietarioSitioNacimiento || '',
        item.codigoSitioActual || '',
        item.nombreSitioActual || '',
        '', // FECHA VACUNACIÓN
        '', // NOMBRE VACUNA
        ''  // OBSERVACIONES
      ];
      
      // Dibujar fila
      rowData.forEach((cell, colIndex) => {
        const width = colWidths[colIndex] || (297 - margin * 2 - colWidths.reduce((a,b) => a + (b || 0), 0));
        
        if (rowIndex % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(xPos, yPos - 3, width, lineHeight, 'F');
        }
        
        const textX = xPos + (width / 2);
        const textY = yPos - 3 + (lineHeight / 2);
        
        // Tamaño de fuente especial para NRO. ARETE (columna 2)
        if (colIndex < 3) {
          doc.setFontSize(8); // Tamaño aumentado para NRO. ARETE
        } else {
          doc.setFontSize(7); // Tamaño estándar para otras celdas
        }
        
        doc.text(cell, textX, textY, {
          align: 'center',
          baseline: 'middle',
          maxWidth: width - 4
        });
        
        doc.rect(xPos, yPos - 3, width, lineHeight);
        xPos += width;
      });
      
      // Restaurar tamaño de fuente normal
      doc.setFontSize(7);
      yPos += lineHeight;
    });

    doc.save(`FORMATO_REGISTRO_VACUNACION_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Listado de animales con arete oficial en PDF - Versión final
exportAsPdfFileAnimalesAretesOficiales(jsonData: any, sitioSeleccionado: any): void {

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración inicial
  const margin = 10;
  let yPos = 20;
  const lineHeight = 7;

  // Anchos de columnas ajustados - eliminamos TIPO SERVICIO, redistribuimos anchos
  const colWidths = [
    8,   // N°
    25,  // NRO. ARETE
    22,  // CAT. ETARIA
    22,  // F. NACIMIENTO
    33,  // RAZA (aumentada de 26 a 33)
    34,  // NRO. REGISTRO (aumentada de 27 a 34)
    40   // FIEBRE AFTOSA (al final)
  ];

  // Encabezados de columna actualizados
  const headers = [
    'N°', 'NRO. ARETE', 'CAT. ETARIA', 'F. NACIMIENTO',
    'RAZA', 'NRO. REGISTRO', 'ULT. VACUNACIÓN FA'
  ];

  // Función para obtener categoría basada en taxonomía y sexo
  const obtenerCategoria = (item: any) => {
    if (item.nombreCategoria && item.nombreCategoria !== 'null') {
      return item.nombreCategoria;
    }
    
    // Si nombreCategoria es null, determinar según taxonomía y sexo
    if (item.idTaxonomia === 13) { // Búfalos
      if (item.idSexo === 1) return 'Búfalo Hembra';
      if (item.idSexo === 2) return 'Búfalo Macho';
    }
    
    return item.nombreCategoria || 'N/A';
  };

  // Función para obtener nombre de categoría para el resumen
  const obtenerNombreCategoriaResumen = (item: any) => {
    // Primero verificar si es búfalo
    if (item.idTaxonomia === 13) {
      if (item.idSexo === 1) return 'Búfalo Hembra';
      if (item.idSexo === 2) return 'Búfalo Macho';
    }
    
    // Luego verificar por idCategoria
    switch (item.idCategoria) {
      case 1: return 'Ternera';
      case 2: return 'Vacona';
      case 3: return 'Vaca';
      case 4: return 'Ternero';
      case 5: return 'Torete';
      case 6: return 'Toro';
      default: return obtenerCategoria(item) || 'Sin Categoría';
    }
  };

  // Función para obtener información de fiebre aftosa
  const obtenerInfoFiebreAftosa = (item: any) => {
    if (item.estadoVacunacion === 'vacunado') {
      return item.nombreFaseVacunacion || 'Vacunado';
    } else {
      return '*** NO VACUNADO ***';
    }
  };

  // Función para obtener raza (especial para búfalos)
  const obtenerRaza = (item: any) => {
    if (item.idTaxonomia === 13) {
      return 'Búfalo';
    }
    return item.nombreComunRaza || '';
  };

  // Función para dibujar encabezados
  const drawHeaders = () => {
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');

    let xPos = margin;
    headers.forEach((header, i) => {
      const width = colWidths[i];

      // Centrar texto horizontal y verticalmente - MISMO ALTO QUE FILAS
      const textX = xPos + (width / 2);
      const textY = yPos - 3 + (lineHeight / 2); // Mismo cálculo que las filas

      doc.text(header, textX, textY, { align: 'center', baseline: 'middle' });

      // Dibujar borde - MISMO ALTO QUE FILAS
      doc.rect(xPos, yPos - 3, width, lineHeight);
      xPos += width;
    });

    yPos += lineHeight;
  };

  // Título
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('LISTADO DE ANIMALES CON ARETE OFICIAL', 105, yPos, { align: 'center' });
  yPos += 10;

  // Información del sitio desde sitioSeleccionado
  const identificacionPropietario = sitioSeleccionado?.numeroIdentificacion || "N/A";
  const nombresPropietario = sitioSeleccionado?.nombres || "N/A";
  const codigoSitio = sitioSeleccionado?.codigoSitio || "N/A";
  const nombreSitio = sitioSeleccionado?.nombreSitio || "N/A";
  const ubicacion = `${sitioSeleccionado?.nombreProvinciaSitio || "N/A"} / ${sitioSeleccionado?.nombreCantonSitio || "N/A"} / ${sitioSeleccionado?.nombreParroquiaSitio || "N/A"}`;

  doc.setFontSize(8);
  
  // Definir posición horizontal fija para los valores
  const valorX = margin + 35;
  
  // Primera línea - IDENTIFICACIÓN
  doc.setFont(undefined, 'bold');
  doc.text('IDENTIFICACIÓN:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(identificacionPropietario, valorX, yPos);
  yPos += 5;

  // Segunda línea - PRODUCTOR
  doc.setFont(undefined, 'bold');
  doc.text('PRODUCTOR:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(nombresPropietario, valorX, yPos);
  yPos += 5;

  // Tercera línea - CÓDIGO SITIO
  doc.setFont(undefined, 'bold');
  doc.text('CÓDIGO SITIO:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(codigoSitio, valorX, yPos);
  yPos += 5;

  // Cuarta línea - NOMBRE SITIO
  doc.setFont(undefined, 'bold');
  doc.text('NOMBRE SITIO:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(nombreSitio, valorX, yPos);
  yPos += 5;

  // Quinta línea - UBICACIÓN
  doc.setFont(undefined, 'bold');
  doc.text('UBICACIÓN:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(ubicacion, valorX, yPos);
  yPos += 5;

  // Sexta línea - GENERADO (fecha y hora actual)
  const fechaActual = new Date().toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFont(undefined, 'bold');
  doc.text('GENERADO:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(fechaActual, valorX, yPos);
  yPos += 10;

  // Dibujar encabezados iniciales
  drawHeaders();

  // Contenido de la tabla
  doc.setFont(undefined, 'normal');
  
  // Procesar datos y contar categorías
  const conteoCategorias: { [key: string]: number } = {};
  
  jsonData.resultado.forEach((item, rowIndex) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      drawHeaders();
    }

    let xPos = margin;

    // Obtener categoría para conteo
    const categoriaResumen = obtenerNombreCategoriaResumen(item);
    conteoCategorias[categoriaResumen] = (conteoCategorias[categoriaResumen] || 0) + 1;

    const rowData = [
      (rowIndex + 1).toString(),
      item.codigoIdentificacionOficial || item.codigoIdentificacion || '',
      obtenerCategoria(item),
      item.fechaNacimientoFormateada || '',
      obtenerRaza(item),
      item.registroNacimientoDefinitivo || item.registroNacimientoProvisional || '',
      obtenerInfoFiebreAftosa(item) // FIEBRE AFTOSA al final
    ];

    // Dibujar fila
    rowData.forEach((cell, colIndex) => {
      const width = colWidths[colIndex];

      if (rowIndex % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(xPos, yPos - 3, width, lineHeight, 'F');
      }

      const textX = xPos + (width / 2);
      const textY = yPos - 3 + (lineHeight / 2);

      // Tamaño de fuente diferente para NRO. ARETE y CAT. ETARIA
      if (colIndex === 1 || colIndex === 2) {
        doc.setFontSize(7);
      } else {
        doc.setFontSize(6);
      }

      // Aplicar negritas para "*** NO VACUNADO ***"
      if (colIndex === 6 && cell === '*** NO VACUNADO ***') {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }

      doc.text(cell, textX, textY, {
        align: 'center',
        baseline: 'middle',
        maxWidth: width - 4
      });

      doc.rect(xPos, yPos - 3, width, lineHeight);
      xPos += width;
    });

    yPos += lineHeight;
  });

  // Agregar resumen de categorías al final en formato de tabla
  yPos += 10;
  
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Configuración para la tabla de resumen
  const anchoTablaResumen = 80;
  const colResumenCategoria = anchoTablaResumen * 0.7;
  const colResumenCantidad = anchoTablaResumen * 0.3;
  const xResumen = margin;

  // Título del resumen
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('RESUMEN', margin, yPos);
  yPos += 8;

  // Dibujar encabezado de la tabla de resumen
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  
  // Encabezado CATEGORÍA
  doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight);
  doc.text('CATEGORÍA', xResumen + (colResumenCategoria / 2), yPos - 3 + (lineHeight / 2), 
    { align: 'center', baseline: 'middle' });
  
  // Encabezado CANTIDAD
  doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight);
  doc.text('CANT.', xResumen + colResumenCategoria + (colResumenCantidad / 2), yPos - 3 + (lineHeight / 2), 
    { align: 'center', baseline: 'middle' });

  yPos += lineHeight;

  // Ordenar categorías para mostrar
  const categoriasOrdenadas = Object.keys(conteoCategorias).sort();
  
  // Dibujar filas del resumen
  doc.setFontSize(7);
  categoriasOrdenadas.forEach((categoria, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      
      // Redibujar encabezado de resumen en nueva página
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('RESUMEN (CONT.)', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight);
      doc.text('CATEGORÍA', xResumen + (colResumenCategoria / 2), yPos - 3 + (lineHeight / 2), 
        { align: 'center', baseline: 'middle' });
      doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight);
      doc.text('CANT.', xResumen + colResumenCategoria + (colResumenCantidad / 2), yPos - 3 + (lineHeight / 2), 
        { align: 'center', baseline: 'middle' });
      yPos += lineHeight;
    }

    const cantidad = conteoCategorias[categoria];
    
    // Fondo gris para filas pares
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight, 'F');
      doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight, 'F');
    }

    // Texto de categoría
    doc.setFont(undefined, 'normal');
    doc.text(categoria, xResumen + 2, yPos - 3 + (lineHeight / 2), 
      { align: 'left', baseline: 'middle', maxWidth: colResumenCategoria - 4 });
    
    // Texto de cantidad
    doc.text(cantidad.toString(), xResumen + colResumenCategoria + (colResumenCantidad / 2), yPos - 3 + (lineHeight / 2), 
      { align: 'center', baseline: 'middle' });
    
    // Bordes de la fila
    doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight);
    doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight);
    
    yPos += lineHeight;
  });

  // Fila de total general
  yPos += 2;
  
  // Fondo diferente para el total
  doc.setFillColor(220, 220, 220);
  doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight, 'F');
  doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight, 'F');

  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL', xResumen + 2, yPos - 3 + (lineHeight / 2), 
    { align: 'left', baseline: 'middle' });
  doc.text(jsonData.resultado.length.toString(), xResumen + colResumenCategoria + (colResumenCantidad / 2), yPos - 3 + (lineHeight / 2), 
    { align: 'center', baseline: 'middle' });

  // Bordes del total
  doc.rect(xResumen, yPos - 3, colResumenCategoria, lineHeight);
  doc.rect(xResumen + colResumenCategoria, yPos - 3, colResumenCantidad, lineHeight);

  doc.save(`LISTADO_ANIMALES_ARETE_OFICIAL_${sitioSeleccionado?.codigoSitio || ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

}

