import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { clavePublica } from '../../config/config';
import { validarCedula, validarCoordenadasDesdeString } from '../../config/utilitario';
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Usuario } from '../../modelos/usuario.modelo';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { TipoActividad } from '../../modelos/tipo-actividad.modelo';
import { Laboratorio } from '../../modelos/laboratorio.modelo';
import { Lote } from '../../modelos/lote.modelo';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { AnimalCertificado } from '../../modelos/animal-certificado.modelo';
import { Sexo } from '../../modelos/sexo.modelo';
import { Taxonomia } from '../../modelos/taxonomia.modelo';
import { Categoria } from 'src/app/modelos/categoria.modelo';
import { InterroganteFaseVacunacion } from '../../modelos/interrogante-fase-vacunacio.modelo';
import { InterroganteCertificadoVacunacion } from '../../modelos/interrogante-certificado-vacunacion.modelo';
import { CertificadoVacunacion } from '../../modelos/certificado-vacunacion.modelo';
import { CoberturaOficina } from '../../modelos/cobertura-oficina.modelo';
import { FiguraPersona } from '../../modelos/figura-persona.modelo';
import { Area } from '../../modelos/area.modelo';
import { Bovino } from 'src/app/modelos/bovino.modelo';
import { DatoDemografico } from '../../modelos/dato-demografico.modelo';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
// Importación de servicios.
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { SexoService } from '../../servicios/sexo/sexo.service';
import { TaxonomiaService } from '../../servicios/taxonomia.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { InterrogantesService } from '../../servicios/interrogantes.service';
import { CoberturaOficinaService } from '../../servicios/cobertura-oficina.service';
import { FiguraPersonaService } from '../../servicios/figura-persona.service';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';
import { TipoActividadAreaService } from '../../servicios/tipo-actividad-area/tipo-actividad-area.service';
import { LaboratorioService } from '../../servicios/laboratorio.service';
import { LoteService } from '../../servicios/lote.service';
import { AreaService } from '../../servicios/area/area.service';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { CostoVacunaService } from '../../servicios/costo-vacuna/costo-vacuna.service';

@Component({
  selector: 'app-registrar-certificado-vacunacion',
  templateUrl: './registrar-certificado-vacunacion.component.html',
  styleUrls: ['./registrar-certificado-vacunacion.component.css']
})
export class RegistrarCertificadoVacunacionComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  usuarioExterno: Usuario;
  sitioSeleccionado: Area;
  coberturaSeleccionada?: CoberturaOficina;
  secuenciaSeleccionada?: SecuenciaCertificado;
  //**** Listas ****/
  listaFasesVacunaciones: FaseVacunacion[];
  listaSexos: Sexo[] = [];
  listaTaxonomias: Taxonomia[] = [];
  listaCategorias: Categoria[] = [];
  listaInterrogantesFaseVacunacion: InterroganteFaseVacunacion[] = [];
  listaInterrogantesCertificadosVacunacion: InterroganteCertificadoVacunacion[] = [];
  listaDigitadorasOficinas: PersonaOficina[];
  listaSecuenciasCertificados: SecuenciaCertificado[];
  listaBrigadistasOficinas: PersonaOficina[];
  listaUsuariosInternos: any[];
  listaCoberturasOficinas: CoberturaOficina[];
  listaParroquias: Parroquia[] = [];
  listaSitios: Area[] = [];
  listaTiposActividades: TipoActividad[] = [];
  listaAnimalesConAreteOficial: AnimalCertificado[] = [];
  listaAnimalesConAreteDisponibles: Bovino[] = [];
  listaAnimalesConAreteSinVacunar: Bovino[] = [];
  listaAnimalesConAreteVacunados: Bovino[] = [];
  listaLaboratorios: Laboratorio[] = [];
  listaLotes: Lote[] = [];
  listaFigurasPersonas: FiguraPersona[];
  bovinoArete: Bovino[] = [];
  listaCostoVacuna: any [] = [];
  //**** Variables auxiliares ****/
  activarSitioNuevo = false; // Variable para activar (true) opción para sitio nuevo
  tecnicoVacunador: boolean = false;
  mostrarDatosSitio: boolean = false;
  idFaseVacunacion: number;
  idParroquia: number;
  totalAnimalesConArete: number;
  encriptar: any;
  ipPublica: string = '';
  valorVacuna: number = 0;
  //**** Variables para registro de usuarios ****/
  idUsuarioReceptor: number;
  idUsuarioProductor: number;
  identificacion: string;
  nombres: string;
  // Cuando es RUC
  nombreComercial: string;
  identificacionRep: string;
  nombresRep: string;
  email: string;
  //**** Variables ingreso de animales al catastro ****/
  // Bovinos vacunados sin arete
  terneras: AnimalCertificado = new AnimalCertificado();
  terneros: AnimalCertificado = new AnimalCertificado();
  vacas: AnimalCertificado = new AnimalCertificado();
  vaconas: AnimalCertificado = new AnimalCertificado();
  toros: AnimalCertificado = new AnimalCertificado();
  toretes: AnimalCertificado = new AnimalCertificado();
  bufalosMachos: AnimalCertificado = new AnimalCertificado();
  bufalosHembras: AnimalCertificado = new AnimalCertificado();
  // Otras especies en el predio
  ovinosMachos: AnimalCertificado = new AnimalCertificado();
  ovinosHembras: AnimalCertificado = new AnimalCertificado();
  caprinosMachos: AnimalCertificado = new AnimalCertificado();
  caprinosHembras: AnimalCertificado = new AnimalCertificado();
  camelidosMachos: AnimalCertificado = new AnimalCertificado();
  camelidosHembras: AnimalCertificado = new AnimalCertificado();
  equinosMachos: AnimalCertificado = new AnimalCertificado();
  equinosHembras: AnimalCertificado = new AnimalCertificado();
  porcinosMachos: AnimalCertificado = new AnimalCertificado();
  porcinosHembras: AnimalCertificado = new AnimalCertificado();
  // Bovinos vacunados con arete
  ternerasAgregados: number = 0;
  ternerosAgregados: number = 0;
  vaconasAgregados: number = 0;
  toretesAgregados: number = 0;
  vacasAgregados: number = 0;
  torosAgregados: number = 0;
  bufalosHembrasAgregados: number = 0;
  bufalosMachosAgregados: number = 0;
  totalAnimalesAgregados: number = 0;
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioPersonaOficina: PersonaOficinaService,
    private servicioSecuenciaCertificado: SecuenciaCertificadoService,
    private servicioSexo: SexoService,
    private servicioTaxonomia: TaxonomiaService,
    private servicioCategoria: CategoriaService,
    private servicioInterrogante: InterrogantesService,
    private servicioCoberturaOficina: CoberturaOficinaService,
    private servicioFiguraPersona: FiguraPersonaService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService,
    private servicioParroquia: ParroquiaService,
    private servicioTipoActividadArea: TipoActividadAreaService,
    private servicioLaboratorio: LaboratorioService,
    private servicioLote: LoteService,
    private servicioArea: AreaService,
    private servicioBovino: BovinoService,
    private servicioDinardap: DinardapService,
    private servicioCostoVacuna: CostoVacunaService
  ) {
    this.inicializarCatastroSinAretes();
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.coberturaSeleccionada = null;
    this.tecnicoVacunador = false;
    this.servicioScript.inicializarScripts();
    this.encriptar = new JSEncrypt();
    if (this.servicioUsuario.usuarioExterno) {
      this.usuarioExterno = this.servicioUsuario.usuarioExterno;
      this.cargarCatalogos();
    }
    // Obtener la IP pública del cliente
    this.servicioDinardap.obtenerIpCliente().subscribe((res: any) => {
      this.ipPublica = res?.ip || 'IP no disponible';
    });
  }

  //**** Inicializa el formulario. ****/
  inicializarFormulario() {
    this.formulario = new FormGroup({
      // Datos logísticos
      inputIdFaseVacunacion: new FormControl(null, Validators.required),
      inputIdOficinaVacunacion: new FormControl(null, Validators.required),
      inputIdZonaCobertura: new FormControl(null, Validators.required),
      // Datos generales
      inputIdNumeroCertificado: new FormControl(null, Validators.required),
      inputBuscarCertificado: new FormControl(null),
      inputFechaVacunacion: new FormControl(null, Validators.required),
      // Datos de vacunador
      inputIdBrigadista: new FormControl(null),
      inputIdUsuarioInterno: new FormControl(null),
      // Datos del productor
      inputIdentificacionProductor: new FormControl(null),
      inputNombreProductor: new FormControl(null),
      // Cobertura territorial
      inputIdProvincia: new FormControl(null, Validators.required),
      inputIdCanton: new FormControl(null, Validators.required),
      inputIdParroquia: new FormControl(null, Validators.required),
      // Datos del sitio
      checkNuevoSitio: new FormControl(false, Validators.required),
      inputIdArea: new FormControl(null),
      inputIdTipoActividad: new FormControl(null, Validators.required),
      inputNombreSitio: new FormControl(null, Validators.required),
      inputCallePrincipal: new FormControl(null, Validators.required),
      inputTelefono: new FormControl(null),
      inputLatitud: new FormControl(0, Validators.pattern('^([+-])?(?:90(?:\\.0{1,6})?|((?:|[1-8])[0-9])(?:\\.[0-9]{1,6})?)$')),
      inputLongitud: new FormControl(0, Validators.pattern('^([+-])?(?:180(?:\\.0{1,6})?|((?:|[1-9]|1[0-7])[0-9])(?:\\.[0-9]{1,6})?)$')),
      inputMarca: new FormControl(null),
      // Catastro de animales con arete oficial
      inputNumeroIdentificador: new FormControl(null),
      // Observaciones
      inputObservaciones: new FormControl(null),
      // Datos del biológico
      inputIdLaboratorio: new FormControl(null, Validators.required),
      inputLote: new FormControl(null, Validators.required),
      // Datos del receptor
      checkReceptor: new FormControl(false),
      inputIdFigura: new FormControl(null),
      inputIdentificacionReceptor: new FormControl(null),
      inputNombreReceptor: new FormControl(null)
    }, [
      this.brigadistaObligatorio('inputIdBrigadista'),
      this.tecnicoAgrocalidadObligatorio('inputIdUsuarioInterno'),
      this.areaObligatoria('inputIdArea', 'checkNuevoSitio'),
      this.figuraObligatoria('inputIdFigura', 'checkReceptor'),
      this.nombresReceptorObligatorio('inputNombreReceptor', 'checkReceptor')
    ]);
  }

  //**** Cargar catálogos en paparelelo ****//
  cargarCatalogos() {
    this.mostrarCargando('Cargando catálogos...');
    forkJoin({
      fases: this.servicioFaseVacunacion.obtenerFasesVacunacion({ codigoEstadoDocumento: 'CRD' }),
      sexos: this.servicioSexo.obtenerSexos(),
      categorias: this.servicioCategoria.obtenerCategorias(),
      taxonomias: this.servicioTaxonomia.obtenerTaxonomias(),
      figuras: this.servicioFiguraPersona.obtenerFigurasPersonas(),
      laboratorios: this.servicioLaboratorio.obtenerLaboratorios({ estado: 1 }),
      actividades: this.servicioTipoActividadArea.getTiposActividadArea(),
      costoVacuna: this.servicioCostoVacuna.obtenerCatalogo({estado: 1, codigo: 'AFT'})
    }).subscribe({
      next: (resultados) => {
        this.listaFasesVacunaciones = resultados.fases;
        this.listaSexos = resultados.sexos;
        this.listaCategorias = resultados.categorias;
        this.listaTaxonomias = resultados.taxonomias.filter(taxonomia => taxonomia.nombre_comun);
        this.listaFigurasPersonas = resultados.figuras.filter(figura => figura.idFiguraPersona !== 1);
        this.listaLaboratorios = resultados.laboratorios;
        this.listaTiposActividades = resultados.actividades;
        this.listaCostoVacuna = resultados.costoVacuna;
        // Asignación directa del valor de la vacuna
        if (resultados.costoVacuna && resultados.costoVacuna.length > 0) {
          this.valorVacuna = parseFloat(resultados.costoVacuna[0].valor) || 0;
        } else {
          this.valorVacuna = 0;
        }
        Swal.close();
      },
      error: () => {
        Swal.close();
      }
    });
  }

  //**** Limpiar datos logísticos ****//
  limpiarDatosLogisticos() {
    this.listaCoberturasOficinas = [];
    this.formulario.controls.inputIdOficinaVacunacion.setValue(null);
    this.formulario.controls.inputIdZonaCobertura.setValue(null);
  }

  //**** Cargar datos logísticos en paralelo / Oficinas e Interrogantes ****//
  cargarOficinasEInterrogantes() {
    this.limpiarDatosLogisticos();
    // Validar fase seleccionada
    if (this.formulario.value.inputIdFaseVacunacion === null) {
      Swal.fire('¡Advertencia!', 'Opción no válida', 'warning');
      return;
    }
    // Asignar ID de la fase a la variable global
    this.idFaseVacunacion = this.formulario.value.inputIdFaseVacunacion;

    this.mostrarCargando('Cargando datos...');
    forkJoin({
      oficinas: this.servicioPersonaOficina.obtenerPersonalDeOficina({
        idFaseVacunacion: this.formulario.value.inputIdFaseVacunacion,
        idUsuarioExternoPersona: this.usuarioExterno.idUsuario,
        codigoTipoPersona: 'DIG'
      }),
      interrogantes: this.servicioInterrogante.obtenerInterrotantesDeFaseVacunacion({
        idFaseVacunacion: this.formulario.value.inputIdFaseVacunacion,
        estadoInterrogante: 1
      })
    }).subscribe({
      next: (resultados) => {
        this.listaDigitadorasOficinas = resultados.oficinas;
        this.listaInterrogantesFaseVacunacion = resultados.interrogantes;
        this.listaInterrogantesCertificadosVacunacion = [];
        this.listaInterrogantesFaseVacunacion.forEach((item: InterroganteFaseVacunacion) => {
          const interrogante = new InterroganteCertificadoVacunacion();
          interrogante.idInterrogante = item.idInterrogante;
          interrogante.seleccionada = Boolean(0);
          this.listaInterrogantesCertificadosVacunacion.push(interrogante);
        });
        Swal.close();
      },
      error: (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al cargar los datos: ' + error.message, 'error');
      }
    });
  }

  //**** Limpiar vacunador Brigadista ****//
  limpiarVacunadorBrigadista() {
    this.listaBrigadistasOficinas = [];
    this.tecnicoVacunador = false;
    this.formulario.controls.inputIdBrigadista.setValue(null);
    this.formulario.controls.inputIdUsuarioInterno.setValue(null);
  }

  //**** Limpiar datos secuencia ****//
  limpiarSecuencia() {
    this.listaSecuenciasCertificados = [];
    this.formulario.controls.inputIdNumeroCertificado.setValue(null);
    this.formulario.controls.inputBuscarCertificado.setValue(null);
  }

  //**** Limpiar lista de secuencias ****//
  limpiarListaCertificados() {
    this.listaSecuenciasCertificados = [];
    this.formulario.controls.inputIdNumeroCertificado.setValue(null);
  }

  //**** Cargar en paralelo: Zona de cobertura, Secuencias y Brigadistas ****//
  cargarSecuenciasBrigadistasCobertura() {
    this.limpiarVacunadorBrigadista();
    this.limpiarSecuencia();
    // Validar oficina seleccionada
    if (this.formulario.value.inputIdOficinaVacunacion === null) {
      Swal.fire('¡Advertencia!', 'Opción no válida', 'warning');
      return;
    }

    this.mostrarCargando('Cargando datos...');
    // Preparar parámetros comunes
    const idFaseVacunacion = this.formulario.value.inputIdFaseVacunacion;
    const idOficina = this.formulario.value.inputIdOficinaVacunacion;
    // Obtener parámetros de cobertura de la oficina seleccionada
    const oficinaSeleccionada = this.listaDigitadorasOficinas.find(
      (item: PersonaOficina) => Number(item.idOficina) === Number(idOficina)
    );
    // Preparar parámetros para cobertura
    const parametrosCobertura = new CoberturaOficina();
    if (oficinaSeleccionada) {
      parametrosCobertura.idOficina = idOficina;
      parametrosCobertura.idFaseVacunacion = idFaseVacunacion;
      parametrosCobertura.estado = 1;
      parametrosCobertura.idOperadora = oficinaSeleccionada.idOperadora;
      parametrosCobertura.idProvinciaOficina = oficinaSeleccionada.idProvinciaOficina;
      parametrosCobertura.idCantonOficina = oficinaSeleccionada.idCantonOficina;
      parametrosCobertura.idParroquiaOficina = oficinaSeleccionada.idParroquiaOficina;
    }
    // Preparar parámetros para secuencias
    const parametrosSecuencias = {
      idFaseVacunacion: idFaseVacunacion,
      idOficina: idOficina,
      codigoEstadoSecuencia: 'CRD',
      INICIO: 0,
      LIMITE: 100
    };
    // Preparar parámetros para brigadistas
    const parametrosBrigadistas = {
      idFaseVacunacion: idFaseVacunacion,
      idOficina: idOficina,
      codigoTipoPersona: 'BRIG',
      estado: 1
    };

    forkJoin({
      coberturas: this.servicioCoberturaOficina.obtenerCoberturasDeOficina(parametrosCobertura),
      brigadistas: this.servicioPersonaOficina.obtenerPersonalDeOficina(parametrosBrigadistas),
      secuencias: this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados(parametrosSecuencias)
    }).subscribe({
      next: (resultados) => {
        this.listaCoberturasOficinas = resultados.coberturas;
        this.listaBrigadistasOficinas = resultados.brigadistas;
        this.listaSecuenciasCertificados = resultados.secuencias;
        Swal.close();
      },
      error: (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al cargar los datos: ' + error.message, 'error');
      }
    });
  }

  //**** Buscar secuencia de números de certificado ****//
  buscarSecuencias(BusquedaIndividual: boolean = false) {
    // Validar oficina seleccionada
    if (this.formulario.value.inputIdOficinaVacunacion === null) {
      Swal.fire('¡Advertencia!', 'Opción no válida', 'warning');
      return;
    }

    this.mostrarCargando('Buscando secuencias...');
    const parametros: any = {
      idFaseVacunacion: this.formulario.value.inputIdFaseVacunacion,
      idOficina: this.formulario.value.inputIdOficinaVacunacion,
      codigoEstadoSecuencia: 'CRD',
      INICIO: 0,
      LIMITE: 100
    };

    // Agregar filtro por número de certificado
    if (BusquedaIndividual && this.formulario.value.inputBuscarCertificado) {
      parametros.secuencia = `%${this.formulario.value.inputBuscarCertificado.trim()}%`;
    }

    this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados(parametros)
      .subscribe({
        next: (secuencias: SecuenciaCertificado[]) => {
          this.listaSecuenciasCertificados = secuencias;
          Swal.close();
          if (BusquedaIndividual) {
            if (secuencias.length === 0) {
              Swal.fire('¡Atención!', 'La búsqueda no generó resultados', 'info');
            } else if (secuencias.length === 1) {
              const certificadoEncontrado = secuencias[0];
              this.formulario.controls.inputIdNumeroCertificado.setValue(certificadoEncontrado.idSecuencia);

              Swal.fire({
                title: '¡Búsqueda exitosa!',
                text: `Certificado encontrado [${certificadoEncontrado.secuencia}]`,
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                title: '¡Búsqueda exitosa!',
                text: `Se encontraron ${secuencias.length} certificados. Por favor seleccione uno.`,
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
              });
            }
          }
        },
        error: (error) => {
          Swal.close();
          Swal.fire('Error', 'Hubo un problema al buscar certificados: ' + error, 'error');
        }
      });
  }

  //**** Limpiar datos zona de cobertura ****//
  limpiarZonaCobertura() {
    this.coberturaSeleccionada = null;
    this.formulario.controls.inputIdProvincia.setValue(null);
    this.formulario.controls.inputIdCanton.setValue(null);
    this.formulario.controls.inputIdParroquia.setValue(null);
  }

  //**** Buscar Zona de cobertura final****//
  buscarZonaCobertura() {
    // Validar zona de cobertura seleccionada
    if (this.formulario.value.inputIdZonaCobertura === null) {
      Swal.fire('¡Advertencia!', 'Opción no válida', 'warning');
      return;
    }
    this.limpiarZonaCobertura();
    this.listaCoberturasOficinas.forEach((item: CoberturaOficina) => {
      if (Number(item.idCobertura) === Number(this.formulario.value.inputIdZonaCobertura)) {
        this.coberturaSeleccionada = item;
        this.formulario.controls.inputIdProvincia.setValue(this.coberturaSeleccionada.idProvinciaCobertura);
        this.formulario.controls.inputIdCanton.setValue(this.coberturaSeleccionada.idCantonCobertura);
        // Manejo de parroquias
        if (this.coberturaSeleccionada.idParroquiaCobetura) {
          this.formulario.controls.inputIdParroquia.setValue(this.coberturaSeleccionada.idParroquiaCobetura);
        } else {
          this.mostrarCargando('Consultando zona de influencia...');
          this.listaParroquias = [];
          this.servicioParroquia.getParroquiasPorCanton(this.coberturaSeleccionada.idCantonCobertura)
            .subscribe((parroquias: Parroquia[]) => {
              this.listaParroquias = parroquias;
              Swal.close();
            });
        }
      }
    });
  }

  //**** Limpiar vacunador Agrocalidad ****//
  limpiarVacunadorAgrocalidad() {
    this.listaUsuariosInternos = [];
    this.formulario.controls.inputIdBrigadista.setValue(null);
    this.formulario.controls.inputIdUsuarioInterno.setValue(null);
  }

  //**** Cambiar tipo de vacunador ****//
  cambiarTipoVacunador(valor: boolean) {
    this.limpiarVacunadorAgrocalidad();
    this.tecnicoVacunador = valor;
    if (!this.tecnicoVacunador) return;
    this.mostrarCargando('Cargando vacunadores...');
    // Buscar la oficina seleccionada para obtener la provincia
    const oficinaSeleccionada = this.listaDigitadorasOficinas.find(
      (item: PersonaOficina) =>
        Number(item.idOficina) === Number(this.formulario.value.inputIdOficinaVacunacion)
    );

    if (!oficinaSeleccionada) {
      Swal.close();
      return;
    }

    this.servicioUsuario.consultarUsuariosInternos({ idProvincia: oficinaSeleccionada.idProvinciaOficina }).subscribe({
      next: (respuesta: any) => {
        this.listaUsuariosInternos = respuesta.resultado || [];
        Swal.close();
      },
      error: (error) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al cargar los datos: ' + error.message, 'error');
      }
    });
  }

  //**** Método unificado para buscar usuarios externos (base local + servicios DINARP según tipo) ****/
  buscarUsuarioExterno(esProductor: boolean = true) {
    // Determinar los campos según si es productor o receptor
    const campoIdentificacion = esProductor ? 'inputIdentificacionProductor' : 'inputIdentificacionReceptor';
    const campoNombre = esProductor ? 'inputNombreProductor' : 'inputNombreReceptor';
    const idUsuarioField = esProductor ? 'idUsuarioProductor' : 'idUsuarioReceptor';

    const identificacion = this.formulario.value[campoIdentificacion]?.toUpperCase().trim();

    if (!identificacion || identificacion.length === 0) {
      Swal.fire('¡Advertencia!', 'Ingrese un número de identificación', 'warning');
      return;
    }

    this.mostrarCargando('Buscando en la base de datos...');

    // Primero busca siempre en la base local sin importar la longitud
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: identificacion
    }).subscribe(
      (respuesta: UsuarioExterno[]) => {
        Swal.close();
        if (respuesta.length === 1) {
          this[idUsuarioField] = respuesta[0].idUsuariosExternos;
          this.identificacion = identificacion;
          this.nombres = respuesta[0].nombres;
          this.formulario.controls[campoNombre].setValue(this.nombres);
          Swal.fire({
            title: '¡Búsqueda exitosa!',
            text: 'Usuario encontrado en la base local',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000
          }).then(() => {
            if (esProductor) {
              this.buscarAreasProductor();
            }
          });
        } else {
          if (identificacion.length === 10) {
            this.buscarCedulaDINARP(identificacion, esProductor);
          } else if (identificacion.length === 13) {
            this.buscarRUCDINARP(identificacion, esProductor);
          } else {
            Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'Usuario no encontrado (número de identificación no válida)',
              showConfirmButton: true
            });
          }
        }
      },
      (errorLocal) => {
        Swal.close();
        Swal.fire('Error', 'Ocurrió un error al buscar en registros locales: ' + errorLocal, 'error');
      }
    );
  }

  //**** Buscar cédula en DINARP (10 dígitos) ****/
  private buscarCedulaDINARP(ci: string, esProductor: boolean) {
    const campoNombre = esProductor ? 'inputNombreProductor' : 'inputNombreReceptor';

    // Validar formato de cédula antes de consultar
    if (!validarCedula(ci)) {
      Swal.fire('¡Advertencia!', 'Ingrese un número de cédula válido', 'warning');
      return;
    }

    this.mostrarCargando('Consultando datos en Registro Civil...');
    this.servicioDinardap.obtenerDatosDemograficos(ci).subscribe(
      (datosDemograficos: DatoDemografico[]) => {
        if (datosDemograficos?.length > 0) {
          const datoDemografico = datosDemograficos[0];
          this.identificacion = ci;
          this.nombres = datoDemografico.nombre.toUpperCase().trim();
          this.formulario.controls[campoNombre].setValue(this.nombres);
          this.email = 'info@noset.com';
          // Registrar usuario con datos del Registro Civil
          this.registrarUsuarioExterno(esProductor);
        } else {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'No se encontraron registros en el Registro Civil',
            showConfirmButton: true
          });
        }
      },
      (errorDINARP) => {
        Swal.fire('Error', 'Ocurrió un error al consultar el Registro Civil: ' + errorDINARP, 'error');
      }
    );
  }

  //**** Buscar RUC en SRI (13 dígitos) ****/
  private buscarRUCDINARP(ruc: string, esProductor: boolean) {
    const campoNombre = esProductor ? 'inputNombreProductor' : 'inputNombreReceptor';

    this.mostrarCargando('Consultando datos en el SRI...');

    forkJoin([
      this.servicioDinardap.obtenerUbicacionesSri(ruc),
      this.servicioDinardap.obtenerCorreoElectronicoContribuyente(ruc),
      this.servicioDinardap.obtenerRepresentanteLegal(ruc)
    ]).subscribe(
      ([ubicaciones, correos, representante]) => {
        const ubicacionSri: UbicacionSri = ubicaciones?.[0] || new UbicacionSri();
        const correoContribuyente: EmailContribuyente = correos?.[0] || new EmailContribuyente();
        const representanteLegal: RucRepresentanteLegal = representante?.[0] || new RucRepresentanteLegal();
        // Asignar valores a las propiedades
        this.identificacion = ruc;
        this.nombres = ubicacionSri.razonSocial || '';
        this.nombreComercial = correoContribuyente.nombreComercial || '';
        this.email = correoContribuyente.email || 'info@noset.com';
        this.nombresRep = representanteLegal.nombreRepreLegal || '';
        this.identificacionRep = representanteLegal.idRepreLegal || '';
        this.formulario.controls[campoNombre].setValue(this.nombres);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Datos obtenidos del SRI',
          showConfirmButton: false,
          timer: 1500
        });
        // Registrar automáticamente el usuario con los datos del SRI
        this.registrarUsuarioExterno(esProductor);
      },
      (error) => {
        Swal.fire('Error', 'Error al consultar el SRI: ' + error, 'error');
      }
    );
  }

  //**** Registrar nuevo usuario externo ****/
  private registrarUsuarioExterno(esProductor: boolean) {
    const idUsuarioField = esProductor ? 'idUsuarioProductor' : 'idUsuarioReceptor';

    this.encriptar.setPublicKey(clavePublica);
    const claveEncriptada = this.encriptar.encrypt('12345678Agro');
    const usuario = new Usuario();
    usuario.tipoIdentificacion = this.identificacion.length === 10 ? 1 : 2; // 1=Cédula, 2=RUC
    usuario.numeroIdentificacion = this.identificacion;
    usuario.nombres = this.nombres;
    usuario.apellidos = this.nombres;
    usuario.email = this.email || 'info@noset.com';
    usuario.contraseña = claveEncriptada;
    usuario.estado = 1;
    // Campos específicos para RUC
    if (this.identificacion.length === 13) {
      usuario.razonSocial = this.nombres;
      usuario.nombreComercial = this.nombreComercial || '';
      usuario.apellidosRepresentanteLegal = this.nombresRep || '';
      usuario.nombresRepresentanteLegal = this.nombresRep || '';
      usuario.identificacionRepresentanteLegal = this.identificacionRep || '';
    }

    this.mostrarCargando('Registrando nuevo usuario...');
    this.servicioUsuario.registrarUsuarioExternoVacunacion(usuario).subscribe(
      (respuesta: any) => {
        if (respuesta.estado === 'OK' && respuesta.resultado?.idUsuarioExterno) {
          this[idUsuarioField] = respuesta.resultado.idUsuarioExterno;
          Swal.fire({
            title: '¡Éxito!',
            text: 'Usuario registrado correctamente',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          Swal.fire('Error', respuesta.mensaje || 'Error al registrar usuario', 'error');
        }
      },
      (error) => {
        Swal.fire('Error', 'Error al registrar usuario: ' + error, 'error');
      }
    );
  }

  //**** Buscar sitios del productor ****//
  buscarAreasProductor() {
    if (!this.idUsuarioProductor || !this.formulario.value.inputIdParroquia) {
      return;
    }
    this.listaSitios = [];
    this.mostrarCargando('Buscando sitios del productor...');
    const parametros = {
      idParroquiaSitio: this.formulario.value.inputIdParroquia,
      idUsuariosExternos: this.idUsuarioProductor,
      estado: 1
    };

    this.servicioArea.obtenerAreasPorFiltro(parametros)
      .subscribe({
        next: (areas: Area[]) => {
          this.listaSitios = areas;
          Swal.close();
        },
        error: () => Swal.close()
      });
  }

  //**** Activar o desactivar nuevo sitio ****//
  nuevoSitio() {
    this.mostrarDatosSitio = this.formulario.value.checkNuevoSitio;
    this.limpiarSitio();
    this.listaAnimalesConAreteDisponibles = [];
    this.listaAnimalesConAreteSinVacunar = [];
    this.listaAnimalesConAreteVacunados = [];
    this.inicializarCatastroSinAretes();
    this.inicializarCatastroConAretes();
  }

  //**** Limpiar datos del sitio ****//
  limpiarSitio() {
    this.sitioSeleccionado = null;
    // Limpiar controles
    this.formulario.patchValue({
      inputIdArea: null,
      inputIdTipoActividad: null,
      inputNombreSitio: null,
      inputCallePrincipal: null,
      inputTelefono: null,
      inputLatitud: 0,
      inputLongitud: 0,
      inputMarca: null
    });
  }

  //**** Cambiar sitio del productor ****/
  cambioSitioProductor() {
    this.sitioSeleccionado = null;
    this.mostrarDatosSitio = true;
    this.listaAnimalesConAreteDisponibles = [];
    this.listaAnimalesConAreteSinVacunar = [];
    this.listaAnimalesConAreteVacunados = [];
    this.inicializarCatastroConAretes();
    this.inicializarCatastroSinAretes();
    this.listaSitios.forEach((itemArea: Area) => {
      if (Number(itemArea.idArea) === Number(this.formulario.value.inputIdArea)) {
        this.sitioSeleccionado = itemArea;
        this.formulario.controls.inputIdTipoActividad.setValue(itemArea?.idTipoActividad);
        this.formulario.controls.inputNombreSitio.setValue(itemArea?.nombreSitio);
        this.formulario.controls.inputCallePrincipal.setValue(itemArea?.callePrincipalSitio);
        this.formulario.controls.inputTelefono.setValue(itemArea?.telefono);
        this.formulario.controls.inputLatitud.setValue(itemArea?.latitudSitio);
        this.formulario.controls.inputLongitud.setValue(itemArea?.longitudSitio);
      }
    });
    this.buscarAnimalesConAreteOficial(true);
  }

  //**** Inicializar cantidades de animales (sin arete oficial y otras especies) ****/
  inicializarCatastroSinAretes() {
    // Bovinos
    this.terneras = { vacunado: 0, noVacunado: 0 };
    this.terneros = { vacunado: 0, noVacunado: 0 };
    this.vaconas = { vacunado: 0, noVacunado: 0 };
    this.toretes = { vacunado: 0, noVacunado: 0 };
    this.vacas = { vacunado: 0, noVacunado: 0 };
    this.toros = { vacunado: 0, noVacunado: 0 };
    this.bufalosHembras = { vacunado: 0, noVacunado: 0 };
    this.bufalosMachos = { vacunado: 0, noVacunado: 0 };
    // Otras especies
    this.ovinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.ovinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.caprinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.caprinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.camelidosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.camelidosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.equinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.equinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.porcinosMachos = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
    this.porcinosHembras = { cantidadAnimal: 0, vacunado: 0, noVacunado: 0 };
  }

  //**** Inicializar cantidades de animales (con arete oficial) ****/
  inicializarCatastroConAretes() {
    this.ternerasAgregados = 0;
    this.ternerosAgregados = 0;
    this.vaconasAgregados = 0;
    this.toretesAgregados = 0;
    this.vacasAgregados = 0;
    this.torosAgregados = 0;
    this.bufalosHembrasAgregados = 0;
    this.bufalosMachosAgregados = 0;
    this.totalAnimalesAgregados = 0;
  }

  //**** Buscar animales con arete oficial, disponibles en el sitio seleccionado ****/
  buscarAnimalesConAreteOficial(msj: boolean = false) {
    const parametros = new Bovino();
    parametros.idUsuarioActual = this.idUsuarioProductor;
    parametros.codigoEstadoRegistro = 'DISP';
    parametros.codigoEstadoAnimal = 'vivo';
    parametros.codigoEstadoUbicacion = 'SIT';
    parametros.idAreaActual = this.formulario.value.inputIdArea;
    parametros.codigoIdentificacion = 'si';

    this.mostrarCargando('Cargando animales disponibles...');

    this.servicioBovino.filtrarAnimalesMovilizacionFerias(parametros)
      .subscribe((bovinos: Bovino[]) => {
        this.listaAnimalesConAreteDisponibles = bovinos;
        this.totalAnimalesConArete = this.listaAnimalesConAreteDisponibles.length;
        // Excluir los que no tengan el ID de la fase vigente.
        this.listaAnimalesConAreteSinVacunar = bovinos.filter(animal => {
          const idFaseAnimal = animal.idFaseVacunacion !== null ? Number(animal.idFaseVacunacion) : null;
          const idFaseFormulario = this.idFaseVacunacion !== null ?
            Number(this.idFaseVacunacion) : null;
          return idFaseAnimal !== idFaseFormulario;
        });

        Swal.close();
        if (msj && bovinos && bovinos.length > 0 && this.listaAnimalesConAreteSinVacunar.length > 0) {
          this.mostrarMensajeSitioConAretesOficiales(bovinos.length, this.listaAnimalesConAreteSinVacunar.length);
        }
      }, (error) => { Swal.close(); });
  }

  // Formato de mensaje de advertencia cuando un animal no se encuentra disponible en el sitio.
  private mostrarMensajeSitioConAretesOficiales(Total: number, CantSinVacunar: number) {
    Swal.fire({
      title: '¡Atención!',
      html: `<br>Este sitio tiene animales con arete oficial que aún no registran vacunación en la fase actual:<br><br>
             <div style="text-align: left;">
             <i class="fas fa-id-card"></i> <b>Código:</b><span class="badge rounded-pill badge-info">${this.sitioSeleccionado?.codigoSitio}</span><br>
             <i class="fas fa-map-marker-alt"></i> <b> Sitio:</b> <span style="font-size: 0.8em;"> ${this.sitioSeleccionado.nombreSitio.toUpperCase()}</span><br>
             <i class="fas fa-tag"></i> <b>Animale(s) con arete oficial:</b> <span style="font-size: 0.9em;"> ${Total}</span><br>
             <i class="fas fa-syringe"></i> <b>Pendiente de vacunación:</b> <span style="font-size: 0.9em;"> ${CantSinVacunar}</span><br>
             </div>`,
      icon: 'info'
    });
  }

  //**** Abrir Mapa de Google Maps ****/
  abrirGoogleMaps(lat: string, lng: string) {
    console.log('Valores recibidos:', lat, lng);
    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  //**** Limpiar el input de los aretes ****//
  limpiarInputNumeroIdentificador() {
    this.formulario.controls.inputNumeroIdentificador.setValue(null);
  }

  //**** Agregar animales al listado de vacunados ****/
  agregarAnimal() {
    const inputValor = this.formulario.value.inputNumeroIdentificador?.toUpperCase().trim();

    if (!inputValor) {
      Swal.fire('¡Atención!', 'Ingrese número de arete oficial', 'info');
      this.limpiarInputNumeroIdentificador();
      return;
    }

    // Validar Formato del arete (EC + 9 dígitos)
    const formatoAreteValido = /^EC\d{9}$/.test(inputValor);
    if (!formatoAreteValido) {
      Swal.fire({
        title: '¡Formato incorrecto!',
        html: `El arete oficial debe tener el formato: <b>EC</b> seguido de 9 dígitos<br><br>
               <b>Ejemplo:</b> <span class="badge rounded-pill badge-amarillo">EC006132746</span>`,
        icon: 'warning'
      });
      this.limpiarInputNumeroIdentificador();
      return;
    }

    // Validar si ya está en lista de vacunados
    const yaRegistrado = this.listaAnimalesConAreteVacunados.some((item: Bovino) =>
      item.codigoIdentificacion && item.codigoIdentificacion === inputValor
    );

    if (yaRegistrado) {
      Swal.fire({
        title: '¡Atención!',
        html: `<br>Arete oficial <span class="badge rounded-pill badge-amarillo">${inputValor}</span> ya registrado en:<br><br>
               <i class="fas fa-list-ol"></i> <b>Lista de animales vacunados</b>`,
        icon: 'info'
      });
      this.limpiarInputNumeroIdentificador();
      return;
    }

    // Buscar en animales disponibles (solo por arete)
    const animalDisponible = this.listaAnimalesConAreteDisponibles.find(
      (item: Bovino) => item.codigoIdentificacion && item.codigoIdentificacion === inputValor
    );

    if (animalDisponible) {
      // Validar si tiene vacunación en fase actual
      const idFaseAnimal = animalDisponible.idFaseVacunacion !== null ?
        Number(animalDisponible.idFaseVacunacion) : null;
      const idFaseActual = this.idFaseVacunacion !== null ?
        Number(this.idFaseVacunacion) : null;

      if (idFaseAnimal === idFaseActual) {
        Swal.fire({
          title: '¡Atención!',
          html: `<br>Estado de vacunación actual:<br><br>
             <div style="text-align: left;">
             <i class="fas fa-tag"></i> <b>Arete oficial:</b> <span class="badge rounded-pill badge-amarillo">${inputValor}</span><br>
             <i class="fas fa-syringe"></i> <b>Fiebre Aftosa:</b> <span class="badge rounded-pill badge-info">vacunado</span><br>
             </div>`,
          icon: 'info'
        });
        this.limpiarInputNumeroIdentificador();
        return;
      }

      // Si pasa todas las validaciones, se agrega el animal
      this.quitarAgregarAnimales(1, animalDisponible.idCategoriaAnimal);
      this.listaAnimalesConAreteVacunados.unshift(animalDisponible);
      this.listaAnimalesConAreteDisponibles = this.listaAnimalesConAreteDisponibles.filter(
        item => item !== animalDisponible
      );
      this.limpiarInputNumeroIdentificador();
      return;
    }

    // Si no está en disponibles, buscar en la base de datos
    this.bovinoArete = [];
    this.mostrarCargando('Buscando información del arete oficial...');
    this.servicioBovino.filtrarBovinosTicket({
      codigoIdentificacion: inputValor,
      codigoEstadoAnimal: 'vivo',
      codigoEstadoRegistro: 'DISP'
    }).subscribe({
      next: (infoArete: Bovino[]) => {
        this.bovinoArete = infoArete;

        if (this.bovinoArete.length === 0) {
          this.mostrarAreteNoExiste(inputValor);
          this.limpiarInputNumeroIdentificador();
          return;
        }

        const bovinoEncontrado = infoArete[0];
        this.procesarAnimalEncontrado(bovinoEncontrado, inputValor);
      },
      error: (err) => {
        Swal.fire('Error', `Ocurrió un error al buscar: ${err}`, 'error');
      }
    });
  }

  //**** Mensaje para Arete no existente ****/
  mostrarAreteNoExiste(numeroArete: string) {
    Swal.fire({
      title: '¡Atención!',
      html: `<br>Arete oficial <b><span class="badge rounded-pill badge-amarillo">${numeroArete}</span></b> no existe`,
      icon: 'info'
    });
    this.limpiarInputNumeroIdentificador();
  }

  //**** Validar existencia del animal en cuanto a ubicación y estado ****/
  procesarAnimalEncontrado(bovino: Bovino, identificadorBuscado: string) {
    const categoria = this.obtenerCategoria(bovino);
    const areaOrigen = Number(this.formulario.value.inputIdAreaOrigen);
    const estadoUbicacion = bovino.nombreEstadoUbicacion.toUpperCase();
    // Valida si NO está disponible (área diferente o en movimiento)
    if (bovino.idAreaActual !== areaOrigen || estadoUbicacion === "MOVIMIENTO") {
      this.mostrarMensajeArete(bovino, categoria, identificadorBuscado);
      this.limpiarInputNumeroIdentificador();
      return;
    }
    // Si pasa la validación, actualiza la lista de disponibles y lo agrega a lista de vacunados.
    this.buscarAnimalesConAreteOficial();
    this.agregarAnimal();
    this.limpiarInputNumeroIdentificador();
  }

  //**** Define las categorías de acuerdo a la Taxonomía y Sexo del animal ****/
  private obtenerCategoria(bovino: Bovino): string {
    return bovino.nombreCategoria
      ? bovino.nombreCategoria
      : `${bovino.nombreComunTaxonomia} ${bovino.nombreSexo}`;
  }

  // Cambiar cadenas a tipo título (primera letra mayúscula)
  private formatTitleCase(text: string): string {
    return text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Formato de mensaje de advertencia cuando un animal no se encuentra disponible en el sitio.
  mostrarMensajeArete(bovino: Bovino, categoria: string, identificadorBuscado: string) {
    const estado = Number(bovino.idFaseVacunacion) === Number(this.idFaseVacunacion) ? 'vacunado' : 'no vacunado';
    const badgeClassEstado = estado === 'vacunado' ? 'badge-info' : 'badge-danger';

    const ubicacion = bovino.nombreEstadoUbicacion.toLowerCase();
    const badgeClassUbicacion = ubicacion === 'en sitio' ? 'badge-info' : 'badge-warning';

    Swal.fire({
      title: '¡Advertencia!',
      html: `<br>El animal no está disponible en este sitio<br><br>
             <div style="text-align: left;">
             <i class="fas fa-tag"></i> <b>Arete oficial:</b> <span class="badge rounded-pill badge-amarillo">${identificadorBuscado}</span> &rarr; <span style="font-size: 0.9em;">${categoria}</span><br>
             <i class="fas fa-syringe"></i> <b>Estado vacunación:</b> <span class="badge rounded-pill ${badgeClassEstado}">${estado}</span><br>
             <i class="fas fa-flag"></i> <b>Tránsito:</b> <span class="badge rounded-pill ${badgeClassUbicacion}">${ubicacion}</span><br>
             <i class="fas fa-map-marker-alt"></i> <b>Sitio actual:</b> <span style="font-size: 0.8em;"> ${bovino.nombreAreaActual.toUpperCase()}</span><br>
             <i class="fas fa-id-card"></i> <b>Identificación:</b> <span style="font-size: 0.9em;"> ${bovino.numeroIdentificacionUsuarioActual}</span><br>
             <i class="fas fa-user"></i> <b>Propietario:</b> <span style="font-size: 0.9em;">${this.formatTitleCase(bovino.nombresUsuarioActual)}</span><br>
             </div>`,
      icon: 'warning'
    });
  }

  //**** Quitar animales del listado de vacunados (con arete) ****/
  quitarAnimal(id: number) {
    const animalIndex = this.listaAnimalesConAreteVacunados.findIndex(item =>
      Number(id) === Number(item.idBovino)
    );

    if (animalIndex === -1) return;
    const [animalRemovido] = this.listaAnimalesConAreteVacunados.splice(animalIndex, 1);
    this.quitarAgregarAnimales(-1, animalRemovido.idCategoriaAnimal);
    this.listaAnimalesConAreteDisponibles.push(animalRemovido);
    this.limpiarInputNumeroIdentificador();
  }

  //**** Quitar o agregar animales del listado de vacunados (con arete) ****/
  quitarAgregarAnimales(cantidad: number, idCategoria: number) {
    const categorias: { [key: number]: { agregados: string } } = {
      1: { agregados: 'ternerasAgregados' },
      4: { agregados: 'ternerosAgregados' },
      2: { agregados: 'vaconasAgregados' },
      5: { agregados: 'toretesAgregados' },
      3: { agregados: 'vacasAgregados' },
      6: { agregados: 'torosAgregados' },
      7: { agregados: 'bufalosHembrasAgregados' },
      8: { agregados: 'bufalosMachosAgregados' }
    };

    const categoria = categorias[idCategoria];
    if (!categoria) return;

    if (cantidad > 0) {
      this[categoria.agregados]++;
      this.totalAnimalesAgregados++;
    } else {
      this[categoria.agregados]--;
      this.totalAnimalesAgregados--;
    }
  }

  /**** Genérico para mostrar mensaje mientras se ejecuta una acción ****/
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

  /**** Cargar lotes de un laboratorio ****/
  cargarLotes() {
    // Validar laboratorio seleccionado
    if (this.formulario.value.inputIdLaboratorio === null) {
      Swal.fire('¡Advertencia!', 'Opción no válida', 'warning');
      return;
    }

    this.listaLotes = [];
    this.mostrarCargando('Cargando lotes...');

    this.servicioLote.obtenerLotes({
      idLaboratorio: this.formulario.value.inputIdLaboratorio,
      estado: 1
    }).subscribe({
      next: (lotes: Lote[]) => {
        // Ordenar por nombre de forma ascendente
        this.listaLotes = lotes.sort((a, b) => 
          a.nombre.localeCompare(b.nombre)
        );
        Swal.close();
      },
      error: () => {
        Swal.close();
      }
    });
  }

  // Limpiar datos del receptor
  limpiarNombresReceptor() {
    this.idUsuarioReceptor = null;
    this.formulario.controls.inputNombreReceptor.setValue(null);
  }

  // Limpiar datos del productor
  limpiarNombresProductor() {
    this.idUsuarioProductor = null;
    this.formulario.controls.inputNombreProductor.setValue(null);
    this.formulario.controls.checkNuevoSitio.setValue(false);
    this.mostrarDatosSitio = false;
    this.limpiarSitio();
    this.listaSitios = [];
    this.listaAnimalesConAreteDisponibles = [];
    this.listaAnimalesConAreteSinVacunar = [];
    this.listaAnimalesConAreteVacunados = [];
    this.inicializarCatastroSinAretes();
    this.inicializarCatastroConAretes();
  }

  //**** Asignar id del productor al receptor cuando sea el mismo ****/
  cambiarTipoReceptor(): void {
    this.formulario.controls.inputIdFigura.setValue(null);
    this.formulario.controls.inputIdentificacionReceptor.setValue(null);
    this.limpiarNombresReceptor();
    const checkboxMarcado = this.formulario.get('checkReceptor')?.value;
    if (checkboxMarcado) {
      if (this.idUsuarioProductor !== null) {
        this.idUsuarioReceptor = this.idUsuarioProductor; // Asigna ID
      }
    }
  }

  //**** Validación área obligatoria cuando no sea un nuevo sitio ****/
  areaObligatoria(itemArea: string, ckeckNuevoSitio: string) {
    return (formulario_area: FormGroup) => {
      const nuevo = formulario_area.controls[ckeckNuevoSitio].value;
      const area = formulario_area.controls[itemArea].value;
      if (nuevo === false && area === null) {
        return {
          areaObligatoria: true
        };
      }
      return null;
    };
  }

  //**** Validación Brigadista obligatorio ****/
  brigadistaObligatorio(formControl: string) {
    return (formulario_vacunador: FormGroup) => {
      const brigadista = formulario_vacunador.controls[formControl].value;
      if (this.tecnicoVacunador === false && brigadista === null) {
        return {
          brigadistaObligatorio: true
        };
      }
      return null;
    };
  }

  //**** Validación Técnico Agrocalidad obligatorio ****/
  tecnicoAgrocalidadObligatorio(formControl: string) {
    return (formulario_vacunador: FormGroup) => {
      const tecnicoAgrocalidad = formulario_vacunador.controls[formControl].value;
      if (this.tecnicoVacunador && tecnicoAgrocalidad === null) {
        return {
          tecnicoAgrocalidadObligatorio: true
        };
      }
      return null;
    };
  }

  //**** Obtiene el nombre de cada pregunta cargada en la fase ****/
  obtenerNombrePregunta(id: number) {
    let pregunta = '';
    this.listaInterrogantesFaseVacunacion.forEach((item: InterroganteFaseVacunacion) => {
      if (Number(id) === Number(item.idInterrogante)) {
        pregunta = item.nombreInterrogante;
      }
    });
    return pregunta;
  }

  //**** Validación tipo de receptor obligatorio cuando no sea el productor ****/
  figuraObligatoria(itemFigura: string, checkReceptor: string) {
    return (formulario_figura: FormGroup) => {
      const productor = formulario_figura.controls[checkReceptor].value;
      const figura = formulario_figura.controls[itemFigura].value;
      if (productor === false && figura === null) {
        return {
          figuraObligatoria: true
        };
      }
      return null;
    };
  }

  //**** Validación nombres del receptor obligatorio cuando no sea el productor ****/
  nombresReceptorObligatorio(inputNombreReceptor: string, checkReceptor: string) {
    return (formulario_receptor: FormGroup) => {
      const receptor = formulario_receptor.controls[checkReceptor].value;
      const nombresReceptor = formulario_receptor.controls[inputNombreReceptor].value;
      if (receptor === false && nombresReceptor === null) {
        return {
          nombresReceptorObligatorio: true
        };
      }
      return null;
    };
  }

  //**** Registrar un nuevo certificado de vacunación ****/
  registrarCertificadoVacunacion() {

    this.formulario.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente:<ul></br>";

    if (!this.formulario.value.inputIdFaseVacunacion) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione fase / campaña</li>";
    }

    if (!this.formulario.value.inputIdOficinaVacunacion) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione oficina operativa</li>";
    }

    if (!this.formulario.value.inputIdZonaCobertura) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione zona de influencia</li>";
    }

    if (!this.formulario.value.inputIdNumeroCertificado) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione número de certificado</li>";
    }

    if (!this.formulario.value.inputFechaVacunacion) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese fecha de vacunación</li>";
    } else {
      // Convertir a números
      const [anioVac, mesVac, diaVac] = this.formulario.value.inputFechaVacunacion.split('T')[0].split('-').map(Number);
      const fechaVacunacion = new Date(anioVac, mesVac - 1, diaVac);
    
      const fechaActual = new Date();
      const fechaHoy = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
    
      if (fechaVacunacion > fechaHoy) {
        formularioInvalido = true;
        mensaje += "<li>La fecha de vacunación no puede ser mayor a la fecha actual</li>";
      }
    
      const idFaseSeleccionada = Number(this.formulario.value.inputIdFaseVacunacion);
      const faseSeleccionada = this.listaFasesVacunaciones?.find(
        fase => Number(fase.idFaseVacunacion) === idFaseSeleccionada
      ) || null;
    
      if (faseSeleccionada) {
        // Convertir a números
        const [anioIni, mesIni, diaIni] = faseSeleccionada.fechaInicio.split(' ')[0].split('-').map(Number);
        const [anioFin, mesFin, diaFin] = faseSeleccionada.fechaFin.split(' ')[0].split('-').map(Number);
        
        const fechaInicio = new Date(anioIni, mesIni - 1, diaIni);
        const fechaFin = new Date(anioFin, mesFin - 1, diaFin);
    
        if (fechaVacunacion < fechaInicio || fechaVacunacion > fechaFin) {
          formularioInvalido = true;
          // Formatear las fechas
          const diaIniStr = String(fechaInicio.getDate()).padStart(2, '0');
          const mesIniStr = String(fechaInicio.getMonth() + 1).padStart(2, '0');
          const anioIniStr = fechaInicio.getFullYear();
          
          const diaFinStr = String(fechaFin.getDate()).padStart(2, '0');
          const mesFinStr = String(fechaFin.getMonth() + 1).padStart(2, '0');
          const anioFinStr = fechaFin.getFullYear();
          
          mensaje += `<li>La fecha de vacunación debe encontrarse entre ${diaIniStr}/${mesIniStr}/${anioIniStr} y ${diaFinStr}/${mesFinStr}/${anioFinStr}</li>`;
        }
      } else {
        formularioInvalido = true;
        mensaje += "<li>Seleccione una fase de vacunación válida</li>";
      }
    }

    const erroresBrigadista = this.brigadistaObligatorio('inputIdBrigadista')(this.formulario);

    if (erroresBrigadista?.brigadistaObligatorio) {
      formularioInvalido = true;
      mensaje += `<li>Seleccione brigadista</li>`;
    }

    const erroresTecnicoAgrocalidad = this.tecnicoAgrocalidadObligatorio('inputIdUsuarioInterno')(this.formulario);

    if (erroresTecnicoAgrocalidad?.tecnicoAgrocalidadObligatorio) {
      formularioInvalido = true;
      mensaje += `<li>Seleccione Técnico de Agrocalidad</li>`;
    }

    if (!this.formulario.value.inputIdParroquia) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione parroquia de cobertura</li>";
    }

    const erroresArea = this.areaObligatoria('inputIdArea', 'checkNuevoSitio')(this.formulario);

    if (erroresArea?.areaObligatoria) {
      formularioInvalido = true;
      mensaje += `<li>Seleccione sitio</li>`;
    }

    if (!this.formulario.value.inputIdTipoActividad) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de explotación</li>";
    }

    if (!this.formulario.value.inputNombreSitio) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese nombre del sitio</li>";
    }

    if (!this.formulario.value.inputCallePrincipal) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese localidad/sitio/vía</li>";
    }

    if (!this.formulario.value.inputLatitud) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese Latitud</li>";
    }

    if (!this.formulario.value.inputLongitud) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese Longitud</li>";
    }

    if (!this.formulario.value.inputCallePrincipal) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese localidad/sitio/vía</li>";
    }

    const totalAnimalesVacunados = (this.terneras.vacunado + this.terneros.vacunado + this.vacas.vacunado + this.vaconas.vacunado
      + this.toretes.vacunado + this.toros.vacunado + this.bufalosMachos.vacunado + this.bufalosHembras.vacunado + this.totalAnimalesAgregados);

    if (totalAnimalesVacunados === 0) {
      formularioInvalido = true;
      mensaje += "<li>Vacunar mínimo 1 animal</li>";
    }

    const animalesConAreteSinVacunar = Number(this.listaAnimalesConAreteSinVacunar.length) - Number(this.listaAnimalesConAreteVacunados.length);
    if (animalesConAreteSinVacunar > 0) {
      formularioInvalido = true;
      mensaje += "<li>Tiene "+animalesConAreteSinVacunar+" animal(es) con arete oficial sin vacunar</li>";
    }

    if (!this.formulario.value.inputIdLaboratorio) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione laboratorio</li>";
    }

    if (!this.formulario.value.inputLote) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione lote</li>";
    }

    const erroresReceptor = this.figuraObligatoria('inputIdFigura', 'checkReceptor')(this.formulario);

    if (erroresReceptor?.figuraObligatoria) {
      formularioInvalido = true;
      mensaje += `<li>Seleccione tipo de receptor</li>`;
    }

    const erroresNombresReceptor = this.nombresReceptorObligatorio('inputNombreReceptor', 'checkReceptor')(this.formulario);

    if (erroresNombresReceptor?.nombresReceptorObligatorio) {
      formularioInvalido = true;
      mensaje += `<li>Ingrese apellidos y nombres del receptor</li>`;
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

    // Validar coordenadas geográficas
    if (!validarCoordenadasDesdeString(this.formulario.value.inputLatitud.trim(), this.formulario.value.inputLongitud.trim())) {
      Swal.fire({
        title: '¡Advertencia!',
        html: '<i class="fas fa-map-marker-alt"></i> Ubicación fuera de Ecuador continental',
        icon: 'warning'
      });
      return;
    }

    // Validar todos los campos de cantidad de animales
    if (!this.validarTodosLosCamposNumericos()) {
      Swal.fire('¡Atención!', 'Cantidad de animales no válida', 'warning');
      return;
    }

    const certificadoVacunacion = new CertificadoVacunacion();
    certificadoVacunacion.idFaseVacunacion = this.formulario.value.inputIdFaseVacunacion;
    certificadoVacunacion.idOficina = this.formulario.value.inputIdOficinaVacunacion;
    certificadoVacunacion.idSecuencia = this.formulario.value.inputIdNumeroCertificado;
    certificadoVacunacion.origenEmision = 1; // Emitido desde la web
    certificadoVacunacion.ipPublica = this.ipPublica;
    this.listaSecuenciasCertificados.forEach((item: SecuenciaCertificado) => {
      if (Number(item.idSecuencia) === Number(this.formulario.value.inputIdNumeroCertificado)) {
        certificadoVacunacion.secuencia = item.secuencia;
      }
    });
    this.listaDigitadorasOficinas.forEach((item: PersonaOficina) => {
      if (Number(item.idOficina) === Number(this.formulario.value.inputIdOficinaVacunacion)) {
        certificadoVacunacion.idOperadora = item.idOperadora;
        certificadoVacunacion.idUsuarioOperadora = item.idUsuarioExternoOperadora;
      }
    });
    certificadoVacunacion.fechaVacunacion = this.formulario.value.inputFechaVacunacion;
    certificadoVacunacion.idUsuarioBrigadista = this.formulario.value.inputIdBrigadista;
    certificadoVacunacion.idUsuarioAgrocalidad = this.formulario.value.inputIdUsuarioInterno;
    certificadoVacunacion.idUsuarioProductor = this.idUsuarioProductor;
    certificadoVacunacion.idProvincia = this.formulario.value.inputIdProvincia;
    certificadoVacunacion.idCanton = this.formulario.value.inputIdCanton;
    certificadoVacunacion.idParroquia = this.formulario.value.inputIdParroquia;
    // Sitio existente o nuevo
    if (!this.formulario.value.checkNuevoSitio) {
      certificadoVacunacion.idSitio = this.sitioSeleccionado.idSitio;
      certificadoVacunacion.idArea = this.sitioSeleccionado.idArea;
    }
    certificadoVacunacion.idTipoActividad = this.formulario.value.inputIdTipoActividad;
    certificadoVacunacion.nombrePredio = String(this.formulario.value.inputNombreSitio).toUpperCase();
    certificadoVacunacion.sitioVia = String(this.formulario.value.inputCallePrincipal).toUpperCase();
    certificadoVacunacion.telefono = this.formulario.value.inputTelefono;
    certificadoVacunacion.latitud = Number(this.formulario.value.inputLatitud);
    certificadoVacunacion.longitud = Number(this.formulario.value.inputLongitud);
    certificadoVacunacion.zona = '';
    certificadoVacunacion.marca = this.formulario.value.inputMarca;
    certificadoVacunacion.observacion = String(this.formulario.value.inputObservaciones).toUpperCase();
    certificadoVacunacion.idCobertura = this.formulario.value.inputIdZonaCobertura;
    certificadoVacunacion.fechaVacunacion = this.formulario.value.inputFechaVacunacion;
    if (this.formulario.value.inputIdBrigadista) {
      certificadoVacunacion.idUsuarioBrigadista = this.formulario.value.inputIdBrigadista;
    }
    certificadoVacunacion.idLaboratorio = this.formulario.value.inputIdLaboratorio;
    certificadoVacunacion.idLote = this.formulario.value.inputLote;
    certificadoVacunacion.idUsuarioDigitador = this.servicioUsuario.usuarioExterno.idUsuario;
    if (this.formulario.value.inputObservaciones === null) {
      certificadoVacunacion.observacion = this.formulario.value.inputObservaciones;
    } else {
      certificadoVacunacion.observacion = String(this.formulario.value.inputObservaciones).toUpperCase();
    }

    certificadoVacunacion.costoVacunas = (totalAnimalesVacunados * this.valorVacuna);
    certificadoVacunacion.idUsuarioResponsable = this.idUsuarioReceptor;
    // Agregamos los animales
    this.terneras.idFaseVacunacion = this.formulario.value.inputIdFaseVacunacion;
    this.listaTaxonomias.forEach((taxonomia: Taxonomia) => {
      if (taxonomia.codigo === 'bubalus_bubalis') {
        this.bufalosMachos.idTaxonomia = taxonomia.id_taxonomia;
        this.bufalosHembras.idTaxonomia = taxonomia.id_taxonomia;
      }
      if (taxonomia.codigo === 'capra_hircus_aegagrus') {
        this.caprinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.caprinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if (taxonomia.codigo === 'camelidae') {
        this.camelidosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.camelidosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if (taxonomia.codigo === 'equidae') {
        this.equinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.equinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if (taxonomia.codigo === 'ovis_aries_orientalis') {
        this.ovinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.ovinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      if (taxonomia.codigo === 'sus_scrofa_scrofa') {
        this.porcinosHembras.idTaxonomia = taxonomia.id_taxonomia;
        this.porcinosMachos.idTaxonomia = taxonomia.id_taxonomia;
      }
      // Todos los bovinos
      if (taxonomia.codigo === 'bos_taurus_primigenius') {
        this.terneras.idTaxonomia = taxonomia.id_taxonomia;
        this.terneros.idTaxonomia = taxonomia.id_taxonomia;
        this.vaconas.idTaxonomia = taxonomia.id_taxonomia;
        this.toretes.idTaxonomia = taxonomia.id_taxonomia;
        this.vacas.idTaxonomia = taxonomia.id_taxonomia;
        this.toros.idTaxonomia = taxonomia.id_taxonomia;
      }
    });
    this.listaCategorias.forEach((item: Categoria) => {
      if (item.codigo === 'ternera') {
        this.terneras.idCategoria = item.id_categoria;
      }
      if (item.codigo === 'ternero') {
        this.terneros.idCategoria = item.id_categoria;
      }
      if (item.codigo === 'torete') {
        this.toretes.idCategoria = item.id_categoria;
      }
      if (item.codigo === 'toro') {
        this.toros.idCategoria = item.id_categoria;
      }
      if (item.codigo === 'vaca') {
        this.vacas.idCategoria = item.id_categoria;
      }
      if (item.codigo === 'vacona') {
        this.vaconas.idCategoria = item.id_categoria;
      }
    });
    this.bufalosHembras.cantidadAnimal = this.bufalosHembras.vacunado + this.bufalosHembras.noVacunado;
    this.bufalosMachos.cantidadAnimal = this.bufalosMachos.vacunado + this.bufalosMachos.noVacunado;
    this.terneras.cantidadAnimal = this.terneras.vacunado + this.terneras.noVacunado;
    this.terneros.cantidadAnimal = this.terneros.vacunado + this.terneros.noVacunado;
    this.vaconas.cantidadAnimal = this.vaconas.vacunado + this.vaconas.noVacunado;
    this.toretes.cantidadAnimal = this.toretes.vacunado + this.toretes.noVacunado;
    this.vacas.cantidadAnimal = this.vacas.vacunado + this.vacas.noVacunado;
    this.toros.cantidadAnimal = this.toros.vacunado + this.toros.noVacunado;
    this.listaSexos.forEach((sexo: Sexo) => {
      if (sexo.codigo === 'hembra') {
        this.bufalosHembras.idSexo = sexo.id_sexo;
        this.caprinosHembras.idSexo = sexo.id_sexo;
        this.camelidosHembras.idSexo = sexo.id_sexo;
        this.equinosHembras.idSexo = sexo.id_sexo;
        this.ovinosHembras.idSexo = sexo.id_sexo;
        this.porcinosHembras.idSexo = sexo.id_sexo;
        this.terneras.idSexo = sexo.id_sexo;
        this.vaconas.idSexo = sexo.id_sexo;
        this.vacas.idSexo = sexo.id_sexo;
      } else if (sexo.codigo === 'macho') {
        this.bufalosMachos.idSexo = sexo.id_sexo;
        this.caprinosMachos.idSexo = sexo.id_sexo;
        this.camelidosMachos.idSexo = sexo.id_sexo;
        this.equinosMachos.idSexo = sexo.id_sexo;
        this.ovinosMachos.idSexo = sexo.id_sexo;
        this.porcinosMachos.idSexo = sexo.id_sexo;
        this.terneros.idSexo = sexo.id_sexo;
        this.toretes.idSexo = sexo.id_sexo;
        this.toros.idSexo = sexo.id_sexo;
      }
    });

    // Agregamos los bovinos con arete oficial
    certificadoVacunacion.animalesConArete = [];
    if (this.listaAnimalesConAreteVacunados && this.listaAnimalesConAreteVacunados.length > 0) {
      this.listaAnimalesConAreteVacunados.forEach((animal: Bovino) => {
        certificadoVacunacion.animalesConArete.push({
          idBovino: animal.idBovino,
          codigoIdentificacion: animal.codigoIdentificacion,
          idCategoriaAnimal: animal.idCategoriaAnimal,
          idTaxonomia: animal.idTaxonomia,
          idSexo: animal.idSexo
        });
      });
    }
    
    // Agregamos las cantidades de animales por categorias
    certificadoVacunacion.animales = [];
    certificadoVacunacion.animales.push(
      this.bufalosHembras, this.caprinosHembras, this.camelidosHembras, this.equinosHembras,
      this.ovinosHembras, this.porcinosHembras, this.terneras, this.vaconas, this.vacas,
      this.bufalosMachos, this.caprinosMachos, this.camelidosMachos, this.equinosMachos,
      this.ovinosMachos, this.porcinosMachos, this.terneros, this.toretes, this.toros
    );

    certificadoVacunacion.interrogantes = this.listaInterrogantesCertificadosVacunacion;

    if (this.idUsuarioReceptor === this.idUsuarioProductor) {
      certificadoVacunacion.idFiguraPersona = 1;
    } else {
      certificadoVacunacion.idFiguraPersona = this.formulario.value.inputIdFigura;
    }

    this.obtenerNumeroSecuencia();

    Swal.fire({
      title: `¿Registrar certificado?<br><br>${this.secuenciaSeleccionada.secuencia}`,
      html: 'Verifique que los datos ingresados sean correctos. Una vez registrado, el catastro de animales vacunados estará disponible en la cuenta del titular y, tras la movilización de animales, no podrá eliminarse o modificarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, registrar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Registrando certificado de vacunación...');
        this.servicioCertificadoVacunacion.registrarCertificadoVacunacion(certificadoVacunacion).subscribe(
          (respuesta: any) => {
            Swal.close();
            const idCertificadoVacunacion = respuesta.idCertificadoVacunacion;
            this.generarPDF(idCertificadoVacunacion);
          },
          (error) => {
            Swal.close();
            Swal.fire({
              title: '¡Advertencia!',
              html: error.error,
              icon: 'warning'
            });
          }
        );
      }
    });
  }

  /**** Método para generar el certificado de vacunación en PDF ****/
  generarPDF(id: number) {
    this.mostrarCargando('Generando Documento PDF...');
    let codigoCertificado = this.secuenciaSeleccionada.secuencia;

    this.servicioCertificadoVacunacion.obtenerPdfCertificadoUnicoVacunacion(id)
      .subscribe({
        next: (resp: any) => {
          Swal.close();

          const byteCharacters = atob(resp.contenido);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);

          Swal.fire({
            title: `${codigoCertificado}`,
            html: 'Documento generado con éxito.<br><br><b>Seleccione una opción:</b>',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#28a745',
            confirmButtonText: '<i class="fas fa-download"></i> Descargar',
            cancelButtonText: '<i class="fas fa-sign-out-alt" style="color: white !important;"></i> Continuar',
            allowOutsideClick: false
          }).then((result) => {
            // Manejar la descarga
            if (result.isConfirmed) {
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = codigoCertificado + '.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
            Swal.close();
            setTimeout(() => {
              this.limpiarFormulario();
              this.desplazarAlInicioForzado();
            }, 500);
          });
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el documento PDF: ' + err, 'error');
        }
      });
  }

  //**** Desplazamiento forzado para cuando se descarga el documento ****/
  desplazarAlInicioForzado() {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
    document.body.classList.remove('swal2-shown');
    document.body.classList.remove('swal2-height-auto');

    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
    setTimeout(() => window.scrollTo(0, 0), 50);
    setTimeout(() => window.scrollTo(0, 0), 100);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  }

  //**** Limpiar todo el formulario ****/
  limpiarFormulario() {
    this.formulario.reset();
    this.limpiarVacunadorBrigadista();
    this.sitioSeleccionado = null;
    this.mostrarDatosSitio = false;
    this.listaAnimalesConAreteDisponibles = [];
    this.listaAnimalesConAreteSinVacunar = [];
    this.listaAnimalesConAreteVacunados = [];
    this.inicializarCatastroConAretes();
    this.inicializarCatastroSinAretes();
    this.listaDigitadorasOficinas = [];
    this.listaCoberturasOficinas = [];
    this.listaSecuenciasCertificados = [];
    this.listaUsuariosInternos = [];
    this.listaSitios = [];
    this.secuenciaSeleccionada = null;
  }

  /**** Acción que se realiza al cancelar, limpiar y regresar al inicio de la página ****/
  botonCancelar() {
    this.limpiarFormulario();
    this.desplazarAlInicioAnimacion();
  }

  //**** obtener datos de la secuencia seleccionada ****/
  obtenerNumeroSecuencia() {
    if (!this.formulario || !this.formulario.value.inputIdNumeroCertificado) {
      this.secuenciaSeleccionada = null;
      return;
    }

    const idBuscado = Number(this.formulario.value.inputIdNumeroCertificado);
    this.secuenciaSeleccionada = this.listaSecuenciasCertificados.find(
      item => Number(item.idSecuencia) === idBuscado
    ) || null;
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicioAnimacion() {
    requestAnimationFrame(() => {
      document.documentElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  // Función para validar solo números en el keypress
  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Permitir solo números (0-9) y teclas de control
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Función para asignar 0 cuando el campo está vacío
  validarYAsignarCero(event: any, campo: string): void {
    const valor = event.target.value;

    if (valor === '' || valor === null || valor === undefined) {
      this.asignarValorCero(campo);
      event.target.value = '0';
    }
  }

  // Función auxiliar para asignar el valor 0 al campo correspondiente
  asignarValorCero(campo: string): void {
    const partes = campo.split('.');
    if (partes.length === 2) {
      const objeto = partes[0];
      const propiedad = partes[1];
      if (this[objeto] && this[objeto][propiedad] !== undefined) {
        this[objeto][propiedad] = 0;
      }
    }
  }

  // Función para validar todos los campos de cantidad de animales
  validarTodosLosCamposNumericos(): boolean {
    const campos = [
      'terneras.vacunado',
      'terneros.vacunado',
      'vacas.vacunado',
      'vaconas.vacunado',
      'toretes.vacunado',
      'toros.vacunado',
      'bufalosMachos.vacunado',
      'bufalosHembras.vacunado',
      'ovinosMachos.cantidadAnimal',
      'ovinosHembras.cantidadAnimal',
      'caprinosMachos.cantidadAnimal',
      'caprinosHembras.cantidadAnimal',
      'camelidosMachos.cantidadAnimal',
      'camelidosHembras.cantidadAnimal',
      'equinosMachos.cantidadAnimal',
      'equinosHembras.cantidadAnimal',
      'porcinosMachos.cantidadAnimal',
      'porcinosHembras.cantidadAnimal'
    ];

    for (const campo of campos) {
      if (!this.validarCampoEspecifico(campo)) {
        return false;
      }
    }

    return true;
  }

  // Función para validar un campo específico
  validarCampoEspecifico(campo: string): boolean {
    const partes = campo.split('.');
    let valor: any;

    if (partes.length === 2) {
      const objeto = partes[0];
      const propiedad = partes[1];
      valor = this[objeto] ? this[objeto][propiedad] : null;
    }

    // Si está vacío, asignar 0 y continuar
    if (valor === null || valor === undefined || valor === '') {
      this.asignarValorCero(campo);
      return true;
    }

    // Validar que sea un número entero positivo
    if (!Number.isInteger(Number(valor)) || Number(valor) < 0) {
      Swal.fire('Error', `El campo ${campo} debe ser un número entero positivo`, 'error');
      return false;
    }

    return true;
  }

}
