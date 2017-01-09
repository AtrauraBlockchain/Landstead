function DashboardConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.about', {
            url: '/about',
            templateUrl: 'modules/about/about.html',
            title: 'About'
        });

};

export default DashboardConfig;