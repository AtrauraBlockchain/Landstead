function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead.property.invalidate', {
            url: '/property/invalidate',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/property/invalidate/Landstead.html',
            title: 'Invalidate Property'
        });

};

export default LandsteadConfig;