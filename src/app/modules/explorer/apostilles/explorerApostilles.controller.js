import Network from '../../../utils/Network';
import Sinks from '../../../utils/sinks';
import helpers from '../../../utils/helpers';

class ExplorerApostillesCtrl {
    constructor(Wallet, $scope, NetworkRequests, Alert, $location, DataBridge) {
        'ngInject';

        // Wallet service
        this._Wallet = Wallet;
        // Network requests service
        this._NetworkRequests = NetworkRequests;
        // Alert service
        this._Alert = Alert;
        // DataBridge service
        this._DataBridge = DataBridge;
        // $location to redirect
        this._location = $location;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        // Array to get sink data
        this.sinkData = [];
        // Get sink depending of ntwork
        this.sink = Sinks.sinks.apostille[this._Wallet.network].toUpperCase().replace(/-/g, '');

        // Get incoming transactions of the sink account
        this.getSinkTransactions();

        // Public sink's apostilles pagination properties
        this.currentPageSink = 0;
        this.pageSizeSink = 5;
        this.numberOfPagesSink = function() {
            return Math.ceil(this.sinkData.length / this.pageSizeSink);
        }

    }

    /**
     * Get incoming transaction of the sink account
     */
    getSinkTransactions() {
        return this._NetworkRequests.getIncomingTxes(helpers.getHostname(this._Wallet.node), this.sink, "").then((data) => {
            this.sinkData = data.data;
        }, 
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorFetchingIncomingTxes(err.data.message);
            }
        });
    }

}

export default ExplorerApostillesCtrl;