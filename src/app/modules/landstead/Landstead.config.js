function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead', {
            url: '/landstead',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/Landstead.html',
            title: 'Landstead module'
        });

};

export default LandsteadConfig;