// Función que permite desaparecer la precarga, mostrar recuperar contraseña y mostrar el daterangepicker
function funciones_index() {
    $(document).ready(function() {
        /*******************************************/
        // Mostrar el formulario para recuperar contraseñas.
        /*******************************************/
        $('#to-recover').on('click', function() {
            $('#loginform').slideUp();
            $('#recoverform').fadeIn();
        });
        /*******************************************/
        // Ocultamos el preloader
        /*******************************************/
        $(".preloader").fadeOut();
        /*******************************************/
        // Para ocultar el menú cuando es visto desde un teléfono
        /*******************************************/
        //$(".sidebar-link").on('click', function() {
        //    $("#main-wrapper").toggleClass("show-sidebar");
        //    $(".nav-toggler i").toggleClass("ti-menu");
        //});
        $(".navtoggler").on('click', function() {
            $("#main-wrapper").toggleClass("show-sidebar");
            $("#menuLateral").toggleClass("ti-menu");
        });

        /*******************************************/
        // Basic Date Range Picker
        /*******************************************/
        // MAterial Date picker
        //$('#mdate').bootstrapMaterialDatePicker({ weekStart: 0, time: false });
        //$('#timepicker').bootstrapMaterialDatePicker({ format: 'HH:mm', time: true, date: false });
        $('#date-format').bootstrapMaterialDatePicker({ 
            format: 'DD/MM/YYYY HH:mm',
            minDate: new Date(),
            //minDate: moment({h:5}),
            //maxDate: moment({h:18}),
        });

        //$('#min-date').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm', minDate: new Date() });
        //$('#date-fr').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm', lang: 'fr', weekStart: 1, cancelText: 'ANNULER' });
        //$('#date-end').bootstrapMaterialDatePicker({ weekStart: 0 });
        //$('#date-start').bootstrapMaterialDatePicker({ weekStart: 0 }).on('change', function(e, date) {
        //    $('#date-end').bootstrapMaterialDatePicker('setMinDate', date);
        //});
        
        
        /***********************************/
        // Date range to select selecciona la hora
        /***********************************/
        //$('.pickatime-minmax-range').pickatime({
        //    min: new Date(2018, 3, 20, 5),
        //    max: new Date(2018, 7, 14, 18),
        //    timePicker24Hour: false,
        //    interval: 30,
        //    locale: {
        //        format: 'MM/DD/YYYY h:mm A'
        //    },
        //    formatLabel: 'h:i a',
        //    formatSubmit: 'HH:i'
        //});
        //$('.timeseconds').daterangepicker({
        //    timePicker: true,
        //    timePickerIncrement: 30,
        //    timePicker24Hour: true,
        //    timePickerSeconds: true,
        //    locale: {
        //        format: 'MM-DD-YYYY h:mm:ss'
        //    }
        //});


    });
}