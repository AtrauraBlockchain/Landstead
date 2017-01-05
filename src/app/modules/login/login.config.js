function LoginConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.login', {
            url: '/login/:slug',
            controller: 'LoginCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/login/login.html',
            title: 'Login'
        });

};

export default LoginConfig;