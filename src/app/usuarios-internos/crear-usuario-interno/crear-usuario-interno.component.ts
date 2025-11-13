import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { Funcionario } from 'src/app/modelos/funcionario.modelo';

// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { OficinaInternaService } from 'src/app/servicios/oficina-interna/oficina-interna.service';

// Importamos las máscaras de validacion
import  * as mascaras from 'src/app/config/mascaras';

@Component({
  selector: 'app-crear-usuario-interno',
  templateUrl: './crear-usuario-interno.component.html',
  styles: []
})
export class CrearUsuarioInternoComponent implements OnInit {

  // Objeto que maneja el formulario.
  formulario: FormGroup;
  funcionario: Funcionario;
  regExpCedula : RegExp = mascaras.MASK_CEDULA;
  listaProvincias = [];
  listaOficinas = [];
  funcionarioEncontrado = false;

  constructor(
    public _servicioUsuario: UsuarioService,
    private _servicioProvincia: ProvinciaService,
    private _servicioOficina: OficinaInternaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
  }

  // Inicializar formulario.
  inicializarFormulario() {
    this.formulario = new FormGroup({
      numero_identificacion: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_NUMERICO)]),
      nombres: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFABETICO)]),
    apellidos: new FormControl(null, [Validators.required, Validators.pattern(mascaras.MASK_ALFABETICO)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      provincia: new FormControl(null, [Validators.required]),
      oficina: new FormControl(null, [Validators.required])
    })
  }

  // Método que permite registrar un usuario.
  registrarUsuarioInterno() {

    let formularioInvalido = false;
    let mensaje = "El formulario de registro contiene errores<ul></br>";
   
    if ( this.formulario.invalid || formularioInvalido) {
    mensaje += "</ul>"
    Swal.fire('Error', mensaje, 'error');
    return;
    }

    let usuario = new Usuario();
      usuario.tipoIdentificacion = 4;//Cédula por defecto para usuarios internos
      usuario.numeroIdentificacion = this.formulario.value.numero_identificacion;
      usuario.nombres = this.formulario.value.nombres;
      usuario.apellidos = this.formulario.value.apellidos;
      usuario.email =  this.formulario.value.email;
      usuario.idProvincia =  this.formulario.value.provincia;
      usuario.idOficina =  this.formulario.value.oficina;

    Swal.fire({
      title: 'Espere...',
      text: 'Sus datos se están registrando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });

  //Mensaje de confirmación
Swal.fire({
  title: 'Está seguro de continuar con la creación del usuario?',
  text: "Revise la información antes de continuar",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Si, enviar',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.value) {
  
    this._servicioUsuario.registrarUsuarioInterno(usuario)
    .subscribe( (resp: any) => {
      if ( resp.estado === 'OK') {
        Swal.fire('Éxito', 'El Usuario Interno fue registrado correctamente', 'success');
        this.router.navigate(['inicio']);
      }
      else {
      Swal.fire('Error', resp.mensaje , 'error');
    }
  });

  }
  else
  Swal.close();
})

  }

  buscarFuncionario(cedula: string)
  {
    this.funcionarioEncontrado = false; 
    //Validaciones de lógica de negocio.
     if(!this.regExpCedula.test(cedula.trim())){
      Swal.fire('Error', "La cédula ingresada no tiene un formato válido", 'error');
      return;
    }
  
    Swal.fire({
      title: 'Espere...',
      text: 'Se está ejecutando la búsqueda',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });
  this._servicioUsuario.consultarFuncionariosGUIAPorIdentificacion(cedula.trim())
  .subscribe((resp: any) => {
      if (resp.estado === 'OK') {
        if(resp.resultado[0] != null)
        {
          this.funcionarioEncontrado = true;
          this.funcionario = new Funcionario();
          //Cargar funcionario
          /*this.formulario.value.nombres = resp.resultado[0].nombres;
          this.formulario.value.apellidos = resp.resultado[0].apellidos;
          this.formulario.value.email = resp.resultado[0].email;*/
          this.funcionario.nombres = resp.resultado[0].nombres;
          this.funcionario.apellidos = resp.resultado[0].apellidos;
          this.funcionario.email = resp.resultado[0].email;

          if(this.cargarProvinciaOficinaFuncionario(resp.resultado[0].codigo_provincia, resp.resultado[0].codigo_oficina))
            Swal.fire('Éxito', 'Se han obtenidos los datos con éxito', 'success');
          else
            {
              Swal.fire('Advertencia', 'Ha ocurrido un error al cargar la provincia y/o oficina del funcionario. Por favor ingrese esta información manualmente' , 'warning');
            }
        }
        else
        {
          Swal.fire('Advertencia', 'La búsqueda no ha retornado resultados. No es posible registrar un usuario que no está registrado como funcionario en GUIA' , 'warning');
        }
      }
      else {
       Swal.fire('Error', resp.mensaje , 'error');
     }
   } );
  }

  // Método que obtiene los datos de provincias.
  cargarProvinciasPorPais(idPais: number) {
    this._servicioProvincia.getProvinciasPorPais(idPais)
    .subscribe( respuesta => this.listaProvincias = respuesta );
  }

  // Método que obtiene los datos de oficinas por provincias.
  cargarOficinasPorProvincia(idProvincia: number) {
    this._servicioOficina.getOficinasInternasPorProvincia(idProvincia)
    .subscribe( respuesta => {
      this.listaOficinas = respuesta;
    });
  }

  //Función para filtrar Provincias
  cargarProvinciaOficinaFuncionario(codigoProvincia: string, codigoOficina: string):boolean {
    let provincia = this.listaProvincias.filter(a => a.codigo.toLowerCase().indexOf(codigoProvincia.toLowerCase()) != -1);
    //Agregar el control para cuando el filtrado de identificadores resulta en una lista vacía
    if(provincia.length != 1)
      {
        console.log("Ningún o más de un resultado al filtrar provincias por su código");
        return false;
      }
    else
    {
      this._servicioOficina.getOficinasInternasPorProvincia(provincia[0].id_provincia)
      .subscribe( respuesta => {
        this.listaOficinas = respuesta;
        let oficina = this.listaOficinas.filter(a => a.codigo.toLowerCase().indexOf(codigoOficina.toLowerCase()) != -1);
        if(oficina.length != 1)
        {
          console.log("Ningún o más de un resultado al filtrar oficinas por su código");
          return false;
        }
        else
        {
          //cargar la provincia y la oficina en el html
          this.funcionario.provincia = provincia[0].nombre + ' - ' + provincia[0].codigo;
          this.funcionario.oficina = oficina[0].nombre + ' - ' + oficina[0].codigo;
        }
      });
    } 
    return true;
  }

  //Función que aplica la máscara a un input al presionarse una tecla
  mascara(event: KeyboardEvent, mascara: string)
  {
    mascaras.Mascara(event, mascara);
  }

}
