import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import Swal from 'sweetalert2';
import { Bovino } from '../../modelos/bovino.modelo';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { Area } from 'src/app/modelos/area.modelo';
import { AreaService } from '../../servicios/area/area.service';
import { param } from 'jquery';
import { Categoria } from '../../modelos/categoria.modelo';
import { CategoriaService } from '../../servicios/categoria/categoria.service';

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
  listaAreasDestinos: Area[] = [];

  // Propiedades para paginación
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private servicioScript: ScriptsService,
    public servicioUsuario: UsuarioService,
    private servicioBovino: BovinoService,
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
      propietario: new FormControl(null, Validators.required),
      destinatario: new FormControl(null, Validators.required),
      area_origen: new FormControl(null, Validators.required),
      categoria: new FormControl(null),
      categoriaD: new FormControl("-1"),
      area_destino: new FormControl(null)
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
    if ( this.formulario.invalid ) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    if ( this.listaBovinosAgregados.length === 0 ) {
      Swal.fire('Error', 'Debe agregar bovinos para transferirlos', 'error');
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
    solicitud.idUsuarioOrigen = this.formulario.value.propietario;
    solicitud.idUsuarioDestino = this.formulario.value.destinatario;
    if ( this.formulario.value.area_destino ) {
      solicitud.idAreaDestino = this.formulario.value.area_destino;
    }
    const bovinosTransferir: any[] = [];
    this.listaBovinosAgregados.forEach( (item: Bovino) => {
      bovinosTransferir.push({idBovino: item.idBovino});
    });
    solicitud.bovinos = bovinosTransferir;
    this.servicioBovino.transferirDominio(solicitud)
    .subscribe( (respuesta: any) => {
      Swal.fire('Éxito', 'Se transfirió correctamente los bovinos', 'success').then( () => {
        //this.obtenerBovinosDisponibles();
        this.formulario.reset();
        this.formulario.controls.categoriaD.setValue("-1");
        this.usuarioPropietarioNuevoSeleccionado = null;
        this.usuarioPropietarioActualSeleccionado = null;
        this.listaBovinosDisponibles = [];
        this.listaBovinosAgregados = [];
        this.listaDestinatarios = [];
        this.listaPropietarios = [];
      });
      console.log(respuesta);
    });
  }

  /**
   * Busca los destinatarios
   */
  buscarDestinatario(ci: string){
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
  cambioDestinatario(){
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
  }

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
   * Consulta los bovinos disponibles del operador pecuario
   */
  obtenerBovinosDisponibles(parametros: Bovino){
    
    //this.listaBovinosDisponibles = [];
    //this.listaBovinosAgregados = [];
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
   * Agrega un bovino a la lista de transferencia
   */
  agregarBovino(id: number){
    const listaDisponibles = this.listaBovinosDisponibles.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino) ) {
        this.listaBovinosAgregados.push(item);
      } else {
        return item;
      }
    });
    this.listaBovinosDisponibles = listaDisponibles;
  }

  /**
   * Quita un bovino de la lista de transferencia
   * @param id 
   */
  quitarBovino(id: number){
    const listaAgregados = this.listaBovinosAgregados.filter( (item: Bovino) => {
      if ( Number(id) === Number(item.idBovino) ) {
        this.listaBovinosDisponibles.push(item);
      } else {
        return item;
      }
    });
    this.listaBovinosAgregados = listaAgregados;
  }

  /**
   * Cuando se cambia de propietario
   */
  cambioPropietario(){
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
  }

  /**
   * Busca a los propietarios
   * @param ci 
   * @returns 
   */
  buscarPropietario(ci: string){
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

  }

  /**
   * Carga los bovinos del predio origen si se ha seleccionado un propietario
   */
  BuscarBovinosOrigen(){
    this.inicio = 0;
    this.fin = this.rango;
    this.listaBovinosDisponibles = [];
    if ( this.formulario.value.area_origen ) {
      const parametros = new Bovino();
      parametros.idUsuarioActual = this.formulario.value.propietario;
      parametros.codigoEstadoUbicacion = 'SIT';
      parametros.codigoEstadoRegistro = 'DISP';
      parametros.codigoEstadoAnimal = 'vivo';
      parametros.idAreaActual = this.formulario.value.area_origen;
      if(this.formulario.value.categoria !="-1")
      {
        parametros.idCategoria = this.formulario.value.categoria;
      }
      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;
      this.obtenerBovinosDisponibles(parametros);
    }
  }

  /**
   * Carga los bovinos del predio origen si se ha seleccionado un propietario
   */
   cambioPredioOrigen(){
    this.listaBovinosDisponibles = [];
    this.listaBovinosAgregados = [];
    //this.formulario.value.categoria = null;
    this.formulario.controls.categoria.setValue(null);
  }

  /**
   * Obtenemos la página anterior
   */
  anterior() {
    this.inicio = this.inicio - this.rango;
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
    }
  }

  /**
   * Obtenemos la página siguiente
   */
  siguiente() {
    this.inicio = this.inicio + this.rango;
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
    }
  }

}
