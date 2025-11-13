import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Area } from 'src/app/modelos/area.modelo';
import Swal from 'sweetalert2';
import { Bovino } from '../../modelos/bovino.modelo';
import { EstadoRegistroService } from '../../servicios/estado-registro.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { EstadoRegistro } from '../../modelos/estado-registro-modelo';
import { Categoria } from '../../modelos/categoria.modelo';
import { AreaService } from '../../servicios/area/area.service';
import { CategoriaService } from '../../servicios/categoria/categoria.service';

@Component({
  selector: 'app-verificar-catastro',
  templateUrl: './verificar-catastro.component.html',
  styleUrls: ['./verificar-catastro.component.css']
})
export class VerificarCatastroComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaBovinos: Bovino[];
  listaEstadosRegistros: EstadoRegistro[];
  public listaProvincias = [];
  public idProvincia = null;
  public aprobadorNacional = false;
  // Propietario actual
  listaPropietarios: UsuarioExterno[] = [];
  usuarioPropietarioActualSeleccionado: UsuarioExterno;
  listaAreasOrigen: Area[] = [];
  listadoCategorias: Categoria[] = [];

  constructor(
    private servicioScript: ScriptsService,
    private servicioBovino: BovinoService,
    private _usuarioService: UsuarioService,
    private _provinciaService: ProvinciaService,
    private servicioEstadoRegistro: EstadoRegistroService,
    private servicioArea: AreaService,
    private servicioCategoria: CategoriaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.listaBovinos = [];
    this.listaEstadosRegistros = [];
    this.listaAreasOrigen = [];
    this.listadoCategorias = [];
    this.verificarRolUsuario();
    this.obtenerEstadosRegistros();
    this.servicioScript.inicializarScripts();
    this.inicializarFormularioBusqueda();
    //this.cargarProvinciasPorPais(19);//Ecuador por defecto
    this.obtenerCategorias();
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormularioBusqueda(){
    this.formularioBusqueda = new FormGroup({
      //ci: new FormControl(null, Validators.required),
      propietario: new FormControl(null, Validators.required),
      area_origen: new FormControl(null, Validators.required),
      categoria: new FormControl("-1"),
      estado_registro: new FormControl(null, Validators.required)
    });
  }

  // Método que obtiene las categorías.
  obtenerCategorias() {
    this.servicioCategoria.obtenerCategorias()
    .subscribe( (respuesta: Categoria[]) => this.listadoCategorias = respuesta );
  }

  // Método que obtiene los datos de provincias.
  cargarProvinciasPorPais(idPais: number) {
    this._provinciaService.getProvinciasPorPais(idPais)
    .subscribe( respuesta => this.listaProvincias = respuesta );
  }

   // Método que obtiene los datos de roles del usuario
   verificarRolUsuario()
   {
     if(this._usuarioService.usuarioInterno)
     {
       let idUsuario = parseInt(localStorage.getItem('idUsuario'));
 
       this._usuarioService.consultarRolesUsuarioInternoId(idUsuario)
       .subscribe( (resp:any) =>{
             if (resp.estado === 'OK') 
             {
               let rolesUsuario = resp.resultado;
               let aprobadorNacional = false
               rolesUsuario.forEach(rol => {
                 if(rol.idRoles == 18)//Rol de aprobador nacional de predios
                   aprobadorNacional = true;  
               })
 
               if(aprobadorNacional)
                   this.aprobadorNacional = true;  
                 else
                 {
                   this.aprobadorNacional = false;
                 }
             }
             else {
             Swal.fire('Error', resp.mensaje , 'error');
           }
         } );
     }
     else
     {
       Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad' , 'error');
       this.router.navigate(['inicio']);
     }
   }

   /**
   * Busca a los propietarios
   * @param ci 
   * @returns 
   */
  buscarPropietario(ci: string){
    this.formularioBusqueda.controls.propietario.setValue(null);
    this.formularioBusqueda.controls.area_origen.setValue(null);
    this.usuarioPropietarioActualSeleccionado = null;
    this.listaPropietarios = [];
    this.listaBovinos = [];
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
    this._usuarioService.filtrarUsuariosExternos({
      numeroIdentificacion: ci
    }).subscribe( (resp: any) => {
      this.listaPropietarios = resp;
      Swal.close();
    });
  }

  obtenerAreasPropietario(){

    if ( this.formularioBusqueda.value.propietario ) {
      const parametros = new Area();
      parametros.idUsuariosExternos = this.formularioBusqueda.value.propietario;
      if(this.aprobadorNacional == false)
      {
        parametros.idProvinciaSitio = parseInt(localStorage.getItem('idProvincia'));
        console.log(parseInt(localStorage.getItem('idProvincia')));
      }
      
      this.obtenerAreas(parametros);
    }
  }

  /**
   * Consulta los bovinos disponibles del operador pecuario
   */
   obtenerAreas(parametros: Area){
    
    this.listaAreasOrigen = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioArea.obtenerAreasPorFiltro(parametros)
    .subscribe( (areas: Area[]) => {
      this.listaAreasOrigen = areas;
      console.log(areas);
      Swal.close();
    });
  }



  /**
   * Obtiene los estados de registros.
   */
  obtenerEstadosRegistros(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando catálogo.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioEstadoRegistro.obtenerEstadosRegistros()
    .subscribe( (estadosRegistros: EstadoRegistro[]) => {
      this.listaEstadosRegistros = estadosRegistros.filter( (item: EstadoRegistro) => {
        return item.grupo === 'BOV';
      });
      Swal.close();
    });
  }

  /**
   * Busca el catastro de un operador pecuario
   */
  buscarCatastro(){

    console.log(this.formularioBusqueda);
    this.formularioBusqueda.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formularioBusqueda.value.propietario == null || this.formularioBusqueda.value.propietario == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione propietario</li>";
    }

    if(this.formularioBusqueda.value.area_origen == null || this.formularioBusqueda.value.area_origen == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione predio</li>";
    }

    if(this.formularioBusqueda.value.estado_registro == null || this.formularioBusqueda.value.estado_registro == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione estado del animal</li>";
    }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('Error', mensaje, 'error');
      return;
    }

    Swal.fire({
      title: 'Espere...',
      text: 'Consultando catastro.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    const bovinoParametros = new Bovino();
    bovinoParametros.idUsuarioActual = this.formularioBusqueda.value.propietario;
    bovinoParametros.idAreaActual = this.formularioBusqueda.value.area_origen;
    bovinoParametros.idEstadoRegistro = this.formularioBusqueda.value.estado_registro;
    
    if(this.formularioBusqueda.value.categoria !="-1")
    {
      bovinoParametros.idCategoria = this.formularioBusqueda.value.categoria;
    }

    this.servicioBovino.filtrarBovinos(bovinoParametros)
    .subscribe( (bovinos: Bovino[]) => {
      this.listaBovinos = bovinos;
      console.log(this.listaBovinos);
      Swal.close();
    });

  }

  /**
   * Habilita un bovino para 
   * @param id 
   */
  verificarBovino(id: number){
    Swal.fire({
      title: 'Verificar animal',
      text: '¿Está seguro de verificar este animal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Verificando animal...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioBovino.habilitarBovino(id)
        .subscribe( (respuesta: any) => {
          const bovino = new Bovino();
          bovino.idBovino = respuesta[0].idBovino;
          this.servicioBovino.filtrarBovinos(bovino)
          .subscribe( ( res: Bovino[]) => {
            const itemBovino = res[0];
            const lista: Bovino[] = this.listaBovinos.map( (item: Bovino) => {
              if ( Number(item.idBovino) === Number(itemBovino.idBovino) ) {
                return itemBovino;
              } else {
                return item;
              }
            });
            this.listaBovinos = lista;
          });
          Swal.fire(
            'Éxito',
            'El animal fue verificado',
            'success'
          );
        });
      }
    });
  }

  /**
   * Confirma un bovino
   */
  confirmarBovino(id: number){
    Swal.fire({
      title: 'Confirmar animal',
      text: '¿Está seguro de confirmar este animal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Confirmando animal...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioBovino.habilitarBovino(id)
        .subscribe( (respuesta: any) => {
          const bovino = new Bovino();
          bovino.idBovino = respuesta[0].idBovino;
          this.servicioBovino.filtrarBovinos(bovino)
          .subscribe( ( resp: Bovino[]) => {
            const itemBovino = resp[0];
            const lista: Bovino[] = this.listaBovinos.map( (item: Bovino) => {
              if ( Number(item.idBovino) === Number(itemBovino.idBovino) ) {
                return itemBovino;
              } else {
                return item;
              }
            });
            this.listaBovinos = lista;
          });
          Swal.fire(
            'Éxito',
            'El animal fue confirmado',
            'success'
          );
        });
      }
    });
  }

  /**
   * Deshabilita un bovino
   * @param id 
   */
  deshabilitarBovino(id: number){
    Swal.fire({
      title: 'Deshabilitar animal',
      text: '¿Está seguro de deshabilitar este animal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Deshabilitando animal...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        this.servicioBovino.deshabilitarBovino(id)
        .subscribe( (respuesta: any) => {
          const bovino = new Bovino();
          bovino.idBovino = respuesta[0].idBovino;
          this.servicioBovino.filtrarBovinos(bovino)
          .subscribe( ( resp: Bovino[]) => {
            const itemBovino = resp[0];
            const lista: Bovino[] = this.listaBovinos.map( (item: Bovino) => {
              if ( Number(item.idBovino) === Number(itemBovino.idBovino) ) {
                return itemBovino;
              } else {
                return item;
              }
            });
            this.listaBovinos = lista;
          });
          Swal.fire(
            'Éxito',
            'El animal fue deshabilitado',
            'success'
          );
        });
      }
    });
  }

}
