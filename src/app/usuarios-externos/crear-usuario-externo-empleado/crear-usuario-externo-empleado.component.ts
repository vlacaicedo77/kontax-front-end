import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Area } from '../../modelos/area.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
// Importación de servicios.
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CrearUsuarioExternoService } from '../crear-usuario-externo/servicios/crear-usuario-externo.service';
import { AreaService } from '../../servicios/area/area.service';

// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
import { JSEncrypt } from 'jsencrypt';

// Importamos las máscaras de validacion
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({

  selector: 'app-crear-usuario-externo-empleado',
  templateUrl: './crear-usuario-externo-empleado.component.html',
  styleUrls: ['./crear-usuario-externo-empleado.component.css']
})
export class CrearUsuarioExternoEmpleadoComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaProvincias = [];
  //listaCentros: Area[] = [];
  listaAreas: Area[] = [];
  areaSeleccionada?: Area = null;
  listaUsuariosCca: UsuarioExterno[] = [];
  listaUsuariosCcaBg: UsuarioExterno[] = [];
  usuario : Usuario = new Usuario();
  usuarioExterno: Usuario;
  
  // Formularios
  formulario: FormGroup;
  formularioBusquedaExterno: FormGroup;

  // Variables auxiliares
  destino: string;
  idUsuario : number;
  estadoUsuario : number;
  nombreCca : string = '';
  tipoArea : string = '';
  numeroIdentificacion : string = '';
  tablaVisible : boolean = false;
  mostrarCorreo: boolean = false;
  contrasenaTemporal: string = '';
  tipoIdentificacion: number;
  encriptar: any;

  constructor(
    public scriptServicio: ScriptsService,
    private servicioUsuario: UsuarioService,
    private _provinciaService: ProvinciaService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
    private servicioArea: AreaService,
    private router: Router
    ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    //this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.inicializarFormulario();
    this.destino = '';
    this.encriptar = new JSEncrypt();

    this.usuarioExterno = this.servicioUsuario.usuarioExterno;
    this.obtenerSitiosProductor({
        idUsuariosExternos: this.usuarioExterno.idUsuario,
        codigoEstadoSitio: "AC",
        estado: "1"
      });
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      //tipo_area: new FormControl(null, Validators.required),
      //provincia: new FormControl(null),
      id_area: new FormControl(null, Validators.required),
      inputNombres: new FormControl(null, [Validators.required]),
      inputEmail: new FormControl(null,[Validators.email]),
      inputEmailRead: new FormControl(null,[Validators.email]),
      inputIdUsuario: new FormControl(null)
    });

    this.formularioBusquedaExterno = new FormGroup({
      inputIdentificacion: new FormControl(null, Validators.required)
    });
  }

  //Funcion para generar la clave aleatoria del usuario
generarClaveAleatoria() {
  let text = "";
  let possible = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890";

  for (let i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
    return text;
}

  // Método que obtiene los datos de provincias.
cargarProvinciasPorPais(idPais: number) {
  this._provinciaService.getProvinciasPorPais(idPais)
  .subscribe( respuesta => this.listaProvincias = respuesta );
}

/**
   * Buscar usuario externo
*/

buscarUsuario(ci: string)
  {
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
          Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');

          //Generar la contraseña aleatoria temporal
          this.contrasenaTemporal = this.generarClaveAleatoria();
          //Cargar resumen
          this.usuario = new Usuario();
          this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
          this.usuario.nombres = resp.resultado[0].nombres;
          this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
          this.usuario.email = resp.resultado[0].email; 
          this.usuario.estado = resp.resultado[0].estado;
          this.usuario.tipoIdentificacion = resp.resultado[0].id_tipos_identificacion;
          //Cargar los datos del usuario en el formulario y variables
          this.idUsuario = this.usuario.idUsuario;
          this.formulario.controls.inputNombres.setValue(this.usuario.nombres);
          this.formulario.controls.inputEmail.setValue(this.usuario.email);
          this.formulario.controls.inputEmailRead.setValue(this.usuario.email);
          this.estadoUsuario = this.usuario.estado;
          this.numeroIdentificacion = this.usuario.numeroIdentificacion;
          this.tipoIdentificacion = this.usuario.tipoIdentificacion;

          //console.log('tipo id: '+this.tipoIdentificacion);
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
 * Permite agregar un ciudadano si no se lo encuentra.
 */
agregarCiudadano(){
  this.mostrarCorreo = false;
  this.servicioCrearUsuario.abrir();
  }

  /**
   * Obtiene los sitios del productor
   */
   obtenerSitiosProductor(parametros: any){
    this.listaAreas = [];
    Swal.fire({
      title: 'Buscando sitios...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    // parametros.estado = 1;
    this.servicioArea.obtenerAreasPorFiltro(parametros)
    .subscribe( (areas: Area[]) => {
      this.listaAreas = areas;

      this.listaAreas = areas.filter( ( item: any ) => {
        return item.codigoTipoArea !== 'ex_pec_bov';
      });
      Swal.close();
    });
  }
 

/**
   * Método que permite limpiar combos de provincia y destino.
   */
   
 

borraDatosUsuario(){
  this.formulario.controls.inputEmail.reset();
  this.formulario.controls.inputNombres.reset();
  this.idUsuario = null;
  this.estadoUsuario = 0;
 }

/**
   * Se ejecuta cuando se cambia de destino
   */
 cambioDestino(){
  this.listaAreas.forEach( (itemArea: Area) => {
    if ( Number(itemArea.idArea) === Number(this.formulario.value.id_area) ) {
      this.areaSeleccionada = itemArea;
    }
  });
}

/**
   * Permite registrar un personal a la operadora.
   */
 registrarPersonal(){
  //console.log('Formulario: ', this.formulario);

  let formularioInvalido = false;
  let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

  if(this.formulario.value.id_area == null || this.formulario.value.id_area == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione un sitio</li>";
  }

  if(this.formulario.value.inputNombres == null || this.formulario.value.inputNombres == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese Apellidos y Nombres</li>";
  }

  if(this.estadoUsuario == 1){
    if(this.formulario.value.inputEmail.toLowerCase().indexOf('@agrocalidad.gob.ec') !== -1){
      formularioInvalido = true;
      mensaje += "<li>El correo electrónico no debe pertenecer al dominio @agrocalidad.gob.ec</li>";
    }

    if(this.formulario.value.inputEmail == '' || this.formulario.value.inputEmail == ''){
      formularioInvalido = true;
      mensaje += "<li>Ingrese un correo electrónico válido</li>";
    }
  }

  if (this.formulario.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('¡Advertencia!', mensaje, 'warning');
    return;
  }

  //console.log('tipo Id: '+this.tipoIdentificacion)

  if(this.tipoIdentificacion == 1 || this.tipoIdentificacion == 2 || this.tipoIdentificacion == 5)
  {
  Swal.fire({
    title: 'Espere...',
    text: 'Registrando usuario digitador / fiscalizador',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
      Swal.showLoading();
    },
  });

  this.encriptar.setPublicKey(clavePublica);
  let claveEncriptada = this.encriptar.encrypt(this.contrasenaTemporal);

  const personal = new UsuarioExterno();
  personal.idUsuariosExternos = this.idUsuario;//this.formulario.value.id_usuario;
  personal.idUsuariosExternosCca = this.usuarioExterno.idUsuario;
  personal.estado = this.estadoUsuario.toLocaleString();

  if(this.estadoUsuario == 1)
  {
    personal.email = this.formulario.value.inputEmail;
  }else
  {
    personal.email = this.formulario.value.inputEmailRead;
  }
  
  personal.contraseña = claveEncriptada;
  personal.nombres = this.formulario.value.inputNombres;
  personal.nombreCentro = this.nombreCca.toLocaleLowerCase();
  personal.tipoArea = this.tipoArea.toUpperCase();
  personal.numeroIdentificacion = this.numeroIdentificacion;
  this.servicioUsuario.registrarUsuarioCca(personal)
  .subscribe( (respuesta: any) => {

    Swal.fire(
      'Éxito',
      'Usuario digitador / fiscalizador registrado',
      'success'
    ).then(() => {
      this.listaUsuariosCca = [];
      this.cargarPersonalCca();
      this.borraDatosUsuario();
      this.formulario.controls.inputIdUsuario.reset();
    });
  });

  }else
  {
    this.formulario.reset();
    Swal.fire('¡Advertencia!', 'No es posible registrar este usuario debido a que no pertenece a una persona natural.', 'warning');
  }
}

/**
   * Obtiene los usuarios pertenecientes a un centro de concentración de animales en general
   * @param parametros 
   */

 obtenerPersonalCca(parametros: any){
  
  if(parametros['bandera'] == "busqueda")
  {
    this.listaUsuariosCcaBg = [];
  }

  if(parametros['bandera'] == "area")
  {
    this.listaUsuariosCca = [];
  }

  Swal.fire({
    title: 'Espere...',
    text: 'Buscando registros...',
    confirmButtonText: '',
    allowOutsideClick: false,
    onBeforeOpen: () => {
      Swal.showLoading();
    },
  });
  this.servicioUsuario.consultarPersonalCca(parametros)
  .subscribe( (personal: UsuarioExterno[]) => {
    
  if(parametros['bandera'] == "busqueda")
  {
    this.listaUsuariosCcaBg = personal;

    if(personal.length < 1)
    {
      Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
      this.tablaVisible = false;
    }
    else
    {
      //Swal.fire('¡Atención!', 'No se encontraron registros' , 'info');
      this.tablaVisible = true;
      Swal.close();
    }
  }

  if(parametros['bandera'] == "area")
  {
    this.listaUsuariosCca = personal;
    Swal.close();
  }

  });
}

cargarPersonalCca(){

  //this.formulario.controls.inputIdUsuario.reset();
  //this.borraDatosUsuario();

  if(this.listaAreas.length > 0)
    {
      this.listaAreas.filter( (item: Area) => {
        if ( Number(this.formulario.value.id_area) === Number(item.idArea) ) {
          this.nombreCca = item.nombre;
          this.tipoArea = item.nombreTipoArea;
        } 
      });

      console.log(this.nombreCca);
      console.log(this.tipoArea);
    }

  this.obtenerPersonalCca({
  idUsuariosExternosCca: this.usuarioExterno.idUsuario, bandera: String('area')
});
}

cargarPersonalCcaBg(){
  
this.listaUsuariosCcaBg = [];
this.tablaVisible = false;

let formularioInvalido = false;
let mensaje = "Por favor, ingrese # de identificación<ul>";

if(this.formularioBusquedaExterno.value.inputIdentificacion == null || this.formularioBusquedaExterno.value.inputIdentificacion == ""){
  formularioInvalido = true;
}

if (formularioInvalido) {
  mensaje += "</ul>"
  Swal.fire('¡Advertencia!', mensaje, 'warning');
  return;
}

this.obtenerPersonalCca({
  numeroIdentificacion: String(this.formularioBusquedaExterno.value.inputIdentificacion), 
  idUsuariosExternosCca: this.usuarioExterno.idUsuario,
  bandera: String('busqueda')
});

}

/**
   * Eliminar usuarios de centros de concentración de animales
   * @param id 
   */
 eliminarUsuario(id: number, bandera: string){
  Swal.fire({
    title: '¿Está seguro de eliminar este digitador / fiscalizador?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Espere...',
        text: 'Eliminando registro.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });
      this.servicioUsuario.eliminarUsuarioCca(id)
      .subscribe( (respuesta: any) => {
        //console.log(respuesta);
        Swal.fire(
          'Éxito',
          'Usuario digitador / fiscalizador eliminado',
          'success'
        ).then(() => {
          if(bandera='area'){
            this.cargarPersonalCca();
          }
          if(bandera='busqueda'){
            this.formularioBusquedaExterno.controls.inputIdentificacion.reset();
            this.cargarPersonalCcaBg();
          }
        });
      });
    }
  });
}

}