function AppConfig($httpProvider, $stateProvider, $locationProvider, $urlRouterProvider, ngToastProvider, $translateProvider) {
    'ngInject';

    /*
      If you don't want hashbang routing, uncomment this line.
    */
    // $locationProvider.html5Mode(true);

    $stateProvider
        .state('app', {
            abstract: true,
            templateUrl: 'layout/app-view.html'
        });

    $urlRouterProvider.otherwise('/');

    ngToastProvider.configure({
        animation: 'fade'
    });

    $translateProvider.preferredLanguage('en');

}

export default AppConfig;