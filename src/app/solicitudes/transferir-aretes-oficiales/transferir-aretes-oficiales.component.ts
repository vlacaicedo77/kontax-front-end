import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, NavigationStart } from '@angular/router';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { AreteBovino } from 'src/app/modelos/arete-bovino.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
// Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';
@Component({
  selector: 'app-transferir-aretes-oficiales',
  templateUrl: './transferir-aretes-oficiales.component.html',
  styleUrls: ['./transferir-aretes-oficiales.component.css']
})
export class TransferirAretesOficialesComponent implements OnInit {

  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formulario: FormGroup;
  //**** Listas ****/
  public listaAretesOrigen = [];
  public listaAretesOrigenBackup = [];
  public listaAretesDestino = [];
  //**** Cuerpo de modelos ****/
  usuario: Usuario = new Usuario();
  // Variables auxiliares
  idUsuarioOrigen: number = null;
  numeroIdentificacionOrigen: string = '';
  nombresUsuarioOrigen: string = '';
  idUsuarioDestino: number = null;
  numeroIdentificacionDestino: string = '';
  nombresUsuarioDestino: string = '';
  aretesCargados: boolean = false;

  constructor(
    private servicioScript: ScriptsService,
    private usuarioService: UsuarioService,
    private aretesBovinosService: AretesBovinosService,
    private router: Router
  ) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.resetScroll();
      }
    });
  }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.verificarRolUsuario(); // Se valida el acceso del usuario, en base a su rol. Que sea usuario interno.
    this.inicializarFormulario();
  }

  //**** Método que obtiene los datos de roles del usuario ****/
  verificarRolUsuario() {
    if (!this.usuarioService.usuarioInterno) {
      Swal.fire('Error', 'Su usuario(externo) no tiene autorización para ingresar a esta funcionalidad', 'error');
      this.router.navigate(['inicio']);
    }
  }

   // Método para resetear el scroll
   resetScroll() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }

  //**** Inicializar el formulario ****/
  inicializarFormulario() {
    this.formulario = new FormGroup({
      inputIdentificacionOrigen: new FormControl(null),
      inputIdentificacionDestino: new FormControl(null),
      inputNombresDestinatario: new FormControl(null),
      inputCodigoOficial: new FormControl(null)
    });
  }

  //**** Buscar usuarios para origen y destino ****/
  buscarUsuario(numeroIdentificacion: string, esOrigen: boolean = false): void {

    numeroIdentificacion = (numeroIdentificacion || '').toUpperCase().trim();

    if (!numeroIdentificacion) {
      Swal.fire('¡Advertencia!', 'Por favor, ingrese # de identificación', 'info');
      return;
    }

    // Preparar el contexto si es origen
    if (esOrigen) {
      this.vaciarListasAretes();
    } else {
      this.mostrarCargando('Buscando usuario de destino...');
    }

    this.usuarioService.consultarUsuarioExtFiltros(
      null, null, null, numeroIdentificacion, null, null
    ).subscribe(
      (resp: any) => {
        if (resp.estado === 'OK') {
          if (resp.resultado.length === 1) {
            this.usuario = new Usuario();
            this.usuario.idUsuario = resp.resultado[0].id_usuarios_externos;
            this.usuario.numeroIdentificacion = resp.resultado[0].numero_identificacion;
            this.usuario.nombres = resp.resultado[0].nombres;
            // Asignación según origen/destino
            if (esOrigen) {
              this.idUsuarioOrigen = this.usuario.idUsuario;
              this.numeroIdentificacionOrigen = this.usuario.numeroIdentificacion;
              this.nombresUsuarioOrigen = this.usuario.nombres;
              this.buscarAretesGeneral();
            } else {
              this.idUsuarioDestino = this.usuario.idUsuario;
              this.numeroIdentificacionDestino = this.usuario.numeroIdentificacion;
              this.nombresUsuarioDestino = this.usuario.nombres;
              this.formulario.controls.inputNombresDestinatario.setValue(this.usuario.nombres);
              Swal.close();
            }
          } else {
            Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          }
        } else {
          Swal.fire('Error', resp.mensaje, 'error');
        }
      },
      (error) => {
        Swal.fire('Error', 'Ocurrió un error al buscar el usuario', 'error');
      }
    );
  }

  //**** Buscar aretes oficiales no asignados ****/
  buscarAretesIndividual() {
    // Si ya tenemos datos, filtrar en la lista existente
    if (this.aretesCargados) {
      const termino = this.formulario.value.inputCodigoOficial?.toUpperCase().trim();
      this.listaAretesOrigen = termino
        ? this.listaAretesOrigenBackup.filter(a => a.codigoOficial.includes(termino))
        : [...this.listaAretesOrigenBackup];
      return;
    }
  }

  // Realiza la búsqueda a través del servicio
  buscarAretesGeneral() {
    this.resetScroll();
    this.vaciarListasAretes();
    this.formulario.controls.inputCodigoOficial.setValue(null);

    const parametros: any = {
      idEstadosAretesBovinos: 2, // Aretes sin asignar
      origen: 1, // solo extemporáneos
      idUsuarioActual: this.idUsuarioOrigen
    };

    this.mostrarCargando('Buscando aretes oficiales...');

    this.aretesBovinosService.obtenerAretes(parametros)
      .subscribe((resultado: any) => {
        Swal.close();

        if (!resultado?.resultado || resultado.resultado.length === 0) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          this.aretesCargados = false;
          return;
        }

        this.listaAretesOrigen = resultado.resultado;
        this.listaAretesOrigenBackup = [...resultado.resultado];
        this.aretesCargados = true;

      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener el listado de aretes oficiales. Intente nuevamente más tarde: ' + error, 'error');
        this.aretesCargados = false;
      });
  }

  //**** Agregar aretes a la lista de destino ****/
  agregarArete(id: number) {
    const idNum = Number(id);
    if (!this.formulario.value.inputNombresDestinatario) {
      Swal.fire('¡Atención!', 'Por favor, ingrese un destinatario', 'info');
      return;
    }
    // Encontrar y mover el arete
    const areteIndex = this.listaAretesOrigen.findIndex(
      item => Number(item.idAretesBovinos) === idNum
    );

    if (areteIndex >= 0) {
      // Mover a lista destino
      this.listaAretesDestino.unshift(this.listaAretesOrigen[areteIndex]);
      // Eliminar de origen y backup
      this.listaAretesOrigen.splice(areteIndex, 1);

      if (this.listaAretesOrigenBackup) {
        const backupIndex = this.listaAretesOrigenBackup.findIndex(
          item => Number(item.idAretesBovinos) === idNum
        );
        if (backupIndex >= 0) {
          this.listaAretesOrigenBackup.splice(backupIndex, 1);
        }
      }
    }
    // Si la lista queda vacía, borrar.
    if (this.listaAretesOrigen.length === 0) {
      this.formulario.controls.inputCodigoOficial.setValue(null);
      this.buscarAretesIndividual();
    }
  }

  //**** Quitar aretes a la lista de destino ****/
  quitarArete(id: number) {
    const idNum = Number(id);
    const index = this.listaAretesDestino.findIndex(item =>
      Number(item.idAretesBovinos) === idNum
    );

    if (index >= 0) {
      const [arete] = this.listaAretesDestino.splice(index, 1);
      this.listaAretesOrigen.unshift(arete);
      // Agregar al backup si no existe
      if (this.listaAretesOrigenBackup &&
        !this.listaAretesOrigenBackup.some(item =>
          Number(item.idAretesBovinos) === idNum)) {
        this.listaAretesOrigenBackup.unshift(arete);
        this.buscarAretesIndividual();
      }
    }
  }

  //**** Registra la transferencia de los aretes ****//
  registrarTransferencia() {
    this.formulario.markAllAsTouched();
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (this.idUsuarioOrigen == null) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese identificación del usuario origen</li>";
    }

    if (this.idUsuarioDestino == null) {
      formularioInvalido = true;
      mensaje += "<li>Ingrese identificación del usuario de destino</li>";
    }

    if (this.listaAretesDestino.length < 1) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione al menos un arete</li>";
    }

    if (this.formulario.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    const aretesTransferir = this.listaAretesDestino.map((arete: AreteBovino) => {
      const areteActualizado = new AreteBovino();
      areteActualizado.idAretesBovinos = arete.idAretesBovinos;
      areteActualizado.idUsuarioActual = this.idUsuarioDestino;
      return areteActualizado;
    });

    Swal.fire({
      title: '¿Está seguro de transferir estos aretes?',
      html: `<br><div style="text-align: left;">
        <i class="fas fa-tags"></i> <b>Cantidad:</b> ${this.listaAretesDestino.length}<br>
        <i class="fas fa-user-circle"></i> <b>Origen:</b><span style="font-size: 0.9em;"> ${this.formatTitleCase(this.nombresUsuarioOrigen)}</span><br>
        <i class="fas fa-user-plus"></i> <b>Destino:</b><span style="font-size: 0.9em;"> ${this.formatTitleCase(this.nombresUsuarioDestino)}</span><br>
        <br>
        </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, transferir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Registrando transferencia...');
        this.aretesBovinosService.transferirAretes(aretesTransferir).subscribe({
          next: (resp: any) => {
            Swal.fire('¡Éxito!', 'Transferencia realizada correctamente', 'success')
              .then(() => {
                this.limpiarFormulario();
              });
          },
          error: (error) => {
            Swal.fire('Error', 'Ocurrió un error al comunicarse con el servidor: ' + error, 'error');
          }
        });
      }
    });
  }

  // Cambiar cadenas a tipo título (primera letra mayúscula)
  private formatTitleCase(text: string): string {
    return text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  //**** Limpiar listas de aretes ****//
  vaciarListasAretes() {
    this.listaAretesOrigen = [];
    this.listaAretesOrigenBackup = [];
    this.listaAretesDestino = [];
  }

  //**** Limpiar datos usuario origen ****//
  limpiarDatosUsuarioOrigen() {
    this.vaciarListasAretes();
    this.formulario.controls.inputCodigoOficial.setValue(null);
    this.idUsuarioOrigen = null;
  }

  //**** Limpiar datos usuario destino ****//
  limpiarDatosUsuarioDestino() {
    // Limpiar datos del formulario
    this.formulario.controls.inputNombresDestinatario.setValue(null);
    this.idUsuarioDestino = null;
    // Si no hay aretes en destino, no hacer nada
    if (this.listaAretesDestino.length === 0) return;
    // Devolver todos los aretes al origen
    this.listaAretesOrigen.unshift(...this.listaAretesDestino.reverse());
    // Actualizar backup (solo los que no existan)
    if (this.listaAretesOrigenBackup) {
      const nuevosAretes = this.listaAretesDestino.filter(destinoArete =>
        !this.listaAretesOrigenBackup.some(backupArete =>
          Number(backupArete.idAretesBovinos) === Number(destinoArete.idAretesBovinos)
        )
      );
      this.listaAretesOrigenBackup.unshift(...nuevosAretes);
    }

    this.listaAretesDestino = [];
    this.buscarAretesIndividual();
  }

  //**** Limpiar lista de aretes ****//
  limpiarFormulario() {
    this.formulario.controls.inputIdentificacionOrigen.setValue(null);
    this.formulario.controls.inputIdentificacionDestino.setValue(null);
    this.limpiarDatosUsuarioOrigen();
    this.limpiarDatosUsuarioDestino();
    this.vaciarListasAretes();
  }

  // Cargar mensaje del cargando
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

}
