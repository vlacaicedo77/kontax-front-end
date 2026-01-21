// autenticacion.service.ts - VERSIÓN COMPLETA CON TOKEN MANAGER
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap } from "rxjs/operators";
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import * as moment from "moment";
import { Router } from '@angular/router';

// Importamos modelos
import { Sesion } from '../../modelos/sesion.modelo';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  
  // BehaviorSubject para manejar el token de forma reactiva
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  // Observable público para que otros componentes se suscriban
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    public usuarioServicio: UsuarioService,
    private router: Router
  ) {
    // Inicializar con token de localStorage si existe
    this.inicializarToken();
  }

  /**
   * Inicializa el token desde localStorage
   */
  private inicializarToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  /**
   * Método para que el interceptor actualice el token cuando llega nuevo
   */
  actualizarToken(nuevoToken: string): void {
    // Actualizar localStorage
    localStorage.setItem('token', nuevoToken);
    // Actualizar BehaviorSubject
    this.tokenSubject.next(nuevoToken);
    // También actualizar la expiración (asumir misma duración)
    const duracion = parseInt(localStorage.getItem('duracion') || '1800', 10);
    const expiracion = moment().add(duracion, 'seconds');
    localStorage.setItem('expiracion', JSON.stringify(expiracion.valueOf()));
  }

  /**
   * Obtener el token actual (para uso síncrono)
   */
  obtenerToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('token');
  }

  autenticar(identificacion: string, password: string) {
    localStorage.setItem('numeroIdentificacion', identificacion);
    const url = environment.URL_SERVICIOS + 'tokens';

    return this.http.post(url, { numeroIdentificacion: identificacion, password }).pipe(
      map((resp: any) => {
        if (resp.hasOwnProperty('estado')) {
          if (resp.estado === 'OK') {
            const sesion = new Sesion();
            sesion.idSesion = resp.resultado.idSesion;
            sesion.token = resp.resultado.token;
            sesion.duracion = resp.resultado.duracion;
            sesion.refreshToken = resp.resultado.refreshToken;
            sesion.menu = resp.resultado.menu;
            sesion.idUsuario = resp.resultado.idUsuario;
            sesion.sesionActivaAnterior = resp.resultado.sesionActivaAnterior ? 1 : 0;

            const usuario = new Usuario();
            usuario.numeroIdentificacion = identificacion;
            usuario.idUsuario = resp.resultado.idUsuario;

            this.guardarUsuario(usuario);
            this.crearSesion(sesion, identificacion);
            
            // Actualizar el BehaviorSubject con el nuevo token
            this.tokenSubject.next(resp.resultado.token);
          }
          return resp;
        }
        return resp;
      })
    );
  }

  private guardarUsuario(datos: Usuario) {
    const usuario = new Usuario();
    usuario.numeroIdentificacion = datos.numeroIdentificacion;
    usuario.idUsuario = datos.idUsuario;
    this.usuarioServicio.guardarUsuarioExternoEnStorage(usuario);
  }

  private crearSesion(sesion: Sesion, nui: string) {
    const expiracion = moment().add(sesion.duracion, 'seconds');

    localStorage.setItem('numeroIdentificacion', nui);
    localStorage.setItem('idUsuario', sesion.idUsuario.toString());
    localStorage.setItem('token', sesion.token);
    localStorage.setItem('expiracion', JSON.stringify(expiracion.valueOf()));
    localStorage.setItem('refreshToken', sesion.refreshToken);
    localStorage.setItem('menu', JSON.stringify(sesion.menu));
    localStorage.setItem('idSesion', sesion.idSesion.toString());
    localStorage.setItem('duracion', sesion.duracion.toString()); // IMPORTANTE: Guardar duración

    if (sesion.sesionActivaAnterior !== undefined) {
      localStorage.setItem('sesionActivaAnterior', sesion.sesionActivaAnterior.toString());
    }
  }

  public logout(): Observable<any> {
    const idUsuario = localStorage.getItem('idUsuario');
    const token = this.obtenerToken(); // Usar método propio

    if (!idUsuario) {
      this.limpiarSesion();
      return throwError('No hay usuario para cerrar sesión');
    }

    const url = environment.URL_SERVICIOS + 'tokens/' + idUsuario;

    return this.http.delete(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }).pipe(
      map((respuesta: any) => {
        this.limpiarSesion();
        return respuesta;
      }),
      catchError((error) => {
        this.limpiarSesion();
        return throwError(error);
      })
    );
  }

  public limpiarSesion() {
    // Limpiar BehaviorSubject
    this.tokenSubject.next(null);
    // Limpiar localStorage
    localStorage.removeItem('numeroIdentificacion');
    localStorage.removeItem('token');
    localStorage.removeItem('expiracion');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('menu');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('idSesion');
    localStorage.removeItem('sesionActivaAnterior');
    localStorage.removeItem('duracion');
    
    this.usuarioServicio.removerUsuario();
  }

  public tokenValido(): boolean {
    return moment().isBefore(this.getExpiracion());
  }

  public tokenExpirado(): boolean {
    return !this.tokenValido();
  }

  /**
   * Verifica si el token está por expirar (últimos X segundos)
   * @param segundosRestantes Segundos antes de expirar para considerar "por expirar"
   */
  public tokenPorExpirar(segundosRestantes: number = 300): boolean {
    const expiracion = this.getExpiracion();
    const segundosHastaExpiracion = expiracion.diff(moment(), 'seconds');
    return segundosHastaExpiracion < segundosRestantes && segundosHastaExpiracion > 0;
  }

  public sesionIniciada(): boolean {
    const token = this.obtenerToken();
    const tokenValido = !!token && token.length > 5 && this.tokenValido();
    return tokenValido;
  }

  /*sesionIniciada() {
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      return (token.length > 5) ? true : false;
    }
    return false;
  }*/

  private getExpiracion() {
    const expiracion = localStorage.getItem('expiracion');
    if (!expiracion) {
      return moment().subtract(1, 'day');
    }
    
    try {
      const expiraEn = JSON.parse(expiracion);
      const momentoExpiracion = moment(expiraEn);
      return momentoExpiracion;
    } catch (e) {
      return moment().subtract(1, 'day');
    }
  }

  public obtenerSesionActual(): Sesion {
    const sesion = new Sesion();
    sesion.idSesion = parseInt(localStorage.getItem('idSesion') || '0');
    sesion.token = this.obtenerToken() || '';
    sesion.duracion = parseInt(localStorage.getItem('duracion') || '0');
    sesion.refreshToken = localStorage.getItem('refreshToken') || '';
    sesion.idUsuario = parseInt(localStorage.getItem('idUsuario') || '0');

    try {
      const menu = localStorage.getItem('menu');
      sesion.menu = menu ? JSON.parse(menu) : [];
    } catch (e) {
      sesion.menu = [];
    }

    return sesion;
  }
  
  /**
   * Método para hacer refresh token manualmente (si es necesario)
   */
  public refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    const token = this.obtenerToken();
    
    if (!refreshToken || !token) {
      return throwError('No hay tokens para refrescar');
    }
    
    const url = environment.URL_SERVICIOS + 'tokens';
    
    return this.http.patch(url, { refreshToken }, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((resp: any) => {
        if (resp.estado === 'OK' && resp.resultado.token) {
          this.actualizarToken(resp.resultado.token);
          localStorage.setItem('refreshToken', resp.resultado.refreshToken);
        }
      })
    );
  }
}