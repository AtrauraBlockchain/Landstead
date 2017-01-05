import CryptoHelpers from '../../utils/CryptoHelpers';
import Network from '../../utils/Network';
import helpers from '../../utils/helpers';

class SignupCtrl {
    constructor(AppConstants, $state, Alert, WalletBuilder, $localStorage, $timeout) {
        'ngInject';

        //Local storage
        this._storage = $localStorage;
        // Alert service
        this._Alert = Alert;
        // WalletBuilder service
        this._WalletBuilder = WalletBuilder;
        // $state for redirect
        this._$state = $state;
        // App constants
        this._AppConstants = AppConstants;
        // $timeout to digest asynchronously
        this._$timeout = $timeout;

        // Signup properties
        this.network = this._AppConstants.defaultNetwork;
        // Available networks
        this.networks = Network.data;
        // Get wallets from local storage or create empty array
        this._storage.wallets = this._storage.wallets || [];
        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Wallet types
        this.walletTypes = [{
            "type": 1 // Simple
        }, {
            "type": 2 // Brain
        }, {
            "type": 3 // Private key
        }];

        // Default is "create a new wallet" (PRNG)
        this._selectedType = this.walletTypes[0];
    }

    /**
     * changeWalletType() Change the selected wallet type
     *
     * @param type: Type number
     */
    changeWalletType(type) {
        // Set wallet type
        this._selectedType = this.walletTypes[type - 1];
    }

    /**
     * changeNetwork() Change wallet network
     *
     * @param network: Network id to use at wallet creation
     */
    changeNetwork(id) {
        if (id == Network.data.Mijin.id && this._AppConstants.mijinDisabled) {
            this._Alert.mijinDisabled();
            // Reset network to default
            this.network = this._AppConstants.defaultNetwork;
            return;
        } else if (id == Network.data.Mainnet.id && this._AppConstants.mainnetDisabled) {
            this._Alert.mainnetDisabled();
            // Reset network to default
            this.network = this._AppConstants.defaultNetwork;
            return;
        }
        // Set Network
        this.network = id;
    }

    /**
     * download() trigger download of the wallet
     *
     * @param wallet: Wallet object
     */
    download(wallet) {
        if (!wallet) {
            this._Alert.errorWalletDownload();
            return;
        }
        // Wallet object string to word array
        var wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(wallet));
        // Word array to base64
        var base64 = CryptoJS.enc.Base64.stringify(wordArray);
        // Set download element attributes
        $("#downloadWallet").attr('href', 'data:application/octet-stream,' + base64);
        $("#downloadWallet").attr('download', wallet.name + '.wlt');
        // Simulate click to trigger download
        document.getElementById("downloadWallet").click();
    }

    /**
     * createWallet() create a new PRNG wallet
     */
    createWallet() {
            // Check form
            if (!this.formData || !this.formData.walletName || !this.formData.password || !this.formData.confirmPassword) {
                this._Alert.missingFormData();
                return;
            }

            // Check if wallet already loaded
            if (helpers.haveWallet(this.formData.walletName, this._storage.wallets)) {
                this._Alert.walletNameExists();
                return;
            }

            // Check if passwords match
            if (this.formData.password !== this.formData.confirmPassword) {
                this._Alert.passwordsNotMatching();
                return;
            }

            this.okPressed = true;

                // Create the wallet from form data
                return this._WalletBuilder.createWallet(this.formData.walletName, this.formData.password, this.network).then((wallet) => {
                    this._$timeout(() => {
                        if (wallet) {
                            // On success concat new wallet to local storage wallets
                            this._storage.wallets = this._storage.wallets.concat(wallet);
                            this._Alert.createWalletSuccess();
                            // Reset form data
                            this.formData = "";
                            // Trigger download
                            this.download(wallet);
                            console.log(this._storage.wallets);
                            this.okPressed = false;
                            // Redirect to login
                            this._$state.go("app.login");
                        }
                    }, 10);
                },
                (err) => {
                    this._Alert.createWalletFailed(err);
                    this.okPressed = false;
                });
    }

    /**
     * createBrainWallet() create a new brain wallet
     */
    createBrainWallet() {
            // Check form
            if (!this.formData || !this.formData.walletName || !this.formData.password || !this.formData.confirmPassword) {
                this._Alert.missingFormData();
                return;
            }

            // Check if wallet already loaded
            if (helpers.haveWallet(this.formData.walletName, this._storage.wallets)) {
                this._Alert.walletNameExists();
                return;
            }

            // Check if passwords match
            if (this.formData.password !== this.formData.confirmPassword) {
                this._Alert.passwordsNotMatching();
                return;
            }

            this.okPressed = true;

                // Create the wallet from form data
                return this._WalletBuilder.createBrainWallet(this.formData.walletName, this.formData.password, this.network).then((wallet) => {
                    this._$timeout(() => {
                        if (wallet) {
                            // On success concat new wallet to local storage wallets
                            this._storage.wallets = this._storage.wallets.concat(wallet);
                            this._Alert.createWalletSuccess();
                            // Reset form data
                            this.formData = "";
                            // Trigger download
                            this.download(wallet)
                            console.log(this._storage.wallets);
                            this.okPressed = false;
                            // Redirect to login
                            this._$state.go("app.login");
                        }
                    }, 10);
                },
                (err) => {
                    this._Alert.createWalletFailed(err);
                    this.okPressed = false;
                });
    }

    /**
     * createPrivateKeyWallet() create a new private key wallet
     */
    createPrivateKeyWallet() {
            // Check form
            if (!this.formData || !this.formData.walletName || !this.formData.password || !this.formData.confirmPassword || !this.formData.address || !this.formData.privateKey) {
                this._Alert.missingFormData();
                return;
            }

            // Check if wallet already loaded
            if (helpers.haveWallet(this.formData.walletName, this._storage.wallets)) {
                this._Alert.walletNameExists();
                return;
            }

            // Check if passwords match
            if (this.formData.password !== this.formData.confirmPassword) {
                this._Alert.passwordsNotMatching();
                return;
            }

            // Check if address match private key provided
            if (!CryptoHelpers.checkAddress(this.formData.privateKey, this.network, this.formData.address.toUpperCase().replace(/-/g, ''))) {
                this._Alert.invalidKeyForAddress();
                return;
            }

            this.okPressed = true;

                // Create the wallet from form data
                return this._WalletBuilder.createPrivateKeyWallet(this.formData.walletName, this.formData.password, this.formData.address, this.formData.privateKey, this.network).then((wallet) => {
                    this._$timeout(() => {
                        if (wallet) {
                            // On success concat new wallet to local storage wallets
                            this._storage.wallets = this._storage.wallets.concat(wallet);
                            this._Alert.createWalletSuccess();
                            // Reset form data
                            this.formData = "";
                            // Trigger download
                            this.download(wallet)
                            console.log(this._storage.wallets);
                            this.okPressed = false;
                            // Redirect to login
                            this._$state.go("app.login");
                        }
                    }, 10);
                },
                (err) => {
                    this._Alert.createWalletFailed(err);
                    this.okPressed = false;
                });
    }

}

export default SignupCtrl;