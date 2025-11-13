import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-directorio-proveedores',
  templateUrl: './directorio-proveedores.component.html',
  styleUrls: ['./directorio-proveedores.component.css']
})
export class DirectorioProveedoresComponent implements OnInit {

  //Objetos para manejar el mapa
  zoom: number = 15;
  opcionesMapa: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
    //disableDefaultUI: true,
    fullscreenControl: false,
    //mapTypeControl: false,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  opcionesMarcador: { animation: google.maps.Animation.BOUNCE };

  proveedores = [
    {nombre: "Epimex",
    direccion:"No disponible",
    email:"No disponible",
    telefono:"022543761",
    mapa:{lat: -0.181519,
    lng: -78.475608}
  },
  {nombre: "Inexago",
  direccion:"No disponible",
  email:"No disponible",
  telefono:"0998718219",
  mapa:{lat: -0.181519,
  lng: -78.475608}
  },
  {nombre: "Implementos Agropecuarios",
    direccion:"No disponible",
    email:"No disponible",
    telefono:"0997097521",
    mapa:{lat: -0.181519,
    lng: -78.475608}
  },
  {nombre: "Inventagri",
    direccion:"No disponible",
    email:"No disponible",
    telefono:"022467807",
    mapa:{lat: -0.181519,
    lng: -78.475608}
  }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
