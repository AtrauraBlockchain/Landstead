function ShowBlockHeight(DataBridge) {
    'ngInject';

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.DataBridge = DataBridge;

            scope.$watch('DataBridge.nisHeight', function(val) {
                element.html(val)
            });

        }
    };
}

export default ShowBlockHeight;