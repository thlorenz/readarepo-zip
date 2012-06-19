(function ($) {
    var $styleSelector = $('#style-selector')
      , $styles = $('#styles')
      ;
    
    $styleSelector.on('change', function (event) {
        console.log('change to : ', $styleSelector.val());
        $styles.attr('href', './styles/' + $styleSelector.val() + '.css');
    });


}) (jQuery);
