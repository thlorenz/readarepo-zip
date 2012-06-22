(function ($) {
    var $styleSelector = $('#style-selector')
      , $styles = $('#style-link')
      ;
    
    $styleSelector.on('change', function (event) {
        console.log('change to : ', $styleSelector.val());
        $styles.attr('href', './styles/' + $styleSelector.val() + '.css');
    });


}) (jQuery);
