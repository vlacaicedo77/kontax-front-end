import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScriptsService } from '../../servicios/scripts/scripts.service';
import { BovinoService } from '../../servicios/bovino/bovino.service';
import { Bovino } from '../../modelos/bovino.modelo';
import { Usuario } from '../../modelos/usuario.modelo';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Pais } from '../../modelos/pais.modelo';
import { Provincia } from '../../modelos/provincia.modelo';
import { Canton } from '../../modelos/canton.modelo';
import { Parroquia } from '../../modelos/parroquia.modelo';
import { Area } from '../../modelos/area.modelo';
import { Sitio } from '../../modelos/sitio.modelo';
import { PaisService } from '../../servicios/pais/pais.service';
import { ProvinciaService } from '../../servicios/provincia/provincia.service';
import { CantonService } from '../../servicios/canton/canton.service';
import { ParroquiaService } from '../../servicios/parroquia/parroquia.service';
import { SitioService } from '../../servicios/sitio/sitio.service';
import { AreaService } from '../../servicios/area/area.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TipoBaja } from '../../modelos/tipo-baja.modelo';
import { TipoBajaService } from '../../servicios/tipo-baja/tipo-baja.service';
import { BajaBovino } from '../../modelos/baja-bovino.modelo';

@Component({
  selector: 'app-baja-bovino',
  templateUrl: './baja-bovino.component.html',
  styles: []
})
export class BajaBovinoComponent implements OnInit {

  private id: number;
  public bovino: Bovino;
  public bovinoMadre?: Bovino;
  public bovinoMadreDonadora?: Bovino;
  public bovinoPadre?: Bovino;
  public usuario: Usuario;
  public pais: Pais;
  public provincia: Provincia;
  public canton: Canton;
  public parroquia: Parroquia;
  public sitio: Sitio;
  public area: Area;
  public formulario: FormGroup;
  public tiposBajas: TipoBaja[] = [];

  constructor(
    private route: ActivatedRoute,
    private scriptServicio: ScriptsService,
    private bovinoServicio: BovinoService,
    private usuarioServicio: UsuarioService,
    private paisServicio: PaisService,
    private provinciaServicio: ProvinciaService,
    private cantonServicio: CantonService,
    private parroquiaServicio: ParroquiaService,
    private sitioServicio: SitioService,
    private areaServicio: AreaService,
    private tipoBajaServicio: TipoBajaService,
    private router: Router
    ) { }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.scriptServicio.inicializarScripts();
    this.obtenerBovino(this.id);
    this.obtenerUsuario();
    this.inicializarFormulario();
    this.obtenerTiposBajas();
  }

  // Inicializar formulario
  inicializarFormulario(){
    this.formulario = new FormGroup({
      id_bovino: new FormControl(null, Validators.required),
      motivo_muerte: new FormControl(null, Validators.required),
      fecha_muerte: new FormControl(null, Validators.required),
      detalle: new FormControl(null, Validators.maxLength(1024))
    }, [ this.validarFechaMuerte('fecha_muerte')]);
    const idBovino = 'id_bovino';
    // Establecemos el identificador del bovino.
    this.formulario.controls[idBovino].setValue(this.id);
  }

  validarFechaMuerte(fechaMuerte: string){
    return (formularioBaja: FormGroup) => {
      const valorFechaMuerte = formularioBaja.controls[fechaMuerte].value;
      if (valorFechaMuerte !== null) {
        const fechaMuerteSeleccionada = new Date(valorFechaMuerte);
        const fechaActual = Date.now();
        if (fechaMuerteSeleccionada.getTime() > fechaActual) {
          return {
            validarFechaMuerte: true
          };
        }
      }
      return null;
    };
  }

  // Método para obtener los tipos de bajas
  obtenerTiposBajas(){
    this.tipoBajaServicio.obtenerTiposBajas()
    .subscribe( (respuesta: TipoBaja[]) => this.tiposBajas = respuesta);
  }

  // Método que permite obtener el bovino.
  obtenerBovino(id: number) {
    Swal.fire({
      title: 'Consultando información...',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.bovinoServicio.obtenerBovinosPorFiltro({
      idBovino: id
    })
    .subscribe( (respuesta: any) => {
      if ( respuesta.length > 0) {
        this.bovino = respuesta[0];
        this.consultarInformacionUbicacionBovino(this.bovino);
        this.consultarDatosPadreMadreBovino(this.bovino);
        Swal.close();
      }
    }, (error: HttpErrorResponse) => {
        Swal.fire('Error', error.error.mensaje, 'error');
    });
  }
  // Método que permite obtener los datos del usuario.
  obtenerUsuario(){
    if (this.usuarioServicio.usuarioInterno) {
      this.usuario = this.usuarioServicio.usuarioInterno;
    }
    if (this.usuarioServicio.usuarioExterno) {
      this.usuarioServicio.consultarUsuarioExternoId(this.usuarioServicio.usuarioExterno.idUsuario)
      .subscribe( (respuesta: any) => {
        if ( respuesta.estado === 'OK') {
          this.usuario = respuesta.resultado.find( e => true);
        }
      });
    }
  }

  consultarInformacionUbicacionBovino(bovino: Bovino){
    // Pais
    this.paisServicio.getPaises().subscribe( (paises: Pais[]) => {
      this.pais = paises.find( (pais: Pais ) => {
        return bovino.idPaisActual === pais.id_pais;
      });
    });
    // Provincia
    this.provinciaServicio.getProvinciasPorPais(bovino.idPaisActual).subscribe( (provincias: Pais[]) => {
      this.provincia = provincias.find( (provincia: Provincia) => {
        return bovino.idProvinciaActual === provincia.id_provincia;
      });
    });
    // Cantón
    this.cantonServicio.getCantonesPorProvincia(this.bovino.idProvinciaActual).subscribe( (cantones: Canton[]) => {
      this.canton = cantones.find( (canton: Canton) => {
        return bovino.idCantonActual === canton.id_canton;
      });
    });
    // Parroquia
    this.parroquiaServicio.getParroquiasPorCanton(bovino.idCantonActual).subscribe( (parroquias: Parroquia[]) => {
      this.parroquia = parroquias.find( (parroquia: Parroquia) => {
        return bovino.idParroquiaActual === parroquia.id_parroquia;
      });
    });
    // Sitio
    this.sitioServicio.filtrarSitios({
      idSitio: bovino.idSitioActual
    })
    .subscribe( (sitios: Sitio[]) => {
      this.sitio = sitios.find( (sitio: Sitio) => {
        return bovino.idSitioActual === sitio.idSitio;
      });
    });
    // Área
    this.areaServicio.obtenerAreasPorIdSitio(bovino.idSitioActual).subscribe( (areas: Area[]) => {
      this.area = areas.find( (area: Area) => {
        return bovino.idAreaActual === area.idArea;
      });
    });
  }

  consultarDatosPadreMadreBovino(bovino: Bovino) {
    // Madre
    if ( bovino.idBovinoMadre ){
      this.bovinoServicio.obtenerBovinosPorFiltro({
        idBovino: bovino.idBovinoMadre
      }).subscribe( (respuesta: any) => {
        this.bovinoMadre = respuesta[0];
      });
    }
    // Madre donadora
    if ( bovino.idBovinoMadreDonadora ) {
      this.bovinoServicio.obtenerBovinosPorFiltro({
        idBovino: bovino.idBovinoMadreDonadora
      }).subscribe( (respuesta: any) => {
        this.bovinoMadreDonadora = respuesta[0];
      });
    }
    // Padre
    if ( bovino.idBovinoPadre ) {
      this.bovinoServicio.obtenerBovinosPorFiltro({
        idBovino: bovino.idBovinoPadre
      }).subscribe( (respuesta: any) => {
        this.bovinoPadre = respuesta[0];
      });
    }

  }

  // Registra la baja del bovino
  registrarBaja(){
    this.formulario.markAsTouched();
    if (this.formulario.invalid) {
      Swal.fire('Error', 'El formulario de registro contiene errores', 'error');
      return;
    }
    Swal.fire({
      title: 'Espere...',
      text: 'Registrando la baja del bovino.',
      confirmButtonText: '',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    const bajaBovino = new BajaBovino();
    bajaBovino.idBovino = this.formulario.value.id_bovino;
    bajaBovino.idTipoBaja = this.formulario.value.motivo_muerte;
    bajaBovino.fechaMuerte = this.formulario.value.fecha_muerte;
    bajaBovino.detalle = this.formulario.value.detalle;
    bajaBovino.idProvincia = this.bovino.idProvinciaActual;
    bajaBovino.idCanton = this.bovino.idCantonActual;
    bajaBovino.idParroquia = this.bovino.idParroquiaActual;
    bajaBovino.idSitio = this.bovino.idSitioActual;
    bajaBovino.idArea = this.bovino.idAreaActual;
    bajaBovino.idProductor = this.bovino.idUsuarioActual;
    bajaBovino.usuarioGenera = this.usuario.numeroIdentificacion;
    this.bovinoServicio.registrarBajaBovino(bajaBovino)
    .subscribe( (respuesta: any) => {
      Swal.fire('Éxito', 'La baja del bovino fue registrada con éxito.', 'success').then(() => {
        this.formulario.reset();
        this.router.navigate(['catastro']);
      });
    });
  }

}