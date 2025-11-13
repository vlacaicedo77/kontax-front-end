import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { CertificadoVacunacion } from '../../modelos/certificado-vacunacion.modelo';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../servicios/usuario/usuario.service';

@Component({
  selector: 'app-certificados-vacunacion-productor',
  templateUrl: './certificados-vacunacion-productor.component.html',
  styleUrls: ['./certificados-vacunacion-productor.component.css']
})
export class CertificadosVacunacionProductorComponent implements OnInit {

  listaCertificadosUnicosVacunacion: CertificadoVacunacion[] = [];
  

  constructor(
    private servicioScript: ScriptsService,
    private servicioVisorPdf: VisorPdfService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService,
    private servicioUsuario: UsuarioService
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    if ( this.servicioUsuario.usuarioExterno ) {
      this.obtenerCertificadosVacunaciones();
    }
  }

  /**
   * Método que permite obtener los certificados de vacunación del productor
   */
  obtenerCertificadosVacunaciones(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando certificados de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoVacunacion.obtenerCertificadosVacunaciones({
      idUsuarioProductor: this.servicioUsuario.usuarioExterno.idUsuario
    })
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosUnicosVacunacion = certificados;
      Swal.close();
    });

  }
  /**
   * Descargar certificado de vacunación en PDF
   * @param id 
   */
   descargarCertificadoVacunacion(id: number){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando certificado de vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.servicioCertificadoVacunacion.obtenerPdfCertificadoUnicoVacunacion(id, false)
    .subscribe( (respuesta: any) => {
      this.servicioVisorPdf.establecerArchivoDesdeBase64( respuesta.contenido );
      this.servicioVisorPdf.abrir();
      Swal.close();
      console.log(respuesta);
    });
  }

}
