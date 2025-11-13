import { Component, OnInit } from '@angular/core';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CertificadoVacunacionService } from '../../servicios/certificado-vacunacion.service';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { FaseVacunacionService } from '../../servicios/fase-vacunacion/fase-vacunacion.service';
import { CertificadoVacunacion } from 'src/app/modelos/certificado-vacunacion.modelo';
import { PersonaOficina } from '../../modelos/persona-oficina.modelo';
import { PersonaOficinaService } from '../../servicios/persona-oficina.service';
import Swal from 'sweetalert2';
import { FaseVacunacion } from '../../modelos/fase-vacunacion.modelo';

@Component({
  selector: 'app-dosis-aplicadas-operadora',
  templateUrl: './dosis-aplicadas-operadora.component.html',
  styleUrls: ['./dosis-aplicadas-operadora.component.css']
})
export class DosisAplicadasOperadoraComponent implements OnInit {

  formularioBusqueda: FormGroup;
  listaCertificadosVacunacion: CertificadoVacunacion[] = [];
  listaCertificadosVacunacionBrigadista: CertificadoVacunacion[] = [];
  listaDigitadorasOficinas: PersonaOficina[];
  listaBrigadistasOficinas: PersonaOficina[];

  inicio: number;
  fin: number;
  rango: number;
  totalDosis: number = 0;
  listaFasesVacunaciones: FaseVacunacion[];

  constructor(
    private servicioScript: ScriptsService,
    private servicioFaseVacunacion: FaseVacunacionService,
    private servicioPersonaOficina: PersonaOficinaService,
    private usuarioServicio: UsuarioService,
    private servicioCertificadoVacunacion: CertificadoVacunacionService
    
  ) { }

  ngOnInit(): void {
    this.servicioScript.inicializarScripts();
    this.inicializarFormulario();
    this.obtenerFaseVacunacion();
  }

  /**
   * Obtenemos la página anterior
   */
   anterior(){
    this.inicio = this.inicio - this.rango;
    if(this.formularioBusqueda.value.tecnico_vacunador == '-1')
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idOficina: this.formularioBusqueda.value.oficina_vacunacion,
      fechaInicio: this.formularioBusqueda.value.fecha_inicio,
      fechaFin: this.formularioBusqueda.value.fecha_fin,
      bandera: 1,
      INICIO: this.inicio,
      LIMITE: this.fin
    })
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosVacunacion = certificados;
      console.log(this.listaCertificadosVacunacion);
      Swal.close();

      this.listaCertificadosVacunacion.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
    });

    }else
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
        idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
        idOficina: this.formularioBusqueda.value.oficina_vacunacion,
        idUsuarioBrigadista: this.formularioBusqueda.value.tecnico_vacunador,
        fechaInicio: this.formularioBusqueda.value.fecha_inicio,
        fechaFin: this.formularioBusqueda.value.fecha_fin,
        bandera: 2,
        INICIO: this.inicio,
        LIMITE: this.fin
      })
      .subscribe( ( certificados: CertificadoVacunacion[]) => {
        this.listaCertificadosVacunacionBrigadista = certificados;
        console.log(this.listaCertificadosVacunacionBrigadista);
        Swal.close();
        this.listaCertificadosVacunacionBrigadista.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
      });
    }
    /*this.obtenerCertificadosVacunacionesDosis({
      idUsuarioDigitador: this.usuarioBrigadistaActual.idUsuario,
      idFaseVacunacion: '2',
      INICIO: this.inicio,
      LIMITE: this.fin
    });*/
  }
  /**
   * Obtenemos la página siguiente
   */
  siguiente(){
    this.inicio = this.inicio - this.rango;
    if(this.formularioBusqueda.value.tecnico_vacunador == '-1')
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idOficina: this.formularioBusqueda.value.oficina_vacunacion,
      fechaInicio: this.formularioBusqueda.value.fecha_inicio,
      fechaFin: this.formularioBusqueda.value.fecha_fin,
      bandera: 1,
      INICIO: this.inicio,
      LIMITE: this.fin
    })
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosVacunacion = certificados;
      console.log(this.listaCertificadosVacunacion);
      Swal.close();

      this.listaCertificadosVacunacion.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
    });

    }else
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
        idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
        idOficina: this.formularioBusqueda.value.oficina_vacunacion,
        idUsuarioBrigadista: this.formularioBusqueda.value.tecnico_vacunador,
        fechaInicio: this.formularioBusqueda.value.fecha_inicio,
        fechaFin: this.formularioBusqueda.value.fecha_fin,
        bandera: 2,
        INICIO: this.inicio,
        LIMITE: this.fin
      })
      .subscribe( ( certificados: CertificadoVacunacion[]) => {
        this.listaCertificadosVacunacionBrigadista = certificados;
        console.log(this.listaCertificadosVacunacionBrigadista);
        Swal.close();
        this.listaCertificadosVacunacionBrigadista.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
      });
    }
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
      codigoEstadoDocumento: 'CRD'
    }).subscribe( (fases: FaseVacunacion[]) => {
      this.listaFasesVacunaciones = fases;
      Swal.close();
    });
  }

  /**
   * Buscamos las oficinas asignadas al digitador
   */
   cambioFaseVacunacion(){
    this.listaCertificadosVacunacion = [];
    this.listaCertificadosVacunacionBrigadista = [];
    this.obtenerPersonalOficina();
  }

  /**
   * Las oficinas asignadas por digitadoras
   */
   obtenerPersonalOficina(){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando Oficinas de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.listaDigitadorasOficinas = [];
    //console.log('Consultando oficinas de vacunación');
    this.servicioPersonaOficina.obtenerPersonalDeOficina({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idUsuarioExternoPersona: this.usuarioServicio.usuarioExterno.idUsuario,
      codigoTipoPersona: 'DIG'
    })
    .subscribe( (personalOficinas: PersonaOficina[]) => {
      this.listaDigitadorasOficinas = personalOficinas;
      console.log(this.listaDigitadorasOficinas);
      Swal.close();
    });
  }

  /**
   * Cambio de la oficina de vacunación
   */
   cambioOficinaVacunacion(){
    this.obtenerBrigadistas({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idOficina: this.formularioBusqueda.value.oficina_vacunacion,
      codigoTipoPersona: 'BRIG',
      estado: 1
    });
  }

  /**
   * Obtiene la lista de brigadistas asignados
   */
   obtenerBrigadistas(parametros: any){
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando brigadistas asignados a la Oficina de Vacunación.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    this.servicioPersonaOficina.obtenerPersonalDeOficina(parametros)
    .subscribe( (personalOficinas: PersonaOficina[]) => {
      this.listaBrigadistasOficinas = personalOficinas;
      Swal.close();
    });
  }
  /*cambioBrigadista(){
    this.brigadistaSeleccionado = null;
    this.listaBrigadistasOficinas.forEach( (item: PersonaOficina) => {
      if ( Number(item.idUsuarioExternoPersona) === Number(this.formulario.value.tecnico_vacunador)){
        this.brigadistaSeleccionado = item;
      }
    });
  }*/

  /**
   * Inicializa el formulario de búsqueda
   */
  inicializarFormulario(){
    this.formularioBusqueda = new FormGroup({
      fase_vacunacion: new FormControl(null, Validators.required),
      oficina_vacunacion: new FormControl(null, Validators.required),
      tecnico_vacunador: new FormControl('-1'),
      fecha_inicio: new FormControl(null, Validators.required),
      fecha_fin: new FormControl(null, Validators.required)
    });
  }

  /**
   * Buscar los certificados por los números de cédula
   */
  buscar(){
    
    this.listaCertificadosVacunacion = [];
    this.listaCertificadosVacunacionBrigadista = [];
    this.totalDosis = 0;

    let formularioInvalido = false;
    let mensaje = "El formulario contiene datos inválidos, por favor revisa lo siguiente...<ul></br>";

    if(this.formularioBusqueda.value.fase_vacunacion == null || this.formularioBusqueda.value.fase_vacunacion == ""){
    formularioInvalido = true;
    mensaje += "<li>Seleccione Fase de Vacunación</li>";
    }

    if(this.formularioBusqueda.value.oficina_vacunacion == null || this.formularioBusqueda.value.oficina_vacunacion == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione Oficina de Vacunación</li>";
    }

    if(this.formularioBusqueda.value.fecha_inicio == null || this.formularioBusqueda.value.fecha_inicio == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione Fecha de Inicio</li>";
    }

    if(this.formularioBusqueda.value.fecha_fin == null || this.formularioBusqueda.value.fecha_fin == ""){
      formularioInvalido = true;
      mensaje += "<li>Seleccione Fecha de Fin</li>";
    }

    const fechaInicio = new Date(`${this.formularioBusqueda.value.fecha_inicio} ${'00:00:00'}`);
    const fechaFin = new Date(`${this.formularioBusqueda.value.fecha_fin} ${'00:00:00'}`);
    
    if(fechaInicio > fechaFin)
    {
      formularioInvalido = true;
      mensaje += "<li>La Fecha de Inicio no debe ser mayor a la de Fin</li>";
    }

    let days = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24) )

    console.log('Días: '+ Number(days));

    if(days > 61)
    {
      formularioInvalido = true;
      mensaje += "<li>El rango de consulta no puede ser mayor 60 días</li>";
    }

    if (this.formularioBusqueda.invalid || formularioInvalido) {
      mensaje += "</ul>"
      Swal.fire('¡Advertencia!', mensaje, 'warning');
      return;
    }
    
    Swal.fire({
      title: 'Espere...',
      text: 'Consultando dosis aplicadas',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });

    if(this.formularioBusqueda.value.tecnico_vacunador == '-1')
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
      idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
      idOficina: this.formularioBusqueda.value.oficina_vacunacion,
      fechaInicio: this.formularioBusqueda.value.fecha_inicio,
      fechaFin: this.formularioBusqueda.value.fecha_fin,
      bandera: 1
    })
    .subscribe( ( certificados: CertificadoVacunacion[]) => {
      this.listaCertificadosVacunacion = certificados;
      console.log(this.listaCertificadosVacunacion);
      Swal.close();

      this.listaCertificadosVacunacion.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
    });

    }else
    {
      this.servicioCertificadoVacunacion.obtenerCertificadosVacunacionesDosis({
        idFaseVacunacion: this.formularioBusqueda.value.fase_vacunacion,
        idOficina: this.formularioBusqueda.value.oficina_vacunacion,
        idUsuarioBrigadista: this.formularioBusqueda.value.tecnico_vacunador,
        fechaInicio: this.formularioBusqueda.value.fecha_inicio,
        fechaFin: this.formularioBusqueda.value.fecha_fin,
        bandera: 2
      })
      .subscribe( ( certificados: CertificadoVacunacion[]) => {
        this.listaCertificadosVacunacionBrigadista = certificados;
        console.log(this.listaCertificadosVacunacionBrigadista);
        Swal.close();
        this.listaCertificadosVacunacionBrigadista.forEach( (itemBovino: CertificadoVacunacion) => {
          this.totalDosis+=Number(itemBovino.totalAplicado);
      });
      });
    }
  }

}
