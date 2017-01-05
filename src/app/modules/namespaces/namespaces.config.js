function NamespacesConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.namespaces', {
            url: '/namespaces',
            controller: 'NamespacesCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/namespaces/namespaces.html',
            title: 'Create namespace or sub-namespace'
        });

};

export default NamespacesConfig;