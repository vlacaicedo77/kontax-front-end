import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { VisorPdfService } from '../../general/visor-pdf/servicio/visor-pdf.service';
import { CertificadoVacunacion } from 'src/app/modelos/certificado-vacunacion.modelo';
import Swal from 'sweetalert2';
import { AnimalCertificado } from '../../modelos/animal-certificado.modelo';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';

@Component({
  selector: 'app-predios-vacunados-operadora',
  templateUrl: './predios-vacunados-operadora.component.html',
  styleUrls: ['./predios-vacunados-operadora.component.css']
})
export class PrediosVacunadosOperadoraComponent implements OnInit {

  formularioBusqueda: FormGroup;
  formularioDetalleCertificado: FormGroup;
  listaCertificadosVacunacion: CertificadoVacunacion[] = [];
  op: number = 0;
  listaFasesVacunaciones: FaseVacunacion[];

  tipoCUV = false;
  //tipoConsultaSeleccionada = false;
  secuenciaNum: string = '';
  idSecuencia: number = 0;

  constructor(
    private servicioScript: ScriptsService,
    private servicioVisorPdf: VisorPdfService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private usuarioServicio: UsuarioService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService
    
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerFaseVacunacion();
    this.formularioBusqueda.controls.inputTipoConsulta.setValue('cedula');
  }

  /**
   * Obtiene las fases de vacunación habilitadas.
   */
   obtenerFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Fases de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaFasesVacunaciones = [];
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      
    }).subscribe( (fases: FaseVacunacion[]) => {
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Buscamos las oficinas asignadas al digitador
   */
   cambioFaseVacunacion(){
    this.op = 0;
    this.limpiarDatos();
    this.formularioBusqueda.controls.certificado.reset();
    this.listaCertificadosVacunacion = [];
  }

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormulario(){
    this.formularioBusqueda = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      identificacion: new FormControl(null),
      numero_cuv: new FormControl(null),
      certificado: new FormControl(null),
      inputTipoConsulta: new FormControl(null, [Validators.required])
    });
    this.formularioDetalleCertificado = new FormGroup({
      id_certificado: new FormControl(''),
      secuencia: new FormControl(''),
      fecha: new FormControl(''),
      predio: new FormControl(''),
      productor: new FormControl(''),
      provincia: new FormControl(''),
      canton: new FormControl(''),
      parroquia: new FormControl(''),
      sitio_via: new FormControl(''),
      operadora: new FormControl(''),
      oficina: new FormControl(''),
      brigadista: new FormControl(''),
      lote: new FormControl(''),
      terneras: new FormControl(0),
      terneros: new FormControl(0),
      vaconas: new FormControl(0),
      toretes: new FormControl(0),
      vacas: new FormControl(0),
      toros: new FormControl(0),
      bufalos_hembras: new FormControl(0),
      bufalos_machos: new FormControl(0),
    });
  }

  cambiarTipoConsulta()
  {
    this.op = 0;
    this.limpiarDatos();
    this.formularioBusqueda.controls.certificado.reset();
    this.formularioBusqueda.controls.fase_vacunacion.reset();
    this.formularioBusqueda.controls.numero_cuv.setValue('');
    this.formularioBusqueda.controls.identificacion.setValue('');
    this.listaCertificadosVacunacion = [];

    if(this.formularioBusqueda.value.inputTipoConsulta == "cedula")
    {
      //this.tipoConsultaSeleccionada = true;
      this.tipoCUV = false;
    }
    else //Tipo CUV
    {
      //this.tipoConsultaSeleccionada = true;
      this.tipoCUV = true;
    }
  }

  /**
   * Buscar los certificados por los números de cédula
   */
  buscar(){
    this.op = 0;
    this.formularioBusqueda.controls.certificado.reset();
    this.limpiarDatos();
    
    this.listaCertificadosVacunacion = [];

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formularioBusqueda.value.fase_vacunacion == null || this.formularioBusqueda.value.fase_vacunacion == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione Fase de Vacunación</li>";
    }
    if(!this.tipoCUV){
    if(this.formularioBusqueda.value.identificacion == null || this.formularioBusqueda.value.identificacion == ""){
      formularioInvalido = true;
      mensaje += "<li>Ingrese número de identificación</li>";
      }
    }

    if(this.tipoCUV){
      if(this.formularioBusqueda.value.numero_cuv == null || this.formularioBusqueda.value.numero_cuv == ""){
        formularioInvalido = true;
        mensaje += "<li>Ingrese número de CUV</li>";
        }
      }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }
    
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando predios del productor.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    if(!this.tipoCUV)
    {
    this.servicioCertificadoVacunacion.obtenerCertificadosVacunaciones({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      numeroIdentificacionProductor: this.formularioBusqueda.value.identificacion,
      idUsuarioDigitador: this.usuarioServicio.usuarioExterno.idUsuario
    })
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosVacunacion = certificados;
      console.log(this.listaCertificadosVacunacion);
      Swal.close();
    });
    }else
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunaciones({
        idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
        idUsuarioDigitador: this.usuarioServicio.usuarioExterno.idUsuario,
        secuencia: `%${this.formularioBusqueda.value.numero_cuv}`
      })
      .subscribe( ( certificados: CertificadoVacunacion[]) => {
        this.listaCertificadosVacunacion = certificados;
        console.log(this.listaCertificadosVacunacion);
        Swal.close();
      });
    }
  }

  limpiarDatos(){
    this.formularioDetalleCertificado.controls.terneras.setValue(0);
    this.formularioDetalleCertificado.controls.terneros.setValue(0);
    this.formularioDetalleCertificado.controls.vaconas.setValue(0);
    this.formularioDetalleCertificado.controls.toretes.setValue(0);
    this.formularioDetalleCertificado.controls.vacas.setValue(0);
    this.formularioDetalleCertificado.controls.toros.setValue(0);
    this.formularioDetalleCertificado.controls.bufalos_hembras.setValue(0);
    this.formularioDetalleCertificado.controls.bufalos_machos.setValue(0);
    this.formularioDetalleCertificado.controls.predio.setValue('');
    this.formularioDetalleCertificado.controls.provincia.setValue('');
    this.formularioDetalleCertificado.controls.canton.setValue('');
    this.formularioDetalleCertificado.controls.parroquia.setValue('');
    this.formularioDetalleCertificado.controls.sitio_via.setValue('');
    this.formularioDetalleCertificado.controls.secuencia.setValue('');
    this.formularioDetalleCertificado.controls.fecha.setValue('');
    this.formularioDetalleCertificado.controls.operadora.setValue('');
    this.formularioDetalleCertificado.controls.oficina.setValue('');
    this.formularioDetalleCertificado.controls.brigadista.setValue('');
    this.formularioDetalleCertificado.controls.lote.setValue('');
    this.formularioDetalleCertificado.controls.id_certificado.setValue('');
    this.formularioDetalleCertificado.controls.productor.setValue('');
  }

  /**
   * Muestra los datos del certificado seleccionado
   */
  cambioCertificado(){
    this.op = 1;
    this.limpiarDatos();
    let certificado: CertificadoVacunacion = new CertificadoVacunacion();
    this.listaCertificadosVacunacion.forEach( (itemCertificado: CertificadoVacunacion) => {
      if ( Number(this.formularioBusqueda.value.certificado) === Number(itemCertificado.idCertificadoVacunacion) ){
        certificado = itemCertificado;
        this.formularioDetalleCertificado.controls.provincia.setValue(certificado.nombreProvinciaPredio);
        this.formularioDetalleCertificado.controls.canton.setValue(certificado.nombreCantonPredio);
        this.formularioDetalleCertificado.controls.parroquia.setValue(certificado.nombreParroquiaPredio);
        this.formularioDetalleCertificado.controls.predio.setValue(certificado.nombrePredio + ' ['+certificado.codigoSitioCuv+']');
        this.formularioDetalleCertificado.controls.sitio_via.setValue(certificado.sitioVia);
        this.formularioDetalleCertificado.controls.secuencia.setValue('['+certificado.nombreFaseVacunacion+'] '+certificado.secuencia);
        this.secuenciaNum = certificado.secuencia;
        this.idSecuencia = certificado.idSecuencia;
        this.formularioDetalleCertificado.controls.fecha.setValue(certificado.fechaVacunacion);
        this.formularioDetalleCertificado.controls.operadora.setValue('['+certificado.numeroIdentificacionUsuarioOperadora+'] '+certificado.nombresUsuarioOperadora);
        this.formularioDetalleCertificado.controls.oficina.setValue(certificado.nombreOficina);
        this.formularioDetalleCertificado.controls.brigadista.setValue('['+certificado.numeroIdentificacionBrigadista+'] '+certificado.nombresBrigadista);
        this.formularioDetalleCertificado.controls.lote.setValue(certificado.nombreLaboratorio +' '+ certificado.nombreLote);
        this.formularioDetalleCertificado.controls.id_certificado.setValue(certificado.idCertificadoVacunacion);
        this.formularioDetalleCertificado.controls.productor.setValue('['+certificado.numeroIdentificacionProductor+'] '+certificado.nombresProductor);
      }
    });
    certificado.animales.forEach( (itemAnimal: AnimalCertificado ) => {
      // Terneras
      if ( itemAnimal.codigoCategoria === 'ternera' ) {
        this.formularioDetalleCertificado.controls.terneras.setValue(itemAnimal.vacunado);
      }
      // Terneros
      if ( itemAnimal.codigoCategoria === 'ternero' ) {
        this.formularioDetalleCertificado.controls.terneros.setValue(itemAnimal.vacunado);
      }
      // Vaconas
      if ( itemAnimal.codigoCategoria === 'vacona' ) {
        this.formularioDetalleCertificado.controls.vaconas.setValue(itemAnimal.vacunado);
      }
      // Torete
      if ( itemAnimal.codigoCategoria === 'torete' ) {
        this.formularioDetalleCertificado.controls.toretes.setValue(itemAnimal.vacunado);
      }
      // Vaca
      if ( itemAnimal.codigoCategoria === 'vaca' ) {
        this.formularioDetalleCertificado.controls.vacas.setValue(itemAnimal.vacunado);
      }
      // Toro
      if ( itemAnimal.codigoCategoria === 'toro' ) {
        this.formularioDetalleCertificado.controls.toros.setValue(itemAnimal.vacunado);
      }
      // Búfalo hembra
      if ( itemAnimal.codigoTaxonomia === 'bubalus_bubalis' && itemAnimal.codigoSexo === 'hembra' ) {
        this.formularioDetalleCertificado.controls.bufalos_hembras.setValue(itemAnimal.vacunado);
      }
      // Búfalo macho
      if ( itemAnimal.codigoTaxonomia === 'bubalus_bubalis' && itemAnimal.codigoSexo === 'macho' ) {
        this.formularioDetalleCertificado.controls.bufalos_machos.setValue(itemAnimal.vacunado);
      }
    });
  }

  /**
   * Elimina un Certificado de Vacunación
   * @param idCertificadoVacunacion 
   */
   eliminarCertificadoVacunacion(id: number){
    Swal.fire({
      title: '¿Desea eliminar el Certificado de Vacunación ' +this.secuenciaNum+ '?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, continuar!',
      cancelButtonText: 'No'
    }).then( (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Espere...',
          text: 'Eliminando Certificado de Vacunación...',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioCertificadoVacunacion.eliminarCertificadoVacunacion(id)
        .subscribe( ( respuesta: any ) => {
          console.log(respuesta);
          //this.op = 0;
          //this.limpiarDatos();
          this.listaCertificadosVacunacion = [];
          this.formularioBusqueda.reset();
          this.formularioBusqueda.controls.inputTipoConsulta.setValue('cedula');
          this.cambiarTipoConsulta();
          Swal.fire(
            'Éxito',
            'Se eliminó correctamente el Certificado de Vacunación '+this.secuenciaNum,
            'success'
          )
        });
      }
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
