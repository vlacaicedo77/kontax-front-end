import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Importación de modelos.
import { CertificadoMovilizacion } from '../../modelos/certificado_movilizacion.modelo';
import { UsuarioExterno } from '../../modelos/usuario-externo.modelo';
// Importación de servicios.
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CertificadoMovilizacionService } from '../../servicios/certificado-movilizacion/certificado-movilizacion.service';

@Component({
  selector: 'app-fiscalizar-movilizacion-externo',
  templateUrl: './fiscalizar-movilizacion-externo.component.html'
})
export class FiscalizarMovilizacionExternoComponent implements OnInit {

  //**** Objeto que maneja el formulario ****/
  formularioBusqueda: FormGroup;
  //**** Listas ****/
  listaCertificadosMovilizacion: CertificadoMovilizacion[] = [];
  listaUsuariosEstablecimiento: UsuarioExterno[] = [];
  public totalAnimalesInd: any = {};
  //**** Variables auxiliares ****/
  idUsuarioEstablecimiento: number;

  constructor(
    private servicioScript: ScriptsService,
    public servicioUsuario: UsuarioService,
    private servicioCertificadoMovilizacion: CertificadoMovilizacionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.mapUsuarioEstablecimiento();
  }

  // Método que inicializa el formulario.
  inicializarFormulario() {
    this.formularioBusqueda = new FormGroup({
      inputNumeroDocumento: new FormControl(null)
    });
  }

  //**** Método para buscar el id del establecimiento al que pertenece el usuario logueado ****/
  mapUsuarioEstablecimiento() {
    this.servicioUsuario.filtrarUsuariosCca({
      idUsuariosExternos: this.servicioUsuario.usuarioExterno.idUsuario,
      bandera: 'idUsuario'
    }).subscribe(
      (usuarios: UsuarioExterno[]) => {
        if (!usuarios.length) {
          this.router.navigate(['inicio']);
          return;
        }
        this.idUsuarioEstablecimiento = usuarios[0].idUsuariosExternosCca;
      },
      (error) => {
        this.router.navigate(['inicio']);
      }
    );
  }

  // Cargar mensaje genérico
  private mostrarCargando(mensaje: string) {
    Swal.fire({
      title: 'Espere...',
      text: mensaje,
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => Swal.showLoading(),
    });
  }

  actualizarEstado(certificadoFront: any, accion: string) {
    const acciones: Record<string, { id: string, texto: string }> = {
      'Confirmar': { id: "6", texto: "confirmado" },
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
      this.servicioCertificadoMovilizacion.actualizarEstadoCertificadoMovilizacion(certificado)
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

  /**** Método para buscar animales en el detalle de un certificado de movilización ****/
  obtenerCategoriasYValoresPorIdCertificado(idCertificado: string): [string, number][] {
    const datos = this.totalAnimalesInd[idCertificado];
    if (!datos || typeof datos !== 'object') return [];
    return Object.entries(datos);

  }

  //**** Generar título para hover de botones ****/
  generarTitulo(certificado: CertificadoMovilizacion, accion: string): string {
    return `${accion} documento Nro. ${certificado.codigo}`;
  }

  /**** Método para generar el certificado de movilización en PDF ****/
  generarPDF(certificadoFront: CertificadoMovilizacion) {
    this.mostrarCargando('Generando Documento PDF...');
    const codigoCertificado = certificadoFront.codigo;
    const idCertificado = certificadoFront.idCertificadoMovilizacion;

    this.servicioCertificadoMovilizacion.obtenerPdfCertificadoMovilizacion(idCertificado)
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
    
    this.totalAnimalesInd = {};
    this.listaCertificadosMovilizacion = [];

    if (!this.formularioBusqueda.value.inputNumeroDocumento) {
      Swal.fire({
        icon: 'info',
        title: '¡Atención!',
        text: 'Ingrese un número de documento',
        confirmButtonText: 'Ok'
      });
      return;
    }

    const parametros = new CertificadoMovilizacion();

    if (this.formularioBusqueda.value.inputNumeroDocumento?.trim()) {
      this.formularioBusqueda.controls.inputNumeroDocumento.setValue(this.formularioBusqueda.value.inputNumeroDocumento.replace(/'/g, '-'));
      parametros.codigo = `%${this.formularioBusqueda.value.inputNumeroDocumento.toUpperCase().trim()}`;
    }

    this.mostrarCargando('Buscando certificados de movilización...');
    this.servicioCertificadoMovilizacion.obtenerCertificadosMovilizacion(parametros)
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
              if (!this.totalAnimalesInd[idCertificado][categoria]) {
                this.totalAnimalesInd[idCertificado][categoria] = 0;
              }

              this.totalAnimalesInd[idCertificado][categoria]++;// Incrementa el contador de la categoría
              this.totalAnimalesInd[idCertificado].Total++; // Incrementa el total del certificado
            });
          });

          for (const certificadoId in this.totalAnimalesInd) {
            if (this.totalAnimalesInd[certificadoId].Total !== undefined) {
              const totalValue = this.totalAnimalesInd[certificadoId].Total;
              delete this.totalAnimalesInd[certificadoId].Total;
              this.totalAnimalesInd[certificadoId] = {
                ...this.totalAnimalesInd[certificadoId],
                Total: totalValue,
              };
            }
          }
          Swal.close();
        } else {
          Swal.fire('¡Atención!', 'La búsqueda no ha generado resultados', 'info');
        }
      });
  }

  //**** Condición para habilitar el botón Autorizar ****/
  mostrarBotonAutorizar(certificado: any): boolean {
    return this.idUsuarioEstablecimiento === certificado.idProductor
      && certificado.codigoEstadoDocumento === 'ER';
  }

  //**** Condición para habilitar el botón Confirmar ****/
  mostrarBotonConfirmar(certificado: any): boolean {
    return this.idUsuarioEstablecimiento === certificado.idPropietarioSitioDestino
      && ['G', 'ET'].includes(certificado.codigoEstadoDocumento);
  }

  //**** Condición para habilitar el botón Anular ****/
  mostrarBotonAnular(certificado: any): boolean {
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

  //**** Limpiar lista de certificados ****//
  limpiarLista() {
    this.listaCertificadosMovilizacion = [];
  }

}
