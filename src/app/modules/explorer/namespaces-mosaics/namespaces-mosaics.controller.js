import helpers from '../../../utils/helpers';

class ExplorerNamespacesMosaicsCtrl {
    constructor(Wallet, NetworkRequests, Alert, $location, $filter) {
        'ngInject';

        // Wallet service
        this._Wallet = Wallet;
        // Network requests service
        this._NetworkRequests = NetworkRequests;
        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // Filters
        this._$filter = $filter;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        this.namespaces = [];
        this.subNamespaces = [];
        this.mosaics = [];
        this.selectedMosaic = undefined;
        this.selectedMosaicName = this._$filter("translate")("EXPLORER_NS_MOS_SELECT_MOS");
        this.selectedMosaicMetaDatapair = {};
        this.selectedNamespaceName = "";
        this.selectedSubNamespaceName = "";
        this.searchText = "";

        // General pagination
        this.pageSize = 10;

        // Namespaces pagination properties
        this.currentPage = 0;
        this.numberOfPages = function() {
            return Math.ceil(this.namespaces.length / this.pageSize);
        }

        // Sub-namespaces pagination properties
        this.currentPageSubNs = 0;
        this.numberOfPagesSubNs = function() {
            return Math.ceil(this.subNamespaces.length / this.pageSize);
        }

        // Mosaics pagination properties
        this.currentPageMos = 0;
        this.numberOfPagesMos = function() {
            return Math.ceil(this.mosaics.length / this.pageSize);
        }

        this.getNamespaces(null);

    }

    /**
     * Gets all namespaces
     *
     * @param {number|null} id - The namespace id up to which to return the results, null for the most recent
     */
    getNamespaces(id) {
        return this._NetworkRequests.getNamespaces(helpers.getHostname(this._Wallet.node), id).then((res) => {
            if(res.data.length == 100){
                for(var i=0; i < res.data.length; i++){
                    this.namespaces.push(res.data[i]);
                }
                this.getNamespaces(res.data[99].meta.id);
            } else{
                for(var i=0; i < res.data.length; i++){
                    this.namespaces.push(res.data[i]);
                }
                return;
            }
        }, 
        (err) => {
             if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.getNamespacesByIdError(err.data.message);
            }
        });
    }

    /**
     * Gets all sub-namespaces given an address and parent namespace
     *
     * @param {string} address - An account address
     * @param {string} parent - A parent namespace
     */
    getSubNamespaces(address, parent) {
        this.mosaics = [];
        this.selectedMosaic = undefined;
        this.selectedMosaicName = this._$filter("translate")("EXPLORER_NS_MOS_SELECT_MOS");
        this.selectedNamespaceName = parent;
        this.selectedSubNamespaceName = "";
        return this._NetworkRequests.getSubNamespaces(helpers.getHostname(this._Wallet.node), address, parent).then((res) => {
            if(!res.data.length) {
                this.subNamespaces = [];
                this.currentPageSubNs = 0;
            } else {
                this.subNamespaces = res.data;
                this.currentPageSubNs = 0;
            }
        }, 
        (err) => {
             if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorGetSubNamespaces(err.data.message);
            }
        });
    }

    /**
     * Gets all mosaics given an address and a parent namespace
     *
     * @param {string} address - An account address
     * @param {string} parent - A parent namespace
     */
    getMosaics(address, parent) {
        this.selectedMosaic = undefined;
        this.selectedMosaicName = this._$filter("translate")("EXPLORER_NS_MOS_SELECT_MOS");
        this.selectedSubNamespaceName = parent;
        return this._NetworkRequests.getMosaics(helpers.getHostname(this._Wallet.node), address, parent).then((res) => {
            if(!res.data.length) {
                this.mosaics = [];
                this.currentPageMos = 0;
            } else {
                this.mosaics = res.data;
                this.currentPageMos = 0;
            }
        }, 
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorGetMosaics(err.data.message);
            }
        });
    };

    /**
     * Set mosaic data to display details and get all mosaics definitions owned by the account for levy details
     *
     * @param {object} mosaic - A mosaic object
     */
    processMosaic(mosaic) {
        this.selectedMosaicMetaDatapair = {};
        this.selectedMosaic = mosaic;
        this.selectedMosaicName = helpers.mosaicIdToName(mosaic.id);
        return this._NetworkRequests.getMosaicsDefinitions(helpers.getHostname(this._Wallet.node), this._$filter("fmtPubToAddress")(mosaic.creator, this._Wallet.network)).then((res) => {
            if(res.data.length) {
                for (let i = 0; i < res.data.length; ++i) {
                    this.selectedMosaicMetaDatapair[helpers.mosaicIdToName(res.data[i].id)] = {};
                    this.selectedMosaicMetaDatapair[helpers.mosaicIdToName(res.data[i].id)].mosaicDefinition = res.data[i];
                }
            }
        }, 
        (err) => {
             if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorGetMosaicsDefintions(err.data.message);
            }
        });
    }

    /**
     * Search for a namespace given an input
     *
     * @param {array} array - The array to look into
     * @param {string} searchText - The name to search
     */
    searchNsInArray(array, searchText) {
        if(this.currentPage > 0 && this.searchText.length) {
            // Reset to first ns page
            this.currentPage = 0;
        }
        var searchRegx = new RegExp(searchText, "i");
        if (searchText == undefined) {
            return array;
        }
        var result = [];
        for (i = 0; i < array.length; i++) {
            if (array[i].namespace.fqn.search(searchRegx) != -1) {
                result.push(array[i]);
            }
        }
        return result;
    };

    /**
     * Clean a sub-namespace of it's parent root
     *
     * @param {string} str - The namespace id to clean
     */
    substringSubNs(str) {
        return str.substr(str.indexOf('.')+1);
    }

}

export default ExplorerNamespacesMosaicsCtrl;