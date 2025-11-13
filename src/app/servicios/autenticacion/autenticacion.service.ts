import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from "rxjs/operators";
import * as moment from "moment";



// Importamos modelos: sesion.
import { Sesion } from '../../modelos/sesion.modelo';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(
    private http: HttpClient,
    public usuarioServicio: UsuarioService
  ) { }
  autenticarUsuarioExterno(identificacion: string, contraseña: string, ip: string) {
    localStorage.setItem('identificacion', identificacion);
    const url = environment.URL_SERVICIOS + 'tokens/' + identificacion;
    return this.http.post(url, { contraseña, ip })
      .pipe(
        map((resp: any) => {
          if (resp.hasOwnProperty('estado')) {
            if (resp.estado === 'OK') {
              const usuario = new Usuario();
              usuario.numeroIdentificacion = identificacion;
              usuario.idUsuario = resp.resultado.idUsuario;
              this.guardarUsuario(usuario, 'externo');
              this.crearSesion(resp.resultado, identificacion);
            }
            return resp;
          }
          return resp;
        })
      );
  }

  autenticarUsuarioInterno(identificacion: string, contraseña: string, ip: string) {
    const url = environment.URL_SERVICIOS + 'tokens_internos/' + identificacion;
    return this.http.post(url, { contraseña, ip })
      .pipe(
        map((resp: any) => {
          if (resp.hasOwnProperty('estado')) {
            if (resp.estado === 'OK') {
              const usuario = new Usuario();
              usuario.numeroIdentificacion = identificacion;
              usuario.idUsuario = resp.resultado.idUsuario;
              this.guardarUsuario(usuario, 'interno');
              this.crearSesion(resp.resultado, identificacion);
            }
            return resp;
          }
          return resp;
        })
      );
  }
  // Método que guarda el objeto usuario en el storage.
  private guardarUsuario(datos: Usuario, tipo: string) {
    const usuario = new Usuario();
    usuario.numeroIdentificacion = datos.numeroIdentificacion;
    usuario.idUsuario = datos.idUsuario;
    switch (tipo) {
      case 'externo':
        this.usuarioServicio.guardarUsuarioExternoEnStorage(usuario);
        break;
      case 'interno':
        this.usuarioServicio.guardarUsuarioInternoEnStorage(usuario);
        break;
    }
  }

  private crearSesion(resAutenticacion: Sesion, identificacion: string) {
    const expiracion = moment().add(resAutenticacion.duracion, 'second');
    localStorage.setItem('identificacion', identificacion);
    localStorage.setItem('idUsuario', resAutenticacion.idUsuario.toString());
    localStorage.setItem('token', resAutenticacion.token);
    localStorage.setItem('expiracion', JSON.stringify(expiracion.valueOf()));
    localStorage.setItem('refreshToken', resAutenticacion.refreshToken);
    localStorage.setItem('menu', JSON.stringify(resAutenticacion.menu));
    localStorage.setItem('tokenJasper', JSON.stringify(resAutenticacion.tokenJasper));
    
    if(resAutenticacion.idOficina == null)
      {
        console.log("ERROR: No se ha enviado la oficina del usuario interno"); // Descomentar solo para debug
        throw new Error('El servicio de autenticación no ha eviado el código de oficina del usuario interno');
      }
    else{
      localStorage.setItem('oficina', resAutenticacion.idOficina.toString());
    }

    if(resAutenticacion.idProvincia == null)
      {
        console.log("ERROR: No se ha enviado la provincia del usuario"); // Descomentar solo para debug
        throw new Error('El servicio de autenticación no ha eviado el código de provincia del usuario');
      }
    else{
      localStorage.setItem('idProvincia', resAutenticacion.idProvincia.toString());
    }
  }
  // Método para cerrar la sesión.
  logout() {
    let recurso = '';
    if (this.usuarioServicio.usuarioInterno) {
      recurso = 'tokens_internos/' + this.usuarioServicio.usuarioInterno.idUsuario;
    } else if (this.usuarioServicio.usuarioExterno) {
      recurso = 'tokens/' + this.usuarioServicio.usuarioExterno.idUsuario;
    } else {
      this.limpiarSesion();
      return;
    }
    
    const url = environment.URL_SERVICIOS + recurso;

    return this.http.delete(url).pipe(
      map((respuesta: any) => {
        if (respuesta.estado === 'OK') {
          this.limpiarSesion();
        }
        return respuesta;
      })
    );
  }

  public limpiarSesion()
  {
    localStorage.removeItem('identificacion');
    localStorage.removeItem('token');
    localStorage.removeItem('duracion');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('menu');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('expiracion');
    localStorage.removeItem('tokenJasper');
    localStorage.removeItem('oficina');
    this.usuarioServicio.removerUsuario();
  }

  public tokenValido() {
    return moment().isBefore(this.getExpiracion());
  }

  public tokenExpirado() {
    return !this.tokenValido();
  }

  getExpiracion() {
    const expiracion = localStorage.getItem('expiracion');
    const expiraEn = JSON.parse(expiracion);
    return moment(expiraEn);
  }
}
