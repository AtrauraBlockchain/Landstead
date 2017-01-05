import helpers from '../../utils/helpers';
import CryptoHelpers from '../../utils/CryptoHelpers';
import Network from '../../utils/Network';

class LoginCtrl {
    constructor($localStorage, $location, Alert, Wallet, $timeout, AppConstants, Connector, DataBridge) {
        'ngInject';

        // Local storage
        this._storage = $localStorage;
        // $location for redirect
        this._location = $location;
        // Alert service
        this._Alert = Alert;
        // Wallet service
        this._Wallet = Wallet;
        // $timeout to digest asynchronously
        this._$timeout = $timeout;
        // Application constants
        this._AppConstants = AppConstants;
        // Connector
        this._Connector = Connector;
        // DataBridge service
        this._DataBridge = DataBridge;

        // Login properties
        this.selectedWallet = "";

        // Get wallets from local storage or create empty array
        this._storage.wallets = this._storage.wallets || [];

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': ''
        };

    }

    /**
     * loadWallet() Load the wallet in app and store in local storage
     *
     * @param data: base64 data from .wlt file
     * @param: isNCC: true if NCC wallet, false otherwise
     */
    loadWallet(data, isNCC) {
        if (!data) {
            this._Alert.noWalletData();
            return;
        }
        let wallet;
        if(isNCC) {
            // NCC wallet
            wallet = JSON.parse(data);
        } else {
            // Wallet base64 to word array
            let parsedWordArray = CryptoJS.enc.Base64.parse(data);
            // Word array to wallet string
            let walletStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
            // Wallet string to JSON object
            wallet = JSON.parse(walletStr);
        }

        //check if already present
        if (helpers.haveWallet(wallet.name, this._storage.wallets)) {
            this._Alert.walletNameExists();
        } else {
            // Set wallet in local storage
            this._storage.wallets = this._storage.wallets.concat(wallet);
            this._Alert.loadWalletSuccess();
        }
    }

    /**
     * login() Log into the application if no need to upgrade
     *
     * @param wallet: Wallet object
     */
    login(wallet) {
        if (!wallet) {
            this._Alert.cantLoginWithoutWallet();
            return;
        }
        // If mainnet disabled
        if(wallet.accounts[0].network === Network.data.Mainnet.id && this._AppConstants.mainnetDisabled) {
            this._Alert.mainnetDisabled();
            return;
        }
        // If mijinnet disabled
        if(wallet.accounts[0].network === Network.data.Mijin.id && this._AppConstants.mijinDisabled) {
            this._Alert.mijinDisabled();
            return;
        }
        // Check if the wallet have child or upgrade
        if (wallet.accounts[0].child) {
            // Decrypt/generate private key and check it. Returned private key is contained into this.common
            if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, wallet.accounts[0], wallet.accounts[0].algo, false)) {
                this._Alert.invalidPassword();
                // Enable send button
                this.okPressed = false;
                return;
            } else if (!CryptoHelpers.checkAddress(this.common.privateKey, wallet.accounts[0].network, wallet.accounts[0].address)) {
                this._Alert.invalidPassword();
                // Enable send button
                this.okPressed = false;
                return;
            }
            // Set the wallet object in Wallet service
            this._Wallet.setWallet(wallet);
            // Clean data
            this.clearSensitiveData();
            // Connect to node
            this.connect();
            // Redirect to dashboard
            this._location.path('/dashboard');
            return;
        } else {
            // Open upgrade modal
            $("#upgradeWallet").modal({
                keyboard: false
            });
        }
    }

    /**
     * upgradeWallet() Derive a child account using bip32 for each accounts in the wallet
     */
    upgradeWallet() {
        // Loop through all accounts
        for (let i = 0; i < Object.keys(this.selectedWallet.accounts).length; i++) {
            // Decrypt/generate private key and check it. Returned private key is contained into this.common
            if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this.selectedWallet.accounts[i], this.selectedWallet.accounts[i].algo, false)) {
                this._Alert.invalidPassword();
                return;
            } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this.selectedWallet.accounts[i].network, this.selectedWallet.accounts[i].address)) {
                this._Alert.invalidPassword();
                return;
            }
            // Generate bip32 data
            CryptoHelpers.generateBIP32Data(this.common.privateKey, this.common.password, 0, this.selectedWallet.accounts[i].network).then((data) => {
                this._$timeout(() => {
                    // Add generated child to account
                    this.selectedWallet.accounts[i].child = data.publicKey;
                });
            },
            (err) => {
                this._$timeout(() => {
                    this._Alert.bip32GenerationFailed(err);
                    // Clean data
                    this.clearSensitiveData();
                    return;
                }, 0)
            });
            // If last account
            if(i === Object.keys(this.selectedWallet.accounts).length - 1) {
                this._$timeout(() => {
                    this._Alert.upgradeSuccess();
                    // Hide modal
                    $("#upgradeWallet").modal('hide');
                    // Clean data
                    this.clearSensitiveData();
                    // Download wallet
                    this.download(this.selectedWallet);
                });
            }
        }
    }

    /**
     * download() Trigger download of the wallet
     *
     * @param wallet: Wallet object
     */
    download(wallet) {
        if (!wallet) {
            this._Alert.errorWalletDownload();
            return;
        }
        // Wallet object string to word array
        let wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(wallet));
        // Word array to base64
        let base64 = CryptoJS.enc.Base64.stringify(wordArray);
        // Set download element attributes
        $("#downloadWallet").attr('href', 'data:application/octet-stream,' + base64);
        $("#downloadWallet").attr('download', wallet.name + '.wlt');
        // Simulate click to trigger download
        document.getElementById("downloadWallet").click();
    }

    /**
     * clearSensitiveData() Reset the common object
     */
    clearSensitiveData() {
        this.common = {
            'password': '',
            'privateKey': ''
        };
    }

    /**
     * connect() Open connection to default node
     */
    connect() {
        let connector = this._Connector.create({
            'uri': this._Wallet.node
        }, this._Wallet.currentAccount.address);
        this._DataBridge.openConnection(connector);
    }

}

export default LoginCtrl;