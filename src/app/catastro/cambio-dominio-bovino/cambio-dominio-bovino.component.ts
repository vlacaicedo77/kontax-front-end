import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import Swal from 'sweetalert2';
import { Bovino } from '../../modelos/bovino.modelo';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { Area } from 'src/app/modelos/area.modelo';
import { AreaService } from '../../servicios/area/area.service';
import { param } from 'jquery';
import { Categoria } from '../../modelos/categoria.modelo';
import { CategoriaService } from '../../servicios/categoria/categoria.service';
import { BovinoVacunadoService } from '../../servicios/bovino-vacunado.service';
import { BovinoCertificadoVacunacion } from '../../modelos/bovino-certificado-vacunacion.modelo';

@Component({
  selector: 'app-cambio-dominio-bovino',
  templateUrl: './cambio-dominio-bovino.component.html',
  styleUrls: ['./cambio-dominio-bovino.component.css']
})
export class CambioDominioBovinoComponent implements OnInit {

  // Propietario actual
  listaPropietarios: UsuarioExterno[] = [];
  usuarioPropietarioActualSeleccionado: UsuarioExterno;
  listaAreasOrigen: Area[] = [];
  categorias: Categoria[] = [];

  formulario: FormGroup;
  listaDestinatarios: UsuarioExterno[] = [];
  usuarioPropietarioNuevoSeleccionado: UsuarioExterno;
  listaBovinosDisponibles: Bovino[] = [];
  listaBovinosAgregados: Bovino[] = [];
  listaBovinosVacunadosAgregados: BovinoCertificadoVacunacion[] = [];
  listaAreasDestinos: Area[] = [];

  usuario : Usuario = new Usuario();
  // Variables auxiliares
  idUsuario : number = 0;
  idUsuarioD : number = 0;
  // Bovinos vacunados
  listaBovinosVacunadosDisponibles: BovinoCertificadoVacunacion[] = [];

  // Propiedades para paginación
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    public servicioUsuario: UsuarioService,
    private servicioBovino: BovinoService,
    private servicioBovinoVacunado: BovinoVacunadoService,
    private servicioCategoria: CategoriaService,
    private servicioArea: AreaService
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
    }

  ngOnInit(): void {
    this.usuarioPropietarioNuevoSeleccionado = null;
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerCategorias();
    //this.obtenerBovinosDisponibles();
  }

  /**
   * Inicializa el formulario
   */
  inicializarFormulario(){
    this.formulario = new FormGroup({
      //propietario: new FormControl(null, Validators.required),
      destinatario: new FormControl(null),
      area_origen: new FormControl(null, Validators.required),
      categoria: new FormControl(null),
      categoriaD: new FormControl("-1"),
      area_destino: new FormControl(null),
      tipo_catastro: new FormControl(null, Validators.required),
      tipo_catastroD: new FormControl("-1"),
      inputNombres: new FormControl(null, [Validators.required]),
      inputIdUsuario: new FormControl(null),
      inputIdUsuarioD: new FormControl(null),
      inputNombresD: new FormControl(null)
    });
  }

  // Método que obtiene las categorías.
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
    .subscribe( (respuesta: Categoria[]) => this.categorias = respuesta );
  }

  /**
   * Registra el cambio de dominio
   */
  registrarCambio(){
    this.formulario.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.idUsuario == null || this.idUsuario == 0){
      formularioInvalido = true;
      mensaje += "<li>Ingrese identificación del propietario del sitio de origen</li>";
    }

    if(this.idUsuarioD == null || this.idUsuarioD == 0){
      formularioInvalido = true;
      mensaje += "<li>Ingrese identificación del propietario del sitio de destino</li>";
    }

    if(this.formulario.value.inputNombresD == null || this.formulario.value.inputNombresD == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese propietario del sitio de destino</li>";
    }

    if(this.formulario.value.area_destino == null || this.formulario.value.area_destino == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione sitio de destino</li>";
    }
    if(this.formulario.value.tipo_catastro == "2"){
      if ( this.listaBovinosAgregados.length === 0 ) {
        formularioInvalido = true;
        mensaje += "<li>Debe agregar bovinos para transferirlos</li>";
      }
    }else
    {
      if ( this.listaBovinosVacunadosAgregados.length === 0 ) {
        formularioInvalido = true;
        mensaje += "<li>Debe agregar bovinos para transferirlos</li>";
      }
    }
    
    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    Swal.fire({
      title: 'Espere...',
      text: 'Registrando transferencia.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });

    const solicitud: any = {};
    solicitud.idUsuarioOrigen = this.idUsuario;
    solicitud.idUsuarioDestino = this.idUsuarioD;
    if ( this.formulario.value.area_destino ) {
      solicitud.idAreaDestino = this.formulario.value.area_destino;
    }
    const bovinosTransferir: any[] = [];

    if(this.formulario.value.tipo_catastro == "2"){
    this.listaBovinosAgregados.forEach( (item: Bovino) => {
      bovinosTransferir.push({idBovino: item.idBovino});
    });
    }

    if(this.formulario.value.tipo_catastro == "1"){
      this.listaBovinosVacunadosAgregados.forEach( (item: BovinoCertificadoVacunacion) => {
        bovinosTransferir.push({idBovino: item.idBovino});
      });
      }

    solicitud.bovinos = bovinosTransferir;
    this.servicioBovino.transferirDominio(solicitud)
    .subscribe( (respuesta: any) => {
      Swal.fire('Éxito', 'Se transfirió correctamente los bovinos', 'success').then( () => {
        //this.obtenerBovinosDisponibles();
        //this.formulario.reset();
        this.formulario.controls.area_origen.setValue(null);
        this.formulario.controls.area_destino.setValue(null);
        this.formulario.controls.tipo_catastro.setValue(null);
        this.formulario.controls.categoriaD.setValue("-1");

        //this.usuarioPropietarioNuevoSeleccionado = null;
        //this.usuarioPropietarioActualSeleccionado = null;
        //this.listaBovinosDisponibles = [];
        //this.listaBovinosVacunadosDisponibles = [];
        //this.listaBovinosAgregados = [];
        this.vaciarListasAnimales();
        //this.listaDestinatarios = [];
        //this.listaPropietarios = [];
      });
      console.log(respuesta);
    });
  }

  borraDatosUsuario(){
    this.listaAreasOrigen = [];
    this.formulario.controls.inputNombres.setValue("");
    this.formulario.controls.area_origen.setValue(null);
    this.formulario.controls.tipo_catastro.setValue(null);
    this.formulario.controls.categoriaD.setValue("-1");
    this.idUsuario = null;
    this.vaciarListasAnimales();
   }

   borraDatosUsuarioD(){
    this.listaAreasDestinos = [];
    this.formulario.controls.inputNombresD.setValue("");
    this.formulario.controls.area_destino.setValue(null);
    this.idUsuarioD = null;
   }

  /**
   * Busca los destinatarios
   */
 /* buscarDestinatario(ci: string){
    this.formulario.controls.destinatario.setValue(null);
    this.formulario.controls.area_destino.setValue(null);
    this.usuarioPropietarioNuevoSeleccionado = null;
    this.listaDestinatarios = [];
    this.listaAreasDestinos = [];
    if ( ci.length === 0) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    }).subscribe( (resp: any) => {
      this.listaDestinatarios = resp;
      Swal.close();
    });

  }

  /**
   * Cambio del destinatario
   */
  /*cambioDestinatario(){
    this.usuarioPropietarioNuevoSeleccionado = null;
    this.listaAreasDestinos = [];
    this.listaDestinatarios.forEach( (item: UsuarioExterno) => {
      if ( Number(this.formulario.value.destinatario) === Number(item.idUsuariosExternos) ) {
        this.usuarioPropietarioNuevoSeleccionado = item;
        this.obtenerAreasDestino({
          idUsuariosExternos: item.idUsuariosExternos
        });
      }
    });
  }*/

  /**
   * Obtiene las áreas del nuevo propietario
   */
  obtenerAreasDestino(parametros: any){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando predios destinos.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioArea.obtenerAreasPorFiltro(parametros)
    .subscribe( ( areas: Area[] ) => {
      this.listaAreasDestinos = areas;
      Swal.close();
      console.log('Destinos: ', areas);
    });
  }

  /**
   * Obtiene las áreas del propietario actual
   * @param parametros 
   */
  obtenerAreasOrigen(parametros: any){

    this.listaAreasOrigen = [];

    Swal.fire({
      title: 'Espere...',
      text: 'Consultando predios destinos.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioArea.obtenerAreasPorFiltro(parametros)
    .subscribe( ( areas: Area[] ) => {
      this.listaAreasOrigen = areas;
      Swal.close();
    });
  }

  /**
   * Agrega un bovino a la lista de transferencia
   */
  agregarBovino(id: number){

    if(this.formulario.value.tipo_catastro == "2"){
    const listaDisponibles = this.listaBovinosDisponibles.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino) ) {
        this.listaBovinosAgregados.push(item);
      } else {
        return item;
      }
    });
    this.listaBovinosDisponibles = listaDisponibles;
    }

    if(this.formulario.value.tipo_catastro == "1"){
      
      const listaDisponibles = this.listaBovinosVacunadosDisponibles.filter( (item: BovinoCertificadoVacunacion) => {
        if ( Number(id) === Number(item.idBovino) ) {
          this.listaBovinosVacunadosAgregados.push((item));
        } else {
          return item;
        }
      });
      this.listaBovinosVacunadosDisponibles = listaDisponibles;
    }
  }

  /**
   * Quita un bovino de la lista de transferencia
   * @param id 
   */
  quitarBovino(id: number){

    if(this.formulario.value.tipo_catastro == "2"){
    const listaAgregados = this.listaBovinosAgregados.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino) ) {
        this.listaBovinosDisponibles.push(item);
      } else {
        return item;
      }
    });
    this.listaBovinosAgregados = listaAgregados;
    }

    if(this.formulario.value.tipo_catastro == "1"){
      const listaVacunadosAgregados = this.listaBovinosVacunadosAgregados.filter( (item: BovinoCertificadoVacunacion) => {
        if ( Number(id) === Number(item.idBovino) ) {
          this.listaBovinosVacunadosDisponibles.push(item);
        } else {
          return item;
        }
      });
      this.listaBovinosVacunadosAgregados = listaVacunadosAgregados;
    }
  }

  /**
   * Quita un bovino de la lista de transferencia
   * @param id 
   */
  /* quitarBovinoVacunado(id: number){
    const listaVacunadosAgregados = this.listaBovinosVacunadosAgregados.filter( (item: BovinoCertificadoVacunacion) => {
      if ( Number(id) === Number(item.idBovino) ) {
        this.listaBovinosVacunadosDisponibles.push(item);
      } else {
        return item;
      }
    });
    this.listaBovinosVacunadosAgregados = listaVacunadosAgregados;
  }*/

  /**
   * Cuando se cambia de propietario
   */
  /*cambioPropietario(){
    this.usuarioPropietarioActualSeleccionado = null;
    this.formulario.controls.area_origen.setValue(null);
    this.listaPropietarios.forEach( (item: UsuarioExterno) => {
      if ( Number(this.formulario.value.propietario) === Number(item.idUsuariosExternos) ) {
        this.usuarioPropietarioActualSeleccionado = item;
        this.obtenerAreasOrigen({
          idUsuariosExternos: item.idUsuariosExternos
        });
      }
    });
  }*/
/**
   * Vacias listas
*/
  vaciarListasAnimales()
  {
    this.listaBovinosDisponibles = [];
    this.listaBovinosVacunadosDisponibles = [];
    this.listaBovinosAgregados = [];
    this.listaBovinosVacunadosAgregados = [];
  }

  /**
   * Buscar usuario externo origen
*/

buscarUsuario(ci: string)
{
  this.listaAreasOrigen = [];
  this.vaciarListasAnimales();
  this.formulario.controls.area_origen.setValue(null);
  let formularioInvalido = false;
  let mensaje = "Por favor, ingrese # de identificación<ul>";

if(this.formulario.value.inputIdUsuario == null || this.formulario.value.inputIdUsuario == ""){
  formularioInvalido = true;
}

if (formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('¡Advertencia!', mensaje, 'warning');
  return;
}

let identificacionUsuario = ci;

this.servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, null, null)
  .subscribe( (resp: any) => {
    if (resp.estado === 'OK') {
      if(resp.resultado.length == 1)
      {
        //Cargar resumen
        this.usuario = new Usuario();
        this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
        this.usuario.nombres = resp.resultado[0].nombres;
        //Cargar los datos del usuario en el formulario y variables
        this.idUsuario = this.usuario.idUsuario;
        this.formulario.controls.inputNombres.setValue(this.usuario.nombres);

        this.obtenerAreasOrigen({
          idUsuariosExternos: this.idUsuario
        });

      }
      else
      {
        Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
      } 
    }
    else 
    {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  });
}

  /**
   * Buscar usuario externo destino
*/

buscarUsuarioD(ci: string)
{
  this.listaAreasDestinos = [];
  this.formulario.controls.area_destino.setValue(null);
  let formularioInvalido = false;
  let mensaje = "Por favor, ingrese # de identificación<ul>";

if(this.formulario.value.inputIdUsuarioD == null || this.formulario.value.inputIdUsuarioD == ""){
  formularioInvalido = true;
}

if (formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('¡Advertencia!', mensaje, 'warning');
  return;
}

let identificacionUsuario = ci;

this.servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, null, null)
  .subscribe( (resp: any) => {
    if (resp.estado === 'OK') {
      if(resp.resultado.length == 1)
      {
        //Cargar resumen
        this.usuario = new Usuario();
        this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
        this.usuario.nombres = resp.resultado[0].nombres;
        //Cargar los datos del usuario en el formulario y variables
        this.idUsuarioD = this.usuario.idUsuario;
        this.formulario.controls.inputNombresD.setValue(this.usuario.nombres);

        this.obtenerAreasDestino({
          idUsuariosExternos: this.idUsuarioD
        });

      }
      else
      {
        Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
      } 
    }
    else 
    {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  });
}

  /**
   * Busca a los propietarios
   * @param ci 
   * @returns 
   */
 /* buscarPropietario(ci: string){
    this.formulario.controls.propietario.setValue(null);
    this.formulario.controls.area_origen.setValue(null);
    this.usuarioPropietarioActualSeleccionado = null;
    this.listaPropietarios = [];
    this.listaBovinosAgregados = [];
    if ( ci.length === 0) {
      Swal.fire('Error', 'Ingrese un número de cédula', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información del propietario.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioUsuario.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    }).subscribe( (resp: any) => {
      this.listaPropietarios = resp;
      Swal.close();
    });

  }*/

  /**
   * Carga los bovinos del predio origen si se ha seleccionado un propietario
   */
  BuscarBovinosOrigen(){

    this.formulario.markAllAsTouched();
    console.log(this.formulario);
    
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formulario.value.inputNombres == null || this.formulario.value.inputNombres == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese propietario del sitio de origen</li>";
    }

    if(this.formulario.value.area_origen == null || this.formulario.value.area_origen == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione sitio de origen</li>";
    }

    if(this.formulario.value.tipo_catastro == null || this.formulario.value.tipo_catastro == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione tipo de catastro</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      this.formulario.controls.categoria.setValue(null);
      return;
    }

    this.inicio = 0;
    this.fin = this.rango;
    this.listaBovinosDisponibles = [];
    this.listaBovinosVacunadosDisponibles = [];

    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.idUsuario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.codigoTipoRegistro = 'n-general';
      parametros.idAreaActual = this.formulario.value.area_origen;
      
      if(this.formulario.value.categoria !="-1")
      {
        parametros.idCategoria = this.formulario.value.categoria;
      }

      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;

      if ( this.formulario.value.tipo_catastro == '1' )
      {
        parametros.codigoTipoRegistro = 'n-general';
        parametros.estado = 1;
        this.obtenerBovinosDisponiblesVacunados(parametros);
      }else
      {
        parametros.codigoTipoRegistro = 'n-descarte';
        this.obtenerBovinosDisponibles(parametros);
      }
    }
  }

  /**
   * Consulta los bovinos disponibles del operador pecuario
   */
   obtenerBovinosDisponiblesVacunados(parametros: Bovino){
    
    this.listaBovinosVacunadosDisponibles = [];
    this.listaBovinosDisponibles = [];

    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });

    this.servicioBovinoVacunado.obtenerBovinosVacunadosWsDominio(parametros)
    .subscribe( (listaBovinosVacunados: BovinoCertificadoVacunacion[]) => {
      this.listaBovinosVacunadosDisponibles = listaBovinosVacunados;
      Swal.close();
      });
  }

  /**
   * Consulta los bovinos disponibles del operador pecuario
   */
   obtenerBovinosDisponibles(parametros: Bovino){
    
    this.listaBovinosVacunadosDisponibles = [];
    this.listaBovinosDisponibles = [];

    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });

    this.servicioBovino.filtrarBovinos(parametros)
    .subscribe( (bovinos: Bovino[]) => {
      this.listaBovinosDisponibles = bovinos;
      console.log(bovinos);
      Swal.close();
    });

  }

  /**
   * Obtenemos los terneros no vacunados para enviarlos al centro de faenamiento.
   */
   /*obtenerBovinosNacimientosDominio(){
    // this.listaTernerosDescarte = [];

    Swal.fire({
       title: 'Buscando nacimientos de bovinos y búfalos aprobados en este sitio...',
       confirmButtonText: '',
       allowOutsideClick: false,
       onBeforeOpen: () => {
         Swal.showLoading();
       }
     });


     this.servicioBovino.obtenerBovinosNacimientos({
       estadoUbicacion:'SIT',
       idAreaActual: this.formulario.value.area_origen
     })

     this.servicioBovino.obtenerBovinosNacimientos(parametros)
    .subscribe( (listaBovinosNacimientos: Bovino[]) => {
      this.listaBovinosDisponibles = listaBovinosNacimientos;
      
      });
      Swal.close();
 
   }*/

  /**
   * Carga los bovinos del predio origen si se ha seleccionado un propietario
   */
   cambioPredioOrigen(){
    this.vaciarListasAnimales();
    //this.formulario.value.categoria = null;
    this.formulario.controls.tipo_catastro.setValue(null);
    this.formulario.controls.categoria.setValue(null);
  }

  /**
   * Carga los bovinos del predio origen si se ha seleccionado un propietario
   */
   cambioTipoCatastro(){
    this.vaciarListasAnimales();
    this.formulario.controls.categoria.setValue(null);
  }

  /**
   * Obtenemos la página anterior
   */
  anterior() {
    /*this.inicio = this.inicio - this.rango;
    this.listaBovinosDisponibles = [];
    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.formulario.value.propietario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idAreaActual = this.formulario.value.area_origen;
      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;
      this.obtenerBovinosDisponibles(parametros);
    }*/

    this.inicio = this.inicio - this.rango;;
    //this.fin = this.rango;
    this.listaBovinosDisponibles = [];
    this.listaBovinosVacunadosDisponibles = [];

    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.idUsuario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.codigoTipoRegistro = 'n-general';
      parametros.idAreaActual = this.formulario.value.area_origen;

      if(this.formulario.value.categoria !="-1")
      {
        parametros.idCategoria = this.formulario.value.categoria;
      }

      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;

      if ( this.formulario.value.tipo_catastro == '1' )
      {
        parametros.codigoTipoRegistro = 'n-general';
        this.obtenerBovinosDisponiblesVacunados(parametros);
      }else
      {
        parametros.codigoTipoRegistro = 'n-descarte';
        this.obtenerBovinosDisponibles(parametros);
      }
    }

  }

  /**
   * Obtenemos la página siguiente
   */
  siguiente() {
   
   /* this.inicio = this.inicio + this.rango;
    this.listaBovinosDisponibles = [];
    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.formulario.value.propietario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idAreaActual = this.formulario.value.area_origen;
      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;
      this.obtenerBovinosDisponibles(parametros);
    }*/

    this.inicio = this.inicio + this.rango;
    //this.fin = this.rango;
    this.listaBovinosDisponibles = [];
    this.listaBovinosVacunadosDisponibles = [];

    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.idUsuario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.codigoTipoRegistro = 'n-general';
      parametros.idAreaActual = this.formulario.value.area_origen;

      if(this.formulario.value.categoria !="-1")
      {
        parametros.idCategoria = this.formulario.value.categoria;
      }

      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;

      if ( this.formulario.value.tipo_catastro == '1' )
      {
        parametros.codigoTipoRegistro = 'n-general';
        this.obtenerBovinosDisponiblesVacunados(parametros);
      }else
      {
        parametros.codigoTipoRegistro = 'n-descarte';
        this.obtenerBovinosDisponibles(parametros);
      }
    }

  }

}
