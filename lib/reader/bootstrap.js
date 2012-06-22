(function () {
  var styleSelector = document.getElementById('style-selector')
    , styles = document.getElementById('style-link')
    , stylesPath = styles.getAttribute('data-stylespath')
    ;
  
  styleSelector.onchange = function (event) {
    var selectedStyle = styleSelector.options[styleSelector.selectedIndex].text;
    styles.setAttribute('href', stylesPath + '/' + selectedStyle + '.css');
  };
}) ();
