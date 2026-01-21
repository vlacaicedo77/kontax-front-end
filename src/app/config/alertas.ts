import Swal from 'sweetalert2';

// Loading
export const showLoading = (message: string = 'Procesando...'): void => {
  Swal.fire({
    title: message,
    html: '<div class="loading-spinner"></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
    backdrop: true
  });
};

// Cerrar cualquier alerta abierta
export const closeAlert = (): void => {
  Swal.close();
};

// Éxito
export const showSuccess = (title: string = '¡Éxito!', text: string = ''): void => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'OK',
    backdrop: true
  });
};

// Error
export const showError = (title: string, text: string = ''): void => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    backdrop: true
  });
};

// Advertencia
export const showWarning = (title: string, text: string = ''): void => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    backdrop: true
  });
};

// Información
export const showInfo = (title: string = '¡Atención!', text: string = ''): void => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'info',
    confirmButtonText: 'Entendido',
    backdrop: true
  });
};

// Confirmación
export const showConfirm = (title: string, text: string = ''): Promise<any> => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '¡Sí, continuar!',
    cancelButtonText: 'Cancelar',
    backdrop: true
  });
};

// Confirmación con texto personalizado
export const showConfirmCustom = (
  title: string,
  text: string = '',
  confirmText: string = 'Sí',
  cancelText: string = 'No'
): Promise<any> => {
  return Swal.fire({
    title: title,
    html: text ? `<div style="font-size: 1.1em;">${text}</div>` : '',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    backdrop: true
  });
};

// Alert con HTML personalizado
export const showHtmlAlert = (
  title: string,
  htmlContent: string,
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning',
  confirmButtonText: string = 'Aceptar'
): void => {
  Swal.fire({
    title: title,
    icon: icon,
    html: htmlContent,
    confirmButtonText: confirmButtonText,
    backdrop: true
  });
};

// Success con auto-cierre
export const showSuccessAutoClose = (
  title: string,
  timer: number = 1500
): void => {
  Swal.fire({
    title: title,
    icon: 'success',
    showConfirmButton: false,
    timer: timer,
    backdrop: true
  });
};

// Alerta con acciones posteriores (then) y restricciones - Versión mejorada
export const showAlertWithCallback = (
  title: string,
  content: string = '',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning',
  confirmButtonText: string = 'Aceptar',
  allowOutsideClick: boolean = false,
  allowEscapeKey: boolean = false,
  useHtml: boolean = false
): Promise<any> => {
  const config: any = {
    title: title,
    icon: icon,
    confirmButtonText: confirmButtonText,
    allowOutsideClick: allowOutsideClick,
    allowEscapeKey: allowEscapeKey,
    backdrop: true
  };

  // Usar html o text según el parámetro useHtml
  if (useHtml) {
    config.html = content;
  } else {
    config.text = content;
  }

  return Swal.fire(config);
};

// Alerta con auto-cierre y barra de progreso
export const showAutoCloseAlert = (
  title: string,
  text: string = '',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning',
  timer: number = 3000,
  showConfirmButton: boolean = false,
  allowOutsideClick: boolean = false,
  allowEscapeKey: boolean = false
): void => {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: showConfirmButton,
    allowOutsideClick: allowOutsideClick,
    allowEscapeKey: allowEscapeKey,
    backdrop: true
  });
};