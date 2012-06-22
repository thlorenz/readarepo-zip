ss = null;
(function () {
    var styleSelector = document.getElementById('style-selector')
      , styles = document.getElementById('style-link')
      , stylesPath = styles.getAttribute('data-stylespath')
      ;
    
    ss = styles;
    console.log(styleSelector);
    console.log(styles);
    
    styleSelector.onchange = function (event) {
        var selectedStyle = styleSelector.options[styleSelector.selectedIndex].text;
        console.log('selected', selectedStyle);
        styles.setAttribute('href', stylesPath + '/' + selectedStyle + '.css');
    };
}) ();
