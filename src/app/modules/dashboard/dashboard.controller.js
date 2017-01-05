class DashboardCtrl {
    constructor(Wallet, Alert, $location, DataBridge, $scope, $filter, Transactions, NetworkRequests) {
        'ngInject';

        // Alert service
        this._Alert = Alert;
        // Filters
        this._$filter = $filter;
        // $location to redirect
        this._location = $location;
        // Wallet service
        this._Wallet = Wallet;
        // Transaction service
        this._Transactions = Transactions;
        // DataBridge service
        this._DataBridge = DataBridge;
        this._NetworkRequests = NetworkRequests;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
        }

        /**
         * Default Dashboard properties 
         */

        // Harvesting chart data
        this.labels = [];
        this.valuesInFee = [];
        // Helper to know if no data for chart
        this.chartEmpty = true;

        // Default tab on confirmed transactions
        this.tabConfirmed = true;

        /**
         * Watch harvested blocks in Databridge service for the chart
         */
        $scope.$watch(() => this._DataBridge.harvestedBlocks, (val) => {
            this.labels = [];
            this.valuesInFee = [];
            if (!val) {
                return;
            }
            for (let i = 0; i < val.length; ++i) {
                // If fee > 0 we push the block as label and the fee as data for the chart
                if (val[i].totalFee / 1000000 > 0) {
                    this.labels.push(val[i].height)
                    this.valuesInFee.push(val[i].totalFee / 1000000);
                }
            }
            // If nothing above 0 XEM show message
            if (!this.valuesInFee.length) {
                this.chartEmpty = true;
            } else {
                this.chartEmpty = false;
            }
        });

        //Confirmed txes pagination properties
        this.currentPage = 0;
        this.pageSize = 5;
        this.numberOfPages = function() {
            return Math.ceil(this._DataBridge.transactions.length / this.pageSize);
        }

        //Unconfirmed txes pagination properties
        this.currentPageUnc = 0;
        this.pageSizeUnc = 5;
        this.numberOfPagesUnc = function() {
            return Math.ceil(this._DataBridge.unconfirmed.length / this.pageSizeUnc);
        }

        // Harvested blocks pagination properties
        this.currentPageHb = 0;
        this.pageSizeHb = 5;
        this.numberOfPagesHb = function() {
            return Math.ceil(this._DataBridge.harvestedBlocks.length / this.pageSizeHb);
        }

    }

    /**
     * refreshMarketInfo() Fetch data from CoinMarketCap api to refresh market information
     */
    refreshMarketInfo() {
        // Get market info
        this._NetworkRequests.getMarketInfo().then((data) => {
            this._DataBridge.marketInfo = data;
        },
        (err) => {
            // Alert error
            this._Alert.errorGetMarketInfo(); 
        });
    }


}

export default DashboardCtrl;