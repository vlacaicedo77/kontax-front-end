import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
import { ProveedoresAretes } from 'src/app/modelos/proveedores-aretes.modelo';
import { TiposProveedoresAretes } from '../../modelos/tipos-proveedores-aretes.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { CantonService } from 'src/app/servicios/canton/canton.service';
import { ParroquiaService } from 'src/app/servicios/parroquia/parroquia.service';
import { ProveedorAretesService } from 'src/app/servicios/proveedor-aretes/proveedor-aretes.service';
import { TiposProveedoresAretesService } from 'src/app/servicios/tipos-proveedores-aretes/tipos-proveedores-aretes.service';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
// Importamos scripts
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';

@Component({
  selector: 'app-registrar-proveedor-aretes',
  templateUrl: './registrar-proveedor-aretes.component.html',
  styleUrls: ['./registrar-proveedor-aretes.component.css']
})
export class RegistrarProveedorAretesComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  formularioBusqueda: FormGroup;
  //**** Cuerpo de modelos ****/
  usuario: Usuario = new Usuario();
  //**** Listas ****/
  public listaProvincias = [];
  public listaCantones = [];
  public listaParroquias = [];
  public listaProveedores = [];
  public listaTiposProveedores = [];
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
  idProveedoresAretes: number;
  nombreTipoProveedor: string = '';
  encriptar: any;

  constructor(
    public servicioUsuario: UsuarioService,
    private servicioDinardap: DinardapService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService,
    private proveedorAretesService: ProveedorAretesService,
    private tiposProveedorAretesService: TiposProveedoresAretesService,
    private router: Router,
    private servicioscript: ScriptsService
  ) { }


  ngOnInit() {
    this.inicializarFormulario();
    this.verificarRolUsuario(); // Se valida el acceso del usuario, en base a su rol. Que sea usuario interno.
    this.encriptar = new JSEncrypt();
    this.servicioscript.inicializarScripts();
    this.cargarProvinciasPorPais(19); //Ecuador por defecto
    this.contrasenaTemporal = this.generarClaveAleatoria(); //Generar la contraseña aleatoria temporal
    this.obtenerTiposProveedores();
  }
  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputIdUsuario: new FormControl(''),
      inputIdUsuarioLock: new FormControl(''),
      inputRazonSocial: new FormControl(null, [Validators.required]),
      inputNombreComercial: new FormControl(''),
      inputIdentificacionRepresentante: new FormControl(null),
      inputNombresRepresentante: new FormControl(null),
      inputTipoProveedor: new FormControl(null, [Validators.required]),
      inputCheckAomz: new FormControl(false, Validators.required),
      inputProvincia: new FormControl(null, [Validators.required]),
      inputCanton: new FormControl(null, [Validators.required]),
      inputParroquia: new FormControl(null, [Validators.required]),
      inputDireccion: new FormControl(null, [Validators.required, Validators.maxLength(150)]),
      inputTelefono: new FormControl(null, [Validators.required]),
      inputEmail: new FormControl(null, [Validators.required, Validators.maxLength(160)])
    });

    this.formularioBusqueda = new FormGroup({
      InputProvincia: new FormControl('-1'),
      InputEstado: new FormControl('-1'),
      inputTipoProveedor: new FormControl('-1'),
      InputDato: new FormControl(null, [Validators.maxLength(13)])
    });
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Desplazar al inicio de la página ****/
  accionNuevoBoton() {
    this.formularioVisible = true;
  }

  //**** Método para obtener tipos de proveedor ****/
  obtenerTiposProveedores() {
    this.listaTiposProveedores = [];
    this.tiposProveedorAretesService.obtenerTiposProveedoresAretes({ estado: 1 })
      .subscribe((tiposProveedorAretes: TiposProveedoresAretes[]) => {
        this.listaTiposProveedores = tiposProveedorAretes;
        Swal.close();
      });
  }

  //**** Método para obtener tipos de proveedor ****/
  asignarTiposProveedores(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.nombreTipoProveedor = selectElement.options[selectElement.selectedIndex].text; // Captura el texto

    this.formulario.get('inputCheckAomz').setValue(false);
    this.activarAomz = 1;

    if (this.formulario.value.inputTipoProveedor == 2) {
      this.visualizarAomz = true;
    } else {
      this.visualizarAomz = false;
    }
  }

  //**** Método para buscar proveedores ****/
  buscarProveedores() {

    const parametros: any = {}; // Objeto para almacenar los filtros dinámicamente
    // Obtenemos los valores actuales del formulario
    const provincia = this.formularioBusqueda.get('InputProvincia')?.value;
    const estado = this.formularioBusqueda.get('InputEstado')?.value;
    const tipo = this.formularioBusqueda.get('inputTipoProveedor')?.value;
    const dato = this.formularioBusqueda.get('InputDato')?.value;
    // Tipo proveedor (principal)
    // Preguntas y lógica para armar el objeto dinámico
    if (provincia !== '-1') {
      parametros.idProvincia = provincia; // Incluimos la provincia solo si es distinta a -1
    }

    if (tipo !== '-1') {
      parametros.idTiposProveedores = tipo; // Incluimos el estado solo si es distinto a -1
    }

    if (estado !== '-1') {
      parametros.estado = estado; // Incluimos el estado solo si es distinto a -1
    }

    if (dato !== null && dato.trim() !== '') {
      parametros.numeroIdentificacionUsuario = dato; // Incluimos el dato si no está vacío o nulo
    }

    // Llamamos al método con los parámetros construidos
    this.obtenerProveedores(parametros);
  }

  //**** Método que permite obtener los proveedores de aretes oficiales según sus parámetros. ****/
  obtenerProveedores(parametros: any) {

    // Inicializamos la lista para evitar datos residuales
    this.limpiarCamposGeneral();
    this.mostrarCargando('Buscando proveedores...');
    this.proveedorAretesService.obtenerProveedorAretes(parametros)
      .subscribe((resultado: any) => { // Cambiamos el tipo si es necesario
        Swal.close();
        // Verificamos y asignamos la lista de proveedores desde resultado
        this.listaProveedores = resultado.resultado;
        // Verificamos si hay elementos en la lista
        if (this.listaProveedores.length === 0) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
        }
      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener los proveedores. Intente nuevamente más tarde: '+error, 'error');
      });
  }

  //**** Limpiar lista de proveedores ****/
  limpiarListaProveedores() {
    this.listaProveedores = [];
  }

  //**** Limpiar campos usuario ****/
  limpiarCamposUsuario() {
    this.idUsuario = null;
    this.formulario.controls.inputRazonSocial.setValue('');
    this.formulario.controls.inputNombreComercial.setValue('');
    this.formulario.controls.inputIdentificacionRepresentante.setValue('');
    this.formulario.controls.inputNombresRepresentante.setValue('');
    this.formulario.controls.inputEmail.setValue('');
  }

  //**** Limpiar campos de todos los formularios, variables y listas ****/
  limpiarCamposGeneral() {
    this.limpiarCamposUsuario();
    this.formulario.controls.inputIdUsuario.setValue('');
    this.formulario.controls.inputTipoProveedor.setValue(null);
    this.formulario.controls.inputCheckAomz.setValue(false);
    this.formulario.controls.inputProvincia.setValue(null);
    this.formulario.controls.inputCanton.setValue(null);
    this.formulario.controls.inputParroquia.setValue(null);
    this.listaCantones = [];
    this.listaParroquias = [];
    this.formulario.controls.inputDireccion.setValue('');
    this.estadoUsuario = 0;
    this.formulario.controls.inputTelefono.setValue('');
    this.listaProveedores = [];
    this.banderaEditar = false;
    this.visualizarAomz = false;
    this.activarAomz = 1;
    this.formularioVisible = false;
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

  //**** Método que obtiene el listado de provincias. ****/
  cargarProvinciasPorPais(idPais: number) {
    this.provinciaService.getProvinciasPorPais(idPais)
      .subscribe(respuesta => this.listaProvincias = respuesta);
  }

  //**** Método que obtiene el listado de cantones. ****/
  cargarCantonesPorProvincia(idProvincia: number) {
    this.cantonService.getCantonesPorProvincia(idProvincia)
      .subscribe(respuesta => {
        this.listaCantones = respuesta
        this.listaParroquias = [];
        this.formulario.controls.inputCanton.setValue(null);
        this.formulario.controls.inputParroquia.setValue(null);
      });
  }

  //**** Método que obtiene el listado de parroquias. ****/
  cargarParroquiasPorCanton(idCanton: number) {
    this.parroquiaService.getParroquiasPorCanton(idCanton)
      .subscribe(respuesta => {
        this.listaParroquias = respuesta
        this.formulario.controls.inputParroquia.setValue(null);
      });
  }

  //**** Método para buscar usuarios externos en la base de datos o servicio web ****/
  buscarUsuario(ruc: string) {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputIdUsuario == null || this.formulario.value.inputIdUsuario == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    }

    if (this.formulario.value.inputIdUsuario.length != 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido</li>";
    }

    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    // Llamar a obtenerProveedores y esperar a la respuesta
    this.proveedorAretesService.obtenerProveedorAretes({ numeroIdentificacionUsuario: ruc })
      .subscribe((resultado: any) => {
        this.listaProveedores = resultado.resultado;

        // Verificamos si hay elementos en la lista
        if (this.listaProveedores && this.listaProveedores.length > 0) {
          Swal.fire('¡Advertencia!', 'Ya existe un proveedor / operador autorizado registrado con el RUC ' + ruc, 'warning');
          return;
        }

        // Continuar con la lógica después de obtener los proveedores
        let identificacionUsuario = ruc;

        this.servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, null, null)
          .subscribe((resp: any) => {
            if (resp.estado === 'OK') {
              if (resp.resultado.length == 1) {
                Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');

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
                this.formulario.controls.inputRazonSocial.setValue(this.usuario.nombres);
                this.formulario.controls.inputNombreComercial.setValue(this.usuario.nombreComercial);
                this.formulario.controls.inputIdentificacionRepresentante.setValue(this.usuario.identificacionRepresentanteLegal);
                this.formulario.controls.inputNombresRepresentante.setValue(this.usuario.nombresRepresentanteLegal);
                this.formulario.controls.inputEmail.setValue(this.usuario.email);
                this.estadoUsuario = this.usuario.estado;
                this.banderaUsuarioNuevo = false; // Usuario existente en la base de datos

              } else {
                this.consultaDinarpRUC(ruc);
                this.banderaUsuarioNuevo = true; // Usuario nuevo
                this.contrasenaTemporal = this.generarClaveAleatoria(); // Generar la contraseña aleatoria temporal
                this.estadoUsuario = 1;
              }
            } else {
              Swal.fire('Error', resp.mensaje, 'error');
            }
          });
      }, (error) => {
        Swal.fire('Error', 'No se pudo obtener los proveedores / operadores autorizados. Intente nuevamente más tarde: '+error, 'error');
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
            this.formulario.controls.inputRazonSocial.setValue(ubicacion.razonSocial);
          }

          if (correos.length > 0) {
            const itemCorreo: EmailContribuyente = correos[0];
            this.formulario.controls.inputEmail.setValue(itemCorreo.email);
            this.formulario.controls.inputNombreComercial.setValue(itemCorreo.nombreComercial);
          }

          if (representante.length > 0) {
            const itemRepresentante: RucRepresentanteLegal = representante[0];
            this.formulario.controls.inputNombresRepresentante.setValue(itemRepresentante.nombreRepreLegal);
            this.formulario.controls.inputIdentificacionRepresentante.setValue(itemRepresentante.idRepreLegal);
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
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputIdUsuario == null || this.formulario.value.inputIdUsuario.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    }
    if (this.formulario.value.inputIdUsuario.trim().length != 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido</li>";
    }
    if (this.formulario.value.inputRazonSocial == null || this.formulario.value.inputRazonSocial.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese razón social</li>";
    }
    if (this.formulario.value.inputTipoProveedor == null || this.formulario.value.inputTipoProveedor == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo</li>";
    }
    if (this.formulario.value.inputProvincia == null || this.formulario.value.inputProvincia == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione provincia</li>";
    }
    if (this.formulario.value.inputCanton == null || this.formulario.value.inputCanton == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione cantón</li>";
    }
    if (this.formulario.value.inputParroquia == null || this.formulario.value.inputParroquia == "") {
      formularioInvalido = true;
      mensaje += "<li>Seleccione parroquia</li>";
    }
    if (this.formulario.value.inputDireccion == null || this.formulario.value.inputDireccion.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese dirección matriz</li>";
    }
    if (this.formulario.value.inputTelefono == null || this.formulario.value.inputTelefono.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese teléfono</li>";
    }
    if (this.formulario.value.inputEmail == null || this.formulario.value.inputEmail.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese correo electrónico</li>";
    }
    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }
    // Mensaje de confirmación
    Swal.fire({
      title: '¿Está seguro de registrar este ' + this.nombreTipoProveedor.toLocaleLowerCase() + '?',
      text: "Una vez registrado, las credenciales de acceso al sistema serán notificadas al correo electrónico [" + this.formulario.value.inputEmail.trim().toLocaleLowerCase() + "].",
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
          usuario.numeroIdentificacion = this.formulario.value.inputIdUsuario.toUpperCase().trim();
          usuario.nombres = this.formulario.value.inputRazonSocial.toUpperCase().trim();
          usuario.apellidos = this.formulario.value.inputRazonSocial.toUpperCase().trim();
          usuario.nombreComercial = this.formulario.value.inputNombreComercial.toUpperCase().trim();
          usuario.razonSocial = this.formulario.value.inputRazonSocial.toUpperCase().trim();
          usuario.identificacionRepresentanteLegal = this.formulario.value.inputIdentificacionRepresentante.trim();
          usuario.nombresRepresentanteLegal = this.formulario.value.inputNombresRepresentante.toUpperCase().trim();
          usuario.apellidosRepresentanteLegal = this.formulario.value.inputNombresRepresentante.toUpperCase().trim();
          usuario.email = this.formulario.value.inputEmail.toLowerCase().trim();
          usuario.contraseña = claveEncriptada;
          this.servicioUsuario.registrarUsuarioExternoVacunacion(usuario)
            .subscribe((respuesta: any) => {
              if (respuesta.estado === 'ERR') {
                Swal.fire('Error', respuesta.mensaje, 'error');
                return;
              }
              if (respuesta.estado === 'OK' && respuesta.resultado?.idUsuarioExterno) {
                // Asignar el valor a la variable this.idUsuario
                this.idUsuario = respuesta.resultado.idUsuarioExterno;
                this.registrarProveedor();
              }
            });
        } else {
          this.registrarProveedor();
        }
      } else {
        Swal.close();
      }
    });
  }

  //**** Método que obtiene los datos de roles del usuario ****/
  verificarRolUsuario() {
    if (!this.servicioUsuario.usuarioInterno) {
      Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad', 'error');
      this.router.navigate(['inicio']);
    }
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

  //**** Método para registrar proveedores de aretes oficiales ****/
  registrarProveedor() {

    let proveedor = new ProveedoresAretes();
    proveedor.idUsuariosExternos = this.idUsuario;
    proveedor.idProvincia = this.formulario.value.inputProvincia;
    proveedor.idCanton = this.formulario.value.inputCanton;
    proveedor.idParroquia = this.formulario.value.inputParroquia;
    proveedor.direccion = this.formulario.value.inputDireccion.trim().toUpperCase();
    proveedor.telefono = this.formulario.value.inputTelefono.trim();
    proveedor.nombresUsuario = this.formulario.value.inputRazonSocial.trim().toUpperCase();
    proveedor.numeroIdentificacionUsuario = this.formulario.value.inputIdUsuario.trim();
    proveedor.email = this.formulario.value.inputEmail.trim().toLocaleLowerCase();
    proveedor.idTiposProveedores = this.formulario.value.inputTipoProveedor;
    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);
    proveedor.contraseña = claveEncriptada;
    proveedor.estadoUsuario = this.estadoUsuario;
    proveedor.banderaUsuarioNuevo = this.banderaUsuarioNuevo;
    proveedor.nombreTipoProveedor = this.nombreTipoProveedor;
    proveedor.aomz = this.activarAomz;

    let usuario = new Usuario();

    if (this.estadoUsuario == 1) {

      usuario.idUsuario = this.idUsuario;
      usuario.email = this.formulario.value.inputEmail.trim().toLowerCase();
      usuario.contraseña = claveEncriptada;
      usuario.bandera = 0;
      usuario.banderaDatos = 1;
      // Aquí se activa el usuario y se genera una clave aleatoria cuando se encuentra en estado inactivo
      this.servicioUsuario.actualizarUsuarioExternoSimple(usuario)
        .subscribe((resp: any) => { });
    } else {
      if (this.email.toLowerCase() !== this.formulario.value.inputEmail.toLowerCase()) {
        usuario.idUsuario = this.idUsuario;
        usuario.banderaDatos = 1;
        usuario.email = this.formulario.value.inputEmail.toLowerCase();
        this.servicioUsuario.actualizarUsuarioExternoSimple(usuario)
          .subscribe((resp: any) => { });
      }
    }
    this.llamarServicioCrearProveedorAretes(proveedor);
  }

  //**** Método que llama al servicio de creación de proveedores ****/
  llamarServicioCrearProveedorAretes(proveedor: ProveedoresAretes) {
    
    this.mostrarCargando('Registrando ' + this.nombreTipoProveedor.toLocaleLowerCase());
    this.proveedorAretesService.registrarProveedorAretes(proveedor)
      .subscribe((resp: any) => {
        if (resp.estado === 'OK') {
          Swal.fire({
            title: 'Éxito',
            text: this.nombreTipoProveedor + ' registrado con éxito',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.limpiarCamposGeneral();
            this.buscarProveedores();
            this.desplazarAlInicio();
          });

        } else {
          Swal.fire('Error', resp.mensaje, 'error');
          Swal.close();
        }
      });
  }

  //**** Método para actualizar el estado de un proveedor de aretes oficiales. ****/
  actualizarEstadoProveedor(id: number, accion: string, tipo: string) {

    let proveedor = new ProveedoresAretes();
    proveedor.idProveedoresAretes = id;

    this.listaProveedores.forEach((item: ProveedoresAretes) => {
      if (item.idProveedoresAretes == id) {
        this.nombreUsuario = item.nombresUsuario.toLocaleUpperCase();
        this.idProveedoresAretes = item.idProveedoresAretes;
      }
    });

    var accionTexto = '';
    proveedor.idProveedoresAretes = this.idProveedoresAretes;

    switch (accion) {
      case 'Activar': {
        proveedor.estado = 1;
        accionTexto = "activado";
        break;
      }
      case 'Inactivar': {
        proveedor.estado = 0;
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
        this.proveedorAretesService.actualizarProveedor(proveedor)
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
                this.buscarProveedores(); // Llama a la función buscar aquí
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
  asignarDatosFormularioProveedor(id: number) {
    
    this.mostrarCargando('Asignando datos proveedor / operador autorizado');
    // Buscar el proveedor en la lista
    const proveedor = this.listaProveedores.find((item: ProveedoresAretes) => item.idProveedoresAretes === id);
    this.formularioVisible = true;
    // Verificar si el proveedor fue encontrado
    if (proveedor) {
      // Asignar los valores al formulario
      this.nombreUsuario = proveedor.nombresUsuario.toLocaleUpperCase();
      this.idUsuario = proveedor.idUsuariosExternos;
      this.idProveedoresAretes = proveedor.idProveedoresAretes;

      this.formulario.controls['inputIdUsuario'].setValue(proveedor.numeroIdentificacionUsuario);
      this.formulario.controls['inputIdUsuarioLock'].setValue(proveedor.numeroIdentificacionUsuario);
      this.formulario.controls['inputRazonSocial'].setValue(proveedor.razonSocialUsuario);
      this.formulario.controls['inputNombreComercial'].setValue(proveedor.nombreComercialUsuario);
      this.formulario.controls['inputIdentificacionRepresentante'].setValue(proveedor.identificacionRepresentanteLegalUsuario);
      this.formulario.controls['inputNombresRepresentante'].setValue(proveedor.nombresRepresentanteLegalUsuario);
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

      //Cargar listado de cantones
      this.cantonService.getCantonesPorProvincia(proveedor.idProvincia)
        .subscribe(respuesta => {
          this.listaCantones = respuesta
          this.listaParroquias = [];
        });
      //Cargar listado de parroquias
      this.parroquiaService.getParroquiasPorCanton(proveedor.idCanton)
        .subscribe(respuesta => {
          this.listaParroquias = respuesta
        });

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
  actualizarProveedor(id: number) {

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.formulario.value.inputIdUsuario.trim() == null || this.formulario.value.inputIdUsuario.trim() == "") {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC</li>";
    }
    if (this.formulario.value.inputIdUsuario.trim().length != 13) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de RUC válido</li>";
    }
    if (this.formulario.value.inputRazonSocial.trim() == null || this.formulario.value.inputRazonSocial.trim() == "") {
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

    const proveedor = new ProveedoresAretes();
    proveedor.idProveedoresAretes = id;

    // Buscar proveedor en la lista y asignar sus datos
    const proveedorExistente = this.listaProveedores.find(
      (item: ProveedoresAretes) => item.idProveedoresAretes === id
    );

    if (!proveedorExistente) {
      Swal.fire('Error', 'Proveedor / operador autorizado no encontrado.', 'error');
      return;
    }

    this.nombreUsuario = proveedorExistente.nombresUsuario.toLocaleUpperCase();
    this.idUsuario = proveedorExistente.idUsuariosExternos;
    this.email = proveedorExistente.email;
    this.idProveedoresAretes = proveedorExistente.idProveedoresAretes;

    // Asignar datos desde el formulario
    proveedor.idProvincia = this.formulario.value.inputProvincia;
    proveedor.idCanton = this.formulario.value.inputCanton;
    proveedor.idParroquia = this.formulario.value.inputParroquia;
    proveedor.direccion = this.formulario.value.inputDireccion.trim().toUpperCase();
    proveedor.telefono = this.formulario.value.inputTelefono.trim();
    proveedor.idTiposProveedores = this.formulario.value.inputTipoProveedor;

    if (this.formulario.value.inputCheckAomz) {
      proveedor.aomz = 2;
    } else {
      proveedor.aomz = 1;
    }

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

        this.proveedorAretesService.actualizarProveedor(proveedor).subscribe({
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

    if (this.idProveedoresAretes !== this.formulario.value.inputTipoProveedor) {
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
              this.buscarProveedores();
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
        this.buscarProveedores();
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
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

}