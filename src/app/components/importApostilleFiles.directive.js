function ImportApostilleFiles($parse, Alert) {
    'ngInject'
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.importApostilleFiles);

            element.on('change', function(onChangeEvent) {

                for (var i = 0; i < (onChangeEvent.srcElement || onChangeEvent.target).files.length; i++) {
                    var reader = new FileReader();
                    reader.onload = (function(file) {
                        return function(onLoadEvent) {
                            scope.$apply(function() {
                                fn(scope, {
                                    $fileContent: onLoadEvent.target.result,
                                    $fileData: file
                                });
                            });
                        };
                    })((onChangeEvent.srcElement || onChangeEvent.target).files[i]);

                    reader.readAsDataURL((onChangeEvent.srcElement || onChangeEvent.target).files[i]);
                }
            });
        }
    }
}

export default ImportApostilleFiles;