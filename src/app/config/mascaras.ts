//Máscaras
export const MASK_TELEFONO_FIJO = /(^0[2-7]\d{7})$/;
export const MASK_TELEFONO_MOVIL = /(^09\d{8})$/;
export const MASK_CEDULA =  /^([0-2]\d[0-6]\d{7})$/;
export const MASK_RUC =  /^([0-2]\d[0-6|9]\d{10})$/;
export const MASK_NUMERICO = /^(\d)+$/ ;
export const MASK_DECIMAL = /^((\d)\.\d{0,2}|(\d))+$/ ;
export const MASK_ALFANUMERICO = /^(\d|[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]|\.|,|-|!|_|\s)+$/;
export const MASK_ALFABETICO = /^([A-Za-zÁÉÍÓÚÜáéíóúüÑñ]|\.|,|-|!|_|\s)+$/;
//18APR2021 DSRE Se agrega a las máscaras de contraseña, la posibilidad de ingresar de manera opcional caracteres especiales
export const MASK_PASSWORD_EXT = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)[a-zñA-ZÑ\d\*!@%\$-_\.,]{8,}$/; //8 caracteres con al menos una mayúscula y una minúscula. Caracteres especiales opcionales
export const MASK_PASSWORD_INT = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)[a-zñA-ZÑ\d\*!@%\$-_\.,]{8,}$/; //8 caracteres con al menos una mayúscula y una minúscula. Caracteres especiales opcionales
export const MASK_FORMAT_MESSAGE_EXT = "La contraseña debe tener mínimo 8 caracteres. Al menos número, una letra mayúscula y una letra minúscula. Se permiten los siguientes caracteres especiales: *!@%$-_., ";
export const MASK_FORMAT_MESSAGE_INT = "La contraseña debe tener mínimo 8 caracteres. Al menos número, una letra mayúscula y una letra minúscula. Se permiten los siguientes caracteres especiales: *!@%$-_., ";


export function Mascara(event: KeyboardEvent, mascara: string)
  {
    let elemento = event.target as HTMLInputElement;
    let regExp :RegExp; //Buscador de coincidencias
    let regExpFull :RegExp; //Validador de toda la cadena

    let longitud = elemento.value.length;
    
    if(mascara == "numerico")
    {
        regExp = /(\d+)/;
        regExpFull = MASK_NUMERICO;
    }
    if(mascara == "decimal")
    {
        regExp = /(((\d)\.\d{1,2}|(\d))+)/;
        regExpFull = MASK_DECIMAL;
    }
    if(mascara == "alfanumerico")
    {
        regExp = /(\d|\w|\s|-)/;
        regExpFull = MASK_ALFANUMERICO;
    }
    if(mascara == "alfabetico")
    {
        regExp = /(\w|\s)/;
        regExpFull = MASK_ALFABETICO;
    }
    if(mascara == "telefonoFijo")
    {
        switch(longitud)
        {
            case 1:
                regExp = /(0)/;
                break;
            case 2:
                regExp = /(0[2-7])/;
                break;
            default:
                regExp = /(0[2-7]\d{1,7})/;
                break;
        }
        regExpFull = MASK_TELEFONO_FIJO;
    }
    if(mascara == "telefonoMovil")
    {
        switch(longitud)
        {
            case 1:
                regExp = /(0)/;
                break;
            case 2:
                regExp = /(09)/;
                break;
            default:
                regExp = /(09\d{1,8})/;
                break;
        }
        regExpFull = MASK_TELEFONO_MOVIL;
    }
    if(mascara == "cedula")
    {
        switch(longitud)
        {
            case 1:
                regExp = /([0-2])/;
                break;
            case 2:
                regExp = /([0-2]\d)/;
                break;
            case 3:
                regExp = /([0-2]\d[0-6])/;
                break;
            default:
                regExp = /([0-2]\d[0-6]\d{1,7})/;
                break;
        }
                
        regExpFull = MASK_CEDULA;
    }
    if(mascara == "ruc")
    {
        switch(longitud)
        {
            case 1:
                regExp = /([0-2])/;
                break;
            case 2:
                regExp = /([0-2]\d)/;
                break;
            case 3:
                regExp = /([0-2]\d[0-6|9])/;
                break;
            default:
                regExp = /([0-2]\d[0-6|9]\d{1,10})/;
                break;
        }
        regExpFull = MASK_RUC;
    }

    validar(regExp, regExpFull, elemento);
  }

  function validar(regExp :RegExp, regExpFull :RegExp, elemento :HTMLInputElement)
  {
    let textoOriginal = elemento.value;
    let coincidencias = textoOriginal.match(regExp);
    if(!regExpFull.test(textoOriginal))
    {
        elemento.classList.add("ng-invalid");
        elemento.classList.remove("ng-valid");

        if(coincidencias == null)
            elemento.value = "";
        else
        {
            elemento.value=coincidencias[0];
            if(regExpFull.test(elemento.value))
            {
                elemento.classList.remove("ng-invalid");
                elemento.classList.add("ng-valid");
            }
        }
    }
  }