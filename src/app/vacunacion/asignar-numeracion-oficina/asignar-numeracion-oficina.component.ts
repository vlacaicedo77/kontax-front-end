import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';
import { Oficina } from '../../modelos/oficina.modelo';
import { OperadoraVacunacion } from '../../modelos/operadora-vacunacion.modelo';
import { SecuenciaCertificado } from '../../modelos/secuencia-certificado.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { OficinaService } from '../../servicios/oficina.service';
import { OperadoraVacunacionService } from '../../servicios/operadora-vacunacion.service';
import { SecuenciaCertificadoService } from '../../servicios/secuencia-certificado.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignar-numeracion-oficina',
  templateUrl: './asignar-numeracion-oficina.component.html',
  styles: [
  ]
})
export class AsignarNumeracionOficinaComponent implements OnInit {

  formulario: FormGroup;
  listaFasesVacunaciones: FaseVacunacion[];
  oficinaOrigen: Oficina;
  oficinaProvincial: Oficina;
  //listaOperadorasEnProvincia: OperadoraVacunacion[];
  listaOficinasDeOperadora: Oficina[];
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
    if ( this.servicioUsuario.usuarioExterno ) {
      this.obtenerFasesVacunaciones();
    }
  }

  // Método que inicializa el formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_vacunacion: new FormControl(null),
      numero_inicial: new FormControl(null),
      numero_final: new FormControl(null)
    }, [
      this.requeridoOficina('oficina_vacunacion')
    ]);
  }

  /**
   * Si no se devuelve a la oficina principal, entonces es requerido la selección de la operadora destino.
   * @param nombreOficina
   */
  requeridoOficina(nombreOficina: string){
    return (formularioAsignacion: FormGroup) => {
      const valor = formularioAsignacion.controls[nombreOficina].value;
      if(this.devolverAOficina === false && valor === null){
        return { requeridoOficina: true };
      }
      return null;
    };
  }

  /**
   * Obtiene las fases de vacunaciones
   */
  obtenerFasesVacunaciones(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando fases de vacunación.',
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
      // console.log(this.listaFasesVacunaciones);
      Swal.close();
    });
  }

  /**
   * Obtenemos la oficina provincial del técnico actual
   */
  cambioFaseVacunacion(){
    this.oficinaOrigen = null;
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
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idUsuariosExternos: this.servicioUsuario.usuarioExterno.idUsuario,
      codigoOficina: 'O-POV',
      codigoEstadoRegistro: 'HAB'
    })
    .subscribe( ( oficinas: Oficina[] ) => {
      if ( oficinas.length > 0 ) {
        this.oficinaOrigen = oficinas[0];
        console.log('Oficinas de operadoras de vacunación:', this.oficinaOrigen);
        // Obtenemos las operadoras de vacunación de la provincia
        Swal.close();
        //this.obtenerOperadoraVacunacion();
        this.obtenerOficinasVacunacionOperadora();
      } else {
        Swal.fire('Error', 'No tiene ninguna oficina principal habilitada.', 'error');
      }
    });
  }

  /**
   * Oculta las operadoras a las que se les va a enviar la numeración
   * @param valor 
   */
  cambioDevolver(valor: boolean){
    this.oficinaProvincial = null;
    this.devolverAOficina = valor;
    if ( this.devolverAOficina ) {
      this.formulario.controls.oficina_vacunacion.setValue(null);
      this.obtenerOficinaProvincial();
    }
  }

  /**
   * Obtiene la oficina provincial para devolver las secuencias de los certificados.
   */
  obtenerOficinaProvincial(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de la oficina provincial de Agrocalidad.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficina.obtenerOficinas({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      idProvincia: this.oficinaOrigen.idProvincia,
      codigoOficina: 'O-PROV',
      codigoEstadoRegistro: 'HAB'
    })
    .subscribe( (oficinas: Oficina[]) => {
      if ( oficinas.length > 0 ) {
        this.oficinaProvincial = oficinas[0];
        console.log('Oficina provincial de Agrocalidad: ', this.oficinaProvincial);
        Swal.close();
      } else {
        Swal.fire('Error', 'No se encontró una oficina provincial asignada.', 'error');
      }
    });
  }

  /**
   * Obtiene las oficinas de vacunaciones de una operadora
   */
  obtenerOficinasVacunacionOperadora(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando información de las oficinas de la Operadora.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioOficina.obtenerOficinas({
      idFaseVacunacion: this.formulario.value.fase_vacunacion,
      codigoOficina: 'O-VAC',
      idOficinaSuperior: this.oficinaOrigen.idOficina
    })
    .subscribe( (oficinas: Oficina[]) => {
      this.listaOficinasDeOperadora = oficinas;
      console.log('Oficinas de operadora de vacunación: ', this.listaOficinasDeOperadora);
      Swal.close();
      if ( oficinas.length === 0 ) {
        Swal.fire('Error', 'No se encontró una oficina provincial asignada.', 'error');
      }
    });
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
    // Devolvemos a la oficina provincial de Agrocalidad
    if ( this.devolverAOficina ){
      asignarNumeracion.idOficinaDestino = this.oficinaProvincial.idOficina;
    } else {
      // Asignamos a la oficina de vacunación
      asignarNumeracion.idOficinaDestino = this.formulario.value.oficina_vacunacion;
    }
    if ( this.formulario.value.numero_inicial && this.formulario.value.numero_final ) {
      asignarNumeracion.numeroInicial = this.formulario.value.numero_inicial;
      asignarNumeracion.numeroFinal = this.formulario.value.numero_final;
    }
    if ( this.listaSecuenciasAgregadas.length > 0 ) {
      const listaFinal = [];
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
        this.listaOficinasDeOperadora = [];
        this.devolverAOficina = false;
        this.seleccionIndividual = false;
        this.oficinaOrigen = null;
        this.rango = 100;
        this.inicio = 0;
        this.fin = this.rango;
      });
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
    //this.listaSecuenciasCertificados = lista;
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
