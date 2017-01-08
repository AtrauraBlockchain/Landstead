function propertyOwnershipRegisterConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.LandsteadPropertyOwnershipRegister', {
            url: '/property/setowner',
            controller: 'propertyOwnershipRegisterCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/propertyOwnershipRegister/propertyOwnershipRegister.html',
            title: 'Register property'
        });

};

export default propertyOwnershipRegisterConfig;