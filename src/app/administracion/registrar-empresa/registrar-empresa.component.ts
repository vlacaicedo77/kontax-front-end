import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { showLoading, showWarning, showSuccessAutoClose, showError, closeAlert, showInfo, showSuccess, showHtmlAlert } from '../../config/alertas';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
import { Empresas } from 'src/app/modelos/empresas.modelo';
// Importación de servicios.
import { CatalogosService } from 'src/app/servicios/catalogos-genericos/catalogos-genericos.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { EmpresasService } from 'src/app/servicios/empresas/empresas.service';
import { CantonService } from 'src/app/servicios/canton/canton.service';
import { ParroquiaService } from 'src/app/servicios/parroquia/parroquia.service';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
// Importamos scripts
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';

@Component({
  selector: 'app-registrar-empresa',
  templateUrl: './registrar-empresa.component.html'
})
export class RegistrarEmpresaComponent implements OnInit {
  // Referencia al input de archivo
  @ViewChild('fileInput') fileInput!: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formulario: UntypedFormGroup;
  formularioBusqueda: UntypedFormGroup;
  //**** Cuerpo de modelos ****/
  usuario: Usuario = new Usuario();
  //**** Listas ****/
  public listaDatos = [];
  //**** Variables auxiliares ****/
  contrasenaTemporal: string = '';
  public idUsuario: number;
  public email: string;
  public nombreUsuario: string = '';
  public activarAomz: number = 1;
  public visualizarAomz: boolean = false;
  estadoUsuario: number;
  banderaUsuarioNuevo: boolean = true; // false = Usuario existente // true = Usuario Nuevo
  banderaEditar: boolean = false; // true = Editar // false = Nuevo
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  idEmpresa: number;
  nombreTipoProveedor: string = '';
  encriptar: any;

  catalogos: { [key: string]: any[] } = {};
  //cargandoCatalogos = true;

  // Variables del componente
  certificadoSeleccionado: File | null = null;
  hayCertificadoCargado: boolean = false;
  certificadoNombre: string = '';
  certificadoTamanio: string = '';
  mostrarPassword: boolean = false;
  isDragging: boolean = false;
  errorValidacion: string = '';

  // Variables nuevas
  certificadoYaCargadoEnBD: boolean = false;
  estaSubiendoArchivo: boolean = false;
  certificadoEnMemoria: boolean = false; // Para saber si hay archivo en memoria (no en BD)

  // Añade estas propiedades a tu componente
  /*currentPage: number = 1;
  itemsPerPage: number = 3; // Puedes cambiar esto según necesites
  totalPages: number = 0;*/

  // Variables para paginación
  inicio: number = 0;
  rango: number = 5; // Items por página
  totalRegistros: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 5; // Para mantener consistencia con la UI

  // Variables auxiliares
  ultimosParametrosBusqueda: any = {};
  //cargando: boolean = false;

  constructor(
    public servicioUsuario: UsuarioService,
    private catalogosService: CatalogosService,
    private servicioDinardap: DinardapService,
    private empresasService: EmpresasService,
    private router: Router,
    private servicioscript: ScriptsService
  ) {
    // Inicialización
    this.inicio = 0;
    this.rango = 5;
    this.itemsPerPage = this.rango;
  }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarCatalogos();
    //this.verificarRolUsuario(); // Se valida el acceso del usuario, en base a su rol. Que sea usuario interno.
    this.encriptar = new JSEncrypt();
    this.servicioscript.inicializarScripts();
    this.contrasenaTemporal = this.generarClaveAleatoria(); //Generar la contraseña aleatoria temporal
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formulario = new UntypedFormGroup({
      // PERFIL USUARIO
      idUsuario: new UntypedFormControl(''),
      idUsuarioLock: new UntypedFormControl(''),
      razonSocial: new UntypedFormControl('', [Validators.required, Validators.maxLength(200)]),
      nombreComercial: new UntypedFormControl('', [Validators.maxLength(200)]),
      identificacionRepresentante: new UntypedFormControl('', [Validators.maxLength(13)]),
      nombresRepresentante: new UntypedFormControl('', [Validators.maxLength(200)]),
      // CLASIFICACIÓN TRIBUTARIA
      idRegimenesTributarios: new UntypedFormControl(null, [Validators.required]),
      esContribuyenteEspecial: new UntypedFormControl(false),
      numeroResolucionContribuyenteEspecial: new UntypedFormControl('', [Validators.maxLength(50)]),
      fechaDesignacionContribuyenteEspecial: new UntypedFormControl(null),
      // AGENTE DE RETENCIÓN
      esAgenteRetencion: new UntypedFormControl(false),
      esAgenteRetencionRenta: new UntypedFormControl(false),
      esAgenteRetencionIva: new UntypedFormControl(false),
      esAgenteRetencionIsd: new UntypedFormControl(false),
      numeroResolucionAgenteRetencion: new UntypedFormControl('', [Validators.maxLength(50)]),
      fechaDesignacionAgenteRetencion: new UntypedFormControl(null),
      // AUTORRETENEDOR
      esAutorretenedor: new UntypedFormControl(false),
      numeroResolucionAutorretenedor: new UntypedFormControl('', [Validators.maxLength(50)]),
      fechaInicioAutorretencion: new UntypedFormControl(null),
      porcentajeAutorretencion: new UntypedFormControl(0, [Validators.maxLength(6)]),
      // INFORMACIÓN ECONÓMICA
      actividadEconomicaPrincipal: new UntypedFormControl('', [Validators.required, Validators.maxLength(200)]),
      fechaInicioActividades: new UntypedFormControl(null, [Validators.required]),
      // OBLIGACIONES TRIBUTARIAS
      obligadoContabilidad: new UntypedFormControl(false),
      tipoContabilidad: new UntypedFormControl(null),
      debePresentarRenta: new UntypedFormControl(false),
      frecuenciaDeclaracionRenta: new UntypedFormControl(null),
      debePresentarIva: new UntypedFormControl(false),
      frecuenciaDeclaracionIva: new UntypedFormControl(null),
      // FIRMA DIGITAL
      rutaCertificadoPfx: new UntypedFormControl('', [Validators.maxLength(500)]),
      passwordCertificado: new UntypedFormControl('', [Validators.maxLength(25)]),
      fechaVencimientoCertificado: new UntypedFormControl(null),
      estadoCertificado: new UntypedFormControl(1),
      // CONTACTO
      telefonoContactoAdministrativo: new UntypedFormControl('', [Validators.required, Validators.maxLength(10)]),
      emailContactoAdministrativo: new UntypedFormControl('', [Validators.required, Validators.email, Validators.maxLength(160)])
    }, {
      validators: [
        this.contribuyenteEspecialValidator.bind(this),
        this.agenteRetencionValidator.bind(this),
        this.autorretenedorValidator.bind(this),
        this.contabilidadValidator.bind(this),
        this.rentaValidator.bind(this),
        this.ivaValidator.bind(this)
      ]
    });

    this.formularioBusqueda = new UntypedFormGroup({
      numeroRUC: new UntypedFormControl(null, [Validators.maxLength(13)]),
      estado: new UntypedFormControl('-1')
    });
  }

  // Función para obtener fecha actual en Ecuador (GMT-5)
  getFechaActualEcuador(): Date {
    const ahoraUTC = new Date();
    const offsetEcuador = -5 * 60; // -5 horas en minutos
    const ahoraEcuador = new Date(ahoraUTC.getTime() + offsetEcuador * 60000);

    // Retornar solo la fecha (sin hora)
    return new Date(
      ahoraEcuador.getUTCFullYear(),
      ahoraEcuador.getUTCMonth(),
      ahoraEcuador.getUTCDate()
    );
  }

  esFechaFutura(fechaString: string): boolean {
    if (!fechaString) return false;

    const fechaSeleccionada = new Date(fechaString);

    if (isNaN(fechaSeleccionada.getTime())) {
      return false;
    }

    const fechaSeleccionadaSolo = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate()
    );

    const fechaActualEcuador = this.getFechaActualEcuador();

    return fechaSeleccionadaSolo > fechaActualEcuador;
  }

  // Validador cuando se activa Contribuyente Especial 
  contribuyenteEspecialValidator() {
    return (formGroup: UntypedFormGroup) => {
      const esContribuyente = formGroup.get('esContribuyenteEspecial').value;
      const numeroResolucion = formGroup.get('numeroResolucionContribuyenteEspecial').value;
      const fechaDesignacion = formGroup.get('fechaDesignacionContribuyenteEspecial').value;

      const errors: any = {};

      if (esContribuyente === true) {
        if (!numeroResolucion || numeroResolucion.trim() === '') {
          errors.numeroResolucionObligatorio = 'Ingrese el número de resolución para contribuyente especial';
        }

        if (!fechaDesignacion) {
          errors.fechaDesignacionObligatoria = 'Seleccione la fecha de designación para contribuyente especial';
        } else if (this.esFechaFutura(fechaDesignacion)) {
          errors.fechaDesignacionFutura = 'La fecha de designación no puede ser futura';
        }

        if (Object.keys(errors).length > 0) {
          errors.contribuyenteEspecialError = true;
          return errors;
        }
      }

      return null;
    };
  }

  // Validador cuando se activa Agente de Retención
  agenteRetencionValidator() {
    return (formGroup: UntypedFormGroup) => {
      const esAgenteRetencion = formGroup.get('esAgenteRetencion').value;
      const esAgenteRetencionRenta = formGroup.get('esAgenteRetencionRenta').value;
      const esAgenteRetencionIva = formGroup.get('esAgenteRetencionIva').value;
      const esAgenteRetencionIsd = formGroup.get('esAgenteRetencionIsd').value;
      const numeroResolucion = formGroup.get('numeroResolucionAgenteRetencion').value;
      const fechaDesignacion = formGroup.get('fechaDesignacionAgenteRetencion').value;

      if (esAgenteRetencion === true) {
        const errors: any = {};

        if (!esAgenteRetencionRenta && !esAgenteRetencionIva && !esAgenteRetencionIsd) {
          errors.tipoAgenteObligatorio = 'Seleccione al menos un tipo de impuesto que retiene (RENTA, IVA o ISD)';
        }

        if (!numeroResolucion || numeroResolucion.trim() === '') {
          errors.numeroResolucionAgenteObligatorio = 'Ingrese el número de resolución para agente de retención';
        }

        if (!fechaDesignacion) {
          errors.fechaDesignacionAgenteObligatoria = 'Seleccione la fecha de designación para agente de retención';
        } else if (this.esFechaFutura(fechaDesignacion)) {
          errors.fechaDesignacionAgenteFutura = 'La fecha de designación no puede ser futura';
        }

        if (Object.keys(errors).length > 0) {
          errors.agenteRetencionError = true;
          return errors;
        }
      }

      return null;
    };
  }

  // Validador cuando se activa Autorretenedor
  autorretenedorValidator() {
    return (formGroup: UntypedFormGroup) => {
      const esAutorretenedor = formGroup.get('esAutorretenedor').value;
      const numeroResolucion = formGroup.get('numeroResolucionAutorretenedor').value;
      const fechaInicio = formGroup.get('fechaInicioAutorretencion').value;
      const porcentaje = formGroup.get('porcentajeAutorretencion').value;

      const errors: any = {};

      if (esAutorretenedor === true) {
        if (!numeroResolucion || numeroResolucion.trim() === '') {
          errors.numeroResolucionAutorretenedorObligatorio = 'Ingrese el número de resolución para autorretenedor';
        }

        if (!fechaInicio) {
          errors.fechaInicioAutorretencionObligatoria = 'Seleccione la fecha de inicio para autorretenedor';
        } else if (this.esFechaFutura(fechaInicio)) {
          errors.fechaInicioAutorretencionFutura = 'La fecha de inicio no puede ser futura';
        }

        if (porcentaje === null || porcentaje === undefined || porcentaje === '') {
          errors.porcentajeAutorretencionObligatorio = 'Ingrese el porcentaje para autorretenedor';
        } else {
          const porcentajeNum = parseFloat(porcentaje);

          if (isNaN(porcentajeNum)) {
            errors.porcentajeAutorretencionInvalido = 'El porcentaje de autorretención debe ser un número válido';
          } else if (porcentajeNum < 0 || porcentajeNum > 100) {
            errors.porcentajeAutorretencionInvalido = 'El porcentaje de autorretención debe estar entre 0 y 100';
          } else if (porcentajeNum === 0) {
            errors.porcentajeAutorretencionInvalido = 'El porcentaje de autorretención no puede ser 0';
          }
        }

        if (Object.keys(errors).length > 0) {
          errors.autorretenedorError = true;
          return errors;
        }
      }

      return null;
    };
  }

  // Validador cuando se activa Contabilidad
  contabilidadValidator() {
    return (formGroup: UntypedFormGroup) => {
      const obligadoContabilidad = formGroup.get('obligadoContabilidad').value;
      const tipoContabilidad = formGroup.get('tipoContabilidad').value;

      if (obligadoContabilidad === true) {
        if (tipoContabilidad === null || tipoContabilidad === undefined || tipoContabilidad === '') {
          return { tipoContabilidadObligatorio: 'Seleccione el tipo de contabilidad' };
        }
      }
      return null;
    };
  }

  // Validador cuando se activa Renta
  rentaValidator() {
    return (formGroup: UntypedFormGroup) => {
      const debePresentarRenta = formGroup.get('debePresentarRenta').value;
      const frecuenciaDeclaracionRenta = formGroup.get('frecuenciaDeclaracionRenta').value;

      if (debePresentarRenta === true) {
        if (frecuenciaDeclaracionRenta === null || frecuenciaDeclaracionRenta === undefined || frecuenciaDeclaracionRenta === '') {
          return { frecuenciaRentaObligatoria: 'Seleccione la frecuencia de declaración de renta' };
        }
      }
      return null;
    };
  }

  // Validador cuando se activa IVA
  ivaValidator() {
    return (formGroup: UntypedFormGroup) => {
      const debePresentarIva = formGroup.get('debePresentarIva').value;
      const frecuenciaDeclaracionIva = formGroup.get('frecuenciaDeclaracionIva').value;

      if (debePresentarIva === true) {
        if (frecuenciaDeclaracionIva === null || frecuenciaDeclaracionIva === undefined || frecuenciaDeclaracionIva === '') {
          return { frecuenciaIvaObligatoria: 'Seleccione la frecuencia de declaración de IVA' };
        }
      }
      return null;
    };
  }

  // Método para abrir el diálogo de selección de archivos
  seleccionarArchivo(): void {
    this.fileInput.nativeElement.click();
  }

  // Método cuando se selecciona un archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  // Métodos para drag & drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.procesarArchivo(file);
      // Limpiar el dataTransfer para evitar problemas
      event.dataTransfer.clearData();
    }
  }

  procesarArchivo(file: File): void {
    this.errorValidacion = '';

    const extensionesPermitidas = ['.p12'];
    const nombreArchivo = file.name.toLowerCase();
    const extensionValida = extensionesPermitidas.some(ext => nombreArchivo.endsWith(ext));

    if (!extensionValida) {
      this.errorValidacion = 'Solo se permiten archivos .p12';
      return;
    }

    // Validar tamaño (1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      this.errorValidacion = 'El archivo no debe superar 1MB';
      return;
    }

    this.certificadoSeleccionado = file;
    this.hayCertificadoCargado = true;
    this.certificadoNombre = file.name;
    this.certificadoTamanio = this.formatearTamanio(file.size);

    // Resetear password si había uno anterior
    if (this.formulario) {
      this.formulario.patchValue({
        passwordCertificado: ''
      });
    }
  }

  formatearTamanio(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  eliminarCertificado(): void {
    this.certificadoSeleccionado = null;
    this.hayCertificadoCargado = false;
    this.certificadoNombre = '';
    this.certificadoTamanio = '';
    this.errorValidacion = '';

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    if (this.formulario) {
      this.formulario.patchValue({
        passwordCertificado: '',
        fechaVencimientoCertificado: null,
        estadoCertificado: 1
      });
    }
  }

  // Método genérico para cargar catálogos
  cargarCatalogos() {
    const catalogosRequeridos = [
      'regimenesTributarios',
      'tiempoFrecuencia',
      'tiposContabilidad'
    ];

    this.catalogosService.obtenerMultiplesCatalogos(catalogosRequeridos).subscribe({
      next: (resultados) => {
        this.catalogos = resultados;
        //this.cargandoCatalogos = false;
      },
      error: (error) => {
        console.error('Error cargando catálogos:', error);
        //this.cargandoCatalogos = false;
      }
    });
  }

  // Limpiar Contribuyente Especial
  limpiarContribuyenteEspecial() {
    if (!this.formulario.get('esContribuyenteEspecial').value) {
      this.formulario.get('numeroResolucionContribuyenteEspecial').reset('');
      this.formulario.get('fechaDesignacionContribuyenteEspecial').reset(null);
    }
  }

  // Limpiar Agente Retención
  limpiarAgenteRetencion() {
    if (!this.formulario.get('esAgenteRetencion').value) {
      this.formulario.get('esAgenteRetencionRenta').reset(false);
      this.formulario.get('esAgenteRetencionIva').reset(false);
      this.formulario.get('esAgenteRetencionIsd').reset(false);
      this.formulario.get('numeroResolucionAgenteRetencion').reset('');
      this.formulario.get('fechaDesignacionAgenteRetencion').reset(null);
      this.formulario.get('esAutorretenedor').reset(false);
    }
  }

  // Limpiar Autorretenedor
  limpiarAutorretenedor() {
    if (!this.formulario.get('esAutorretenedor').value) {
      this.formulario.get('numeroResolucionAutorretenedor').reset('');
      this.formulario.get('fechaInicioAutorretencion').reset(null);
      this.formulario.get('porcentajeAutorretencion').reset(null); // Cambié de 0 a null
    }
  }

  // Limpiar Obligado Contabilidad
  limpiarObligadoContabilidad() {
    if (!this.formulario.get('obligadoContabilidad').value) {
      this.formulario.get('tipoContabilidad').reset(null);
    }
  }

  // Limpiar Debe presentar declaración de IR (renta)
  limpiarDebePresentarRenta() {
    if (!this.formulario.get('debePresentarRenta').value) {
      this.formulario.get('frecuenciaDeclaracionRenta').reset(null);
    }
  }

  // Limpiar Debe presentar declaración de IVA
  limpiarDebePresentarIva() {
    if (!this.formulario.get('debePresentarIva').value) {
      this.formulario.get('frecuenciaDeclaracionIva').reset(null);
    }
  }

  // Limpiar Perfil de usuario
  limpiarCamposUsuario() {
    this.idUsuario = null;
    this.formulario.get('razonSocial').reset('');
    this.formulario.get('nombreComercial').reset('');
    this.formulario.get('identificacionRepresentante').reset('');
    this.formulario.get('nombresRepresentante').reset('');
    this.formulario.get('emailContactoAdministrativo').reset('');
  }

  // Limpiar Debe presentar declaración de IVA
  limpiarRegimenesTributarios() {
    this.limpiarAgenteRetencion();
    this.limpiarContribuyenteEspecial();
    this.limpiarDebePresentarIva();
    this.limpiarDebePresentarRenta();
    this.limpiarObligadoContabilidad();
  }

  // Limpiar campos de todo el formularios, variables y listas
  limpiarCamposGeneral() {
    this.formulario.get('idUsuario').reset('');
    this.limpiarCamposUsuario();
    this.formulario.get('actividadEconomicaPrincipal').reset('');
    this.formulario.get('fechaInicioActividades').reset(null);
    this.formulario.get('idRegimenesTributarios').reset(null);
    //this.limpiarRegimenesTributarios();
    this.eliminarCertificado();
    this.formulario.get('telefonoContactoAdministrativo').reset('');
    this.formulario.get('emailContactoAdministrativo').reset('');

    this.listaDatos = [];
    this.estadoUsuario = 0;
    this.banderaEditar = false;
    this.formularioVisible = false;

    // Paginación
    this.inicio = 0;
    this.currentPage = 1;
    this.totalRegistros = 0;
    this.totalPages = 1;
    this.ultimosParametrosBusqueda = {};

  }

  //**** Limpiar lista de empresad ****/
  limpiarListaDatos() {
    this.listaDatos = [];
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Limpiar campos del formulario de búsqueda ****/
  limpiarFormularioBuscar() {
    this.formularioBusqueda.controls.InputProvincia.setValue('-1');
    this.formularioBusqueda.controls.inputTipoProveedor.setValue('-1');
    this.formularioBusqueda.controls.InputEstado.setValue('-1');
    this.formularioBusqueda.controls.InputDato.setValue('');
  }

  //**** Botón cancelar ****/
  botonCancelar() {
    this.limpiarCamposGeneral();
    this.limpiarFormularioBuscar();
    this.desplazarAlInicio();
  }

  //**** Desplazar al inicio de la página ****/
  accionNuevoBoton() {
    this.formularioVisible = true;
  }

  //**** Método para buscar empresas ****/
  buscarEmpresas() {
    const parametros: any = {};
    // Obtenemos los valores del formulario
    const ruc = this.formularioBusqueda.get('numeroRUC')?.value;
    const estado = this.formularioBusqueda.get('estado')?.value;
    // Construir parámetros dinámicamente
    if (ruc !== null && ruc.trim() !== '') { parametros.numeroIdentificacion = ruc; }
    if (estado !== '-1') { parametros.estado = estado; }
    // Agregar parámetros de paginación
    parametros.INICIO = 0; // Siempre empezar desde 0 en nueva búsqueda
    parametros.LIMITE = this.rango;
    // Reiniciar variables
    this.inicio = 0;
    this.currentPage = 1;
    this.listaDatos = [];
    this.totalRegistros = 0;
    this.totalPages = 1;
    // Guardar parámetros antes de consultar
    this.ultimosParametrosBusqueda = { ...parametros };
    // Llamar al servicio
    this.consultarEmpresas(parametros);
  }

  //**** Método que consulta empresas ****/
  consultarEmpresas(parametros: any) {

    this.mostrarCargando('Espere...');

    this.empresasService.consultarEmpresas(parametros)
      .subscribe((resultado: any) => {
        closeAlert(); // Usa tu función para cerrar alertas

        if (resultado.estado === 'OK') {
          // Asignar resultados
          this.listaDatos = resultado.resultado || [];

          if (resultado.paginacion) {
            // Actualizar desde la respuesta del backend
            this.totalRegistros = resultado.paginacion.total;
            this.currentPage = resultado.paginacion.paginaActual;
            this.totalPages = resultado.paginacion.totalPaginas;
            this.itemsPerPage = resultado.paginacion.limite;
            this.rango = resultado.paginacion.limite;
            this.inicio = resultado.paginacion.inicio;
            // Asegurar que currentPage esté dentro de los límites
            if (this.currentPage < 1) this.currentPage = 1;
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
              this.currentPage = this.totalPages;
            }
          } else {
            // Si no viene paginación, estimar
            this.actualizarInformacionPaginacionEstimada();
          }

          // Mostrar mensaje si no hay resultados
          if (this.listaDatos.length === 0) {
            showInfo('','La búsqueda no ha generado resultados');
          }
        } else {
          showError('Error', resultado.mensaje || 'Error en la consulta');
        }

      }, (error) => {
        closeAlert();
        showError('Error', 'No se pudo obtener resultados: ' + error.message);
      });
  }

  //**** Método para buscar usuarios externos en la base de datos o servicio web ****/
  buscarUsuario(ruc: string) {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revise lo siguiente...<ul></br>";

    if (!this.formulario.value.idUsuario || this.formulario.value.idUsuario.trim() === '') {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    } else if (this.formulario.value.idUsuario.length !== 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido (13 dígitos)</li>";
    }

    if (formularioInvalido) {
      mensaje += "</ul>";
      showHtmlAlert(
        '¡Advertencia!',
         `<div style="text-align: left;">${mensaje}</div>`,
        'warning');
      return;
    }

    // Mostrar loading para la búsqueda
    showLoading('Buscando información del RUC...');

    // Llamar a obtenerProveedores y esperar a la respuesta
    this.empresasService.consultarEmpresas({ numeroIdentificacion: ruc })
      .subscribe((resultado: any) => {
        this.listaDatos = resultado.resultado;

        // Verificamos si hay elementos en la lista
        if (this.listaDatos && this.listaDatos.length > 0) {
          closeAlert();
          showWarning('¡Advertencia!', 'Ya existe un registro con el RUC ' + ruc);
          return;
        }

        // Continuar con la lógica después de obtener los proveedores
        let identificacionUsuario = ruc;

        this.servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, null, null)
          .subscribe((resp: any) => {
            closeAlert(); // Cerrar loading

            if (resp.estado === 'OK') {
              if (resp.resultado.length == 1) {
                showSuccess('¡Éxito!', 'Búsqueda exitosa, registro encontrado.');

                // Cargar resumen
                this.usuario = new Usuario();
                this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
                this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
                this.usuario.nombres = resp.resultado[0].nombres;
                this.usuario.nombreComercial = resp.resultado[0].nombre_comercial;
                this.usuario.identificacionRepresentanteLegal = resp.resultado[0].identificacion_representante_legal;
                this.usuario.nombresRepresentanteLegal = resp.resultado[0].nombres_representante_legal;
                this.usuario.email = resp.resultado[0].email.trim().toLocaleLowerCase();
                this.usuario.estado = resp.resultado[0].estado;
                this.email = this.usuario.email;

                // Cargar los datos del usuario en el formulario y variables
                this.idUsuario = this.usuario.idUsuario;
                this.nombreUsuario = this.usuario.nombres;
                this.formulario.controls.razonSocial.setValue(this.usuario.nombres);
                this.formulario.controls.nombreComercial.setValue(this.usuario.nombreComercial);
                this.formulario.controls.identificacionRepresentante.setValue(this.usuario.identificacionRepresentanteLegal);
                this.formulario.controls.nombresRepresentante.setValue(this.usuario.nombresRepresentanteLegal);
                this.formulario.controls.emailContactoAdministrativo.setValue(this.usuario.email);
                this.estadoUsuario = this.usuario.estado;
                this.banderaUsuarioNuevo = false; // Usuario existente en la base de datos

              } else {
                // Si no hay usuarios, proceder con consulta Dinarp
                this.consultaDinarpRUC(ruc);
                this.banderaUsuarioNuevo = true; // Usuario nuevo
                this.contrasenaTemporal = this.generarClaveAleatoria(); // Generar la contraseña aleatoria temporal
                this.estadoUsuario = 1;

                // Podrías mostrar un info aquí si quieres:
                // showInfo('Usuario nuevo', 'Se procederá a crear un nuevo usuario con este RUC');
              }
            } else {
              showError('Error en la consulta', resp.mensaje);
            }
          }, (error: any) => {
            closeAlert();
            showError('Error de conexión', 'No se pudo consultar el servicio de usuarios externos');
          });
      }, (error: any) => {
        closeAlert();
        let mensajeError = 'No se pudo verificar proveedores existentes. ';

        if (error.status === 0) {
          mensajeError += 'Error de conexión al servidor.';
        } else if (error.error?.mensaje) {
          mensajeError += error.error.mensaje;
        } else {
          mensajeError += error.message || 'Intente nuevamente más tarde.';
        }

        showError('Error del servicio', mensajeError);
      });
  }

  //**** Método para consultar un RUC a través del servicio web de DINARP ****/
  consultaDinarpRUC(documento: string) {
    if (documento.trim().length == 13) {
      this.mostrarCargando('Consultando datos en el SRI');
      this.limpiarCamposUsuario();
      // Crea un array con los observables
      const observables = [
        this.servicioDinardap.obtenerUbicacionesSri(documento),
        this.servicioDinardap.obtenerCorreoElectronicoContribuyente(documento),
        this.servicioDinardap.obtenerRepresentanteLegal(documento)
      ];
      // Usa forkJoin para esperar a que todos los observables se completen
      forkJoin(observables).subscribe(
        ([ubicaciones, correos, representante]) => { // Desestructuración de los resultados
          if (ubicaciones.length > 0) {
            const ubicacion: UbicacionSri = ubicaciones[0];
            this.formulario.controls.razonSocial.setValue(ubicacion.razonSocial);
          }

          if (correos.length > 0) {
            const itemCorreo: EmailContribuyente = correos[0];
            this.formulario.controls.emailContactoAdministrativo.setValue(itemCorreo.email);
            this.formulario.controls.nombreComercial.setValue(itemCorreo.nombreComercial);
          }

          if (representante.length > 0) {
            const itemRepresentante: RucRepresentanteLegal = representante[0];
            this.formulario.controls.nombresRepresentante.setValue(itemRepresentante.nombreRepreLegal);
            this.formulario.controls.identificacionRepresentante.setValue(itemRepresentante.idRepreLegal);
          }

          Swal.close(); // Cierra el modal solo después de que todo se complete

          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Datos extraídos desde la fuente (SRI)',
            showConfirmButton: false,
            timer: 1500
          });
        },
        (error) => { // Manejo de errores
          Swal.close(); // Asegura cerrar el modal incluso en caso de error
          Swal.fire('Error', 'Ocurrió un error al consultar los datos en la fuente (SRI)', 'error');
        }
      );
    }
  }

  //**** Método para crear usuarios externos y registrar proveedores ****/
  crearUsuario() {

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revise lo siguiente...<ul></br>";

    // Validación RUC
    if (!this.formulario.value.idUsuario || this.formulario.value.idUsuario.trim() === '') {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    } else if (this.formulario.value.idUsuario.length !== 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido (13 dígitos)</li>";
    }

    // Validación razón social
    if (!this.formulario.value.razonSocial || !this.formulario.value.razonSocial.trim()) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese razón social</li>";
    }

    // Validación Régimen Tributario
    if (!this.formulario.value.idRegimenesTributarios) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione régimen tributario</li>";
    }

    // Validar contribuyente especial
    const erroresContribuyente = this.contribuyenteEspecialValidator()(this.formulario);
    if (erroresContribuyente?.contribuyenteEspecialError) {
      formularioInvalido = true;
      if (erroresContribuyente.numeroResolucionObligatorio) {
        mensaje += `<li>${erroresContribuyente.numeroResolucionObligatorio}</li>`;
      }
      if (erroresContribuyente.fechaDesignacionObligatoria) {
        mensaje += `<li>${erroresContribuyente.fechaDesignacionObligatoria}</li>`;
      }
      if (erroresContribuyente.fechaDesignacionFutura) {
        mensaje += `<li>${erroresContribuyente.fechaDesignacionFutura}</li>`;
      }
    }

    // Validar agente de retención
    const erroresAgente = this.agenteRetencionValidator()(this.formulario);
    if (erroresAgente?.agenteRetencionError) {
      formularioInvalido = true;
      if (erroresAgente.tipoAgenteObligatorio) {
        mensaje += `<li>${erroresAgente.tipoAgenteObligatorio}</li>`;
      }
      if (erroresAgente.numeroResolucionAgenteObligatorio) {
        mensaje += `<li>${erroresAgente.numeroResolucionAgenteObligatorio}</li>`;
      }
      if (erroresAgente.fechaDesignacionAgenteObligatoria) {
        mensaje += `<li>${erroresAgente.fechaDesignacionAgenteObligatoria}</li>`;
      }
      if (erroresAgente.fechaDesignacionAgenteFutura) {
        mensaje += `<li>${erroresAgente.fechaDesignacionAgenteFutura}</li>`;
      }
    }

    // Validar autorretenedor
    const erroresAutorretenedor = this.autorretenedorValidator()(this.formulario);
    if (erroresAutorretenedor?.autorretenedorError) {
      formularioInvalido = true;
      if (erroresAutorretenedor.numeroResolucionAutorretenedorObligatorio) {
        mensaje += `<li>${erroresAutorretenedor.numeroResolucionAutorretenedorObligatorio}</li>`;
      }
      if (erroresAutorretenedor.fechaInicioAutorretencionObligatoria) {
        mensaje += `<li>${erroresAutorretenedor.fechaInicioAutorretencionObligatoria}</li>`;
      }
      if (erroresAutorretenedor.fechaInicioAutorretencionFutura) {
        mensaje += `<li>${erroresAutorretenedor.fechaInicioAutorretencionFutura}</li>`;
      }
      if (erroresAutorretenedor.porcentajeAutorretencionObligatorio) {
        mensaje += `<li>${erroresAutorretenedor.porcentajeAutorretencionObligatorio}</li>`;
      }
      if (erroresAutorretenedor.porcentajeAutorretencionInvalido) {
        mensaje += `<li>${erroresAutorretenedor.porcentajeAutorretencionInvalido}</li>`;
      }
    }

    if (this.formulario.value.actividadEconomicaPrincipal == null || this.formulario.value.actividadEconomicaPrincipal.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese actividad económica principal</li>";
    }

    // Validar fecha inicio actividades
    if (!this.formulario.value.fechaInicioActividades ||
      this.formulario.value.fechaInicioActividades.trim() === '') {
      formularioInvalido = true;
      mensaje += "<li>Seleccione la fecha de inicio de actividades</li>";
    } else if (this.esFechaFutura(this.formulario.value.fechaInicioActividades)) {
      formularioInvalido = true;
      mensaje += "<li>La fecha de inicio de actividades no puede ser futura</li>";
    }

    // Validar contabilidad
    const erroresContabilidad = this.contabilidadValidator()(this.formulario);
    if (erroresContabilidad?.tipoContabilidadObligatorio) {
      formularioInvalido = true;
      mensaje += `<li>${erroresContabilidad.tipoContabilidadObligatorio}</li>`;
    }

    // Validar renta
    const erroresRenta = this.rentaValidator()(this.formulario);
    if (erroresRenta?.frecuenciaRentaObligatoria) {
      formularioInvalido = true;
      mensaje += `<li>${erroresRenta.frecuenciaRentaObligatoria}</li>`;
    }

    // Validar IVA
    const erroresIva = this.ivaValidator()(this.formulario);
    if (erroresIva?.frecuenciaIvaObligatoria) {
      formularioInvalido = true;
      mensaje += `<li>${erroresIva.frecuenciaIvaObligatoria}</li>`;
    }

    // Validar campos cuando haya un certificado cargado
    if (this.hayCertificadoCargado) {
      const password = this.formulario.value.passwordCertificado;
      const fechaVencimiento = this.formulario.value.fechaVencimientoCertificado;

      // Validar contraseña
      if (!password || password.trim() === '') {
        formularioInvalido = true;
        mensaje += "<li>Ingrese la contraseña del certificado .p12</li>";
      } else if (password.length < 4) {
        formularioInvalido = true;
        mensaje += "<li>La contraseña del certificado .p12 debe tener al menos 4 caracteres</li>";
      }

      // Validar fecha de vencimiento - DEBE SER FUTURA
      if (!fechaVencimiento) {
        formularioInvalido = true;
        mensaje += "<li>Seleccione fecha vencimiento del certificado</li>";
      } else if (!this.esFechaFutura(fechaVencimiento)) {
        formularioInvalido = true;
        mensaje += "<li>La fecha de vencimiento del certificado .p12 debe ser una fecha futura</li>";
      }
    }

    // Validar teléfono
    const telefono = this.formulario.value.telefonoContactoAdministrativo;
    if (!telefono || telefono.trim() === "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese Celular / WhatsApp</li>";
    } else if (telefono.trim().length < 7) {
      formularioInvalido = true;
      mensaje += "<li>El teléfono debe tener al menos 7 dígitos</li>";
    }

    // Validar email
    const email = this.formulario.value.emailContactoAdministrativo;
    if (!email || email.trim() === "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese correo electrónico</li>";
    } else {
      const emailTrim = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        formularioInvalido = true;
        mensaje += "<li>Ingrese un correo electrónico válido (ejemplo: nombre@dominio.com)</li>";
      }
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire({
        title: '¡Advertencia!',
        html: `<div style="text-align: left;">${mensaje}</div>`,
        icon: 'warning'
      });
      return;
    }

    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de registrar este ' + this.nombreTipoProveedor.toLocaleLowerCase() + '?',
      text: "Una vez registrado, las credenciales de acceso al sistema serán notificadas al correo electrónico [" + this.formulario.value.emailContactoAdministrativo.trim().toLocaleLowerCase() + "].",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {

        if (this.banderaUsuarioNuevo) {
          this.encriptar.setPublicKey(clavePublica);
          let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
          let usuario = new Usuario();
          usuario.tipoIdentificacion = 2; // Tipo de identificación RUC
          usuario.idPais = 19;
          usuario.numeroIdentificacion = this.formulario.value.idUsuario.toUpperCase().trim();
          usuario.nombres = this.formulario.value.razonSocial.toUpperCase().trim();
          usuario.apellidos = this.formulario.value.razonSocial.toUpperCase().trim();
          usuario.nombreComercial = this.formulario.value.nombreComercial?.toUpperCase().trim();
          usuario.razonSocial = this.formulario.value.razonSocial.toUpperCase().trim();
          usuario.identificacionRepresentanteLegal = this.formulario.value.identificacionRepresentante.trim();
          usuario.nombresRepresentanteLegal = this.formulario.value.nombresRepresentante.toUpperCase().trim();
          usuario.apellidosRepresentanteLegal = this.formulario.value.nombresRepresentante.toUpperCase().trim();
          usuario.email = this.formulario.value.emailContactoAdministrativo.toLowerCase().trim();
          usuario.contraseña = claveEncriptada;
          this.servicioUsuario.registrarUsuarioBasico(usuario)
            .subscribe((respuesta: any) => {
              if (respuesta.estado === 'ERR') {
                Swal.fire('Error', respuesta.mensaje, 'error');
                return;
              }
              if (respuesta.estado === 'OK' && respuesta.resultado?.idUsuarioExterno) {
                // Asignar el valor a la variable this.idUsuario
                this.idUsuario = respuesta.resultado.idUsuarioExterno;
                this.registrarEmpresa();
              }
            });
        } else {
          this.registrarEmpresa();
        }
      } else {
        Swal.close();
      }
    });
  }

  //**** Método para generar la clave aleatoria del usuario ****/
  generarClaveAleatoria() {
    let text = "";
    let possible = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890";

    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  //**** Método para registrar empresas ****/
  registrarEmpresa() {

    this.encriptar.setPublicKey(clavePublica);
    let modelo = new Empresas();
    // Identificadores
    modelo.idUsuarioPropietario = this.idUsuario;
    modelo.idRegimenesTributarios = this.formulario.value.idRegimenesTributarios;
    // Contribuyente Especial
    modelo.esContribuyenteEspecial = this.formulario.value.esContribuyenteEspecial;
    if (this.formulario.value.esContribuyenteEspecial) {
      modelo.numeroResolucionContribuyenteEspecial = this.formulario.value.numeroResolucionContribuyenteEspecial.trim().toUpperCase();
      modelo.fechaDesignacionContribuyenteEspecial = this.formulario.value.fechaDesignacionContribuyenteEspecial;
    }
    // Agente de Retención
    modelo.esAgenteRetencion = this.formulario.value.esAgenteRetencion;
    if (this.formulario.value.esAgenteRetencion) {
      modelo.esAgenteRetencionRenta = this.formulario.value.esAgenteRetencionRenta;
      modelo.esAgenteRetencionIva = this.formulario.value.esAgenteRetencionIva;
      modelo.esAgenteRetencionIsd = this.formulario.value.esAgenteRetencionIsd;
      modelo.numeroResolucionAgenteRetencion = this.formulario.value.numeroResolucionAgenteRetencion.trim().toUpperCase();
      modelo.fechaDesignacionAgenteRetencion = this.formulario.value.fechaDesignacionAgenteRetencion;
    }
    // Autorretenedor
    modelo.esAutorretenedor = this.formulario.value.esAgenteRetencion;
    if (this.formulario.value.esAgenteRetencion) {
      modelo.numeroResolucionAutorretenedor = this.formulario.value.numeroResolucionAutorretenedor.trim().toUpperCase();
      modelo.fechaInicioAutoretencion = this.formulario.value.fechaInicioAutoretencion;
      modelo.porcentajeAutorretencion = this.formulario.value.porcentajeAutorretencion;
    }
    // Actividad Económica
    modelo.actividadEconomicaPrincipal = this.formulario.value.actividadEconomicaPrincipal.trim().toUpperCase();
    modelo.fechaInicioActividades = this.formulario.value.fechaInicioActividades;
    // Contabilidad
    modelo.obligadoContabilidad = this.formulario.value.obligadoContabilidad;
    if (this.formulario.value.obligadoContabilidad) {
      modelo.idTipoContabilidad = this.formulario.value.idTipoContabilidad;
    }
    // Obligaciones Tributarias
    modelo.debePresentarRenta = this.formulario.value.debePresentarRenta;
    if (this.formulario.value.debePresentarRenta) {
      modelo.idFrecuenciaRenta = this.formulario.value.idFrecuenciaRenta;
    }
    modelo.debePresentarIva = this.formulario.value.debePresentarIva;
    if (this.formulario.value.debePresentarIva) {
      modelo.idFrecuenciaIva = this.formulario.value.idFrecuenciaIva;
    }
    // Certificado Digital
    if (this.hayCertificadoCargado) {
      let claveCertificadoEncriptada = this.encriptar.encrypt(this.formulario.value.passwordCertificado);
      modelo.passwordCertificado = claveCertificadoEncriptada;
      modelo.fechaVencimientoCertificado = this.formulario.value.fechaVencimientoCertificado;
      modelo.estadoCertificado = 1; // Activo
    }
    // Contacto Administrativo
    modelo.telefonoContactoAdministrativo = this.formulario.value.telefonoContactoAdministrativo.trim();
    modelo.emailContactoAdministrativo = this.formulario.value.emailContactoAdministrativo.trim().toLocaleLowerCase();

    let claveUsuarioEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
    modelo.contraseña = claveUsuarioEncriptada;
    modelo.estadoUsuario = this.estadoUsuario;
    modelo.banderaUsuarioNuevo = this.banderaUsuarioNuevo;

    let usuario = new Usuario();

    if (this.estadoUsuario == 1) {

      usuario.idUsuario = this.idUsuario;
      usuario.email = this.formulario.value.emailContactoAdministrativo.trim().toLowerCase();
      usuario.contraseña = claveUsuarioEncriptada;
      usuario.bandera = 0;
      usuario.banderaDatos = 1;
      // Aquí se activa el usuario y se genera una clave aleatoria cuando se encuentra en estado inactivo
      this.servicioUsuario.actualizarUsuarioExternoSimple(usuario)
        .subscribe((resp: any) => { });
    } else {
      if (this.email.toLowerCase() !== this.formulario.value.emailContactoAdministrativo.toLowerCase()) {
        usuario.idUsuario = this.idUsuario;
        usuario.banderaDatos = 1;
        usuario.email = this.formulario.value.emailContactoAdministrativo.toLowerCase();
        this.servicioUsuario.actualizarUsuarioExternoSimple(usuario)
          .subscribe((resp: any) => { });
      }
    }
    this.llamarServicioCrearEmpresa(modelo);
  }

  //**** Método que llama al servicio de creación de proveedores ****/
  llamarServicioCrearEmpresa(modelo: Empresas) {

    this.mostrarCargando('Registrando ' + this.nombreTipoProveedor.toLocaleLowerCase());
    this.empresasService.registrarEmpresas(modelo)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          Swal.fire({
            title: 'Éxito',
            text: this.nombreTipoProveedor + ' registrado con éxito',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.limpiarCamposGeneral();
            this.buscarEmpresas();
            this.desplazarAlInicio();
          });

        } else {
          Swal.fire('Error', resp.mensaje, 'error');
          Swal.close();
        }
      });
  }

  //**** Método para actualizar el estado de un proveedor de aretes oficiales. ****/
  actualizarEstado(id: number, accion: string, tipo: string) {

    let modelo = new Empresas();
    modelo.idEmpresa = id;

    this.listaDatos.forEach((item: Empresas) => {
      if (item.idEmpresa == id) {
        this.nombreUsuario = item.nombresUsuario.toLocaleUpperCase();
        this.idEmpresa = item.idEmpresa;
      }
    });

    var accionTexto = '';
    modelo.idEmpresa = this.idEmpresa;

    switch (accion) {
      case 'Activar': {
        modelo.estado = 1;
        accionTexto = "activado";
        break;
      }
      case 'Inactivar': {
        modelo.estado = 0;
        accionTexto = "inactivado";
        break;
      }
    }

    //Mensaje de confirmación
    Swal.fire({
      title: '¿' + accion + ' ' + tipo.toLocaleLowerCase() + '?',
      text: this.nombreUsuario.toLocaleUpperCase(),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡ ' + accion.toLocaleLowerCase() + ' !',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Actualizando estado del ' + tipo.toLocaleLowerCase() + '...');
        this.empresasService.actualizarProveedor(modelo)
          .subscribe((resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire({
                title: `Éxito`,
                text: `${tipo} ${this.nombreUsuario.toLocaleUpperCase()}, ${accionTexto.toLocaleLowerCase()}.`,
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then(() => {
                // Esta función se ejecuta después de que el usuario presiona "OK"
                this.buscarEmpresas(); // Llama a la función buscar aquí
              });
            }
            else {
              Swal.fire('Error', resp.mensaje, 'error');
            }
          });
      }
    });
  }

  //**** Método para asignar los datos del proveedor de aretes al formulario. ****/
  asignarDatosFormulario(id: number) {

    this.mostrarCargando('Asignando datos proveedor / operador autorizado');
    // Buscar el proveedor en la lista
    const proveedor = this.listaDatos.find((item: Empresas) => item.idEmpresa === id);
    this.formularioVisible = true;
    // Verificar si el proveedor fue encontrado
    if (proveedor) {
      // Asignar los valores al formulario
      this.nombreUsuario = proveedor.nombresUsuario.toLocaleUpperCase();
      this.idUsuario = proveedor.idUsuariosExternos;
      this.idEmpresa = proveedor.idProveedoresAretes;

      this.formulario.controls['idUsuario'].setValue(proveedor.numeroIdentificacion);
      this.formulario.controls['idUsuarioLock'].setValue(proveedor.numeroIdentificacion);
      this.formulario.controls['razonSocial'].setValue(proveedor.razonSocialUsuario);
      this.formulario.controls['nombreComercial'].setValue(proveedor.nombreComercial);
      this.formulario.controls['identificacionRepresentante'].setValue(proveedor.identificacionRepresentanteLegal);
      this.formulario.controls['nombresRepresentante'].setValue(proveedor.nombresRepresentanteLegal);
      this.formulario.controls['inputTipoProveedor'].setValue(proveedor.idTiposProveedores);
      this.formulario.controls['inputProvincia'].setValue(proveedor.idProvincia);

      if (proveedor.idTiposProveedores == 2) {
        this.visualizarAomz = true;
      } else {
        this.visualizarAomz = false;
      }

      if (proveedor.aomz == 1) {
        this.formulario.get('inputCheckAomz').setValue(false);
      } else {
        this.formulario.get('inputCheckAomz').setValue(true);
      }

      this.formulario.controls['inputCanton'].setValue(proveedor.idCanton);
      this.formulario.controls['inputParroquia'].setValue(proveedor.idParroquia);
      this.formulario.controls['inputDireccion'].setValue(proveedor.direccion);
      this.formulario.controls['inputTelefono'].setValue(proveedor.telefono);
      this.formulario.controls['inputEmail'].setValue(proveedor.email);
      this.banderaEditar = true;
      Swal.close();
    } else {
      // Mostrar error si el proveedor no fue encontrado
      this.banderaEditar = false;
      Swal.fire('Error', 'Proveedor / operador autorizado no encontrado', 'error');
    }
  }

  //**** Método para actualizar los datos del proveedor de aretes desde el formulario. ****/
  actualizarEmpresa(id: number) {

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revise lo siguiente...<ul></br>";

    if (this.formulario.value.inputIdUsuario.trim() == null || this.formulario.value.inputIdUsuario.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    }
    if (this.formulario.value.inputIdUsuario.trim().length != 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido</li>";
    }
    if (this.formulario.value.razonSocial.trim() == null || this.formulario.value.razonSocial.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese razón social</li>";
    }
    if (this.formulario.value.inputTipoProveedor == null || this.formulario.value.inputTipoProveedor == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo</li>";
    }
    if (this.formulario.value.inputProvincia == null || this.formulario.value.inputProvincia == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione provincia origen</li>";
    }
    if (this.formulario.value.inputCanton == null || this.formulario.value.inputCanton == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione cantón origen</li>";
    }
    if (this.formulario.value.inputParroquia == null || this.formulario.value.inputParroquia == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione parroquia origen</li>";
    }
    if (this.formulario.value.inputDireccion.trim() == null || this.formulario.value.inputDireccion.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese dirección matriz</li>";
    }
    if (this.formulario.value.inputTelefono.trim() == null || this.formulario.value.inputTelefono.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese teléfono</li>";
    }
    if (this.formulario.value.inputEmail.trim() == null || this.formulario.value.inputEmail.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese correo electrónico</li>";
    }
    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    const proveedor = new Empresas();
    proveedor.idEmpresa = id;

    // Buscar proveedor en la lista y asignar sus datos
    const proveedorExistente = this.listaDatos.find(
      (item: Empresas) => item.idEmpresa === id
    );

    if (!proveedorExistente) {
      Swal.fire('Error', 'Proveedor / operador autorizado no encontrado.', 'error');
      return;
    }

    this.nombreUsuario = proveedorExistente.nombresUsuario.toLocaleUpperCase();
    this.idUsuario = proveedorExistente.idUsuariosExternos;
    this.email = proveedorExistente.email;
    this.idEmpresa = proveedorExistente.idProveedoresAretes;

    // Confirmación del usuario
    Swal.fire({
      title: '¿Actualizar datos del proveedor / operador autorizado?',
      text: this.nombreUsuario,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡actualizar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Actualizando datos del proveedor / operador autorizado...');

        this.empresasService.actualizarProveedor(proveedor).subscribe({
          next: (resp: any) => {
            if (resp.estado === 'OK') {
              this.actualizarUsuarioYRolSiEsNecesario();
            } else {
              Swal.fire('Error', resp.mensaje, 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el proveedor.', 'error');
          },
        });
      }
    });
  }

  private actualizarUsuarioYRolSiEsNecesario() {
    let cambiosRealizados = false;

    const usuario = new Usuario();
    usuario.idUsuario = this.idUsuario;

    // Inicializar banderas como 0
    usuario.banderaDatos = 0;
    usuario.banderaRoles = 0;

    if (this.email.toLowerCase() !== this.formulario.value.inputEmail.toLowerCase()) {
      usuario.email = this.formulario.value.inputEmail.toLowerCase();
      usuario.banderaDatos = 1; // Marcar como cambio importante
      cambiosRealizados = true;
    }

    if (this.idEmpresa !== this.formulario.value.inputTipoProveedor) {
      usuario.idTiposProveedoresAretes = this.formulario.value.inputTipoProveedor;
      usuario.banderaRoles = 1; // Marcar como cambio importante
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      this.servicioUsuario.actualizarUsuarioExternoSimple(usuario).subscribe({
        next: (resp: any) => {
          if (resp.estado === 'OK') {
            Swal.fire({
              title: 'Éxito',
              text: `${this.nombreTipoProveedor} ${this.nombreUsuario}, actualizado.`,
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then(() => {
              this.limpiarCamposGeneral();
              this.desplazarAlInicio();
              this.buscarEmpresas();
            });
          } else {
            Swal.fire('Error', resp.mensaje, 'error');
          }
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar los datos del usuario.', 'error');
        },
      });
    } else {
      Swal.fire({
        title: 'Éxito',
        text: `${this.nombreTipoProveedor} ${this.nombreUsuario}, actualizado.`,
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      }).then(() => {
        this.limpiarCamposGeneral();
        this.desplazarAlInicio();
        this.buscarEmpresas();
      });
    }
  }

  //**** Método para activar/desactivar check de Arete Oficial Medida Zoosanitaria ****/
  activarAreteRojo() {
    if (this.formulario.value.inputCheckAomz) {
      this.activarAomz = 2;
    } else {
      this.activarAomz = 1;
    }
  }

  // Cargar mensaje del método actualizarAnimal
  private mostrarCargando(mensaje: string) {
    showLoading(mensaje); // Usa tu función importada
  }

  /** PAGINACIÓN */

  // Método auxiliar para estimar (solo si no viene paginación del backend)
  actualizarInformacionPaginacionEstimada(): void {
    if (this.listaDatos.length === 0) {
      this.totalRegistros = 0;
    } else if (this.listaDatos.length < this.rango) {
      // Última página
      this.totalRegistros = this.inicio + this.listaDatos.length;
    } else {
      // Hay más registros, pero no sabemos cuántos
      this.totalRegistros = this.inicio + this.rango + 1; // +1 para indicar que hay más
    }

    this.totalPages = Math.ceil(this.totalRegistros / this.rango);
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  // Método para ir a una página específica
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.inicio = (page - 1) * this.rango;
    // Preparar parámetros para la nueva página
    const parametros = { ...this.ultimosParametrosBusqueda };
    parametros.INICIO = this.inicio;
    parametros.LIMITE = this.rango;
    // Consultar la página específica
    this.consultarEmpresas(parametros);
  }

  // Método para página anterior
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Método para página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Método para cambiar items por página
  changeItemsPerPage(items: number): void {

    this.rango = items;
    this.itemsPerPage = items;
    this.inicio = 0;
    this.currentPage = 1;

    // Si ya hay una búsqueda realizada, recargar con nuevo rango
    if (Object.keys(this.ultimosParametrosBusqueda).length > 0) {
      const parametros = { ...this.ultimosParametrosBusqueda };
      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.rango;

      this.consultarEmpresas(parametros);
    }
  }

  //**** Método para obtener el rango de elementos mostrados ****/
  getDisplayRange(): string {
    // Si tenemos información de paginación del backend, usarla
    if (this.totalRegistros === 0) {
      return 'No hay datos para mostrar';
    }

    const start = this.inicio + 1;
    const end = this.inicio + this.listaDatos.length;

    // Ahora sabemos el total REAL gracias al backend
    return `Mostrando ${start} - ${end} de ${this.totalRegistros}`;
  }

  // Método mejorado para obtener array de páginas
  getPagesArray(): number[] {
    const pages: number[] = [];

    if (this.totalPages <= 1) {
      return pages;
    }

    const maxVisiblePages = 7;

    if (this.totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      let startPage = Math.max(1, this.currentPage - 3);
      let endPage = Math.min(this.totalPages, this.currentPage + 3);

      // Ajustar para mostrar siempre 7 páginas si es posible
      if (this.currentPage <= 4) {
        endPage = Math.min(maxVisiblePages, this.totalPages);
      } else if (this.currentPage >= this.totalPages - 3) {
        startPage = Math.max(1, this.totalPages - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}