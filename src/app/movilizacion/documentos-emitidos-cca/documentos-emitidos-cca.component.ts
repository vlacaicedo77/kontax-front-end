import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, NavigationStart } from '@angular/router';
// Importación de modelos.
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
import { Area } from '../../modelos/area.modelo';
import { EstadoDocumento } from '../../modelos/estado-documento.modelo';
// Importación de servicios.
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';
import { AreaService } from '../../servicios/area/area.service';
import { ScriptsService } from 'src/app/servicios/scripts/scripts.service';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';
import { EstadoDocumentoService } from 'src/app/servicios/estado-documento/estado-documento.service';

@Component({
  selector: 'app-documentos-emitidos-cca',
  templateUrl: './documentos-emitidos-cca.component.html',
  styleUrls: ['./documentos-emitidos-cca.component.css']
})
export class DocumentosEmitidosCcaComponent implements OnInit {

  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  //**** Listas ****/
  totalAnimalesInd: any = {};
  listaAreasOrigen?: Area[] = [];
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaEstadosDocumentos = [];
  //**** Variables auxiliares ****/
  idUsuarioEstablecimiento: number;
  banderaFiscaliza: boolean = false;
  //**** Propiedades para paginación ****/
  inicio: number;
  fin: number;
  rango: number;

  constructor(
    private scriptSerivicio: ScriptsService,
    private areaServicio: AreaService,
    public usuarioServicio: UsuarioService,
    private certificadoMovilizacionServicio: CertificadoMovilizacionService,
    private estadoDocumentoServicio: EstadoDocumentoService,
    private router: Router
  ) {
    this.inicializarFormulario();
    this.inicio = 0;
    this.rango = 100;
    this.fin = this.rango;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.resetScroll();
      }
    });

  }

  ngOnInit() {
    this.scriptSerivicio.inicializarScripts();
    this.inicializarFormulario();
    this.mapUsuarioEstablecimiento();
    this.obtenerEstadosDocumentos();
  }

  // Método que inicializa el formulario.
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputIdArea: new FormControl(null, Validators.required),
      inputIdEstadoDocumento: new FormControl('-1'),
      inputNumeroDocumento: new FormControl('')
    });
  }

  // Método para resetear el scroll
  resetScroll() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }

  //**** Método para buscar el id del establecimiento al que pertenece el usuario logueado ****/
  mapUsuarioEstablecimiento() {
    this.usuarioServicio.filtrarUsuariosCca({
      idUsuariosExternos: this.usuarioServicio.usuarioExterno.idUsuario,
      bandera: 'idUsuario'
    }).subscribe(
      (usuarios: UsuarioExterno[]) => {
        if (!usuarios.length) {
          this.banderaFiscaliza = false;
          this.idUsuarioEstablecimiento = this.usuarioServicio.usuarioExterno.idUsuario;
        } else {
          this.banderaFiscaliza = true;
          this.idUsuarioEstablecimiento = usuarios[0].idUsuariosExternosCca;
        }
        this.obtenerCentrosConcentracionAnimales();
      },
      (error) => {
        this.router.navigate(['inicio']);
      }
    );
  }

  //**** Desplazar al inicio de la página ****/
  desplazarAlInicio() {
    setTimeout(() => {
      document.documentElement.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  //**** Obtener estados de documentos ****//
  obtenerEstadosDocumentos() {
    this.estadoDocumentoServicio.obtenerEstadosDocumentos()
      .subscribe((estadoDocumento: EstadoDocumento[]) => {
        this.listaEstadosDocumentos = estadoDocumento.filter((item: EstadoDocumento) => {
          return item.grupo === 'CMV';
        });
        Swal.close();
      });
  }

  //**** Limpiar lista de certificados de movilización al cambiar el número de la caja de texto ****//
  limpiarNumeroDocumento() {
    this.listaCertificadosMovilizacion = [];
  }

  //**** Obtener centros de concentración de animales ****/
  obtenerCentrosConcentracionAnimales() {
    //Parámetros
    const parametros: Area = {
      idUsuariosExternos: this.idUsuarioEstablecimiento,
      codigoEstadoSitio: 'AC', //solo sitios en estado ACTIVO
      estado: 1
    };

    this.areaServicio.obtenerAreasPorFiltro(parametros)
      .subscribe((areas: Area[]) => {
        this.listaAreasOrigen = areas.filter((item: any) => {
          return item.codigoTipoArea === 'fer_com' || item.codigoTipoArea === 'fer_exp' || item.codigoTipoArea === 'cen_hos'; // solo cca
        });
        Swal.close();
      });
  }

  /**** Método para generar el certificado de movilización en PDF ****/
  generarPDF(certificadoFront: CertificadoMovilizacion) {
    this.mostrarCargando('Generando Documento PDF...');
    const codigoCertificado = certificadoFront.codigo;
    const idCertificado = certificadoFront.idCertificadoMovilizacion;

    this.certificadoMovilizacionServicio.obtenerPdfCertificadoMovilizacion(idCertificado)
      .subscribe({
        next: (resp: any) => {
          Swal.close();
          // Convertir base64 a Blob
          const byteCharacters = atob(resp.contenido);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);
          Swal.fire({
            title: `${codigoCertificado}`,
            html: 'Documento generado con éxito.<br><br><b>Seleccione una opción:</b>',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#ffc107',
            confirmButtonText: '<i class="fas fa-file-pdf"></i> Abrir PDF',
            cancelButtonText: '<i class="fas fa-download" style="color: black;"></i> <span style="color: black;">Descargar</span>',
            focusCancel: true,
            allowEscapeKey: true,
            allowOutsideClick: true,
            preConfirm: () => {
              // Abrir PDF y cerrar el diálogo inmediatamente
              const newWindow = window.open(pdfUrl, '_blank');
              if (!newWindow || newWindow.closed) {
                Swal.showValidationMessage('El navegador bloqueó la ventana. Por favor habilite Pop-Ups.');
              }
            }
          }).then((result) => {
            if (result.isConfirmed) {
              // El usuario hizo clic en "Abrir PDF"
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Descargar PDF
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = codigoCertificado + '.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            // Liberar memoria
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
          });
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Error', 'No se pudo obtener el documento PDF: ' + err, 'error');
        }
      });
  }

  //**** Método para buscar certificados de movilización ****/
  buscarCertificado() {

    this.resetScroll();
    this.totalAnimalesInd = {};
    this.listaCertificadosMovilizacion = [];

    if (this.formularioBusqueda.value.inputIdArea) {
      const parametros = new CertificadoMovilizacion();
      parametros.idAreaOrigen = this.formularioBusqueda.value.inputIdArea;
      parametros.idProductor = this.idUsuarioEstablecimiento;

      if (this.formularioBusqueda.value.inputIdEstadoDocumento !== "-1" && this.formularioBusqueda.value.inputIdEstadoDocumento !== null) {
        parametros.idEstadoDocumento = this.formularioBusqueda.value.inputIdEstadoDocumento;
      }
      if (this.formularioBusqueda.value.inputNumeroDocumento?.trim()) {
        this.formularioBusqueda.controls.inputNumeroDocumento.setValue(this.formularioBusqueda.value.inputNumeroDocumento.replace(/'/g, '-'));
        parametros.codigo = `%${this.formularioBusqueda.value.inputNumeroDocumento.toUpperCase().trim()}`;
      }

      parametros.INICIO = this.inicio;
      parametros.LIMITE = this.fin;
      this.mostrarCargando('Buscando certificados de movilización...');
      this.certificadoMovilizacionServicio.obtenerCertificadosMovilizacion(parametros)
        .subscribe((certificados: CertificadoMovilizacion[]) => {

          this.listaCertificadosMovilizacion = certificados;

          if (this.listaCertificadosMovilizacion.length > 0) {
            certificados.forEach((certificado: any) => {
              const idCertificado = certificado.idCertificadoMovilizacion;
              if (!this.totalAnimalesInd[idCertificado]) {
                this.totalAnimalesInd[idCertificado] = { Total: 0 };
              }

              if (!this.totalAnimalesInd[idCertificado]) {
                this.totalAnimalesInd[idCertificado] = {};
              }

              // Procesar los detalles del certificado
              certificado.detalles.forEach((detalle: any) => {
                let categoria = detalle.nombreCategoriaBovino;

                // Si la categoría es null, asignar un nombre basado en sexo y taxonomía
                if (!categoria) {
                  if (detalle.codigoTaxonomia === "bubalus_bubalis") {
                    categoria = detalle.codigoSexoBovino === "macho" ? "Búfalo M" : "Búfalo H";
                  } else {
                    categoria = "Indefinido";
                  }
                }

                // Si no existe la categoría en este certificado, inicialízala
                if (!this.totalAnimalesInd[idCertificado][categoria]) {
                  this.totalAnimalesInd[idCertificado][categoria] = 0;
                }

                this.totalAnimalesInd[idCertificado][categoria]++;// Incrementa el contador de la categoría
                this.totalAnimalesInd[idCertificado].Total++; // Incrementa el total del certificado
              });
            });

            for (const certificadoId in this.totalAnimalesInd) {
              if (this.totalAnimalesInd[certificadoId].Total !== undefined) {
                // Extraer el valor de 'total'
                const totalValue = this.totalAnimalesInd[certificadoId].Total;

                // Eliminar la clave 'Total' del objeto
                delete this.totalAnimalesInd[certificadoId].Total;

                // Agregar 'Total' al final del objeto
                this.totalAnimalesInd[certificadoId] = {
                  ...this.totalAnimalesInd[certificadoId], // Otras categorías
                  Total: totalValue, // Agregar 'total' al final
                };
              }
            }
            Swal.close();
          } else {
            Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
          }
        });
    } else {
      Swal.fire('¡Atención!', 'Seleccione un sitio de origen para realizar la búsqueda.', 'warning');
    }

  }

  /**** Método que busca certificados de acuerdo al estado del documento ****/
  cambioEstado() {
    this.formularioBusqueda.controls.inputNumeroDocumento.setValue('');
    this.buscarCertificado();
  }

  /**** Método para buscar animales en el detalle de un certificado de movilización ****/
  obtenerCategoriasYValoresPorIdCertificado(idCertificado: string): [string, number][] {
    const datos = this.totalAnimalesInd[idCertificado];
    if (!datos || typeof datos !== 'object') return [];
    return Object.entries(datos);

  }

  //**** Visualizar el formulario para llenado de datos ****/
  accionNuevoBoton() {
    //this.formularioVisible = true;
    this.router.navigate(['crear-documento-movilizacion-cca']);
  }

  //**** Método que permite cargar los sitios de origen ****/
  cambioSitio() {
    //Reset variables y valores residuales
    this.formularioBusqueda.controls.inputIdEstadoDocumento.setValue('-1');
    this.formularioBusqueda.controls.inputNumeroDocumento.setValue('');
    this.buscarCertificado();
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

  //**** Generar título para hover de botones ****/
  generarTitulo(certificado: CertificadoMovilizacion, accion: string): string {
    return `${accion} documento Nro. ${certificado.codigo}`;
  }

  //**** Condición para habilitar el botón Autorizar ****/
  mostrarBotonAutorizar(certificado: any): boolean {
    // Verificar si el usuario está autorizado a fiscalizar
    if (!this.banderaFiscaliza) {
      return false;
    }

    return this.idUsuarioEstablecimiento === certificado.idProductor
      && certificado.codigoEstadoDocumento === 'ER';
  }

  //**** Condición para habilitar el botón Anular ****/
  mostrarBotonAnular(certificado: any): boolean {
    // Verificar si el usuario está autorizado a fiscalizar
    if (!this.banderaFiscaliza) {
      return false;
    }
    // Si es centro de faenamiento y el usuario es el propietario, NO mostrar el botón
    if (certificado.codigoTiposAreasDestino === 'cen_faen' &&
      this.idUsuarioEstablecimiento === certificado.idPropietarioSitioDestino) {
      return false;
    }
    // Usuario autorizado: productor o propietario del sitio destino
    const usuarioAutorizado =
      this.idUsuarioEstablecimiento === certificado.idProductor ||
      this.idUsuarioEstablecimiento === certificado.idPropietarioSitioDestino;
    // Estados válidos: documento no está Anulado ('A') ni Confirmado ('C')
    const estadoValido =
      certificado.codigoEstadoDocumento !== 'A' &&
      certificado.codigoEstadoDocumento !== 'C';

    return usuarioAutorizado && estadoValido;
  }

  actualizarEstado(certificadoFront: any, accion: string) {
    const acciones: Record<string, { id: string, texto: string }> = {
      'Autorizar': { id: "7", texto: "autorizado" },
      'Anular': { id: "9", texto: "anulado" }
    };

    if (!acciones[accion]) return;

    const { id: idEstado, texto: accionTexto } = acciones[accion];
    const certificado = {
      idCertificadoMovilizacion: certificadoFront.idCertificadoMovilizacion,
      idEstadoDocumento: idEstado
    };

    Swal.fire({
      title: `¿${accion} este documento?`,
      html: `<b>CZPM-M Nro.</b> &rarr; <b>${certificadoFront.codigo}</b>
            <br><br>¡Esta acción no podrá revertirse!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `¡Sí, ${accion.toLowerCase()}!`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.mostrarCargando(`${accion} documento...`);
      this.certificadoMovilizacionServicio.actualizarEstadoCertificadoMovilizacion(certificado)
        .subscribe({
          next: () => {
            Swal.fire({
              title: 'Éxito',
              html: `¡Documento ${accionTexto} con éxito!
                            <br><br><b>CZPM-M Nro.</b> &rarr; 
                            <b>${certificadoFront.codigo}</b>`,
              icon: 'success'
            }).then(() => {
              this.listaCertificadosMovilizacion = [];
              this.formularioBusqueda.controls.inputNumeroDocumento.setValue(null);
              // Enfocar el input inputNumeroDocumento
              const inputElement = document.getElementById('inputNumeroDocumento') as HTMLInputElement;
              if (inputElement) {
                inputElement.focus();
              }
            });
          },
          error: () => {
            Swal.fire('Error', `Ocurrió un error al ${accion.toLowerCase()} el documento`, 'error');
          }
        });
    });
  }

}
