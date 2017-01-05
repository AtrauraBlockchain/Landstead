function CreateApostilleConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.createApostille', {
            url: '/create-apostille',
            controller: 'CreateApostilleCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/apostille/create/createApostille.html',
            title: 'Create apostille'
        });

};

export default CreateApostilleConfig;