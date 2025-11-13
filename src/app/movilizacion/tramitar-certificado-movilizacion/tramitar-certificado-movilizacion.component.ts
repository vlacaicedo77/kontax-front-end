import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CertificadoMovilizacion } from 'src/app/modelos/certificado_movilizacion.modelo';
import { DetalleCertificadoMovilizacion } from 'src/app/modelos/detalle-certificado-movilizacion.modelo';
import Swal from 'sweetalert2';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { EstadoDocumentoService } from 'src/app/servicios/estado-documento/estado-documento.service';
import { EstadoDocumento } from '../../modelos/estado-documento.modelo';
import { ExcelService } from '../../servicios/exportar-excel.service';

@Component({
  selector: 'app-tramitar-certificado-movilizacion',
  templateUrl: './tramitar-certificado-movilizacion.component.html',
  styleUrls: ['./tramitar-certificado-movilizacion.component.css']
})
export class TramitarCertificadoMovilizacionComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaCertificadosMovilizacionFechas: CertificadoMovilizacion[] = [];
  public listaProvincias = [];
  public listaEstadoDocumentos = [];
  numeroCzpm: string = '';
  // Animales
  terneras: number = 0;
  terneros: number = 0;
  vaconas: number = 0;
  toretes: number = 0;
  vacas: number = 0;
  toros: number = 0;
  bufalosHembras: number = 0;
  bufalosMachos: number = 0;
  totalAnimales: number = 0;
  totalAnulados: number = 0;

  //Total animales por categoría | consulta 100U
  public totalAnimalesInd: any = {};

  tipoCZPM = true;
  tipoPROV = false;
  tipoConsulta = false;

  fechaMinima: Date = new Date();
  fechaMaxima: Date = new Date();

  czpm: string = "czpm";
  idemi: string = "idemi";
  idrep: string = "idrep";
  idcon: string = "idcon";
  placa: string = "placa";
  prov: string = "prov";

  fechaInicial: string;
  fechaFinal: string;

  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioCertificadoMovilizacion: CertificadoMovilizacionService,
    private servicioVisorPdf: VisorPdfService,
    private excelService: ExcelService,
    private _provinciaService: ProvinciaService,
    private estadoDocumentoService: EstadoDocumentoService,
    public servicioUsuario: UsuarioService
  ) {

    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
    
  }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    //this.fechaInicialReporte();
    this.inicializarFormularioBusqueda();
    //this.formularioBusqueda.get('tipo_consulta')?.reset(); // Resetea el select
    this.formularioBusqueda.controls.inputTipoConsulta.setValue('u100');
    this.formularioBusqueda.controls.tipo_consulta.setValue('czpm');
    //this.fechaInicialReporte();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.obtenerEstadosDocumentos();
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      dato: new FormControl(null),
      inputTipoConsulta: new FormControl(null, [Validators.required]),
      fecha_inicio: new FormControl(null),
      //fecha_fin: new FormControl(new Date().toISOString().substring(0, 10)), // Asigna la fecha actual
      //fecha_inicio: new FormControl(new Date(this.fechaInicial).toISOString().substring(0, 10)), // Asigna la fecha 15 días atrás
      fecha_fin: new FormControl(null),
      tipo_consulta: new FormControl('czpm'),
      prov_origen: new FormControl('-1'),
      prov_destino: new FormControl('-1'),
      estado: new FormControl('-1')

    });
  }

  // Método que obtiene los datos de provincias.
  cargarProvinciasPorPais(idPais: number) {
    this._provinciaService.getProvinciasPorPais(idPais)
    .subscribe( respuesta => this.listaProvincias = respuesta );
    }

  /**
   * Obtiene los estados de documentos de movilización.
   */
  obtenerEstadosDocumentos(){
    
    this.estadoDocumentoService.obtenerEstadosDocumentos()
    .subscribe( (estadoDocumento: EstadoDocumento[]) => {
      this.listaEstadoDocumentos = estadoDocumento.filter( (item: EstadoDocumento) => {
        return item.grupo === 'CMV';
      });
      Swal.close();
    });
  }

  fechaInicialReporte() {
    const hoy = new Date();
    const fechaPasada = new Date(hoy);
    // Restar 16 días
    hoy.setHours(hoy.getHours() - 5);
    fechaPasada.setDate(hoy.getDate() - 16);
    // Convertir las fechas a formato 'yyyy-MM-dd' requerido por los controles de tipo 'date'
    this.fechaInicial = fechaPasada.toISOString().substring(0, 10);
    this.fechaFinal = hoy.toISOString().substring(0, 10);
    this.formularioBusqueda.controls.fecha_inicio.setValue(new Date(this.fechaInicial).toISOString().substring(0, 10));
    this.formularioBusqueda.controls.fecha_fin.setValue(new Date(this.fechaFinal).toISOString().substring(0, 10));
  }
  
  // Exportar JSON a Excel
  exportarExcel() {
    Swal.fire({
      title: 'Generando Reporte Excel...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    
    let filename = 'MOV_'+this.formularioBusqueda.value.tipo_consulta.toUpperCase()+'_'+this.formularioBusqueda.value.dato;

    if(this.tipoPROV)
    {
      filename = 'MOV_'+this.formularioBusqueda.value.tipo_consulta.toUpperCase()+'_OD';
    }

    this.excelService.exportAsExcelFileMovilizacion(this.listaCertificadosMovilizacionFechas, filename);
    Swal.close();
    //Swal.fire('¡Reporte Generado con Éxito!', 'Por favor, revise su carpeta de descargas' , 'success');
    Swal.fire({
      title: '¡Reporte Generado con Éxito!',
      text: 'Por favor, revise su carpeta de descargas',
      icon: 'success',
      timer: 3000, // Tiempo en milisegundos (3000 ms = 3 segundos)
      showConfirmButton: false // Oculta el botón de confirmación
    });
  }

    
  limpiarContadores(){
    this.listaCertificadosMovilizacion = [];
    this.listaCertificadosMovilizacionFechas = [];
    this.terneras = 0;
    this.terneros = 0;
    this.terneras = 0;
    this.terneros = 0;
    this.vaconas = 0;
    this.toretes = 0;
    this.vacas = 0;
    this.toros = 0;
    this.bufalosHembras = 0;
    this.bufalosMachos = 0;
    this.totalAnimales = 0;
    this.totalAnulados = 0;
  }

  /**
   * Buscar certificado de movilización
   * @returns 
   */
  buscarCertificado(){

    this.limpiarContadores();

    //this.formularioBusqueda.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formularioBusqueda.value.tipo_consulta != "prov")
    {
      if(this.formularioBusqueda.value.dato == null || this.formularioBusqueda.value.dato == ""){
        formularioInvalido = true;
        mensaje += "<li>Ingrese dato de búsqueda según parámetro seleccionado.</li>";
      }
    }

    if(this.formularioBusqueda.value.tipo_consulta == "prov")
      {
        if(this.formularioBusqueda.value.prov_origen == '-1' && this.formularioBusqueda.value.prov_destino == '-1'){
          formularioInvalido = true;
          mensaje += "<li>Seleccione al menos una provincia de origen o destino.</li>";
        }
      }
    
    if(this.formularioBusqueda.value.tipo_consulta != "czpm")
    {
      if(this.formularioBusqueda.value.fecha_inicio == null || this.formularioBusqueda.value.fecha_inicio == ""){
        formularioInvalido = true;
        mensaje += "<li>Seleccione Fecha de Inicio</li>";
      }
    }

    if(this.formularioBusqueda.value.tipo_consulta != "czpm")
    {
      if(this.formularioBusqueda.value.fecha_fin == null || this.formularioBusqueda.value.fecha_fin == ""){
        formularioInvalido = true;
        mensaje += "<li>Seleccione Fecha de Fin</li>";
      }
    }

    const fechaInicio = new Date(`${this.formularioBusqueda.value.fecha_inicio} ${'00:00:00'}`);
    const fechaFin = new Date(`${this.formularioBusqueda.value.fecha_fin} ${'00:00:00'}`);
    
    if(fechaInicio > fechaFin)
    {
      formularioInvalido = true;
      mensaje += "<li>La Fecha de Inicio no debe ser mayor a la de Fin</li>";
    }

    let days = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24) )

    //console.log('Días: '+ Number(days));
    if(days > 91)
    {
      formularioInvalido = true;
      mensaje += "<li>El rango de consulta no puede ser mayor a 3 meses</li>";
    }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    this.obtenerCertificadosMovilizacion();
  }

 /* calculateTotalsByCategory(data: any) {
    //const result = {};

    data.resultado.forEach((certificado: any) => {
      const idCertificado = certificado.idCertificadoMovilizacion;

      // Si no existe el idCertificado en el resultado, inicialízalo
      if (!result[idCertificado]) {
        result[idCertificado] = {};
      }

      // Procesar los detalles del certificado
      certificado.detalles.forEach((detalle: any) => {
        const categoria = detalle.codigoCategoriaBovino;

        // Si no existe la categoría en este certificado, inicialízala
        if (!result[idCertificado][categoria]) {
          result[idCertificado][categoria] = 0;
        }

        // Incrementa el contador de la categoría
        result[idCertificado][categoria]++;
      });
    });

    //this.totals = this.dataProcessingService.calculateTotalsByCategory(jsonData);
    console.log(result); // Verifica los resultados en la consola

    return result;
  }*/


    obtenerCategoriasYValoresPorIdCertificado(idCertificado: string): [string, number][] {
      const datos = this.totalAnimalesInd[idCertificado]; // Accede al certificado específico
      if (!datos || typeof datos !== 'object') return []; // Si no hay datos, devuelve un array vacío
      return Object.entries(datos); // Devuelve un array con pares [clave, valor]
      
    }

  /**
   * Permite obtener los certificados de movilización por parámetro (optimizado)
   */
  obtenerCertificadosMovilizacion(){

    Swal.fire({
      title: 'Buscando Certificados de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this.totalAnimalesInd = {};

    this.formularioBusqueda.controls.dato.setValue(this.formularioBusqueda.value.dato.replace(/'/g, '-'));

    if(this.formularioBusqueda.value.inputTipoConsulta === 'u100')
    {
      this.inicio = 0;
      this.fin = this.rango;
      let parametros: any = {};
      //const fechaFin = new Date(`${this.formularioBusqueda.value.fecha_inicio} ${'00:00:00'}`);

        switch (this.formularioBusqueda.value.tipo_consulta) {
          case 'czpm':
            parametros = { 
              codigo: `%${this.formularioBusqueda.value.dato.trim()}`,
              INICIO: this.inicio,
              LIMITE: this.fin
            }
            //console.log(parametros);
            break;
          case 'idemi':
            if(this.formularioBusqueda.value.estado == "-1")
            {
              parametros = { 
                numeroIdentificacion: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                INICIO: this.inicio,
                LIMITE: this.fin
              }
            }else
            {
              parametros = { 
                numeroIdentificacion: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                idEstadoDocumento: this.formularioBusqueda.value.estado,
                INICIO: this.inicio,
                LIMITE: this.fin
              }
            }
            //console.log(parametros);
            break;
          case 'idrep':
            if(this.formularioBusqueda.value.estado == "-1")
              {
                parametros = { 
                  numeroIdentificacionPropietarioSitioDestino: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }else
              {
                parametros = { 
                  numeroIdentificacionPropietarioSitioDestino: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  idEstadoDocumento: this.formularioBusqueda.value.estado,
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }
            break;
          case 'idcon':
            if(this.formularioBusqueda.value.estado == "-1")
              {
                parametros = { 
                  cedulaTransportista: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }else
              {
                parametros = { 
                  cedulaTransportista: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  idEstadoDocumento: this.formularioBusqueda.value.estado,
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }
            break;
          case 'placa':
            if(this.formularioBusqueda.value.estado == "-1")
              {
                parametros = { 
                  placaVehiculo: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }else
              {
                parametros = { 
                  placaVehiculo: this.formularioBusqueda.value.dato.toLocaleUpperCase().trim(),
                  idEstadoDocumento: this.formularioBusqueda.value.estado,
                  INICIO: this.inicio,
                  LIMITE: this.fin
                }
              }
            break;
        }

      this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacion(parametros)
      .subscribe( (certificados: CertificadoMovilizacion[]) => {

      this.listaCertificadosMovilizacion = certificados;
      
      if(this.listaCertificadosMovilizacion.length > 0)
      {
        certificados.forEach((certificado: any) => {
        //Id del certificado de movilización
        const idCertificado = certificado.idCertificadoMovilizacion;
        // Si no existe el idCertificado en el resultado, inicialízalo
        if (!this.totalAnimalesInd[idCertificado]) {
          this.totalAnimalesInd[idCertificado] = { Total: 0 }; // Incluimos la propiedad total
        }
        // Si no existe el idCertificado en el resultado, inicialízalo
        if (!this.totalAnimalesInd[idCertificado]) {
          this.totalAnimalesInd[idCertificado] = {};
        }

        // Procesar los detalles del certificado
        certificado.detalles.forEach((detalle: any) => {
        let categoria = detalle.nombreCategoriaBovino;

          // Si la categoría es null, asignar un nombre basado en sexo y taxonomía
        if (!categoria) {
          if (detalle.codigoTaxonomia === "bubalus_bubalis") {
            categoria = detalle.codigoSexoBovino === "macho" ? "Búfalo M" : "Búfalo H";
          } else 
          {
            categoria = "Indefinido";
          }
        }

        // Si no existe la categoría en este certificado, inicialízala
        if (!this.totalAnimalesInd[idCertificado][categoria]) {
          this.totalAnimalesInd[idCertificado][categoria] = 0;
        }
      
        this.totalAnimalesInd[idCertificado][categoria]++;// Incrementa el contador de la categoría
        this.totalAnimalesInd[idCertificado].Total++; // Incrementa el total del certificado
      });
    });
    
    for (const certificadoId in this.totalAnimalesInd) {
      if (this.totalAnimalesInd[certificadoId].Total !== undefined) {
        // Extraer el valor de 'total'
        const totalValue = this.totalAnimalesInd[certificadoId].Total;
    
        // Eliminar la clave 'Total' del objeto
        delete this.totalAnimalesInd[certificadoId].Total;
    
        // Agregar 'Total' al final del objeto
        this.totalAnimalesInd[certificadoId] = {
          ...this.totalAnimalesInd[certificadoId], // Otras categorías
          Total: totalValue, // Agregar 'total' al final
        };
      }
    }

    // Totalizar animales de todos los ceertificados de movilización del array
    
    certificados.forEach( (itemBovino: CertificadoMovilizacion) => {
      
      for ( let i = 0; i < itemBovino.detalles.length; i++ ) {
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'ternera' ) {
            this.terneras++;
        }
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'ternero' ) {
            this.terneros++;
        }
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'vacona' ) {
           this.vaconas++;
        }
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'torete' ) {
           this.toretes++;
        }
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'vaca' ) {
           this.vacas++;
        }
        if (itemBovino.detalles[i].codigoCategoriaBovino === 'toro' ) {
           this.toros++;
        }
        if ( itemBovino.detalles[i].codigoSexoBovino === 'macho' && itemBovino.detalles[i].codigoTaxonomia === 'bubalus_bubalis') {
           this.bufalosMachos++;
        }
        if ( itemBovino.detalles[i].codigoSexoBovino === 'hembra' && itemBovino.detalles[i].codigoTaxonomia === 'bubalus_bubalis') {
           this.bufalosHembras++;
        }
        }
      });

      this.totalAnimales = this.terneras + this.terneros + this.vaconas + this.toretes + this.vacas + this.toros + this.bufalosMachos + this.bufalosHembras;
      Swal.close();
  }else
  {
    Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
  }
  });
    }else
    {
      let parametros: any = {};

      switch (this.formularioBusqueda.value.tipo_consulta) {
          case 'idemi':
            parametros = { 
              identificacionSolicitante: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idrep':
            parametros = { 
              identificacionRecibe: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idcon':
            parametros = { 
              cedulaTransportista: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'placa':
            parametros = { 
              placaVehiculo: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
            case 'prov':
              parametros = { 
              provinciaOrigen: this.formularioBusqueda.value.prov_origen,
              provinciaDestino: this.formularioBusqueda.value.prov_destino,
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
        }
      
      this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacionFechas(parametros)
      .subscribe( (certificados: CertificadoMovilizacion[]) => {
        this.listaCertificadosMovilizacionFechas = certificados;

        if(this.listaCertificadosMovilizacionFechas.length > 0)
        {
          certificados.forEach( (itemBovino: CertificadoMovilizacion) => {
          //if (itemBovino.codigoEstadoDocumento !== 'A' ) {
            this.terneras+=Number(itemBovino.terneras);
            this.terneros+=Number(itemBovino.terneros);
            this.vacas+=Number(itemBovino.vacas);
            this.vaconas+=Number(itemBovino.vaconas);
            this.toros+=Number(itemBovino.toros);
            this.toretes+=Number(itemBovino.toretes);
            this.bufalosHembras+=Number(itemBovino.bufalosHembras);
            this.bufalosMachos+=Number(itemBovino.bufalosMachos);
          //}
          if (itemBovino.codigoEstadoDocumento === 'A' ) {
            this.totalAnulados++;
          }
        });
  
        this.totalAnimales = this.terneras + this.terneros + this.vaconas + this.toretes + this.vacas + this.toros + this.bufalosMachos + this.bufalosHembras;
        Swal.close();
    }else
    {
      Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
    }
      
    });
    }
  }

  /**
   * Buscar certificado de movilización
   * @returns 
   */
  generarReporte(){

    this.limpiarContadores();

    //this.formularioBusqueda.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formularioBusqueda.value.tipo_consulta == "prov")
      {
        if(this.formularioBusqueda.value.prov_origen == '-1' && this.formularioBusqueda.value.prov_destino == '-1'){
          formularioInvalido = true;
          mensaje += "<li>Seleccione al menos una provincia de origen o destino.</li>";
        }
      }
    
    if(this.formularioBusqueda.value.tipo_consulta != "czpm")
    {
      if(this.formularioBusqueda.value.fecha_inicio == null || this.formularioBusqueda.value.fecha_inicio == ""){
        formularioInvalido = true;
        mensaje += "<li>Seleccione Fecha de Inicio</li>";
      }
    }

    if(this.formularioBusqueda.value.tipo_consulta != "czpm")
    {
      if(this.formularioBusqueda.value.fecha_fin == null || this.formularioBusqueda.value.fecha_fin == ""){
        formularioInvalido = true;
        mensaje += "<li>Seleccione Fecha de Fin</li>";
      }
    }

    const fechaInicio = new Date(`${this.formularioBusqueda.value.fecha_inicio} ${'00:00:00'}`);
    const fechaFin = new Date(`${this.formularioBusqueda.value.fecha_fin} ${'00:00:00'}`);
    
    if(fechaInicio > fechaFin)
    {
      formularioInvalido = true;
      mensaje += "<li>La Fecha de Inicio no debe ser mayor a la de Fin</li>";
    }

    let days = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24) )

    //console.log('Días: '+ Number(days));

    if(days > 31)
    {
      formularioInvalido = true;
      mensaje += "<li>El rango de consulta no puede ser mayor a 1 mes</li>";
    }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    this.obtenerDatosMovilizacion();
  }

  /**
   * Permite obtener los certificados de movilización que concuerden
   */
  obtenerDatosMovilizacion(){

    Swal.fire({
      title: 'Buscando Certificados de Movilización...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

      let parametros: any = {};

        switch (this.formularioBusqueda.value.tipo_consulta) {
            case 'prov':
              parametros = { 
              provinciaOrigen: this.formularioBusqueda.value.prov_origen,
              provinciaDestino: this.formularioBusqueda.value.prov_destino,
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              estado: this.formularioBusqueda.value.estado,
              bandera: this.formularioBusqueda.value.tipo_consulta
            }
            break;
        }
      
      this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacionFechas(parametros)
      .subscribe( (certificados: CertificadoMovilizacion[]) => {
        this.listaCertificadosMovilizacionFechas = certificados;

        if(this.listaCertificadosMovilizacionFechas.length > 0)
        {
          certificados.forEach( (itemBovino: CertificadoMovilizacion) => {
          //if (itemBovino.codigoEstadoDocumento !== 'A' ) {
            this.terneras+=Number(itemBovino.terneras);
            this.terneros+=Number(itemBovino.terneros);
            this.vacas+=Number(itemBovino.vacas);
            this.vaconas+=Number(itemBovino.vaconas);
            this.toros+=Number(itemBovino.toros);
            this.toretes+=Number(itemBovino.toretes);
            this.bufalosHembras+=Number(itemBovino.bufalosHembras);
            this.bufalosMachos+=Number(itemBovino.bufalosMachos);
          //}
          if (itemBovino.codigoEstadoDocumento === 'A' ) {
            this.totalAnulados++;
          }
        });
  
        this.totalAnimales = this.terneras + this.terneros + this.vaconas + this.toretes + this.vacas + this.toros + this.bufalosMachos + this.bufalosHembras;
        Swal.close();
        this.exportarExcel();
    }else
    {
      Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
    }
      
    });
    
  }

  /**
   * Obtenemos la página anterior
   */
   anterior(){
    //this.inicio = this.inicio - this.rango;
    let parametros: any = {};

        switch (this.formularioBusqueda.value.tipo_consulta) {
          case 'idemi':
            parametros = { 
              identificacionSolicitante: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idrep':
            parametros = { 
              identificacionRecibe: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idcon':
            parametros = { 
              cedulaTransportista: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'placa':
            parametros = { 
              placaVehiculo: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
        }
      
        this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacionFechas(parametros)
        .subscribe( (certificados: CertificadoMovilizacion[]) => {
          this.listaCertificadosMovilizacionFechas = certificados;
          if(this.listaCertificadosMovilizacionFechas.length > 0)
          {
            certificados.forEach( (itemBovino: CertificadoMovilizacion) => {
            if (itemBovino.codigoEstadoDocumento !== 'A' ) {
              this.terneras+=Number(itemBovino.terneras);
              this.terneros+=Number(itemBovino.terneros);
              this.vacas+=Number(itemBovino.vacas);
              this.vaconas+=Number(itemBovino.vaconas);
              this.toros+=Number(itemBovino.toros);
              this.toretes+=Number(itemBovino.toretes);
              this.bufalosHembras+=Number(itemBovino.bufalosHembras);
              this.bufalosMachos+=Number(itemBovino.bufalosMachos);
            }
            
            if (itemBovino.codigoEstadoDocumento === 'A' ) {
              this.totalAnulados++;
            }
          });
    
          this.totalAnimales = this.terneras + this.terneros + this.vaconas + this.toretes + this.vacas + this.toros + this.bufalosMachos + this.bufalosHembras;
          Swal.close();
      }
      });
    }
  
  /**
   * Obtenemos la página siguiente
   */
  siguiente(){
    //this.inicio = this.inicio - this.rango;
    let parametros: any = {};

        switch (this.formularioBusqueda.value.tipo_consulta) {
          case 'idemi':
            parametros = { 
              identificacionSolicitante: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idrep':
            parametros = { 
              identificacionRecibe: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'idcon':
            parametros = { 
              cedulaTransportista: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
          case 'placa':
            parametros = { 
              placaVehiculo: this.formularioBusqueda.value.dato.toLocaleUpperCase(),
              fechaInicio: this.formularioBusqueda.value.fecha_inicio,
              fechaFin: this.formularioBusqueda.value.fecha_fin,
              bandera: this.formularioBusqueda.value.tipo_consulta//,
              //INICIO: this.inicio,
              //LIMITE: this.fin
            }
            break;
        }
      
        this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacionFechas(parametros)
        .subscribe( (certificados: CertificadoMovilizacion[]) => {
          this.listaCertificadosMovilizacionFechas = certificados;
          if(this.listaCertificadosMovilizacionFechas.length > 0)
          {
            certificados.forEach( (itemBovino: CertificadoMovilizacion) => {
            if (itemBovino.codigoEstadoDocumento !== 'A' ) {
              this.terneras+=Number(itemBovino.terneras);
              this.terneros+=Number(itemBovino.terneros);
              this.vacas+=Number(itemBovino.vacas);
              this.vaconas+=Number(itemBovino.vaconas);
              this.toros+=Number(itemBovino.toros);
              this.toretes+=Number(itemBovino.toretes);
              this.bufalosHembras+=Number(itemBovino.bufalosHembras);
              this.bufalosMachos+=Number(itemBovino.bufalosMachos);
            }
            
            if (itemBovino.codigoEstadoDocumento === 'A' ) {
              this.totalAnulados++;
            }
          });
    
          this.totalAnimales = this.terneras + this.terneros + this.vaconas + this.toretes + this.vacas + this.toros + this.bufalosMachos + this.bufalosHembras;
          Swal.close();
      }
      });
  }

  cambiarTipoConsulta()
  {
    /*this.limpiarContadores();
    this.formularioBusqueda.controls.dato.setValue('');
    this.formularioBusqueda.controls.fecha_inicio.setValue('');
    this.formularioBusqueda.controls.fecha_fin.setValue('');*/

    if(this.formularioBusqueda.value.tipo_consulta == "czpm")
    {
      this.formularioBusqueda.controls.inputTipoConsulta.setValue('u100');
    }
    if(this.formularioBusqueda.value.tipo_consulta == "prov")
    {
      this.formularioBusqueda.controls.inputTipoConsulta.setValue('rango');
      this.tipoConsulta = true;
    }

    if(this.formularioBusqueda.value.inputTipoConsulta == "u100")
    {
      this.tipoConsulta = false;
    }else
    {
      this.tipoConsulta = true;
    }
  }

  cambiarTipoParametro()
  {
    this.limpiarContadores();
    this.fechaInicialReporte();
    this.formularioBusqueda.controls.prov_origen.setValue('-1');
    this.formularioBusqueda.controls.prov_destino.setValue('-1');
    this.formularioBusqueda.controls.estado.setValue('-1');
    //this.fecha
    //this.formularioBusqueda.controls.fecha_inicio.setValue(new Date().toISOString().substring(0, 10));
    //this.formularioBusqueda.controls.fecha_fin.setValue(new Date().toISOString().substring(0, 10));
    //this.formularioBusqueda.value.fecha_inicio = new Date().toISOString().substring(0, 10);
    //this.formularioBusqueda.value.fecha_fin = new Date().toISOString().substring(0, 10);
    this.formularioBusqueda.controls.dato.setValue('');
    this.formularioBusqueda.controls.inputTipoConsulta.setValue('u100');
    this.tipoConsulta = false;
    //this.formularioBusqueda.controls.fecha_inicio.setValue('');
    //this.formularioBusqueda.controls.fecha_fin.setValue('');

    if(this.formularioBusqueda.value.tipo_consulta == "czpm")
    {
      this.tipoCZPM = true;
      this.tipoPROV = false;
      //this.formularioBusqueda.controls.inputTipoConsulta.setValue('u100');
    }
    else
    { 
      if(this.formularioBusqueda.value.tipo_consulta == "prov")
      {
        this.tipoCZPM = false;
        this.tipoPROV = true;
        this.formularioBusqueda.controls.inputTipoConsulta.setValue('rango');
        this.tipoConsulta = true;
      }else
      {
        this.tipoCZPM = false;
        this.tipoPROV = false;
        //this.formularioBusqueda.controls.inputTipoConsulta.setValue('u100');
      }
    }

    /*switch (this.formularioBusqueda.value.tipo_consulta) {
      case 'czpm':
        this.tipoCZPM = true;
        //this.tipoID = false;
        this.tipoPROV = false;
        break;
      case 'idemi':
        this.tipoCZPM = false;
        //this.tipoID = true;
        this.tipoPROV = false;
        break;
      case 'idrep':
        this.tipoCZPM = false;
        //this.tipoID = true;
        this.tipoPROV = false;
        break;
      case 'idcon':
        this.tipoCZPM = false;
        //this.tipoID = true;
        this.tipoPROV = false;
        break;
      case 'placa':
        this.tipoCZPM = false;
        this.tipoID = true;
        this.tipoPROV = false;
        break;
      case 'prov':
        this.tipoCZPM = false;
        //this.tipoID = false;
        this.tipoPROV = true;
        break;
    }*/

  }

  

  /**
   * Actualiza el estado de un certificado de movilización
   * @param id 
   * @param accion
   */
   actualizarEstado(id: number, accion: string){

    let certificado = new CertificadoMovilizacion();
    certificado.idCertificadoMovilizacion = id;
    //certificado.usuarioEstado = localStorage.getItem('identificacion');
    var accionTexto = "";

  if(!this.tipoCZPM){
    this.listaCertificadosMovilizacionFechas.forEach( (itemBovino: CertificadoMovilizacion) => {
     if (itemBovino.idCertificadoMovilizacion == id ) {
      this.numeroCzpm = itemBovino.codigo;
     }
   });
  }else
  {
    this.listaCertificadosMovilizacion.forEach( (itemBovino: CertificadoMovilizacion) => {
     if (itemBovino.idCertificadoMovilizacion == id ) {
      this.numeroCzpm = itemBovino.codigo;
     }
    });
  }

  switch(accion)
  {
    case 'Confirmar': { 
      certificado.idEstadoDocumento="6";
      accionTexto = "confirmado";
      break; 
   }
    case 'Autorizar': { 
      certificado.idEstadoDocumento="7";
      accionTexto = "autorizado";
      break; 
   }
   case 'Anular': { 
    certificado.idEstadoDocumento="9";
    accionTexto = "anulado";
    break; 
  }
   default: { 
      break; 
   } 
  }

  //Mensaje de confirmación
Swal.fire({
  title: '¿'+accion.toLocaleUpperCase()+' CZPM-M N° '+this.numeroCzpm+'?',
  text: "¡Esta acción no podrá revertirse!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí, ¡ '+accion.toLocaleLowerCase()+' !',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Actualizando estado del CZPM-M...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
         this.servicioCertificadoMovilizacion.actualizarEstadoCertificadoMovilizacion(certificado)
        .subscribe( (respuesta: any) => {
          Swal.fire('Éxito', 'CZPM-M N° '+this.numeroCzpm+ ' - '+accionTexto.toLocaleUpperCase(), 'success');
          //this.listaCertificadosMovilizacion = [];
          //this.listaCertificadosMovilizacionFechas = [];
          this.formularioBusqueda.reset();
          this.formularioBusqueda.controls.tipo_consulta.setValue('czpm');
          //this.cambiarTipoConsulta();
          this.cambiarTipoParametro();
        });
      }
    });
  }

  /**
   * Descarga el certificado de movilización original
   * @param id 
   */
  descargarCertificadoMovilizacion(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando el Certificado de Movilización.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoMovilizacion.obtenerPdfCertificadoMovilizacion(id, false)
    .subscribe( (resp: any) => {
      //console.log(resp);
      Swal.close();
      this.servicioVisorPdf.establecerArchivoDesdeBase64(resp.contenido);
      this.servicioVisorPdf.abrir();
    });
  }

}
