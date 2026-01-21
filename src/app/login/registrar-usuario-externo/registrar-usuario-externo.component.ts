import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Encriptar la contraseña.
import { JSEncrypt } from 'jsencrypt';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
import { DatoDemografico } from '../../modelos/dato-demografico.modelo';
// Importación de clave pública para encriptar la contraseña.
import { clavePublica } from 'src/app/config/config';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

// Importamos la función de fondos aleatorios
import  * as fondos from 'src/app/config/random-background';

import { environment } from 'src/environments/environment';

declare function funcion_js_custom();
declare function funciones_index();

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar-usuario-externo.component.html',
  styles: []
})


export class RegistrarUsuarioExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: UntypedFormGroup;
  regExpPassword :RegExp = mascaras.MASK_PASSWORD_EXT;
  regExpRUC : RegExp = mascaras.MASK_RUC;
  regExpCedula : RegExp = mascaras.MASK_CEDULA;
  tipoRUC = false;
  tipoIdentificacionSeleccionado = false;
  randomBackground = fondos.RandomBackground();
  /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
  nombresUsuario = "";
  apellidosUsuario = "";

  /* 20APR2021 DSRE Inclusión de Términos y condiciones*/
  public rutaTerminos = `${environment.URL_DOCUMENTOS_PUBLICOS}Términos y Condiciones.pdf`;

  encriptar: any;

  // Constructor del componente.
  constructor(
    public _servicioUsuario: UsuarioService,
    public _servicioDinardap:DinardapService,
    private router: Router
  ) { }

  ngOnInit() {
    funcion_js_custom();
    funciones_index();
    this.encriptar = new JSEncrypt();
    this.inicializarFormulario();
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new UntypedFormGroup({
      inputTipoIdentificacion: new UntypedFormControl(null, [Validators.required]),
      numero_identificacion_RUC: new UntypedFormControl(null, [Validators.pattern(mascaras.MASK_RUC)]),
      numero_identificacion_cedula: new UntypedFormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_CEDULA)]),
      /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
      /*nombres: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      apellidos: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),*/
      /* 20APR2021 DSRE Inclusión de Términos y condiciones*/
      terminos_condiciones: new UntypedFormControl(null, [Validators.required]),
      razon_social: new UntypedFormControl(''),
      nombre_comercial: new UntypedFormControl(''),
      identificacion_representante: new UntypedFormControl(''),
      nombre_representante: new UntypedFormControl(''),
      apellido_representante: new UntypedFormControl(''),
      email: new UntypedFormControl(null, [Validators.required, Validators.email]),
      /* 07APR2021 DSRE Activación de Usuarios Externos desde Agrocalidad
      password: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)]),
      confirmar_password: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFANUMERICO)])
      */
    });
  }
  
  // Método que permite registrar un usuario.
  registrarUsuario() {
    /* 07APR2021 DSRE Activación de Usuarios Externos desde Agrocalidad
    this.encriptar.setPublicKey(clavePublica);
    let claveEncriptada = this.encriptar.encrypt(this.formulario.value.password);*/
    
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

   //Validaciones de lógica de negocio.
   /* 07APR2021 DSRE Activación de Usuarios Externos desde Agrocalidad
   if(this.formulario.value.password !== this.formulario.value.confirmar_password){
      formularioInvalido = true;
      mensaje += "<li>Las contraseñas no coinciden</li>";
    }
    */

    if(!this.regExpRUC.test(this.formulario.value.numero_identificacion_RUC) && this.tipoRUC){
      formularioInvalido = true;
      mensaje += "<li>El RUC no tiene un formato válido</li>";
    }
    if(!this.regExpCedula.test(this.formulario.value.numero_identificacion_cedula) && !this.tipoRUC){
      formularioInvalido = true;
      mensaje += "<li>La cédula no tiene un formato válido</li>";
    }

    if(this.nombresUsuario == ""){
      formularioInvalido = true;
      mensaje += "<li>Consultar datos Registro Civil / SRI</li>";
    }

    if(this.formulario.value.email == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese un correo electrónico válido</li>";
    }

    /*if(this.formulario.value.email.toLowerCase().indexOf('@agrocalidad.gob.ec') !== -1){
      formularioInvalido = true;
      mensaje += "<li>El correo electrónico no debe pertenecer al dominio @agrocalidad.gob.ec</li>";
    }*/

    if(!this.formulario.value.terminos_condiciones){
      formularioInvalido = true;
      mensaje += "<li>Aceptar términos y condiciones de uso</li>";
    }

    /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
    //Validar que los nombres y apellidos no estén vacíos

    /*if(this.apellidosUsuario == ""){
      formularioInvalido = true;
      mensaje += "<li>Se requieren los apellidos del usuario</li>";
    }*/
    
    /* 07APR2021 DSRE Activación de Usuarios Externos desde Agrocalidad
    if (!this.regExpPassword.test(this.formulario.value.password)){
      formularioInvalido = true;
      mensaje += "<li>La contraseña debe tener al menos 8 caracteres. Al menos número, una letra mayúscula y una letra minúscula</li>";
    }*/
    console.log(this.formulario);
  if (this.formulario.invalid || formularioInvalido) {
   mensaje += "</ul>"
   Swal.fire('Error', mensaje, 'error');
   return;
  }

    let usuario = new Usuario();

      /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/  
      usuario.nombres = this.nombresUsuario;
      usuario.apellidos = this.apellidosUsuario;
      usuario.email =  this.formulario.value.email.toLowerCase();
      /* 07APR2021 DSRE Activación de Usuarios Externos desde Agrocalidad
      usuario.contraseña = claveEncriptada;*/

      if(this.tipoRUC)
      {
        //No se envía el tipo de identificación xq será definido en el backend con la validación de RUC
        usuario.tipoIdentificacion = 2;//Tipo de identificación nulo.
        usuario.numeroIdentificacion = this.formulario.value.numero_identificacion_RUC;
        usuario.razonSocial = this.formulario.value.razon_social;
        usuario.identificacionRepresentanteLegal =  this.formulario.value.identificacion_representante;
        usuario.nombresRepresentanteLegal = this.formulario.value.nombre_representante;
        usuario.apellidosRepresentanteLegal = this.formulario.value.apellido_representante;
        usuario.nombreComercial = this.formulario.value.nombre_comercial;
      }
      else
      {
        usuario.tipoIdentificacion = 1;//Tipo de identificación Cédula
        usuario.numeroIdentificacion = this.formulario.value.numero_identificacion_cedula;
      }

      //Mensaje de confirmación
      Swal.fire({
        title: '¿Desea continuar con el registro?',
        text: "Confirmo que la información de este formulario ha sido revisada, he leído y acepto los términos y condiciones de uso de la plataforma.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          
         /* Swal.fire({
            title: 'Espere...',
            text: 'Sus datos se están registrando',
            confirmButtonText: '',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });*/
        this._servicioUsuario.registrarUsuarioExterno(usuario)
          .subscribe((resp: any) => {
            if (resp.estado === 'OK') {
              Swal.fire('Éxito', 'Su usuario ha sido pregregistrado exitosamente. Por favor, acérquese a la oficina de Agrocalidad más cercana con su documento de identidad para realizar la activación de su cuenta de usuario', 'success');
              this.formulario.reset();
              this.router.navigate(['home']);
            }
            else 
            {
             Swal.fire('Error', resp.mensaje , 'error');
           }
         } );


        }
        else
        Swal.close();
      })
}

  //Función que busca los datos de un RUC con el WS de la DINARDAP
  buscarRUC(identificacion : string)
  {
    /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
    //Se resetean las variables de nombres y apellidos del usuario
    this.nombresUsuario = "";
    this.apellidosUsuario = "";
    this.formulario.controls.email.setValue('');
    this.formulario.controls.nombre_comercial.setValue('');
    this.formulario.controls.nombre_representante.setValue('');
    this.formulario.controls.apellido_representante.setValue('');
    this.formulario.controls.identificacion_representante.setValue('');
    this.formulario.controls.razon_social.setValue('');

    if(!this.regExpRUC.test(identificacion)){
      Swal.fire('Error', "El RUC no tiene un formato válido", 'error');
      return;
    }
    else
    {
      /*Swal.fire({
        title: 'Espere...',
        text: 'Consultando información del SRI',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
      });*/

    this._servicioDinardap.obtenerUbicacionesSri(identificacion)
    .subscribe( ( ubicaciones: UbicacionSri[] ) => {
      if ( ubicaciones.length > 0 ){
        const ubicacion: UbicacionSri = ubicaciones[0];
        this.nombresUsuario = ubicacion.razonSocial;
        this.apellidosUsuario = ubicacion.razonSocial;
        this.formulario.controls.razon_social.setValue(ubicacion.razonSocial);
      } else{
        Swal.fire('Error', "No se encontró el RUC consultado", 'error');
        return;
      }
      //Swal.close();
    });

    this._servicioDinardap.obtenerCorreoElectronicoContribuyente(identificacion)
      .subscribe( (correos: EmailContribuyente[]) => {
        if ( correos.length > 0 ) {
          const itemCorreo: EmailContribuyente = correos[0];
          this.formulario.controls.email.setValue(itemCorreo.email);
          this.formulario.controls.nombre_comercial.setValue(itemCorreo.nombreComercial);
        }
        /*else{
          Swal.fire('Error', "No se encontró el RUC consultado", 'error');
          return;
        }*/
      });

      this._servicioDinardap.obtenerRepresentanteLegal(identificacion)
      .subscribe( (representante: RucRepresentanteLegal[]) => {
      if ( representante.length > 0 ) {
        const itemRepresentante: RucRepresentanteLegal = representante[0];
        this.formulario.controls.nombre_representante.setValue(itemRepresentante.nombreRepreLegal);
        this.formulario.controls.apellido_representante.setValue(itemRepresentante.apellidoRepreLegal);
        this.formulario.controls.identificacion_representante.setValue(itemRepresentante.idRepreLegal);
      }
      /*else{
        Swal.fire('Error', "No se encontró el RUC consultado", 'error');
        return;
      }*/
    });

    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Se han extraído exitosamente los datos de usuario desde el SRI.',
      showConfirmButton: false,
      timer: 1500
    });
      
      //this._servicioDinardap.obtenerRucContribuyente(identificacion)
       // .subscribe( (respuesta: RucContribuyente[]) => {
          //console.log('Datos', respuesta);
          //);
    }
  }

  //Función que busca los datos de una Cédula con el WS de la DINARDAP
  buscarCedula(identificacion : string)
  {
    /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
    //Se resetean las variables de nombres y apellidos del usuario
    this.nombresUsuario = "";
    this.apellidosUsuario = "";
    this.formulario.controls.email.setValue('');
    
    if(!this.regExpCedula.test(identificacion)){
      Swal.fire('Error', "La cédula no tiene un formato válido", 'error');
      return;
    }
    else
    {
      /*Swal.fire({
        title: 'Espere...',
        text: 'Consultando información del Registro Civil',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
      });*/


      this._servicioDinardap.obtenerDatosDemograficos(identificacion)
    .subscribe( (respuesta: DatoDemografico[]) => {
      if ( respuesta != null) {
        const datoDemografico: DatoDemografico = respuesta[0];
        // let nombres: string[] = datoDemografico.nombre.split(' ').map( (item: string) => {
        //   let cadena = item.toLowerCase();
        //   return cadena.charAt(0).toUpperCase() + cadena.slice(1);
        // });
        // const nombresCompletos = nombres.slice(2, nombres.length);
        // const apellidosCompletos =  nombres.slice(0, 2);
        /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
        this.nombresUsuario = datoDemografico.nombre;
        this.apellidosUsuario = datoDemografico.apellido;
        //this.formulario.controls.nombres.setValue(this.nombresUsuario);
        //this.formulario.controls.apellidos.setValue(this.apellidosUsuario);
        Swal.close();
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se han extraído exitosamente los datos de usuario desde el Registro Civil.',
          showConfirmButton: false,
          timer: 1500
        });
      }
      else
      {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'No se ha podido extraer información del Registro Civil.',
          showConfirmButton: true
        });
      }
    });
    }
  }

  cambiarTipoIdentificacion()
  {
    /* 19APR2021 DSRE Campos Nombre y Apellidos del usuario solamente de lectura*/
    //Se resetean las variables de nombres y apellidos del usuario
    this.nombresUsuario = "";
    this.apellidosUsuario = "";
    if(this.formulario.value.inputTipoIdentificacion == "cedula")
    {
      this.tipoIdentificacionSeleccionado = true;
      this.tipoRUC = false;
      this.formulario.controls.numero_identificacion_cedula.setValidators([Validators.required , Validators.pattern(mascaras.MASK_CEDULA)]);
      this.formulario.controls.numero_identificacion_cedula.updateValueAndValidity();
      this.formulario.controls.numero_identificacion_RUC.clearValidators();
      this.formulario.controls.numero_identificacion_RUC.updateValueAndValidity();
      this.formulario.controls.razon_social.clearValidators();
      this.formulario.controls.razon_social.updateValueAndValidity();
      /*this.formulario.controls.nombre_comercial.clearValidators();
      this.formulario.controls.nombre_comercial.updateValueAndValidity();
      this.formulario.controls.identificacion_representante.clearValidators();
      this.formulario.controls.identificacion_representante.updateValueAndValidity();
      this.formulario.controls.nombre_representante.clearValidators();
      this.formulario.controls.nombre_representante.updateValueAndValidity();
      this.formulario.controls.apellido_representante.clearValidators();
      this.formulario.controls.apellido_representante.updateValueAndValidity();*/
    }
    else //Tipo RUC
    {
      this.tipoIdentificacionSeleccionado = true;
      this.tipoRUC = true;
      this.formulario.controls.numero_identificacion_cedula.clearValidators();
      this.formulario.controls.numero_identificacion_cedula.updateValueAndValidity();
      this.formulario.controls.numero_identificacion_RUC.setValidators([Validators.required , Validators.pattern(mascaras.MASK_RUC)]);
      this.formulario.controls.numero_identificacion_RUC.updateValueAndValidity();
      this.formulario.controls.razon_social.setValidators([Validators.required , Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.razon_social.updateValueAndValidity();
      /*this.formulario.controls.nombre_comercial.setValidators([Validators.required , Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.nombre_comercial.updateValueAndValidity();
      this.formulario.controls.identificacion_representante.setValidators([Validators.required , Validators.pattern(mascaras.MASK_NUMERICO)]);
      this.formulario.controls.identificacion_representante.updateValueAndValidity();
      this.formulario.controls.nombre_representante.setValidators([Validators.required , Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.nombre_representante.updateValueAndValidity();
      this.formulario.controls.apellido_representante.setValidators([Validators.required , Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.apellido_representante.updateValueAndValidity();*/
    }
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }
}