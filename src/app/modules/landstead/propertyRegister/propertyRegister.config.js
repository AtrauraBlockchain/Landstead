function propertyRegisterConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.LandsteadPropertyRegister', {
            url: '/property/register',
            controller: 'propertyRegisterCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/propertyRegister/propertyRegister.html',
            title: 'Register property'
        });

};

export default propertyRegisterConfig;