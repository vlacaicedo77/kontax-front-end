// Este módulo centraliza los componentes del directorio "general"
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Componentes del directorio "general"
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { HeaderComponent } from './header/header.component';
import { BarraLateralComponent } from './barra-lateral/barra-lateral.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { VisorPdfComponent } from './visor-pdf/visor-pdf.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
    imports:[
        RouterModule,
        BrowserModule,
        NgxExtendedPdfViewerModule
    ],
    declarations: [
        NopagefoundComponent,
        HeaderComponent,
        BarraLateralComponent,
        BreadcrumbsComponent,
        VisorPdfComponent
    ],
    exports: [
        NopagefoundComponent,
        HeaderComponent,
        BarraLateralComponent,
        BreadcrumbsComponent,
        VisorPdfComponent
    ]
})

export class GeneralModule { }