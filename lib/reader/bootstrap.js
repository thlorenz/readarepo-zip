(function () {
    var $styleSelector = document.getElementById('#style-selector')
      , $styles = document.getElementById('#style-link')
      ;
    
    $styleSelector.on('change', function (event) {
        console.log('change to : ', $styleSelector.val());
        $styles.attr('href', './styles/' + $styleSelector.val() + '.css');
    });
}) ();
