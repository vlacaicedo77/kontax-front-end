import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
import { DatoDemografico } from '../../modelos/dato-demografico.modelo';
import { JSEncrypt } from 'jsencrypt';
import { clavePublica } from '../../config/config';
import { Usuario } from '../../modelos/usuario.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CrearUsuarioExternoService } from './servicios/crear-usuario-externo.service';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';

@Component({
  selector: 'app-crear-usuario-externo',
  templateUrl: './crear-usuario-externo.component.html',
  styleUrls: ['./crear-usuario-externo.component.css']
})
export class CrearUsuarioExternoComponent implements OnInit {

  @Input() correo: boolean;

  encriptar: any;
  formularioUsuario: FormGroup;

  constructor(
    private servicioDinardap: DinardapService,
    private servicioUsuario: UsuarioService,
    public servicioCrearUsuario: CrearUsuarioExternoService
  ) {
    this.correo = true;
   }

  ngOnInit(): void {
    this.inicializarFormularioUsuario();
    this.encriptar = new JSEncrypt();
  }
  /**
   * Inicializa el formulario para usuario
   */
  inicializarFormularioUsuario(){
    this.formularioUsuario = new FormGroup({
      ci: new FormControl('', Validators.required),
      nombres: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      email: new FormControl(''),
      nombre_comercial: new FormControl(''),
      identificacion_representante: new FormControl(''),
      nombre_representante_legal: new FormControl(''),
      apellido_representante_legal: new FormControl(''),
      razon_social: new FormControl(''),
      password: new FormControl(''),
      confirmar_password: new FormControl('')
    }, {
      validators: this.passwordIguales('password', 'confirmar_password')
    });
  }
  /**
   * Compara si las passwords son iguales
   * @param password1 
   * @param password2 
   */
  passwordIguales( password1: string, password2: string) {
    return ( formularioGrupo: FormGroup) => {
      let pass1 = formularioGrupo.controls[password1].value;
      let pass2 = formularioGrupo.controls[password2].value;
      if ( pass1 === pass2 ) {
        return null;
      }
      return {
          passwordIguales: true
      };
    }
  }

  /**
   * Registra un nuevo usuario
   */
  registrarUsuario(){
    console.log(this.formularioUsuario);
    this.formularioUsuario.markAllAsTouched();
    if ( this.formularioUsuario.invalid ) {
      Swal.fire('Error', 'El formulario contiene errores.', 'error');
      return;
    }
    this.encriptar.setPublicKey(clavePublica);
    const claveEncriptada = this.encriptar.encrypt('12345678Agro');
    const usuario = new Usuario();
    if ( this.formularioUsuario.value.ci.length <= 10 ) {
      usuario.tipoIdentificacion = 1;
    } else {
      usuario.tipoIdentificacion = 2;
    }
    usuario.numeroIdentificacion = this.formularioUsuario.value.ci;
    usuario.nombres = this.formularioUsuario.value.nombres;
    usuario.apellidos = this.formularioUsuario.value.apellidos;
    usuario.nombreComercial = this.formularioUsuario.value.nombre_comercial;
    usuario.identificacionRepresentanteLegal = this.formularioUsuario.value.identificacion_representante;
    usuario.nombresRepresentanteLegal = this.formularioUsuario.value.nombre_representante_legal;
    usuario.apellidosRepresentanteLegal = this.formularioUsuario.value.apellido_representante_legal;
    usuario.razonSocial = this.formularioUsuario.value.razon_social;
    if (this.correo ) {
      usuario.email = this.formularioUsuario.value.email;
    } else {
      usuario.email = 'info@noset.com';
    }
    usuario.contraseña = claveEncriptada;
    console.log(usuario);
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando datos',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    this.servicioUsuario.registrarUsuarioExternoVacunacion(usuario)
    .subscribe( (respuesta: any) => {
      if ( respuesta.estado === 'ERR' ){
        Swal.fire('Error', respuesta.mensaje , 'error');
        return;
      }
      console.log(respuesta);
      this.servicioCrearUsuario.notificacion.emit(respuesta);
      this.formularioUsuario.reset();
      Swal.fire('Éxito', 'El usuario fue registrado correctamente', 'success');
    });
  }

  /**
   * Permite consulta la información en la Dinardap
   */
  buscar(){
    if ( this.formularioUsuario.value.ci === null || this.formularioUsuario.value.ci.length === 0 ) {
      Swal.fire('Error', 'Ingrese el número de cédula', 'error');
      return;
    }
    this.formularioUsuario.controls.nombres.setValue(null);
    this.formularioUsuario.controls.apellidos.setValue(null);
    this.formularioUsuario.controls.email.setValue('');
    this.formularioUsuario.controls.nombre_comercial.setValue('');
    this.formularioUsuario.controls.identificacion_representante.setValue('');
    this.formularioUsuario.controls.nombre_representante_legal.setValue('');
    this.formularioUsuario.controls.apellido_representante_legal.setValue('');
    this.formularioUsuario.controls.razon_social.setValue('');
    this.formularioUsuario.controls.password.setValue(null);
    this.formularioUsuario.controls.confirmar_password.setValue(null);
    Swal.fire({
      title: 'Espere...',
      text: 'Consultado información',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    // Cuando es CI
    if (this.formularioUsuario.value.ci.length <= 10){
      this.servicioDinardap.obtenerDatosDemograficos(this.formularioUsuario.value.ci)
      .subscribe( (respuesta: DatoDemografico[]) => {
        console.log('Datos', respuesta);
        if ( respuesta.length > 0) {
          const datoDemografico: DatoDemografico = respuesta[0];
          this.formularioUsuario.controls.nombres.setValue(datoDemografico.nombre);
          this.formularioUsuario.controls.apellidos.setValue(datoDemografico.apellido);
          Swal.close();
        }
      });
    } else {
      // Correo y nombre comercial
      this.obtenerCorreoElectronicoContribuyente();
    }
  }

  /**
   * Obtener correo eletrónico y nombre comercial
   */
  obtenerCorreoElectronicoContribuyente(){
    this.servicioDinardap.obtenerCorreoElectronicoContribuyente(this.formularioUsuario.value.ci)
      .subscribe( (correos: EmailContribuyente[]) => {
        if ( correos.length > 0 ) {
          const itemCorreo: EmailContribuyente = correos[0];
          this.formularioUsuario.controls.email.setValue(itemCorreo.email);
          this.formularioUsuario.controls.nombre_comercial.setValue(itemCorreo.nombreComercial);
        }
        this.obtenerDatosRepresentanteLegal();
      });
  }

  /**
   * Obtiene los datos del representante
   */
  obtenerDatosRepresentanteLegal(){
    this.servicioDinardap.obtenerRepresentanteLegal(this.formularioUsuario.value.ci)
    .subscribe( (representante: RucRepresentanteLegal[]) => {
      if ( representante.length > 0 ) {
        const itemRepresentante: RucRepresentanteLegal = representante[0];
        this.formularioUsuario.controls.nombre_representante_legal.setValue(itemRepresentante.nombreRepreLegal);
        this.formularioUsuario.controls.apellido_representante_legal.setValue(itemRepresentante.apellidoRepreLegal);
        this.formularioUsuario.controls.identificacion_representante.setValue(itemRepresentante.idRepreLegal);
        this.formularioUsuario.controls.nombres.setValue(itemRepresentante.nombreRepreLegal);
        this.formularioUsuario.controls.apellidos.setValue(itemRepresentante.nombreRepreLegal);
      } else {
        this.formularioUsuario.controls.nombres.setValue('');
        this.formularioUsuario.controls.apellidos.setValue('');
      }
      this.obtenerRazonSocial();
    });
  }

  /**
   * Obtiene la razón social
   */
  obtenerRazonSocial(){
    this.servicioDinardap.obtenerUbicacionesSri(this.formularioUsuario.value.ci)
    .subscribe( ( ubicaciones: UbicacionSri[] ) => {
      if ( ubicaciones.length > 0 ){
        const ubicacion: UbicacionSri = ubicaciones[0];
        this.formularioUsuario.controls.razon_social.setValue(ubicacion.razonSocial);
        this.formularioUsuario.controls.nombres.setValue(ubicacion.razonSocial);
        this.formularioUsuario.controls.apellidos.setValue(ubicacion.razonSocial);
      } else {
        this.formularioUsuario.controls.nombres.setValue('');
        this.formularioUsuario.controls.apellidos.setValue('');
      }
      Swal.close();
    });
  }

  /**
   * Cierra el panel para crear usuarios
   */
   cerrarPanel(){
    this.borrar();
    this.formularioUsuario.reset();
    this.servicioCrearUsuario.cerrar();
  }
  /**
   * Se ejecuta cuando se borra 
   */
  borrar(){
    this.formularioUsuario.controls.nombres.setValue('');
    this.formularioUsuario.controls.apellidos.setValue('');
    this.formularioUsuario.controls.email.setValue('');
    this.formularioUsuario.controls.nombre_comercial.setValue('');
    this.formularioUsuario.controls.identificacion_representante.setValue('');
    this.formularioUsuario.controls.nombre_representante_legal.setValue('');
    this.formularioUsuario.controls.apellido_representante_legal.setValue('');
    this.formularioUsuario.controls.razon_social.setValue('');
    
  }

}
