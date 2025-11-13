import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import Swal from 'sweetalert2';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { CantonService } from '../../servicios/canton/canton.service';
import { Canton } from '../../modelos/canton.modelo';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';
import { TipoOperadoraService } from '../../servicios/tipo-operadora/tipo-operadora.service';
import { TipoOperadora } from '../../modelos/tipo-operadora.modelo';
import { ActivatedRoute, Router } from '@angular/router';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OficinaService } from '../../servicios/oficina.service';
import { Oficina } from '../../modelos/oficina.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CrearUsuarioExternoService } from '../../usuarios-externos/crear-usuario-externo/servicios/crear-usuario-externo.service';


@Component({
  selector: 'app-operadora-vacunacion',
  templateUrl: './operadora-vacunacion.component.html',
  styles: []
})
export class OperadoraVacunacionComponent implements OnInit {

  modo?: string;
  formulario: FormGroup;
  listaFasesVacunaciones?: FaseVacunacion[];
  listaOficinas?: Oficina[];
  listaCantones?: Canton[];
  listaParroquias?: Parroquia[];
  listaTiposOperadoras?: TipoOperadora[];
  operadoraVacunacion?: OperadoraVacunacion;
  mostrarCorreo: boolean = false;
  usuario : Usuario = new Usuario();
  idUsuario : number;
  estadoUsuario: number;
  nombreFase: string;
  idTipoIden: number;

  constructor(
    private servicioScript: ScriptsService,
    private servicioDinardap: DinardapService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioCanton: CantonService,
    private servicioParroquia: ParroquiaService,
    private servicioTipoOperadora: TipoOperadoraService,
    private servicioRutaActiva: ActivatedRoute,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioEnrutador: Router,
    private servicioOficina: OficinaService,
    private servicioUsuario: UsuarioService,
    private servicioCrearUsuario: CrearUsuarioExternoService,
  ) { }

  ngOnInit(): void {
    this.servicioRutaActiva.params.subscribe( (parametros: any) => {
      if ( parametros?.id === 'nuevo') {
        this.modo = 'nuevo';
      } else {
        this.modo = 'consulta';
        this.obtenerOperadora(parametros?.id);
      }
    });
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerFasesVacunacionActivas();
    this.obtenerTiposOperadoras();
    //this.obtenerProvincias();
  }

  // Método que inicializa el formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      ruc: new FormControl(null, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
      razon_social: new FormControl(null, Validators.required),
      nombres_representante: new FormControl(null, Validators.required),
      //apellidos_representante: new FormControl(null, Validators.required),
      fase_vacunacion: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      canton: new FormControl(null, Validators.required),
      parroquia: new FormControl(null, Validators.required),
      calle_principal: new FormControl(null, Validators.required),
      //interseccion: new FormControl(null, Validators.required),
      //telefono: new FormControl(null, Validators.required),
      e_mail: new FormControl(null, [Validators.email]),
      tipo: new FormControl(null, Validators.required),
      latitud: new FormControl(null),
      longitud: new FormControl(null)
    });
  }

  /**
   * Buscar usuario externo
*/

buscarUsuario(ci: string)
{
  let formularioInvalido = false;
  let mensaje = "Por favor, ingrese # de identificación<ul>";

if(this.formulario.value.ruc == null || this.formulario.value.ruc == ""){
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

        this.usuario = new Usuario();
        this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
        this.usuario.razonSocial = resp.resultado[0].razon_social;
        this.usuario.nombresRepresentanteLegal = resp.resultado[0].nombres_representante_legal;
        //this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
        this.usuario.email = resp.resultado[0].email; 
        this.usuario.estado = resp.resultado[0].estado;
        this.usuario.tipoIdentificacion = resp.resultado[0].id_tipos_identificacion; 
        //this.usuario.estado = resp.resultado[0].estado;
        //Cargar los datos del usuario en el formulario y variables
        this.idUsuario = this.usuario.idUsuario;
        this.formulario.controls.razon_social.setValue(this.usuario.razonSocial);
        this.formulario.controls.nombres_representante.setValue(this.usuario.nombresRepresentanteLegal);
        this.formulario.controls.e_mail.setValue(this.usuario.email.toLowerCase().trim());
        this.estadoUsuario = this.usuario.estado;
        this.idTipoIden =  this.usuario.tipoIdentificacion;
        console.log('Tipo Iden: '+this.idTipoIden)
        if(this.idTipoIden == 4)
        {
          this.formulario.controls.tipo.setValue(1);
        }else
        {
          this.formulario.controls.tipo.setValue(2);
        }
      }
      else
      {
        Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
        this.borraDatosUsuario();
      } 
    }
    else 
    {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  });
}
 // Obtiene las fases de vacunaciones creadas
  obtenerFasesVacunacionActivas(){
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    }).subscribe( ( fasesVacunaciones: FaseVacunacion[]) => this.listaFasesVacunaciones = fasesVacunaciones );
  }

  borraDatosUsuario(){
    this.formulario.controls.razon_social.reset();
    this.formulario.controls.nombres_representante.reset();
    this.listaOficinas = [];
    this.listaCantones = [];
    this.listaParroquias = [];
    this.formulario.controls.tipo.setValue(null);
    this.formulario.controls.fase_vacunacion.setValue(null);
    this.formulario.controls.provincia.reset();
    this.formulario.controls.provincia.setValue(null);
    this.formulario.controls.canton.reset();
    this.formulario.controls.canton.setValue(null);
    this.formulario.controls.parroquia.reset();
    this.formulario.controls.parroquia.setValue(null);
    this.formulario.controls.calle_principal.setValue(null);
    this.formulario.controls.e_mail.setValue(null);
    this.formulario.controls.latitud.setValue(null);
    this.formulario.controls.longitud.setValue(null);
    this.idUsuario = null;
    this.estadoUsuario = null;
   }

   /**
 * Permite agregar un ciudadano si no se lo encuentra.
 */
agregarCiudadano(){
  this.mostrarCorreo = false;
  this.servicioCrearUsuario.abrir();
  }

  /**
   * Se carga las provincias disponibles
   */
  cambioFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado oficinas disponibles',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });

    this.listaOficinas = [];
    this.listaCantones = [];
    this.listaParroquias = [];

    this.formulario.controls.provincia.reset();
    this.formulario.controls.provincia.setValue(null);
    this.formulario.controls.canton.reset();
    this.formulario.controls.canton.setValue(null);
    this.formulario.controls.parroquia.reset();
    this.formulario.controls.parroquia.setValue(null);
    this.formulario.controls.calle_principal.setValue(null);

    this.servicioOficina.obtenerOficinas({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      grupoOficina: 'VAC',
      codigoOficina: 'O-PROV',
      grupoEstadoRegistro: 'OFC-VAC',
      codigoEstadoRegistro: 'HAB',
      idUsuariosInternos: this.servicioUsuario.usuarioInterno.idUsuario
    })
    .subscribe( (oficinas: Oficina[]) => {
      this.listaOficinas = oficinas;
      console.log('Oficinas: ', oficinas);
      Swal.close();
    });
  }

  /**
   * Método que se ejecuta cuando se cambia de provincia
   */
  cambioProvincia(){
    this.listaCantones = null;
    this.listaParroquias = null;
    this.formulario.controls.canton.setValue(null);
    this.formulario.controls.parroquia.setValue(null);
    if ( this.formulario.value.provincia ){
      this.obtenerCantonesPorProvincia(this.formulario.value.provincia);
    }
  }
  // Obtiene los cantones de una provincia
  obtenerCantonesPorProvincia(idProvincia: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCanton.getCantonesPorProvincia(idProvincia).
    subscribe( (cantones: Canton[]) => {
      this.listaCantones = cantones;
      Swal.close();
    } );
  }
  // Método que se ejecuta cuando se cambia de cantón
  cambioCanton(){
    this.listaParroquias = null;
    this.formulario.controls.parroquia.setValue(null);
    if(this.formulario.value.canton){
      this.obtenerParroquiasPorCanton(this.formulario.value.canton);
    }
  }
  // Obtiene las parroquias de un cantón
  obtenerParroquiasPorCanton(idCanton: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioParroquia.getParroquiasPorCanton(idCanton).
    subscribe( (parroquias: Parroquia[]) => {
      this.listaParroquias = parroquias;
      Swal.close();
    });
  }
  // Obtiene los tipos de operadoras
  obtenerTiposOperadoras(){
    this.servicioTipoOperadora.obtenerTiposOperadoras()
    .subscribe( (tiposOperadoras: TipoOperadora[]) => this.listaTiposOperadoras = tiposOperadoras);
  }

  // Permite consultar los datos del RUC
  validarRuc(ruc: string){
    if( ruc.length < 13){
      return;
    }
    this.formulario.controls.razon_social.setValue(null);
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioDinardap.obtenerUbicacionesSri(ruc).subscribe(
      ( respuesta: UbicacionSri[]) => {
        Swal.close();
        respuesta.forEach( (item: UbicacionSri) => {
          this.formulario.controls.razon_social.setValue(item.razonSocial);
        });
      }
    );
  }

  // Método que registrar una operadora de vacunación
  registrarOperadora(){

  let formularioInvalido = false;
  let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

  if(this.formulario.value.razon_social == null || this.formulario.value.razon_social == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese razón social</li>";
  }

  if(this.formulario.value.nombres_representante == null || this.formulario.value.nombres_representante == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese representante legal</li>";
  }

  if(this.formulario.value.tipo == null || this.formulario.value.tipo == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione tipo de operadora</li>";
  }

  if(this.formulario.value.fase_vacunacion == null || this.formulario.value.fase_vacunacion == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione fase de vacunación asociada</li>";
  }

  if(this.formulario.value.provincia == null || this.formulario.value.provincia == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione una provincia</li>";
  }

  if(this.formulario.value.canton == null || this.formulario.value.canton == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione un cantón</li>";
  }

  if(this.formulario.value.parroquia == null || this.formulario.value.parroquia == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione una parroquia</li>";
  }

  if(this.formulario.value.calle_principal == null || this.formulario.value.calle_principal == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese localidad/sitio/vía/Km</li>";
  }

  if(this.formulario.value.e_mail == null || this.formulario.value.e_mail == ""){
    formularioInvalido = true;
    mensaje += "<li>Ingrese correo electrónico</li>";
  }

  if (this.formulario.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('¡Advertencia!', mensaje, 'warning');
    return;
  }

    Swal.fire({
      title: 'Espere...',
      text: 'Registrando operadora de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    let operadoraRegistro: any = {};
    operadoraRegistro.idUsuariosExternos = this.idUsuario;
    operadoraRegistro.estadoUsuario = this.estadoUsuario;
    operadoraRegistro.idTipoIdentificacion = this.idTipoIden;
    operadoraRegistro.ruc = this.formulario.value.ruc;
    operadoraRegistro.nombreComercial=  this.formulario.value.razon_social.toUpperCase();
    operadoraRegistro.nombresRepresentanteLegal=  this.formulario.value.nombres_representante.toUpperCase();
    operadoraRegistro.apellidosRepresentanteLegal=  this.formulario.value.nombres_representante.toUpperCase();
    operadoraRegistro.idFaseVacunacion=  this.formulario.value.fase_vacunacion;
    operadoraRegistro.idTipoOperadora=  this.formulario.value.tipo;
    operadoraRegistro.idProvincia=  this.formulario.value.provincia;
    operadoraRegistro.idCanton=  this.formulario.value.canton;
    operadoraRegistro.idParroquia=  this.formulario.value.parroquia;
    operadoraRegistro.callePrincipal=  this.formulario.value.calle_principal.toUpperCase();
    operadoraRegistro.interseccion=  'ND';
    operadoraRegistro.referencia=  '';
    operadoraRegistro.telefono=  '0000000000';
    operadoraRegistro.email=  this.formulario.value.e_mail.toLowerCase();
    operadoraRegistro.latitud=  this.formulario.value.latitud;
    operadoraRegistro.longitud=  this.formulario.value.longitud;
    this.servicioOperadoraVacunacion.crearOperadoraVacunacion(operadoraRegistro)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se creó correctamente la operadora de vacunación.',
        'success'
      ).then(() => {
        this.servicioEnrutador.navigate(['lista-operadoras-vacunacion']);
      });
    }
    );
  }

  obtenerOperadora(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion({
      idOperadora: id
    }).subscribe( (operadoras: OperadoraVacunacion[])=> {
      if( operadoras.length > 0 ){
        this.operadoraVacunacion = operadoras[0];
      }
      Swal.close();
    });
  }
  // Habilita una operadora de vacunación
  habilitarOperadoraVacunacion(){
    if(this.operadoraVacunacion){
      console.log(this.operadoraVacunacion);
      Swal.fire({
        title: 'Espere...',
        text: 'Habilitando a la Operadora de Vacunación.',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });
      this.servicioOperadoraVacunacion.habilitarOperadoraVacunacion(this.operadoraVacunacion?.idOperadora)
      .subscribe( (respueta: any) => {
        Swal.fire(
          'Éxito',
          'La Operadora de Vacunación fue habilitada correctamente.',
          'success'
        ).then(() => {
          this.servicioEnrutador.navigate(['lista-operadoras-vacunacion']);
        });
      });
    }
  }

}
