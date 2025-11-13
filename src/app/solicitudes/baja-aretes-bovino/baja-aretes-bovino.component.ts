import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// Importación de modelos.
import { Usuario } from 'src/app/modelos/usuario.modelo';
import { TipoBaja } from '../../modelos/tipo-baja.modelo';
import { BajaArete } from '../../modelos/baja-arete.modelo';
import { AreteBovino } from 'src/app/modelos/arete-bovino.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AretesBovinosService } from 'src/app/servicios/aretes-bovinos/aretes-bovinos.service';
import { TipoBajaService } from '../../servicios/tipo-baja/tipo-baja.service';
// Importamos scripts
import { ScriptsService } from '../../servicios/scripts/scripts.service';
@Component({
  selector: 'app-baja-aretes-bovino',
  templateUrl: './baja-aretes-bovino.component.html',
  styleUrls: ['./baja-aretes-bovino.component.css']
})
export class BajaAretesBovinoComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  formulario: FormGroup;
  //**** Cuerpo de modelos ****/
  public usuarioActual?: Usuario = null;
  public areteSeleccionado?: AreteBovino = null;
  public tiposBajas: TipoBaja[] = [];
  //**** Listas ****/
  public listaProveedoresOrdenados = [];
  public listaAretesAprobados = [];
  //**** Variables auxiliares ****/
  public idArete: number;
  formularioVisible: boolean = false; // true = Visible // false = Oculto
  revisarVisible: boolean = false; // true = Visible // false = Oculto
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private scriptServicio: ScriptsService,
    private usuarioService: UsuarioService,
    private aretesBovinosService: AretesBovinosService,
    private tipoBajaServicio: TipoBajaService
  ) {
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;
  }

  ngOnInit() {
    this.scriptServicio.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerTiposBajas();
  }

  //**** Inicializar formularios ****/
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputCodigoOficial: new FormControl(null, [Validators.maxLength(11)])
    });

    this.formulario = new FormGroup({
      inputFechaSuceso: new FormControl(null, Validators.required),
      inputIdSuceso: new FormControl(null, Validators.required),
      inputDetalle: new FormControl('', [Validators.maxLength(50)])
    });
  }


  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  // Cargar mensaje del método actualizarAnimal
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

  /**** Limpiar campos de todos los formularios, variables y listas ****/
  limpiarCamposFormulario() {
    this.formulario.controls.inputFechaSuceso.setValue(null);
    this.formulario.controls.inputIdSuceso.setValue(null);
    this.formulario.controls.inputDetalle.setValue('');
    this.formularioVisible = false;
  }

  //**** Limpiar campos del formulario de búsqueda ****/
  limpiarFormularioBuscar() {
    this.formularioBusqueda.controls.inputCodigoOficial.setValue('');
  }

  //**** Limpiar lista de aretes ****//
  limpiarLista() {
    this.listaAretesAprobados = [];
  }

  //**** Botón cancelar ****/
  botonCancelar() {
    this.limpiarCamposFormulario();
    this.limpiarFormularioBuscar();
    this.limpiarLista();
    this.desplazarAlInicio();
  }

  // Método para obtener los tipos de bajas filtrando por grupo 'ART'
  obtenerTiposBajas() {
    this.mostrarCargando('Cargando catálogos...')
    this.tipoBajaServicio.obtenerTiposBajas()
      .subscribe((respuesta: TipoBaja[]) => {
        this.tiposBajas = respuesta.filter(tipo => tipo.grupo === 'ART');
      });
    Swal.close();
  }

  //**** Método para buscar aretes oficiales no asignados ****/
  buscarAretes() {
    if (!this.formularioBusqueda.value.inputCodigoOficial) {
      Swal.fire('¡Advertencia!', 'Ingrese un número de arete oficial', 'warning');
      return;
    }
    // Limpir resultados anteriores
    this.listaAretesAprobados = [];

    const parametros: any = {
      idEstadosAretesBovinos: 2, // Aretes sin asignar
      codigoOficial: `%${this.formularioBusqueda.value.inputCodigoOficial.toUpperCase().trim()}`
    };
    // Si es usuario externo, agregamos su ID
    if (!this.usuarioService.usuarioInterno) {
      parametros.idUsuarioActual = this.usuarioService.usuarioExterno.idUsuario;
    }

    this.mostrarCargando('Buscando aretes oficiales...');
    this.aretesBovinosService.obtenerAretes(parametros)
      .subscribe((resultado: any) => {
        Swal.close();

        if (!resultado?.resultado || resultado.resultado.length === 0) {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          return;
        }

        this.listaAretesAprobados = resultado.resultado;

      }, (error) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo obtener el listado de aretes oficiales. Intente nuevamente más tarde.', 'error');
      });
  }

  //**** Método para asignar datos del arete al formulario ****/
  asignarDatosRevision(id: number) {

    this.mostrarCargando('Consultando datos del arete oficial...');
    // Buscar arete en la lista
    const arete = this.listaAretesAprobados.find(
      (item: AreteBovino) => item.idAretesBovinos === Number(id)
    );
    this.formularioVisible = true;

    if (arete) {
      // Asignar el arete encontrado a una propiedad del componente
      this.areteSeleccionado = arete;
      this.idArete = arete.idAretesBovinos;
      Swal.close();
    } else {
      // Mostrar error si el arete no fue encontrada
      Swal.fire(
        'Error',
        'Arete oficial no encontrado',
        'error'
      );
    }
  }

  //**** Generar título para hover del botón Asignar arete oficial ****/
  generarTitulo(arete: any): string {
    const codigoOficial = arete?.codigoOficial;
    return `Dar de baja al arete ${codigoOficial}`;
  }

  //**** Método para registrar la baja del arete oficial ****/
  registrarBaja(id: number) {
    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if (!this.formulario.value.inputFechaSuceso) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione una fecha de suceso</li>";
    }

    const fechaSuceso = new Date(this.formulario.value.inputFechaSuceso);
    const fechaActual = new Date(); // Fecha actual

    // Validar que la fecha de muerte no sea mayor que la fecha actual
    if (fechaSuceso > fechaActual) {
      formularioInvalido = true;
      mensaje += `<li>La fecha de suceso seleccionada no puede superar la fecha actual</li>`;
      this.formulario.controls.inputFechaSuceso.setValue(null); //
    }

    if (!this.formulario.value.inputIdSuceso) {
      formularioInvalido = true;
      mensaje += "<li>Seleccione un suceso</li>";
    }

    if (formularioInvalido) {
      mensaje += "</ul>";
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }

    const motivo = this.tiposBajas.find(
      (item: TipoBaja) => item.idTipoBaja === Number(this.formulario.value.inputIdSuceso)
    );

    const arete = new BajaArete();
    arete.idAretesBovinos = id;
    arete.idProductor = this.areteSeleccionado.idUsuarioActual;
    arete.idTipoBaja = this.formulario.value.inputIdSuceso;
    arete.fechaSuceso = fechaSuceso.toISOString().substring(0, 10);
    if (this.formulario.value.inputDetalle) {
      arete.detalle = this.formulario.value.inputDetalle.toLocaleLowerCase();
    } else {
      arete.detalle = motivo.nombre.toLocaleLowerCase();
    }
    // Confirmación del usuario
    Swal.fire({
      title: '¿Estás seguro de dar de baja este arete oficial?',
      html: `<br><b>[ ${this.areteSeleccionado.codigoOficial} ]</b>
          <br><br>
          Atención: Una vez dado de baja, el proceso será irreversible. Verifique la información antes de continuar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarCargando('Dando de baja al arete oficial...');
        this.aretesBovinosService.registrarBajaArete(arete).subscribe({
          next: (resp: any) => {
            Swal.close();
            if (resp && resp.idBajaArete) {
              Swal.fire({
                title: 'Éxito',
                html: `¡Arete oficial dado de baja con éxito!
                <br><br><b>[ ${this.areteSeleccionado.codigoOficial} ]</b>`,
                icon: 'success'
              }).then(() => {
                this.botonCancelar();
              });
            } else {
              // Respuesta inesperada
              const errorMsg = resp?.mensaje ||
                (resp.idBajaArete === undefined ? 'No se recibió confirmación del servidor' : 'Operación completada con observaciones');
              Swal.fire({
                title: 'Advertencia',
                html: errorMsg,
                icon: 'warning'
              });
            }
          },
          error: (error) => {
            Swal.close();
            Swal.fire({
              title: 'Error',
              html: `No se pudo completar la operación:<br>
                  <small>${error.error?.message || error.message || 'Error desconocido'}</small>`,
              icon: 'error'
            });
          }
        });
      }
    });
  }

}