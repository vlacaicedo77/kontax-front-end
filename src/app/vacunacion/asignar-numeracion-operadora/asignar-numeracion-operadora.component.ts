import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import Swal from 'sweetalert2';
import { Oficina } from '../../modelos/oficina.modelo';
import { OficinaService } from '../../servicios/oficina.service';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';

@Component({
  selector: 'app-asignar-numeracion-operadora',
  templateUrl: './asignar-numeracion-operadora.component.html',
  styles: [
  ]
})
export class AsignarNumeracionOperadoraComponent implements OnInit {

  formulario: FormGroup;
  listaFasesVacunaciones: FaseVacunacion[];
  oficinaOrigen: Oficina;
  listaOperadorasEnProvincia: OperadoraVacunacion[];
  listaSecuenciasCertificados: SecuenciaCertificado[];
  listaSecuenciasAgregadas: SecuenciaCertificado[];
  seleccionIndividual: boolean = false;
  devolverAOficina: boolean;
  inicio: number;
  fin: number;
  rango: number;
  certificadoBusqueda: string = '';

  constructor(
    private servicioScript: ScriptsService,
    private servicioUsuario: UsuarioService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioOficina: OficinaService,
    private servicioOperadoraVacunacion: OperadoraVacunacionService,
    private servicioSecuenciaCertificado: SecuenciaCertificadoService
  ) { 
    this.devolverAOficina = false;
  }

  ngOnInit(): void {
    this.rango = 100;
    this.inicio = 0;
    this.fin = this.rango;
    this.oficinaOrigen = null;
    this.listaSecuenciasCertificados = [];
    this.listaSecuenciasAgregadas = [];
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    if ( this.servicioUsuario.usuarioInterno ) {
      this.obtenerFasesVacunaciones();
    }
  }

  // Método que inicializa el formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      operadora_vacunacion: new FormControl(null),
      numero_inicial: new FormControl(null),
      numero_final: new FormControl(null)
    }, [
      this.requeridoOperadora('operadora_vacunacion')
    ]);
  }

  /**
   * Si no se devuelve a la oficina principal, entonces es requerido la selección de la operadora destino.
   * @param operadoraVacunacion
   */
  requeridoOperadora(operadoraVacunacion: string){
    return (formularioAsignacion: FormGroup) => {
      const valor = formularioAsignacion.controls[operadoraVacunacion].value;
      if(this.devolverAOficina === false && valor === null){
        return { requeridoOperadora: true };
      }
      return null;
    };
  }

  /**
   * Asigna la numeración a otra oficina
   */
  asignarNumeracion(){
    this.formulario.markAllAsTouched();
    console.log(this.formulario);
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
    const asignarNumeracion: any = {};
    asignarNumeracion.idFaseVacunacion = this.formulario.value.fase_vacunacion;
    asignarNumeracion.idOficina = this.oficinaOrigen.idOficina;
    if ( this.devolverAOficina ){
      asignarNumeracion.idOficinaDestino = this.oficinaOrigen.idOficinaSuperior;
    } else {
      // Contiene el identificador de la oficina principal de la operadora de vacunación.
      asignarNumeracion.idOficinaDestino = this.formulario.value.operadora_vacunacion;
    }
    if ( this.formulario.value.numero_inicial && this.formulario.value.numero_final ) {
      asignarNumeracion.numeroInicial = this.formulario.value.numero_inicial;
      asignarNumeracion.numeroFinal = this.formulario.value.numero_final;
    }
    if ( this.listaSecuenciasAgregadas.length > 0 ) {
      let listaFinal = [];
      this.listaSecuenciasAgregadas.forEach( (item: SecuenciaCertificado) => {
        const secuenciaItem = new SecuenciaCertificado();
        secuenciaItem.idSecuencia = item.idSecuencia;
        listaFinal.push(secuenciaItem);
      });
      asignarNumeracion.secuencias = listaFinal;
    }
    console.log(asignarNumeracion);
    this.servicioSecuenciaCertificado.asignarSecuenciaOficina(asignarNumeracion)
    .subscribe( (respuesta: any) => {
      Swal.fire(
        'Éxito',
        'Se asignó correctamente los datos a la oficina.',
        'success'
      ).then( () => {
        this.formulario.reset();
        this.listaSecuenciasAgregadas = [];
        this.listaSecuenciasCertificados = [];
        this.listaOperadorasEnProvincia = [];
        this.devolverAOficina = false;
        this.seleccionIndividual = false;
        this.rango = 100;
        this.inicio = 0;
        this.fin = this.rango;
      });
    });
  }

  /**
   * Obtiene las fases de vacunaciones
   */
  obtenerFasesVacunaciones(){
    Swal.fire({
      title: 'Espere...',
      text: 'Habilitando a la Operadora de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaFasesVacunaciones = [];
    this.servicioFaseVacunacion.obtenerFasesVacunacion({
      codigoEstadoDocumento: 'CRD'
    })
    .subscribe( ( fases: FaseVacunacion[]) => {
      this.listaFasesVacunaciones = fases;
      console.log(this.listaFasesVacunaciones);
      Swal.close();
    });
  }

  /**
   * Obtenemos la oficina provincial del técnico actual
   */
  cambioFaseVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la oficina asignada.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficina.obtenerOficinas({
      codigoOficina: 'O-PROV',
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idUsuariosInternos: this.servicioUsuario.usuarioInterno.idUsuario,
      codigoEstadoRegistro: 'HAB'
    })
    .subscribe( ( oficinas: Oficina[] ) => {
      if ( oficinas.length > 0 ) {
        this.oficinaOrigen = oficinas[0];
        console.log(this.oficinaOrigen);
        // Obtenemos las operadoras de vacunación de la provincia
        this.obtenerOperadoraVacunacion();
        Swal.close();
      } else {
        Swal.fire('Error','No tiene ninguna oficina asiganada','error');
      }
    });
  }

  /**
   * Obtiene las operadoraas de vacunación de la provincia
   */
  obtenerOperadoraVacunacion(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de las operadoras en provincia.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaOperadorasEnProvincia = [];
    this.servicioOperadoraVacunacion.obtenerOperadorasVacunacion({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      codigoEstadoRegistro: 'HAB',
      idProvincia: this.oficinaOrigen.idProvincia,
      codigoTipoOficina: 'O-POV'
    })
    .subscribe( (operadoras: OperadoraVacunacion[]) => {
      this.listaOperadorasEnProvincia = operadoras;
      Swal.close();
    });
  }
  /**
   * Se elecuta cuando se realiza un acambio en la selección individual
   * @param valor 
   */
  cambioSeleccionIndividual(valor: boolean){
    this.seleccionIndividual = valor;
    this.listaSecuenciasCertificados = [];
    this.inicio = 0;
    this.fin = this.rango;
    if (this.seleccionIndividual === false) {
      return;
    }
    this.obtenerSecuenciasDeProvincia();
  }

  /**
   * Obtenemos las secuencias de los certificados de la provincia
   */
  obtenerSecuenciasDeProvincia(){
    this.listaSecuenciasCertificados = [];
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
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idOficina: this.oficinaOrigen.idOficina,
      codigoEstadoSecuencia: 'CRD',
      INICIO: this.inicio,
      LIMITE: this.fin
    }).subscribe( ( secuencias: SecuenciaCertificado[]) => {
      this.listaSecuenciasCertificados = secuencias;
      Swal.close();
    });
  }

  /**
   * Navega de reversa para buscar las secuencias
   */
  anterior(){
    this.inicio = this.inicio - this.rango;
    this.fin = this.fin - this.rango;
    this.obtenerSecuenciasDeProvincia();
  }
  /**
   * Navega hacia adelante para buscar las secuencias.
   */
  siguiente(){
    this.inicio = this.inicio + this.rango;
    this.fin = this.fin + this.rango;
    this.obtenerSecuenciasDeProvincia();
  }
  /**
   * Agrega la secuencia a la lista que serán transferidos
   * @param numero 
   */
  agregar(numero: SecuenciaCertificado){
    const encontrado = this.listaSecuenciasAgregadas.find( (elemento: SecuenciaCertificado) => {
      return Number(numero.idSecuencia) === Number(elemento.idSecuencia);
    });
    const lista = this.listaSecuenciasCertificados.filter( (valor: SecuenciaCertificado) => {
      return Number(numero.idSecuencia) !== Number(valor.idSecuencia);
    });
    this.listaSecuenciasCertificados = lista;
    if ( encontrado ) {
      //Swal.fire('','El número de certificado ya se encuentra la lista');
      return;
    }
    this.listaSecuenciasAgregadas.push(numero);
  }
  /**
   * Quita una secuencia de la lista que van a ser transferidos
   * @param numero 
   */
  quitar(numero: SecuenciaCertificado){
    this.listaSecuenciasCertificados.push(numero);
    const lista = this.listaSecuenciasAgregadas.filter( (valor: SecuenciaCertificado) =>{
      return Number(valor.idSecuencia) !== Number(numero.idSecuencia);
    });
    this.listaSecuenciasAgregadas = lista;
  }

  /**
   * Oculta las operadoras a las que se les va a enviar la numeración
   * @param valor 
   */
  cambioDevolver(valor: boolean){
    this.devolverAOficina = valor;
    if ( this.devolverAOficina) {
      this.formulario.controls.operadora_vacunacion.setValue(null);
    }
    console.log('Devolver', this.devolverAOficina);
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
          idFaseVacunacion: this.formulario.value.fase_vacunacion,
          idOficina: this.oficinaOrigen.idOficina,
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
    this.obtenerSecuenciasDeProvincia();
  }

}
