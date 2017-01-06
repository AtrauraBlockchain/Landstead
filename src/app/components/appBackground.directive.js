function AppBackground($state, $rootScope) {
    'ngInject';

    return {
        restrict: 'A',
        link: function(scope, element, rootScope) {

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    if (toState.title == 'Login' || toState.title == 'Signup') {
                        element.css({
                            'background': 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("images/background.jpg")',
                            'background-size': 'cover'
                        });
                    } else {
                        element.css({
                            'background': 'rgb(255, 255, 255)'
                        });
                    }

                })

        }
    };
}

export default AppBackground;