import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Importación de servicios.
import { SitioService } from 'src/app/servicios/sitio/sitio.service';
import { ProvinciaService } from 'src/app/servicios/provincia/provincia.service';
import { OficinaInternaService } from 'src/app/servicios/oficina-interna/oficina-interna.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

@Component({
  selector: 'app-consulta-sitios-pendientes',
  templateUrl: './consulta-sitios-pendientes.component.html',
  styleUrls: []
})
export class ConsultaSitiosPendientesComponent implements OnInit {

  //Objetos para gestionar catálogos
  public listaSitios = [];
  public listaSitiosOriginal = [];
  public listaProvincias = [];
  public idProvincia = null;
  public aprobadorNacional = false;
  idOficina : number;

  constructor(
    private _sitioService: SitioService,
    private _usuarioService: UsuarioService,
    private _provinciaService: ProvinciaService,
    private _oficinaService: OficinaInternaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.verificarRolUsuario();
    this.cargarInformacionInicial();
    this.cargarProvinciasPorPais(19);//Ecuador por defecto
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

  // Método que obtiene el código de provincia de una oficina por su id. Y después obtiene los predios pendientes
  cargarInformacionInicial() {
    Swal.fire({
      title: 'Espere...',
      text: 'Estamos consultando los datos de predios pendientes',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });
    this._oficinaService.getOficinasInternasPorId(parseInt(localStorage.getItem('oficina')))
    .subscribe( resp => {
      if(resp.length <= 0) 
      {
        Swal.fire('Error', resp.mensaje , 'error');
      }
      else 
      {
        let oficina = resp[0];
        this.idProvincia = oficina.id_provincia;
        this.cargarPrediosPendientes();
      }
    });
  }

// Método que carga el listado de predios pendientes de aprobar
cargarPrediosPendientes() {

    this.listaSitios = [];

    if(this.aprobadorNacional)
    {
      //Se pueden aprobar las solicitudes de predio de todo el país.
      this._sitioService.consultaSitioReporteFiltros({idEstado : 1})//Sitios en estado Pendiente
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK')  {

            this.listaSitiosOriginal = resp.resultado;

            this._sitioService.consultaSitioReporteFiltros({idEstado : 2})//Sitios en estado en Visita
            .subscribe( (resp: any) => {
              if ( resp.estado === 'OK')  {
                if(this.listaSitiosOriginal.length > 0)
                {
                  this.listaSitiosOriginal = this.listaSitiosOriginal.concat(resp.resultado);
                  this.listaSitios = this.listaSitiosOriginal;
                }
                
                else
                  this.listaSitiosOriginal = resp.resultado;
              }
              else {
                Swal.fire('Error', resp.mensaje , 'error');
              }
            });

          this.listaSitios = this.listaSitiosOriginal;

          if(this.listaSitiosOriginal.length > 0) {
            Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
          }
          else {
            Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
          }
        }
        else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
      });
    }
    else
    {
      //Se pueden aprobar las solicitudes de predio de todo el país.
      this._sitioService.consultaSitioReporteFiltros({idEstado : 1, idProvincia : this.idProvincia})//Sitios en estado Pendiente
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK')  {

            this.listaSitiosOriginal = resp.resultado;

            this._sitioService.consultaSitioReporteFiltros({idEstado : 2, idProvincia : this.idProvincia})//Sitios en estado en Visita
            .subscribe( (resp: any) => {
              if ( resp.estado === 'OK')  {
                if(this.listaSitiosOriginal.length > 0)
                  this.listaSitiosOriginal.concat(resp.resultado);
                else
                  this.listaSitiosOriginal = resp.resultado;
              }
              else {
                Swal.fire('Error', resp.mensaje , 'error');
              }
            });

            this.listaSitios = this.listaSitiosOriginal;
          
          if(this.listaSitiosOriginal.length > 0) {
            Swal.fire('Éxito', 'Se ha realizado la búsqueda exitosamente', 'success');
          }
          else {
            Swal.fire('Éxito', 'La búsqueda no ha generado resultados', 'success');
          }
        }
        else {
          Swal.fire('Error', resp.mensaje , 'error');
        }
      });
    }
}

  //Función para filtrar Solicitudes
  filtrarSitiosSolicitante(event: KeyboardEvent) {
    let elemento = event.target as HTMLInputElement;
    let cadena = elemento.value;
    if (typeof cadena === 'string') 
    {
      this.listaSitios = this.listaSitiosOriginal.filter(sitio => sitio.numero_identificacion.toLowerCase().indexOf(cadena.toLowerCase()) != -1);
    }
  }

  //Funcion para filtrar sitios por provincia
  filtrarSitiosProvincia(filtro : string)
  {
    switch(filtro)
    {
      case "0"://todas
        this.listaSitios = this.listaSitiosOriginal;
      break;
      default://
        this.listaSitios = this.listaSitiosOriginal.filter(  sitio  => sitio.id_provincia == filtro);
      break;
    }
  }

  //Funcion para filtrar sitios por estado
  filtrarSitiosEstado(filtro : string)
  {
    switch(filtro)
    {
      case "0"://todos
        this.listaSitios = this.listaSitiosOriginal;
      break;
      default:
        this.listaSitios = this.listaSitiosOriginal.filter(  sitio  => sitio.id_estado == filtro);
      break;
    }
  }

  //Funcion que redirecciona al usuario a la pantalla de aproación de sitios
  redireccionaAprobacion(identificacion_propietario : string)
  {
    this.router.navigate(['aprobacion-registro-sitios/'+identificacion_propietario]);
  }
}
