import Swal from 'sweetalert2';

// Validar cédula ecuatoriana
export const validarCedula = (cedula: string): boolean => {
  let cedulaCorrecta = false;
  
  try {
    if (cedula.length === 10) {
      const tercerDigito = parseInt(cedula.substring(2, 3));
      if (tercerDigito < 6) {
        const coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        const verificador = parseInt(cedula.substring(9, 10));
        let suma = 0;
        let digito = 0;

        for (let i = 0; i < (cedula.length - 1); i++) {
          digito = parseInt(cedula.substring(i, i + 1)) * coefValCedula[i];
          suma += ((digito % 10) + Math.floor(digito / 10));
        }

        if ((suma % 10 === 0) && (suma % 10 === verificador)) {
          cedulaCorrecta = true;
        } else if ((10 - (suma % 10)) === verificador) {
          cedulaCorrecta = true;
        } else {
          cedulaCorrecta = false;
        }
      } else {
        cedulaCorrecta = false;
      }
    } else {
      cedulaCorrecta = false;
    }
  } catch (error) {
    Swal.fire('Error!', 'Ocurrió un error al validar la cédula', 'error');
    cedulaCorrecta = false;
  }

  if (!cedulaCorrecta) {
    Swal.fire('¡Advertencia!', 'Número de identificación incorrecto [DINARP]', 'warning');
  }
  
  return cedulaCorrecta;
};

// Validar coordenadas dentro de Ecuador continental
export const validarCoordenadasEcuador = (latitud: number, longitud: number): boolean => {
  try {
    // Límites para Ecuador continental
    const limitesContinental = {
      latitudMin: -5.015,     // Frontera SUR
      latitudMax: 1.450,      // Frontera NORTE
      longitudMin: -81.000,   // Costa OESTE
      longitudMax: -75.200    // Frontera ESTE
    };

    // Validar que sean números válidos
    if (isNaN(latitud) || isNaN(longitud)) {
      return false;
    }

    // Validar rangos globales
    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      return false;
    }

    // Verificar si está dentro de Ecuador continental
    return (latitud >= limitesContinental.latitudMin && 
            latitud <= limitesContinental.latitudMax && 
            longitud >= limitesContinental.longitudMin && 
            longitud <= limitesContinental.longitudMax);

  } catch (error) {
    return false;
  }
};

export const validarCoordenadasDesdeString = (latitudStr: string, longitudStr: string): boolean => {
  const latitud = parseFloat(latitudStr);
  const longitud = parseFloat(longitudStr);
  
  return validarCoordenadasEcuador(latitud, longitud);
};