function ShowNetworkStatus(DataBridge) {
    'ngInject';

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.DataBridge = DataBridge;

            scope.$watch('DataBridge.connectionStatus', function(val) {
                // If user detected
                if (val) {
                    element.css({
                        color: '#5cb85c'
                    });
                } else {
                    element.css({
                        color: 'red'
                    })
                }
            });

        }
    };
}

export default ShowNetworkStatus;