function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead.citizen.invalidate', {
            url: '/citizen/invalidate',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/citizen/invalidate/Landstead.html',
            title: 'Invalidate Citizen'
        });

};

export default LandsteadConfig;