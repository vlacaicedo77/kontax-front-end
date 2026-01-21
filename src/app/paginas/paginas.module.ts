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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        PaginasComponent,
        InicioComponent
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