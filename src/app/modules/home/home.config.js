function HomeConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.home', {
            url: '/',
            controller: 'HomeCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/home/home.html',
            title: 'Home'
        });

};

export default HomeConfig;