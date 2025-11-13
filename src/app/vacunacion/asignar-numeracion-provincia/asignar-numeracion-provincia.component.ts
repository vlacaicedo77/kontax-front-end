import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import Swal from 'sweetalert2';
import { Provincia } from '../../modelos/provincia.modelo';
import { Oficina } from '../../modelos/oficina.modelo';
import { OficinaService } from '../../servicios/oficina.service';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { element } from 'protractor';

@Component({
  selector: 'app-asignar-numeracion-provincia',
  templateUrl: './asignar-numeracion-provincia.component.html',
  styles: [
  ]
})
export class AsignarNumeracionProvinciaComponent implements OnInit {

  formulario: FormGroup;
  listaFasesVacunacion: FaseVacunacion[];
  listaOficinasProvincias: Oficina[];
  listaOficinasPrincipales: Oficina[];
  listaSecuenciasCertificados: SecuenciaCertificado[];
  listaSecuenciasAgreadas: SecuenciaCertificado[] = [];
  inicio: number;
  fin: number;
  rango: number;
  seleccionIndividual:boolean = false;
  certificadoBusqueda: string = '';

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioOficina: OficinaService,
    private servicioSecuenciaCertificado: SecuenciaCertificadoService
  ) { }

  ngOnInit(): void {
    this.rango = 100;
    this.inicio = 0;
    this.fin = this.rango;
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerFaseVacunación();
  }

  // Método que permite asignar la numeración disponible al técnico provincial
  asignarNumeracion(){
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Asignando numeración.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    let asignarNumeracion: any = {};
    asignarNumeracion.idFaseVacunacion = this.formulario.value.fase;
    asignarNumeracion.idOficina = this.formulario.value.oficina_origen;
    asignarNumeracion.idOficinaDestino = this.formulario.value.oficina_destino;
    if( this.formulario.value.numero_inicial && this.formulario.value.numero_final ) {
      asignarNumeracion.numeroInicial = this.formulario.value.numero_inicial;
      asignarNumeracion.numeroFinal = this.formulario.value.numero_final;
    }
    if ( this.listaSecuenciasAgreadas.length > 0 ) {
      let listaFinal = [];
      this.listaSecuenciasAgreadas.forEach( (item: SecuenciaCertificado) => {
        let secuenciaItem = new SecuenciaCertificado();
        secuenciaItem.idSecuencia = item.idSecuencia;
        listaFinal.push(secuenciaItem);
      });
      asignarNumeracion.secuencias = listaFinal;
    }
    this.servicioSecuenciaCertificado.asignarSecuenciaOficina(asignarNumeracion)
    .subscribe( () => {
      Swal.fire(
        'Éxito',
        'Se asignó correctamente los datos a la oficina.',
        'success'
      ).then(() => {
        //this.servicioEnrutador.navigate(['lista-operadoras-vacunacion']);
        this.formulario.reset();
        this.listaSecuenciasCertificados =[];
        this.listaSecuenciasAgreadas = [];
        this.rango = 100;
        this.inicio = 0;
        this.fin = this.rango;
        this.seleccionIndividual = false;
      });
    });

  }

  // Método que inicializa el formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      fase: new FormControl(null, Validators.required),
      oficina_origen: new FormControl(null, Validators.required),
      oficina_destino: new FormControl(null, Validators.required),
      numero_inicial: new FormControl(null),
      numero_final: new FormControl(null)
    });
  }
  // Obtener las fases de vacunación activas
  obtenerFaseVacunación(){
    Swal.fire({
      title: 'Espere...',
      text: 'Habilitando a la Operadora de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( (fasesVacunacion: FaseVacunacion[]) => {
      this.listaFasesVacunacion = fasesVacunacion;
      Swal.close();
    });
  }

  

  // Se ejecuta cuando se cambia de fase
  cambioFaseVacunacion(){
    this.listaOficinasProvincias = [];
    this.listaOficinasPrincipales = [];
    this.listaSecuenciasCertificados = [];
    this.listaSecuenciasAgreadas = [];
    this.inicio = 0;
    this.fin = this.rango;
    this.seleccionIndividual = false;
    this.formulario.controls.oficina_origen.setValue(null);
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando oficinas de la fase de vacunación',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficina.obtenerOficinas({
      codigoOficina: 'O-PROV',
      idFaseVacunacion: this.formulario.value.fase
    })
    .subscribe( ( oficinas: Oficina[] ) => {
      this.listaOficinasProvincias = oficinas;
      Swal.close();
    });
    // Obtenemos la oficina central
    this.servicioOficina.obtenerOficinas({
      codigoOficina: 'O-CTRL',
      idFaseVacunacion: this.formulario.value.fase
    })
    .subscribe( ( oficinas: Oficina[] ) => {
      this.listaOficinasPrincipales = oficinas;
    });
  }

  // Se ejecuta cuando se realiza un cambio en la selección individual
  cambioSeleccionIndividual(valor: boolean){
    this.listaSecuenciasCertificados = [];
    this.listaSecuenciasAgreadas = [];
    this.seleccionIndividual = valor;
    this.inicio = 0;
    this.fin = this.rango;
    console.log('Seleccionado: ',this.seleccionIndividual);
    if(this.seleccionIndividual === false){
      return;
    }
    this.buscarCertificados();
  }

  anterior(){
    this.inicio = this.inicio - this.rango;
    this.fin = this.fin - this.rango;
    this.buscarCertificados();
  }
  siguiente(){
    this.inicio = this.inicio + this.rango;
    this.fin = this.fin + this.rango;
    this.buscarCertificados();
  }

  buscarCertificados(){
    //this.listaSecuenciasAgreadas = [];
    Swal.fire({
      title: 'Espere...',
      text: 'Buscando números de certificados',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados({
      idFaseVacunacion: this.formulario.value.fase,
      idOficina: this.formulario.value.oficina_origen,
      codigoEstadoSecuencia: 'CRD',
      INICIO: this.inicio,
      LIMITE: this.fin
    })
    .subscribe( (secuencias: SecuenciaCertificado[]) => {
      this.listaSecuenciasCertificados = secuencias;
      Swal.close();
    });
  }
  /**
   * Agrega un certificado a la lista
   * @param item 
   */
  agregar(item: SecuenciaCertificado){
    const encontrado = this.listaSecuenciasAgreadas.find( (elemento: SecuenciaCertificado) => {
      return Number(item.idSecuencia) === Number(elemento.idSecuencia);
    });
    const lista = this.listaSecuenciasCertificados.filter( (valor: SecuenciaCertificado) =>{
      return Number(valor.idSecuencia) !== Number(item.idSecuencia);
    });
    this.listaSecuenciasCertificados = lista;
    if ( encontrado ) {
      //Swal.fire('','El número de certificado ya se encuentra la lista');
      return;
    }
    this.listaSecuenciasAgreadas.push(item);
   
  }
  /**
   * Quita un certificado de la lista
   * @param item 
   */
  quitar(item: SecuenciaCertificado){
    this.listaSecuenciasCertificados.push(item);
    const lista = this.listaSecuenciasAgreadas.filter( (valor: SecuenciaCertificado) =>{
      return Number(valor.idSecuencia) !== Number(item.idSecuencia);
    });
    this.listaSecuenciasAgreadas = lista;
  }

  /**
   * Busca un certificado especificado
   */
  buscarCertificado(){
    if ( this.certificadoBusqueda ){
      if ( this.certificadoBusqueda.length > 0 ) {
        //this.listaSecuenciasAgreadas = [];
        Swal.fire({
          title: 'Espere...',
          text: 'Buscando números de certificados',
          confirmButtonText: '',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        this.servicioSecuenciaCertificado.obtenerSecuenciasCertificados({
          idFaseVacunacion: this.formulario.value.fase,
          idOficina: this.formulario.value.oficina_origen,
          codigoEstadoSecuencia: 'CRD',
          secuencia: `%${this.certificadoBusqueda}%`,
          INICIO: 0,
          LIMITE: 100
        })
        .subscribe( (secuencias: SecuenciaCertificado[]) => {
          this.listaSecuenciasCertificados = secuencias;
          Swal.close();
        });
      }
    }
  }
  /**
   * Cancela la búsqueda, limpia el campo y carga los datos iniciales
   */
  cancelarBusqueda(){
    this.certificadoBusqueda = '';
    this.buscarCertificados();
  }

}
