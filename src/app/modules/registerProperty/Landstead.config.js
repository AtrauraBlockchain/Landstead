function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.registerProperty', {
            url: '/property/register',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/registerProperty/Landstead.html',
            title: 'Register Property'
        });

};

export default LandsteadConfig;