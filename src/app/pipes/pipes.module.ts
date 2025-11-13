import { NgModule } from '@angular/core';
import { FiltroPipe } from './filtro.pipe';

@NgModule({
  declarations: [
    FiltroPipe
  ],
  imports: [],
  // Para que lo utilicen otras pantallas
  exports: [
    FiltroPipe
  ]
})
export class PipesModule { }
