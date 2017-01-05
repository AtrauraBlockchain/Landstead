import helpers from '../../../utils/helpers';
import Address from '../../../utils/Address';
import KeyPair from '../../../utils/KeyPair';

class AccountsExplorerCtrl {
    constructor(Wallet, NetworkRequests, Alert, $location, $stateParams, $filter) {
        'ngInject';

        // Wallet service
        this._Wallet = Wallet;
        // Network requests service
        this._NetworkRequests = NetworkRequests;
        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // State parameters
        this._$stateParams = $stateParams;
        // Filters
        this._$filter = $filter;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        this.rawInput = this._$stateParams.address;
        this.account = "";
        this.scope = {};
        this.scope.accountData = {};
        this.scope.mosaicDefinitionMetaDataPair = {};
        this.transactions = [];

        // Transactions pagination
        this.currentPage = 0;
        this.pageSize = 5;
        this.numberOfPages = function() {
            return Math.ceil(this.transactions.length / this.pageSize);
        }

        if (this.rawInput.length) {
            this.processRawInput();
        }

    }

    /**
     * Process user input
     */
    processRawInput() {
        // Check if value is an alias
        let isAlias = (this.rawInput.lastIndexOf("@", 0) === 0);

        // return if no value or lenth < to min address length AND not an alias
        if (!this.rawInput || this.rawInput.length < 40 && !isAlias) {
            return;
        }

        // Get recipient data depending of address or alias used
        if (isAlias) {
            // Clean namespace name
            let nsForLookup = this.rawInput.substring(1);
            // Get cosignatory account data from network using @alias
            this.getAccountDataFromAlias(nsForLookup);
        } else {
            // Clean provided address
            let account = this.rawInput.toUpperCase().replace(/-/g, '');
            // Check if address is from network
            if (Address.isFromNetwork(account, this._Wallet.network)) {
                // Get account data from network
                this.getAccountData(account);
            } else {
                // Error
                this._Alert.invalidAddressForNetwork(account, this._Wallet.network);
                return;
            }
        }
    }

    /**
     * Get the account data using @alias
     * 
     * @param {string} alias: An alias (@namespace)
     */
    getAccountDataFromAlias(alias) {
        return this._NetworkRequests.getNamespacesById(helpers.getHostname(this._Wallet.node), alias).then((data) => {
            // Check if address is from network
            if (Address.isFromNetwork(data.owner, this._Wallet.network)) {
                // Get recipient account data from network
                this.getAccountData(data.owner);
            } else {
                // Error
                this._Alert.invalidAddressForNetwork(data.owner, this._Wallet.network);
                return;
            }
        },
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.getNamespacesByIdError(err.data.message);
            }
            return;
        });
    }

    /**
     * Get the account data
     * 
     * @param {string} address: An account address
     */
    getAccountData(address) {
        return this._NetworkRequests.getAccountData(helpers.getHostname(this._Wallet.node), address).then((data) => {
            this.scope.accountData = data;
            if (data.account.publicKey === null && this._$stateParams.privateKey.length) {
                this.scope.accountData.account.publicKey = KeyPair.create(this._$stateParams.privateKey).publicKey.toString();
            } else if (data.account.publicKey === null && !this._$stateParams.privateKey.length) {
                this.scope.accountData.account.publicKey = this._$filter("translate")("GENERAL_UNKNOWN");
            }
            this.getMosaicsDefinitions(data.account.address);
        },
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.getAccountDataError(err.data.message);
            }
            return;
        });
    }

    /**
     * Get the account incoming transactions
     * 
     * @param {string|null} hash: The hash up to which transactions are returned, first 25 if null
     */
    getAllTransactions(hash) {
        return this._NetworkRequests.getAllTransactions(helpers.getHostname(this._Wallet.node), this.scope.accountData.account.address, hash).then((data) => {
            this.transactions = data.data;
            // Clean state params if any
            this.cleanStateParams()
        }, 
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorGetTransactions(err.data.message);
            }
        });
    }

    /**
     *  Get mosaics definitions of an account
     *
     * @param {string} address - An account address
     */
    getMosaicsDefinitions(address) {
        return this._NetworkRequests.getMosaicsDefinitions(helpers.getHostname(this._Wallet.node), address).then((res) => {
            if(res.data.length) {
                for (let i = 0; i < res.data.length; ++i) {
                    this.scope.mosaicDefinitionMetaDataPair[helpers.mosaicIdToName(res.data[i].id)] = {};
                    this.scope.mosaicDefinitionMetaDataPair[helpers.mosaicIdToName(res.data[i].id)].mosaicDefinition = res.data[i];
                }
                this.getAllTransactions(null);
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
     *  Clean data passed in state parameters
     */
    cleanStateParams() {
        if (this._$stateParams.address.length) {
            this._$stateParams.address = "";
            this._$stateParams.privateKey = "";
        }
    }

}

export default AccountsExplorerCtrl;