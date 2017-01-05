import Network from '../utils/Network';
import helpers from '../utils/helpers';
import Nodes from '../utils/nodes';

/** Service storing wallet data and relative functions on user wallet. */
class Wallet {

    /**
     * Initialize services and properties
     *
     * @param {config} AppConstants - The application constants
     * @param {service} $localStorage - The angular $localStorage service
     * @param {service} Alert - The Alert service
     */
    constructor(AppConstants, $localStorage, Alert) {
        'ngInject';

        /***
         * Declare services
         */
        this._AppConstants = AppConstants;
        this._storage = $localStorage;
        this._Alert = Alert;

        /***
         * Default Wallet properties
         */
        this.current = undefined;
        this.currentAccount = undefined;
        this.algo = undefined
        this.network = AppConstants.defaultNetwork;
        this.node = undefined;
        this.searchNode = undefined;
        this.chainLink = undefined;
        this.ntyData = undefined;
    }

    /**
     * Set a wallet as current
     *
     * @param {object} wallet - A wallet object
     */
    setWallet(wallet) {
        if (!wallet) {
            this._Alert.noWalletToSet();
            return;
        }
        this.network = wallet.accounts[0].network;
        // Set needed nodes
        this.setDefaultNode();
        this.setUtilNodes();
        // Account used
        this.currentAccount = wallet.accounts[0];
        // Algo of the wallet
        this.algo = wallet.accounts[0].algo;
        this.current = wallet;
        return;
    }

    /**
     * Set another account of the wallet
     *
     * @param {object} wallet - A wallet object
     * @param {number} index - The index of account in wallet
     */
    setWalletAccount(wallet, index) {
        if (!wallet) {
            this._Alert.noWalletToSet();
            return;
        }
        if (index > Object.keys(wallet.accounts).length - 1) {
            this._Alert.invalidWalletIndex();
            return;
        }
        if (this.current === undefined) {
            this._Alert.noCurrentWallet();
            return;
        }
        this.network = wallet.accounts[0].network;
        // Set other needed nodes
        this.setUtilNodes();
        // Account used
        this.currentAccount = wallet.accounts[index];
        this.algo = wallet.accounts[0].algo;
        return;
    }

    /**
     * Set util nodes according to network
     */
    setUtilNodes() {
        if (this.network === Network.data.Testnet.id) {
            this.searchNode = Nodes.testnetSearchNodes[0];
            this.chainLink = Nodes.defaultTestnetExplorer;
        } else if (this.network === Network.data.Mainnet.id) {
            this.searchNode = Nodes.mainnetSearchNodes[0];
            this.chainLink = Nodes.defaultMainnetExplorer;
        } else {
            this.searchNode = Nodes.mijinSearchNodes[0];
            this.chainLink = Nodes.defaultMijinExplorer;
        }
    }

    /**
     * Check if nodes present in local storage or set default according to network
     */
    setDefaultNode() {
        if (this.network == Network.data.Mainnet.id) {
            if (this._storage.selectedMainnetNode) {
                this.node = this._storage.selectedMainnetNode;
            } else {
                this.node = Nodes.defaultMainnetNode;
            }
        } else if (this.network == Network.data.Testnet.id) {
            if (this._storage.selectedTestnetNode) {
                this.node = this._storage.selectedTestnetNode;
            } else {
                this.node = Nodes.defaultTestnetNode;
            }
        } else {
            if (this._storage.selectedMijinNode) {
                this.node = this._storage.selectedMijinNode;
            } else {
                this.node = Nodes.defaultMijinNode;
            }
        }
    }

    /**
     * Set nty data in service if exists in local storage
     */
    setNtyData() {
        if (this.network == Network.data.Mainnet.id) {
            if (this._storage.ntyMainnet) {
                this.ntyData = this._storage.ntyMainnet;
            }
        } else if (this.network == Network.data.Testnet.id) {
            if (this._storage.ntyTestnet) {
                this.ntyData = this._storage.ntyTestnet;
            }
        } else {
            if (this._storage.ntyMijin) {
                this.ntyData = this._storage.ntyMijin;
            }
        }
    }

    /**
     * Set nty data into local storage and update in service
     *
     * @param data: The nty data
     */
    setNtyDataInLocalStorage(data) {
        if (this.network == Network.data.Mainnet.id) {
            this._storage.ntyMainnet = data;
        } else if (this.network == Network.data.Testnet.id) {
            this._storage.ntyTestnet = data;
        } else {
            this._storage.ntyMijin = data;
        }
        this.ntyData = data;
    }

    /**
     * Purge nty data from local storage and update in service
     */
    purgeNtyDataInLocalStorage() {
        if (this.network == Network.data.Mainnet.id) {
            delete this._storage.ntyMainnet;
        } else if (this.network == Network.data.Testnet.id) {
            delete this._storage.ntyTestnet;
        } else {
            delete this._storage.ntyMijin;
        }
        this.ntyData = undefined;
    }

    /**
     * Reset Wallet service properties
     */
    reset() {
        this.current = undefined;
        this.currentAccount = undefined;
        this.algo = undefined
        this.network = this._AppConstants.defaultNetwork;
        this.node = undefined;
        this.searchNode = undefined;
        this.chainLink = undefined;
        this.ntyData = undefined;
    }

}

export default Wallet;