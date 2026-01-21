function funcion_js_custom_optimizada() {
    $(function () {
        "use strict";

        // 1. SOLO LO ESENCIAL
        $(".preloader").fadeOut();

        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // 3. TOGGLE DEL SIDEBAR MODIFICADO (no interferir con Angular)
        function configurarToggleSidebar() {
            $(".nav-toggler").off('click.custom-toggle').on('click.custom-toggle', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const $this = $(this);
                const $mainWrapper = $("#main-wrapper");

                // Usar método nativo en lugar de toggleClass directo
                const tieneClase = $mainWrapper.hasClass("show-sidebar");

                if (tieneClase) {
                    $mainWrapper.removeClass("show-sidebar");
                    $this.find("i").removeClass("ti-close").addClass("ti-menu");
                } else {
                    $mainWrapper.addClass("show-sidebar");
                    $this.find("i").removeClass("ti-menu").addClass("ti-close");
                }

                return false;
            });
        }
        configurarToggleSidebar();

        // 4. Tooltips básicos (si los usas)
        if (typeof $.fn.tooltip !== 'undefined') {
            $('[data-toggle="tooltip"]').tooltip();
        }

        // 5. Popovers básicos (si los usas)
        if (typeof $.fn.popover !== 'undefined') {
            $('[data-toggle="popover"]').popover();
        }

        // 6. Resize trigger (para algunos layouts)
        setTimeout(function () {
            $("body, .page-wrapper").trigger("resize");
            $(".page-wrapper").delay(20).show();
        }, 100);

        // 7. FORZAR skin7 y prevenir cambios
        setTimeout(function () {
            // Forzar tema verde
            $('.left-sidebar').attr('data-sidebarbg', 'skin7');

            // Prevenir cambios de tema
            $('.theme-color .theme-item .theme-link').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cambio de tema bloqueado');
                return false;
            });
        }, 200);
    });

    // 8. CIERRE AUTOMÁTICO SIMPLE (AGREGAR AL FINAL)
    $(document).on('click', '.left-sidebar .sidebar-link', function () {
        const $enlace = $(this);

        // Solo cerrar si tiene routerLink o href (no es solo para expandir)
        if ($enlace.attr('routerLink') ||
            ($enlace.attr('href') && !$enlace.attr('href').startsWith('javascript'))) {

            // Pequeño delay para permitir la navegación
            setTimeout(function () {
                $("#main-wrapper").removeClass("show-sidebar");
                $(".nav-toggler i").removeClass("ti-close").addClass("ti-menu");
            }, 300);
        }
    });

    // 9. Cerrar al cambiar tamaño a desktop
    $(window).on('resize', function () {
        if (window.innerWidth > 768) {
            $("#main-wrapper").removeClass("show-sidebar");
            $(".nav-toggler i").removeClass("ti-close").addClass("ti-menu");
        }
    });
}