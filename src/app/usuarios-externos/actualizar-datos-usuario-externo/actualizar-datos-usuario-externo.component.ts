import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { EmailContribuyente } from '../../modelos/email-contribuyente.modelo';
import { RucRepresentanteLegal } from '../../modelos/ruc-representante-legal.mdelo';
import { UbicacionSri } from '../../modelos/ubicacion-sri.modelo';
import { DatoDemografico } from '../../modelos/dato-demografico.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { DinardapService } from '../../servicios/dinardap/dinardap.service';
// Importación de servicios.

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';
// Importamos las máscaras de validacion
import { ScriptsService } from '../../servicios/scripts/scripts.service';

@Component({
  selector: 'app-actualizar-datos-usuario-externo',
  templateUrl: './actualizar-datos-usuario-externo.component.html',
  styleUrls: []
})
export class ActualizarDatosUsuarioExternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  formularioBusquedaExterno: FormGroup;
  idUsuario : number;
  identificacion : string ='';
  tipoIdentificacion: string = '';
  emailAnterior: string = '';
  ruc: boolean = false;
  formularioVisible= false;
  usuario : Usuario = new Usuario();
  // Datos Usuario Interno
  usuarioReporte: any;
  usuarioInterno: Usuario;
  idUsuarioInterno: string;
  nombresUsuarioInterno: string = '';
  emailUsuarioInterno: string = '';
  oficinaUsuarioInterno: string = '';
  provinciaUsuarioInterno: string = '';

  constructor(
    public _servicioUsuario: UsuarioService,
    public scriptServicio: ScriptsService,
    private servicioDinardap: DinardapService,
    private router: Router
  ) { }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormularioBusqueda();
    this.inicializarFormulario();
    this.verificarRolUsuario();//Se valida el acceso del usuario, en base a su rol

    this.usuarioInterno = this._servicioUsuario.usuarioInterno;
    this.idUsuarioInterno = this.usuarioInterno.numeroIdentificacion;
    this.buscarUsuarioInterno();
    console.log('Identificacion: '+this.usuarioInterno.numeroIdentificacion);
    
  }
  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputNombres: new FormControl(null, [Validators.required]),
      //inputApellidos: new FormControl(null, [Validators.required]),
      inputEmail: new FormControl(null, [Validators.email]),
      //inputEmailRead: new FormControl(null, [Validators.email]),
      //inputRazonSocial: new FormControl(null, [Validators.required]),
      inputNombreComercial: new FormControl(''),
      inputIdentificacionRepresentante: new FormControl(null),
      inputNombresRepresentante: new FormControl(null)
      //inputApellidosRepresentante: new FormControl(null)
    });
  }

  // Método que obtiene los datos de tipos de actividad
  buscarUsuarioInterno() {
      
    Swal.fire({
      title: 'Espere...',
      text: 'Se está ejecutando la búsqueda',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });
  this._servicioUsuario.consultarReporteUsuarioInternoFiltros({numeroIdentificacion: this.idUsuarioInterno})
  .subscribe((resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado[0] != null && typeof( resp.resultado[0]) != 'undefined')
        {
          //Cargar resumen
          this.usuarioReporte = resp.resultado[0];
          this.nombresUsuarioInterno = resp.resultado[0].nombres + ' ' + resp.resultado[0].apellidos;
          this.emailUsuarioInterno = resp.resultado[0].email;
          this.oficinaUsuarioInterno = resp.resultado[0].oficina;
          this.provinciaUsuarioInterno = resp.resultado[0].provincia;
          console.log('Nombres: '+this.nombresUsuarioInterno);
          console.log('Email: '+this.emailUsuarioInterno);
          console.log('Oficina: '+this.oficinaUsuarioInterno);
          console.log('Provincia: '+this.provinciaUsuarioInterno);
          Swal.close()
        }
        else
        {
          this.formularioVisible = false;
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados' , 'warning');
        }
      }
      else {
       Swal.fire('Error', resp.mensaje , 'error');
     }
   } );
  }

    // Inicializar formulario de búsqueda.
    inicializarFormularioBusqueda() {
      this.formularioBusquedaExterno = new FormGroup({
        inputIdentificacionUsuario: new FormControl(null, [Validators.required]),
      });
    }

  //Función que busca los datos de un RUC con el WS de la DINARDAP
  validarIdentificacion(documento : string)
  {
    //Si es RUC
    if(documento.trim().length == 13)
    {
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando información del SRI',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
      });

      this.formulario.controls.inputNombresRepresentante.setValue('');
      this.formulario.controls.inputIdentificacionRepresentante.setValue('');
      this.formulario.controls.inputNombreComercial.setValue('');
      this.formulario.controls.inputNombres.setValue('');

      this.servicioDinardap.obtenerUbicacionesSri(documento)
    .subscribe( ( ubicaciones: UbicacionSri[] ) => {
      if ( ubicaciones.length > 0 ){
        const ubicacion: UbicacionSri = ubicaciones[0];
        this.formulario.controls.inputNombres.setValue(ubicacion.razonSocial);
      } else{
        Swal.fire('¡Atención!', "No se encontraron registros con este RUC", 'info');
        return;
      }
    });

    this.servicioDinardap.obtenerCorreoElectronicoContribuyente(documento)
      .subscribe( (correos: EmailContribuyente[]) => {
        if ( correos.length > 0 ) {
          const itemCorreo: EmailContribuyente = correos[0];
          //this.formulario.controls.inputEmail.setValue(itemCorreo.email);
          this.formulario.controls.inputNombreComercial.setValue(itemCorreo.nombreComercial);
        }
        /*else{
          Swal.fire('Error', "No se encontró el RUC consultado", 'error');
          return;
        }*/
      });

      this.servicioDinardap.obtenerRepresentanteLegal(documento)
      .subscribe( (representante: RucRepresentanteLegal[]) => {
      if ( representante.length > 0 ) {
        const itemRepresentante: RucRepresentanteLegal = representante[0];
        this.formulario.controls.inputNombresRepresentante.setValue(itemRepresentante.nombreRepreLegal);
        this.formulario.controls.inputIdentificacionRepresentante.setValue(itemRepresentante.idRepreLegal);
      }
      /*else{
        Swal.fire('Error', "No se encontró el RUC consultado", 'error');
        return;
      }*/
    });
    Swal.close();
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Se han extraído los datos desde el SRI',
      showConfirmButton: false,
      timer: 1500
    });    
    }
    // Si es cédula
    if(documento.trim().length == 10)
    {
      Swal.fire({
        title: 'Espere...',
        text: 'Consultando información del Registro Civil',
        confirmButtonText: '',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
      });

      this.formulario.controls.inputNombres.setValue('');

      this.servicioDinardap.obtenerDatosDemograficos(documento)
    .subscribe( (respuesta: DatoDemografico[]) => {
      if ( respuesta != null) {
        const datoDemografico: DatoDemografico = respuesta[0];
        this.formulario.controls.inputNombres.setValue(datoDemografico.nombre);
        Swal.close();
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se han extraído los datos desde el Registro Civil',
          showConfirmButton: false,
          timer: 1500
        });
      }
      else
      {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'No se han podido extraer los datos desde la base de  Registro Civil.',
          showConfirmButton: true
        });
      }
    });
    }
  }

  actualizarUsuario()
  {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formulario.value.inputEmail.toLowerCase().indexOf('@agrocalidad.gob.ec') !== -1){
      formularioInvalido = true;
      mensaje += "<li>El correo electrónico no debe pertenecer al dominio @agrocalidad.gob.ec</li>";
    }

    if(this.formulario.value.inputNombres == '' || this.formulario.value.inputNombres == ''){
      formularioInvalido = true;
      mensaje += "<li>Ingrese Apellidos y nombres / Razón social</li>";
    }

    if(this.formulario.value.inputEmail == '' || this.formulario.value.inputEmail == ''){
      formularioInvalido = true;
      mensaje += "<li>Ingrese un correo electrónico válido</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    let mensajeQ, titulo, botonConfirmar, actualizando;
    

    if(this.emailAnterior !== this.formulario.value.inputEmail.toLowerCase())
    {
      //mensajeQ = 'Yo, '+this.nombresUsuarioInterno+' con C.C./C.I.: '+ this.idUsuarioInterno+', relizaré el cambio de correo electrónico de la cuenta '+this.identificacion+' a petición del titular o representante legal, quien se encuentra presente. Asimismo cuento con documentos de soporte si se llegase a requirir pruebas de descargo. En caso de mal uso de esta herramienta, la Agencia podrá actuar en derecho y tomar acciones de acuerdo a la ley.';
      mensajeQ = 'Yo, '+this.nombresUsuarioInterno+' con C.C./C.I.: '+ this.idUsuarioInterno+', relizaré el cambio de correo electrónico de la cuenta '+this.identificacion+' a petición del titular o representante legal, quien se encuentra presente.';
      titulo = '¡Atención!';
      botonConfirmar = 'He leído y estoy de acuerdo';
      actualizando = 'Registrando transacción en la base de datos... Notificando al solicitante ('+this.emailAnterior+', '+this.formulario.value.inputEmail.toLowerCase()+') con copia al funcionario modificador ('+this.emailUsuarioInterno+')...';
    }else
    {
      //mensajeQ = 'Yo, '+this.nombresUsuarioInterno+' con C.C./C.I.: ['+ this.idUsuarioInterno+']. Tengo conocimiento que este trámite se realiza de manera presencial y personal. Relizaré el cambio de correo electrónico de la cuenta '+this.identificacion+' a petición del titular o representante legal, quien se encuentra aquí presente. Asimismo cuento con los respaldos en caso de requirirse documentos o pruebas de descargo. <br> Esta transacción se registrará en la base datos del sistema y será notificada al solicitante ('+this.emailAnterior+', '+this.formulario.value.inputEmail.toLowerCase()+' con copia al funcionario modificador ('+this.emailUsuarioInterno+')';
      mensajeQ = 'Por favor, verifique los datos antes de continuar.';
      titulo = '¿Está seguro actualizar datos de la cuenta '+this.identificacion+'?';
      botonConfirmar = 'Sí, actualizar';
      actualizando = 'Actualizando datos de la cuenta '+this.identificacion+'...';
    }

    Swal.fire({
      title: titulo,//'¿Está seguro actualizar datos de la cuenta '+this.identificacion+'?',
      text: mensajeQ,//"Por favor, verifique la información ingresada antes de continuar",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: botonConfirmar,//'Sí, actualizar',
      cancelButtonText: 'Cancelar',//'Cancelar'
    }).then((result) => {
      if (result.value) {
        
        Swal.fire({
          title: 'Espere...',
          text: actualizando,
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
              Swal.showLoading();
          }
      });

      let usuario = new Usuario();

      usuario.idUsuario = this.idUsuario;
      usuario.numeroIdentificacion = this.identificacion;
      usuario.nombres = this.formulario.value.inputNombres.toUpperCase();
      usuario.apellidos = this.formulario.value.inputNombres.toUpperCase();
      usuario.email = this.formulario.value.inputEmail.toLowerCase();
      usuario.emailAnterior = this.emailAnterior;
      usuario.nombresUsuarioInterno = this.nombresUsuarioInterno;
      usuario.emailUsuarioInterno = this.emailUsuarioInterno;
      usuario.oficinaUsuarioInterno = this.oficinaUsuarioInterno;
      
      //Campos exclusivos del tipo de dato RUC
      if(this.usuario.tipoIdentificacion != 1)
      {
        usuario.razonSocial = this.formulario.value.inputNombres;
        usuario.identificacionRepresentanteLegal =  this.formulario.value.inputIdentificacionRepresentante;
        usuario.nombresRepresentanteLegal = this.formulario.value.inputNombresRepresentante
        usuario.apellidosRepresentanteLegal = this.formulario.value.inputNombresRepresentante;
        usuario.nombreComercial = this.formulario.value.inputNombreComercial;
      }

      this._servicioUsuario.actualizarUsuarioExterno(usuario)
        .subscribe((resp: any) => {
          if (resp.estado === 'OK') {
            Swal.fire('Éxito', 'La cuenta de usuario '+this.identificacion+' se ha actualizado correctamente', 'success');
            this.formulario.reset();
            this.router.navigate(['inicio']);
          }
          else {
           Swal.fire('Error', resp.mensaje , 'error');
           this.formularioVisible = false;
           this.router.navigate(['inicio']);
         }
       } );
      }
      else
      Swal.close();
    }) 
  }
  
  buscarUsuario()
  {
    this.formularioVisible = false;
    let formularioInvalido = false;
    let mensaje = "Por favor, ingrese # de identificación<ul>";

    if(this.formularioBusquedaExterno.value.inputIdentificacionUsuario == null || this.formularioBusquedaExterno.value.inputIdentificacionUsuario == ""){
      formularioInvalido = true;
    }

    if (formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    let identificacionUsuario = this.formularioBusquedaExterno.value.inputIdentificacionUsuario;

    this._servicioUsuario.consultarUsuarioExtFiltros(null, null, null, identificacionUsuario, 2 /*Estado Activo*/, null)
    .subscribe( (resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado.length == 1)
        {
          Swal.fire('¡Éxito!', 'Búsqueda exitosa, registro encontrado.', 'success');

          this.formularioVisible = true;

          //Cargar resumen
          this.usuario = new Usuario();
          this.idUsuario = resp.resultado[0].id_usuarios_externos;

          this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
          this.usuario.nombres = resp.resultado[0].nombres;
          //this.usuario.apellidos = resp.resultado[0].apellidos;
          this.usuario.tipoIdentificacion = resp.resultado[0].id_tipos_identificacion;
          this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
          this.usuario.email = resp.resultado[0].email; 
          //this.usuario.razonSocial = resp.resultado[0].razon_social; 
          this.usuario.nombreComercial = resp.resultado[0].nombre_comercial; 
          this.usuario.identificacionRepresentanteLegal = resp.resultado[0].identificacion_representante_legal; 
          this.usuario.nombresRepresentanteLegal = resp.resultado[0].nombres_representante_legal; 
          this.usuario.apellidosRepresentanteLegal = resp.resultado[0].apellidos_representante_legal;

          //Cargar los datos del usuario en el formulario
          this.formulario.controls.inputNombres.setValue(this.usuario.nombres);
          //this.formulario.controls.inputApellidos.setValue(this.usuario.apellidos);
          if(this.usuario.email=='info@noset.com')
          {
            this.formulario.controls.inputEmail.setValue('');
          }else
          {
            this.formulario.controls.inputEmail.setValue(this.usuario.email);
          }
          this.emailAnterior = this.usuario.email;
          //this.formulario.controls.inputRazonSocial.setValue(this.usuario.razonSocial);
          this.formulario.controls.inputNombreComercial.setValue(this.usuario.nombreComercial);
          this.formulario.controls.inputIdentificacionRepresentante.setValue(this.usuario.identificacionRepresentanteLegal);
          this.formulario.controls.inputNombresRepresentante.setValue(this.usuario.nombresRepresentanteLegal);
          //this.formulario.controls.inputApellidosRepresentante.setValue(this.usuario.apellidosRepresentanteLegal);
          this.identificacion = this.usuario.numeroIdentificacion;

          switch(this.usuario.tipoIdentificacion)
          {
            case 1:
              this.ruc = false;
              this.tipoIdentificacion = "Cédula";
              //this.cambiarValidacionesIdentificacion('cedula');
              break;
            case 2:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Natural";
              //this.cambiarValidacionesIdentificacion('ruc');
              break;
            case 3:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Jurídica Privada";
              //this.cambiarValidacionesIdentificacion('ruc');
              break;
            case 4:
              this.ruc = true;
              this.tipoIdentificacion = "RUC Persona Jurídica Pública";
              //this.cambiarValidacionesIdentificacion('ruc');
              break;
            case 5:
                this.ruc = false;
                this.tipoIdentificacion = "Pasaporte";
                //this.cambiarValidacionesIdentificacion('pasaporte');
                break;  
            default:
              Swal.fire('¡Advertencia!', 'El tipo de identificación del usuario no es válido' , 'warning');
              this.formularioVisible = false;
            break;
          }
        }
        else
        {
          this.formularioVisible = false;
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados' , 'info');
          //Swal.fire('Error', 'No existe una cuenta activa con el número de identificación '+this.formularioBusquedaExterno.value.inputIdentificacionUsuario+'' , 'error');
          //Swal.fire('Error', 'No se han encontrado los datos del usuario' , 'error');
        } 
      }
      else 
      {
      Swal.fire('Error', resp.mensaje , 'error');
      }
    });
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

  //Función para cambiar los validadores de los campos del formulario según el tipo de identificación
  /*cambiarValidacionesIdentificacion(tipoIdentificacion :string)
  {
    if(tipoIdentificacion == "cedula" || tipoIdentificacion == "pasaporte")
    {
      this.formulario.controls.inputRazonSocial.clearValidators();
      this.formulario.controls.inputRazonSocial.updateValueAndValidity();
      //this.formulario.controls.inputNombreComercial.clearValidators();
      //this.formulario.controls.inputNombreComercial.updateValueAndValidity();
      this.formulario.controls.inputIdentificacionRepresentante.clearValidators();
      this.formulario.controls.inputIdentificacionRepresentante.updateValueAndValidity();
      this.formulario.controls.inputNombresRepresentante.clearValidators();
      this.formulario.controls.inputNombresRepresentante.updateValueAndValidity();
      this.formulario.controls.inputApellidosRepresentante.clearValidators();
      this.formulario.controls.inputApellidosRepresentante.updateValueAndValidity();
    }
    if(tipoIdentificacion == "ruc")
    {
      this.formulario.controls.inputRazonSocial.setValidators([Validators.required]);
      this.formulario.controls.inputRazonSocial.updateValueAndValidity();
      //this.formulario.controls.inputNombreComercial.setValidators([Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      //this.formulario.controls.inputNombreComercial.updateValueAndValidity();
      this.formulario.controls.inputIdentificacionRepresentante.setValidators([Validators.pattern(mascaras.MASK_NUMERICO)]);
      this.formulario.controls.inputIdentificacionRepresentante.updateValueAndValidity();
      this.formulario.controls.inputNombresRepresentante.setValidators([Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputNombresRepresentante.updateValueAndValidity();
      this.formulario.controls.inputApellidosRepresentante.setValidators([Validators.pattern(mascaras.MASK_ALFANUMERICO)]);
      this.formulario.controls.inputApellidosRepresentante.updateValueAndValidity();
    }
  }*/

    // Método que obtiene los datos de roles del usuario
    verificarRolUsuario()
    {
      if(!this._servicioUsuario.usuarioInterno)
      {
        Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad' , 'error');
        this.router.navigate(['inicio']);
      }
    }
}


