function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.invalidateProperty', {
            url: '/property/invalidate',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/Landstead.html',
            title: 'Invalidate Property'
        });

};

export default LandsteadConfig;