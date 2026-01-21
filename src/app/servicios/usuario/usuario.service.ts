import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
// Importamos modelos: usuario.
import { Usuario } from '../../modelos/usuario.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  usuarioExterno?: Usuario;
  usuarioInterno?: Usuario;
  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) {
    this.leerUsuarioDeStorage();
  }

  registrarUsuarioExterno(usuario: Usuario) {
    const url = environment.URL_SERVICIOS + 'usuarios_externos/';
    return this.http.post(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  /**
   * Consulta el personal de los CCA
   * @param parametros 
   */
   consultarPersonalCca(parametros: any){
    console.log(parametros);
    const url = `${environment.URL_SERVICIOS}usuarios_cca`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Agrega personal a los CCA
   * @param usuario 
   */
   registrarUsuarioCca(usuario: UsuarioExterno) {
    const url = `${environment.URL_SERVICIOS}usuarios_cca`;
    return this.http.post(url, usuario)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Consulta el personal de los CCA
   * @param parametros 
   */
  buscarUsuariosPoliticas(parametros: any){
    const url = `${environment.URL_SERVICIOS}usuarios_politicas`;
    return this.http.get(url, {params: parametros})
    .pipe(
      map( (respuesta: any) => {
        return respuesta;
      })
    );
  }

  /**
   * Registrar aceptación anuncio usuario externo
   * @param usuario 
   */
  registrarUsuariosPoliticas(usuario: UsuarioExterno) {
    const url = `${environment.URL_SERVICIOS}usuarios_politicas`;
    return this.http.post(url, usuario)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }

  /**
   * Eliminar una cuenta de usuario vinculada a un CCA
   * @param identificador 
   */
   eliminarUsuarioCca (identificador: number) {
    const url = `${environment.URL_SERVICIOS}usuarios_cca/${identificador}`;
    return this.http.delete(url)
    .pipe(
      map( (respuesta: any) => {
        return respuesta.resultado;
      })
    );
  }


  actualizarUsuarioExterno(usuario: Usuario) {
    const url = environment.URL_SERVICIOS + 'usuarios_externos/';
    return this.http.patch(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // Método que permite consultar un usuario externo por su Id
  consultarUsuarioExternoId(idUsuario: number) {
    const url = environment.URL_SERVICIOS + 'usuarios_externos/' + idUsuario;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }


  // Método para consultar un usuario externo por filtros
  consultarUsuarioExtFiltros(apellidos?: string, nombres?: string, email?: string, numeroIdentificacion?: string, idEstado?: number, idRol?: number) {
    let filtros = '';
    if (apellidos !== null && apellidos !== undefined && apellidos !== "")
      filtros += '&apellidos=' + apellidos;
    if (nombres !== null && nombres !== undefined && nombres !== "")
      filtros += '&nombres=' + nombres;
    if (email !== null && email !== undefined && email !== "")
      filtros += '&email=' + email;
    if (numeroIdentificacion !== null && numeroIdentificacion !== undefined && numeroIdentificacion !== "")
      filtros += '&numeroIdentificacion=' + numeroIdentificacion;
    if (idEstado !== null && idEstado !== undefined)
      filtros += '&idEstado=' + idEstado;
    if (idRol !== null && idRol !== undefined)
      filtros += '&idRol=' + idRol;

    const url = environment.URL_SERVICIOS + 'usuarios_externos/' + filtros;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

   // Método para consultar un usuario y su rol externo por filtros
   consultarUsuarioExternoRolFiltros(apellidos?: string, nombres?: string, email?: string, numeroIdentificacion?: string, idEstado?: number, idRol?: number) {
    let filtros = '';
    if (apellidos !== null && apellidos !== undefined && apellidos !== "")
      filtros += '&apellidos=' + apellidos;
    if (nombres !== null && nombres !== undefined && nombres !== "")
      filtros += '&nombres=' + nombres;
    if (email !== null && email !== undefined && email !== "")
      filtros += '&email=' + email;
    if (numeroIdentificacion !== null && numeroIdentificacion !== undefined && numeroIdentificacion !== "")
      filtros += '&numeroIdentificacion=' + numeroIdentificacion;
    if (idEstado !== null && idEstado !== undefined)
      filtros += '&idEstado=' + idEstado;
    if (idRol !== null && idRol !== undefined)
      filtros += '&idRol=' + idRol;

    const url = environment.URL_SERVICIOS + 'usuarios_externos_roles/' + filtros;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  /**
   * Consultar usuarios externos por filtro
   * @param parametros 
   */
  consultarUsuarioExternoFiltros(parametros: any){
    const url = `${environment.URL_SERVICIOS}usuarios_externos`;
    return this.http.get(url, { params: parametros}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  /**
   * Busca los usuarios externos en base a parámetros de búsqueda
   */
  filtrarUsuariosExternos(parametros: any) {
    const url = `${environment.URL_SERVICIOS}filtrar_usuarios_externos`;
    return this.http.get(url, { params: parametros}).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

  /**
   * Busca los usuarios externos de centros de concentracion de animales
   */
   filtrarUsuariosCca(parametros: any) {
    const url = `${environment.URL_SERVICIOS}usuarios_cca`;
    return this.http.get(url, { params: parametros}).pipe(
      map((resp: any) => {
        return resp.resultado;
      })
    );
  }

  // Método que permite guardar el usuario externo en el storage.
  guardarUsuarioExternoEnStorage(usuario: Usuario) {
    this.usuarioExterno = null;
    localStorage.setItem('usuarioExterno', JSON.stringify(usuario));
    if (localStorage.getItem('usuarioExterno')) {
      this.usuarioExterno = JSON.parse(localStorage.getItem('usuarioExterno'));
    }
  }

  // Método que permite leer el usuario del storage.
  leerUsuarioDeStorage() {
    this.usuarioExterno = null;

    if (localStorage.getItem('usuarioExterno')) {
      this.usuarioExterno = JSON.parse(localStorage.getItem('usuarioExterno'));
    }
  }

  // Método que remueve los objetos almacenados.
  removerUsuario() {
    this.usuarioExterno = null;
    
    if (localStorage.getItem('usuarioExterno')) {
      localStorage.removeItem('usuarioExterno');
    }
  }

  

  //Método que permite cambiar la contraseña de un usuario externo
  cambiarContraseñaUsuarioExterno(idUsuario : number, contraseña : string, contraseñaAnterior : string){
    const url = environment.URL_SERVICIOS + 'contrasenas_externos/'+idUsuario;
    return this.http.patch(url,{contraseña : contraseña, contraseñaAnterior : contraseñaAnterior}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  
  //Método que permite recuperar la contraseña de un usuario externo
  recuperarContraseñaUsuarioExterno(numeroIdentificacion : string, email : string){
    const url = environment.URL_SERVICIOS + 'contrasenas_externos/'+numeroIdentificacion;
    return this.http.post(url,{numeroIdentificacion : numeroIdentificacion, email : email}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }


  //Método que permite validar el email de un usuario externo
  validarEmailExterno(idUsuario : number, token : string){
    const url = environment.URL_SERVICIOS + 'emails/'+idUsuario;
    return this.http.patch(url,{idUsuario : idUsuario, token : token}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  //Método que permite reenviar el mensaje de confirmación de correo de un usuario externo
  reenviarConfirmacionEmailExterno(idUsuario : number){
    const url = environment.URL_SERVICIOS + 'emails/'+idUsuario;
    return this.http.post(url,{idUsuario : idUsuario}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  
  //Método que permite asignar un rol a un usuario externo
  asignarRolUsuarioExterno(idUsuario : number, idRol : number){
    const url = environment.URL_SERVICIOS + 'usuarios_externos_roles/';
    return this.http.post(url,{idUsuario : idUsuario, idRol : idRol}).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  //Función para activar un usuario externo
  activarUsuarioExterno(usuario: Usuario) {
    const url = environment.URL_SERVICIOS + 'preregistro_externo/';
    return this.http.patch(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  /**
   * Registro para el componente de vacunación
   * @param usuario 
   * @returns 
   */
  registrarUsuarioBasico(usuario: Usuario){
    const url = `${environment.URL_SERVICIOS}registro_usuario_basico`;
    return this.http.patch(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // Recursos para Consultoria SIFAE Aretes Oficiales
  
  actualizarUsuarioExternoSimple(usuario: Usuario) {
    const url = environment.URL_SERVICIOS + 'actualizar_usuario_externo_simple/';
    return this.http.patch(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

}