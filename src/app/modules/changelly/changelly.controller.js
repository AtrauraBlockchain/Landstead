class ChangellyCtrl {
    constructor($location, Wallet, Alert) {
        'ngInject';

        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // Wallet service
        this._Wallet = Wallet;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        document.getElementById('changwidget').innerHTML = '<iframe src="https://changelly.com/widget/v1?auth=merchant&from=BTC&to=XEM&merchant_id=9bad2685d41a&address='+ this._Wallet.currentAccount.address +'&amount=1&ref_id=9bad2685d41a&color=454545" width="100%" height="500" class="changelly" scrolling="no" style="overflow-y: hidden; border: none" > Can\'t load widget </iframe>'; 

    }

}

export default ChangellyCtrl;
