// This file basically contains some snippets found / used by FlatUI to make.. euh.. FlatUI work.
//
(function($) {

    // Focus state for append/prepend inputs
    $('.input-prepend, .input-append').on('focus', 'input', function () {
      $(this).closest('.control-group, form').addClass('focus');
    }).on('blur', 'input', function () {
      $(this).closest('.control-group, form').removeClass('focus');
    });
} ( jQuery ));
