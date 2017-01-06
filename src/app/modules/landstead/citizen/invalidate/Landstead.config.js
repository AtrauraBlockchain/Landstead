function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.invalidateCitizen', {
            url: '/citizen/invalidate',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/invalidateCitizen/Landstead.html',
            title: 'Invalidate Citizen'
        });

};

export default LandsteadConfig;