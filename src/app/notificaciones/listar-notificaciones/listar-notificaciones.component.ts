import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../modelos/usuario.modelo';
import { Notificacion } from '../../modelos/notificacion.modelo';
import { NotificacionService } from '../../servicios/notificacion/notificacion.service';

@Component({
  selector: 'app-listar-notificaciones',
  templateUrl: './listar-notificaciones.component.html',
  styleUrls: []
})
export class ListarNotificacionesComponent implements OnInit {

  usuario: Usuario;
  listaNotificaciones = []; //Lista que se manipulará con filtros
  listaNotificacionesOriginal = []; //Lista original que se mantendrá como base para filtrado
  cantidadNotificaciones: number;
  notificacionSeleccionada : Notificacion;
  detalleVisible = false;
  totalLeidas = 0;
  totalLeer = 0;

  constructor(
    public usuarioServicio: UsuarioService,
    public _notificacionServicio: NotificacionService
    ) { }

  ngOnInit(): void {
    this.usuario = new Usuario();
    this.consultarNotificacionesUsuario();
  }

  consultarNotificacionesUsuario(){
    let idUsuario : number;
    //Consulta para usuarios externos
    if (this.usuarioServicio.usuarioExterno) {
      idUsuario = this.usuarioServicio.usuarioExterno.idUsuario;

      this._notificacionServicio.consultarNotificacionesExternosFiltros({idUsuarioNotificado : idUsuario})
      .subscribe( (respuesta: any) => {
      if (respuesta.estado === 'OK') {
              
        this.listaNotificacionesOriginal = respuesta.resultado;
        this.listaNotificaciones = respuesta.resultado;
        this.calcularCantidad();
        }});

    }
    //Consulta para usuarios internos
    else if(this.usuarioServicio.usuarioInterno)
    {
      idUsuario = this.usuarioServicio.usuarioInterno.idUsuario;

      this._notificacionServicio.consultarNotificacionesInternosFiltros({idUsuarioNotificado : idUsuario})
      .subscribe( (respuesta: any) => {
      if (respuesta.estado === 'OK') {
              
        this.listaNotificacionesOriginal = respuesta.resultado;
        this.listaNotificaciones = respuesta.resultado;
        this.calcularCantidad();
        };
      });
    }
    else
    {
      Swal.fire('Error', "El tipo de usuario logeado es inválido" , 'error');
    }
  }

  leerNotificacion(idNotificacionLeida : number)
  {
     let notificacionAux = this.listaNotificaciones.find(({ idNotificacion }) => idNotificacion === idNotificacionLeida);
     this.notificacionSeleccionada = new Notificacion();
     this.notificacionSeleccionada.idNotificacion = notificacionAux.idNotificacion;
     this.notificacionSeleccionada.titulo = notificacionAux.titulo;
     this.notificacionSeleccionada.texto = notificacionAux.texto;
     this.notificacionSeleccionada.fechaNotificacion = notificacionAux.fechaNotificacion.date;
     this.notificacionSeleccionada.estado = notificacionAux.estado;
     
     if(notificacionAux.estado == 1)
     {
      //Se actualizan los arreglos (original y filtrado) para evitar hacer un request nuevamente para obtener todas las notificaciones
      let indice = this.listaNotificaciones.indexOf(({ idNotificacion }) => idNotificacion === idNotificacionLeida);
      notificacionAux.estado = 2;
      this.listaNotificaciones[indice] = notificacionAux;
      indice = this.listaNotificacionesOriginal.indexOf(({ idNotificacion }) => idNotificacion === idNotificacionLeida);
      this.listaNotificacionesOriginal[indice] = notificacionAux;
      this.calcularCantidad();
      this.actualizarNotificacionLeida(idNotificacionLeida);
     }
     else
     {
       this.detalleVisible = true;
     }
  }

  filtrar(filtro : string)
  {
     switch(filtro)
     {
       case "0"://todas
        this.listaNotificaciones = this.listaNotificacionesOriginal;
       break;
       case "1"://Pendientes de leer
        this.listaNotificaciones = this.listaNotificacionesOriginal.filter( notificacion  => notificacion.estado == 1);
       break;
       case "2"://Leídas
        this.listaNotificaciones = this.listaNotificacionesOriginal.filter(  notificacion  => notificacion.estado > 1);
       break;
       default:
        Swal.fire('Error', "Filtro inválido" , 'error');
        this.listaNotificaciones = this.listaNotificacionesOriginal;
       break;
     }
  }

  // Método que permite actualizar una notificación a leída
  actualizarNotificacionLeida(idNotificacion: number) {

    let notificacion = new Notificacion();
    notificacion.idNotificacion = idNotificacion;
    notificacion.estado = 2; // Marcar como leída
    
    Swal.fire({
      title: 'Espere...',
      text: 'Sus datos se están registrando',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
          Swal.showLoading();
      }
    });
    if(this.usuarioServicio.usuarioExterno)
    {
      this._notificacionServicio.actualizarNotificacionExterno(notificacion)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'Se ha marcado su notificación como leída', 'success');
          this.detalleVisible = true;
        }
        else {
        Swal.fire('Error', resp.mensaje , 'error');
        this.detalleVisible = false;
        }
      });
    }
    else if(this.usuarioServicio.usuarioInterno)
    {
      this._notificacionServicio.actualizarNotificacionInterno(notificacion)
      .subscribe( (resp: any) => {
        if ( resp.estado === 'OK') {
          Swal.fire('Éxito', 'Se ha marcado su notificación como leída', 'success');
          this.detalleVisible = true;
        }
        else {
        Swal.fire('Error', resp.mensaje , 'error');
          this.detalleVisible = false;
        }
      });
    }
    else
    {
      Swal.fire('Error', "El tipo de usuario logeado es inválido" , 'error');
      this.detalleVisible = false;
    }
  }

  //Método para calcular la cantidad de notificaciones leídas y no leídas
  calcularCantidad()
  {
    let sinleer = this.listaNotificacionesOriginal.filter( notificacion => notificacion.estado == 1);
    this.totalLeer = sinleer.length;
    this.totalLeidas = this.listaNotificacionesOriginal.length - this.totalLeer;   
  }

}
