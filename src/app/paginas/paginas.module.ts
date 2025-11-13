// Este módulo centraliza los componentes del directorio "paginas"
import { NgModule } from '@angular/core';

// Controles
import { CommonModule } from '@angular/common';


// Módulo que contiene los componentes compartidos
import { GeneralModule } from '../general/general.module';

// Componente principal
import { PaginasComponent } from './paginas.component';

// Componentes del directorio "paginas"
import { InicioComponent } from './inicio/inicio.component';
import { APP_ROUTES } from '../app.routes';
//import { CatastroGrupalComponent } from './catastro-grupal/catastro-grupal.component';
//import { SlctdCorrecionCGComponent } from './slctd-correcion-c-g/slctd-correcion-c-g.component';
import { SolicitudesComponent } from './solicitudes/solicitudes.component';
import { SlctrAnulacionCsmiComponent } from './slctr-anulacion-csmi/slctr-anulacion-csmi.component';
//import { CrearCsmiComponent } from './crear-csmi/crear-csmi.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        PaginasComponent,
        InicioComponent,
        //CatastroGrupalComponent,
        //SlctdCorrecionCGComponent,
        SolicitudesComponent,
        //CrearCsmiComponent,
        SlctrAnulacionCsmiComponent
    ],
    // Para poder usarlos fuera del módulo.
    exports: [
        InicioComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        GeneralModule,
        APP_ROUTES,
        CommonModule
    ]
})


// Nombre del módulo PaginasModule
export class PaginasModule {

}