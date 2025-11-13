//Fondos Aleatorios

export function RandomBackground()
  {
    let fondo = 'login-register';
    let min = Math.ceil(1);
    let max = Math.floor(10);
    let numero = Math.floor(Math.random() * (max - min + 1) + min);
    
    return fondo + numero.toString() + '.jpg';
  }