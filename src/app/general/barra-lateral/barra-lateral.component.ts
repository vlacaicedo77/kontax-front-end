import { Component, OnInit } from '@angular/core';
// Importación de servicios.
import { MenuService } from 'src/app/servicios/menu/menu.service';

@Component({
  selector: 'app-barra-lateral',
  templateUrl: './barra-lateral.component.html'
})
export class BarraLateralComponent implements OnInit {

  public menu = [];

  constructor(
    private _menuService: MenuService
  ){ }

  ngOnInit() {
    this.buscarMenu();
  }

  // Método que obtiene los datos del menu y asigna los íconos
  buscarMenu() {
    const menuOriginal = this._menuService.consultaMenu();
    this.menu = this.asignarIconosAlMenu(menuOriginal);
  }

  // Método para asignar íconos al menú
  asignarIconosAlMenu(menu: any[]): any[] {
    if (!menu) return [];
    return menu.map(menuItem => {
      const icono = this.obtenerIconoPorEtiqueta(menuItem.etiqueta);
      return {
        ...menuItem,
        icono: icono
      };
    });
  }

  // Método para mapear etiquetas a íconos
  obtenerIconoPorEtiqueta(etiqueta: string): string {
    const etiquetaLower = etiqueta.toLowerCase();
    const mapeoIconos: { [key: string]: string } = {
      'inicio': 'mdi mdi-home',
      'inventario': 'mdi mdi-package-variant',
      'negocio': 'mdi mdi-briefcase',
      'crédito': 'mdi mdi-credit-card',
      'gastos': 'mdi mdi-cash',
      'incidentes': 'mdi mdi-alert',
      'reportes': 'mdi mdi-chart-bar',
      'consulta': 'mdi mdi-magnify',
      'gestión de usuarios': 'mdi mdi-account-group'
    };

    return mapeoIconos[etiquetaLower] || 'mdi mdi-menu';
  }
}
