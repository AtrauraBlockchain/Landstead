class PortalCtrl {
    constructor(Wallet, DataBridge, $location, Alert) {
        'ngInject';

        // Wallet service
        this._Wallet = Wallet;
        // DataBridge service
        this._DataBridge = DataBridge;
        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }
        
    }


}

export default PortalCtrl;