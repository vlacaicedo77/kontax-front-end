import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

// Importamos modelos: menú.
import { Menu } from '../../modelos/menu.modelo';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menu: Menu;

  // Constructor de la clase
  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  // Método que permite obtener menú del usuario
  consultaMenu() {
    return JSON.parse(localStorage.getItem('menu'));
  }
}
