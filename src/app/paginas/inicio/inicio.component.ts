import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
// Importación de modelos.
import { Usuario } from '../../modelos/usuario.modelo';
// Importación de servicios.
import { UsuarioService } from '../../servicios/usuario/usuario.service';

import { showAlertWithCallback, showHtmlAlert } from '../../config/alertas';
import { SesionVerificacionService } from '../../servicios/autenticacion/sesion-verificacion.service';
import { AutenticacionService } from '../../servicios/autenticacion/autenticacion.service';
import { CatalogosService } from 'src/app/servicios/catalogos-genericos/catalogos-genericos.service';
import { AlertaSesionService } from '../../servicios/autenticacion/alerta-sesion.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formularioSitio: FormGroup;
  //**** Cuerpo de modelos ****/
  usuario: Usuario;
  //**** Listas ****/
  listaEstadisticas: null;
  //listaAreas: Area[] = [];
  listaEstadoPredios = [];
  //listaBovinosConArete: Bovino[] = [];
  //**** Variables auxiliares ****/
  op: number = 0;
  isVisibleBotonDetalles: boolean = false;
  isVisible: boolean = false;
  faseVacunacionActiva: any = null;
  numeroIdentificacion: string = '';
 
  private alertaMostrada = false;

  catalogos: { [key: string]: any[] } = {};

  constructor(
    public scriptServicio: ScriptsService,
    public usuarioServicio: UsuarioService,
    private rutas: Router,
    private sesionVerificacionService: SesionVerificacionService,
    private autenticacionService: AutenticacionService,
    private catalogosService: CatalogosService,
    private alertaSesionService: AlertaSesionService
  ) { }

  ngOnInit() {

    console.log('InicioComponent cargado');
    this.scriptServicio.inicializarScripts();
    // 1. Iniciar verificación periódica si hay sesión
    if (this.autenticacionService.sesionIniciada()) {
      this.sesionVerificacionService.iniciarVerificacionPeriodica();
    }

    // 2. Verificar si debemos mostrar alerta de sesión anterior
    setTimeout(() => {
      this.verificarAlertaSesionAnterior();
    }, 1000);

    this.cargarCatalogos();

    // Cargar PopUp Políticas de uso
    setTimeout(() => {
      //this.lanzarPopUp();
    }, 2000);
  }

  ngAfterViewInit() {
    /*setTimeout(() => {
      // 1. Inicializar todos los scripts
      this.scriptServicio.inicializarScripts();
    }, 100);*/
  }

  ngOnDestroy() {
    // Limpiar flags al salir
    this.alertaMostrada = false;
  }

 

  // Método genérico para cargar catálogos
  cargarCatalogos() {
    const catalogosRequeridos = [
      'regimenesTributarios',
      'tiempoFrecuencia',
      'tiposContabilidad'
    ];

    this.catalogosService.obtenerMultiplesCatalogos(catalogosRequeridos).subscribe({
      next: (resultados) => {
        this.catalogos = resultados;
        //this.cargandoCatalogos = false;
      },
      error: (error) => {
        console.error('Error cargando catálogos:', error);
        //this.cargandoCatalogos = false;
      }
    });
  }

  /**
   * Verifica si debe mostrar alerta de sesión anterior cerrada
   */
  private verificarAlertaSesionAnterior(): void {
    const mostrarAlerta = localStorage.getItem('mostrarAlertaSesionAnterior');
    const alertaTimestamp = localStorage.getItem('alertaSesionAnteriorTimestamp');

    if (mostrarAlerta === 'true' && alertaTimestamp) {
      const timestamp = parseInt(alertaTimestamp, 10);
      const ahora = Date.now();
      const tiempoLimite = 5 * 60 * 1000; // 5 minutos

      // Verificar que la alerta sea reciente (menos de 5 minutos)
      if (ahora - timestamp < tiempoLimite) {
        this.mostrarAlertaSesionAnterior();
      }

      // Limpiar los flags del localStorage
      this.limpiarFlagsAlerta();
    }
  }

  /**
   * Muestra la alerta de sesión anterior cerrada
   */
  private mostrarAlertaSesionAnterior(): void {
    this.alertaSesionService.mostrarAlertaInformativa(
      '¡Hey, atención!',
      `Encontramos una sesión abierta en otro dispositivo y la hemos finalizado.
      <div style="margin-top: 15px; padding: 5px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
        💡 <i>Esto ocurre cuando inicias sesión desde un nuevo lugar, sin haber cerrado la sesión en el anterior.</i>
      </div>`
    );
  }

  /**
   * Limpia los flags de alerta del localStorage
   */
  private limpiarFlagsAlerta(): void {
    localStorage.removeItem('mostrarAlertaSesionAnterior');
    localStorage.removeItem('alertaSesionAnteriorTimestamp');
  }


  /**
   * Muestra la alerta de sesión anterior cerrada
   */
  private mostrarAlertaSesionAnterior2(): void {
    this.alertaMostrada = true;

    showHtmlAlert(
      '¡Hey, atención!',
      `Encontramos una sesión abierta en otro dispositivo y la hemos finalizado.
      <div style="margin-top: 15px; padding: 5px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
        💡 <i>Esto ocurre cuando inicias sesión desde un nuevo lugar, sin haber cerrado la sesión en el anterior.</i>
      </div>`,
      'info',
      'Entendido'
    );
  }


  //**** Inicializar formularios ****/
  /*inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputEstado: new FormControl('3'),
      inputIdSitio: new FormControl(null)
    });

    this.formularioSitio = new FormGroup({
    });
  }*/




  //**** Limpiar inputs ****/
  lanzarPopUp() {

    if (this.usuarioServicio.usuarioExterno) {
      this.numeroIdentificacion = this.usuarioServicio.usuarioExterno.numeroIdentificacion;
    } else {
      this.numeroIdentificacion = this.usuarioServicio.usuarioInterno.numeroIdentificacion;
    }

    let parametros: any = {};
    parametros = {
      numeroIdentificacion: this.numeroIdentificacion,
      tipo: 1
    }
    this.usuarioServicio.buscarUsuariosPoliticas(parametros)
      .subscribe((respuesta: any) => {
        if (respuesta.estado === 'OK') {
          if (respuesta.resultado.length < 1) {
            this.popUpPoliticasVersion2();
          }
        }
      });
  }

  // Método que se usa para cerrar la sesión de un usuario.
  cerrarSesion() {
    this.autenticacionService.logout()
      .subscribe(
        (respuesta: any) => {
          this.rutas.navigate(['home']);
        }
        , (err: HttpErrorResponse) => {
          if (err.error.estado === 'ERR') {
            Swal.fire('Error', err.error.mensaje, 'error');
          }
        });
  }

  //**** Pop Up - Políticas nuevas ****/
  popUpPoliticasVersion2() {
    Swal.fire({
      title: '<h2 style="color: #2c3e50; font-size: 22px; font-weight: 600; margin-bottom: 15px;">Aviso de uso y tratamiento de datos personales</h2>',
      icon: 'info',
      width: '800px',
      background: '#FFFFFF',
      html:
        '<div style="text-align: justify; line-height: 1.6; color: #333; font-size: 14px;">' +
        '<p>En cumplimiento con lo dispuesto por la <b>Ley Orgánica de Protección de Datos Personales (Art. 66)</b>, ' +
        'la Agencia de Regulación y Control Fito y Zoosanitario pone en su conocimiento que almacenará los datos ' +
        'que usted proporcione a través del Sistema SIFAE 2.0 y la aplicación SIFAE Móvil. En ese sentido, usted ' +
        'otorga su consentimiento <b>(Art. 8)</b> voluntario, libre, previo, expreso, específico, informado e inequívoco ' +
        'a la Agencia de Regulación y Control Fito y Zoosanitario para que realice el tratamiento <b>(Art. 33)</b>, en ' +
        'cualquiera de sus modalidades, medios o soportes, de la información y los datos personales y de identificación ' +
        'que usted haya proporcionado, para el uso exclusivo de la Agencia de Regulación y Control Fito y Zoosanitario, ' +
        'acorde a las competencias estatutarias de cada Coordinación. La información podrá ser compartida con otras ' +
        'entidades públicas, ministerios o entes rectores del Estado, de conformidad con las competencias estatutarias ' +
        'de cada Coordinación o de la institución, y en cumplimiento de sus funciones legales, técnicas y administrativas.</p>' +
        '</div>',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      confirmButtonText: 'Sí, estoy de acuerdo',
      cancelButtonText: 'Salir del sistema',
      timer: 120000 // 2 minutos
    }).then((result) => {
      if (result.isConfirmed) {
        const numeroIdentificacion = this.usuarioServicio.usuarioExterno
          ? this.usuarioServicio.usuarioExterno.numeroIdentificacion
          : this.usuarioServicio.usuarioInterno.numeroIdentificacion;

        const parametros = {
          numeroIdentificacion: numeroIdentificacion,
          tipo: 1
        };

        this.usuarioServicio.registrarUsuariosPoliticas(parametros)
          .subscribe({
            next: () => { },
            error: () => { }
          });
      } else {
        this.cerrarSesion();
      }
    });
  }


}
