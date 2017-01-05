import helpers from '../../utils/helpers';
import CryptoHelpers from '../../utils/CryptoHelpers';
import Network from '../../utils/Network';

class AccountCtrl {
    constructor(AppConstants, $localStorage, $location, Alert, Wallet, Connector, DataBridge, $timeout) {
        'ngInject';

        // Application constants
        this._AppConstants = AppConstants;
        // Wallet service
        this._Wallet = Wallet;
        // $location to redirect
        this._location = $location;
        //Local storage
        this._storage = $localStorage;
        // Alert service
        this._Alert = Alert;
        // Connector service
        this._Connector = Connector;
        // DataBridge service
        this._DataBridge = DataBridge;
        // $timeout for async digest
        this._$timeout = $timeout;

        // Default account properties
        this.selectedWallet = '';
        this.moreThanOneAccount = false;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        // Hide private key field by default
        this.showPrivateKeyField = false;
       
        // Empty default label for added account
        this.newAccountLabel = "";

        // Check number of accounts in wallet to show account selection in view
        this.checkNumberOfAccounts();

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': ''
        };

        // Wallet model for QR
        // @note: need to handle labels
        this.WalletModelQR = {
            'nem': {
                'type': 1,
                'version': 1,
                'name': this._Wallet.current.name,
                'enc_priv': this._Wallet.currentAccount.encrypted,
                'iv': this._Wallet.currentAccount.iv,
                'indexes': Object.keys(this._Wallet.current.accounts).length,
                'accountLabels': []
            }
        };

        // Account info model for QR
        this.accountInfoModelQR = {
            "v": 1,
            "type": 1,
            "data": {
                "addr": this._Wallet.currentAccount.address,
                "name": this._Wallet.current.name
            }
        }

        // Generate QR using kjua lib
        this.encodeQrCode = function(text, type) {
            let qrCode = kjua({
                size: 256,
                text: text,
                fill: '#000',
                quiet: 0,
                ratio: 2,
            });
            if (type === "wallet") {
                $('#exportWalletQR').append(qrCode);
            } else if (type === "mobileWallet") {
                $('#mobileWalletForm').html("");
                $('#mobileWalletQR').append(qrCode);
            } else {
                $('#accountInfoQR').append(qrCode);
            }
        }

        // Stringify the wallet object for QR
        this.walletString = JSON.stringify(this.WalletModelQR);
        // Stringify the account info object for QR
        this.accountString = JSON.stringify(this.accountInfoModelQR);
        // Generate the QRs
        this.encodeQrCode(this.walletString, "wallet");
        this.encodeQrCode(this.accountString, "accountInfo");
    }

    /**
     * Generate the mobile wallet QR
     */
    generateWalletQR() {
        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, false)) {
            this._Alert.invalidPassword();
            this.showPrivateKeyField = false;
            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();
            this.showPrivateKeyField = false;
            return;
        }

        let mobileKeys = CryptoHelpers.AES_PBKF2_encryption(this.common.password, this.common.privateKey)

        let QR = {
            "v": this._Wallet.network === Network.data.Testnet.id ? 1 : 2,
            "type":3,
            "data": {
                "name": this._Wallet.current.name,
                "priv_key": mobileKeys.encrypted,
                "salt": mobileKeys.salt
            }
        };

        let QRstring = JSON.stringify(QR);
        this.encodeQrCode(QRstring, "mobileWallet");
        this.clearSensitiveData();
    }

    /**
     * Reveal the private key
     */
    showPrivateKey() {
        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, true)) {
            this._Alert.invalidPassword();
            this.showPrivateKeyField = false;
            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();
            this.showPrivateKeyField = false;
            return;
        }
        this.showPrivateKeyField = true;
    }

    /**
     * Change current account
     *
     * @param {number} accountIndex - The account index in the wallet.accounts object
     */
    changeCurrentAccount(accountIndex) {
        // Close the connector
        this._DataBridge.connector.close()
        this._DataBridge.connectionStatus = false;
        // Reset DataBridge service properties
        this._DataBridge.reset();
        // Set the selected account
        this._Wallet.setWalletAccount(this._Wallet.current, accountIndex);
        // Connect
        let connector = this._Connector.create({
            'uri': this._Wallet.node
        }, this._Wallet.currentAccount.address);
        this._DataBridge.openConnection(connector);
        // Redirect to dashboard
        this._location.path('/dashboard');
    }

    /**
     * Trigger download of the wallet
     *
     * @param {object} wallet - A wallet object
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
     * Check the number of accounts in wallet
     */
    checkNumberOfAccounts() {
        if (Object.keys(this._Wallet.current.accounts).length > 1) {
            this.moreThanOneAccount = true;
        }
    }

    /**
     * Add a new bip32 account into the wallet
     */
    addNewAccount() {
        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.current.accounts[0], this._Wallet.algo, false)) {
            this._Alert.invalidPassword();
            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.current.accounts[0].address)) {
            this._Alert.invalidPassword();
            return;
        }
        // Current number of accounts in wallet + 1
        let newAccountIndex = Object.keys(this._Wallet.current.accounts).length;
        // Derive the account at new index
        CryptoHelpers.generateBIP32Data(this.common.privateKey, this.common.password, newAccountIndex, this._Wallet.network).then((data) => {
                let generatedAccount = data.address;
                let generatedPrivateKey = data.privateKey;
                // Generate the bip32 seed for the new account
                CryptoHelpers.generateBIP32Data(generatedPrivateKey, this.common.password, 0, this._Wallet.network).then((data) => {
                        this._$timeout(() => {
                            // Encrypt generated account's private key
                            let encrypted = CryptoHelpers.encodePrivKey(generatedPrivateKey, this.common.password);
                            // Build account object
                            let obj = {
                                "address": generatedAccount,
                                "label": this.newAccountLabel,
                                "child": data.publicKey,
                                "encrypted": encrypted.ciphertext,
                                "iv": encrypted.iv
                            };
                            // Set created object in wallet
                            this._Wallet.current.accounts[newAccountIndex] = obj;
                            // Update to show account selection
                            this.checkNumberOfAccounts();
                            // Show alert
                            this._Alert.generateNewAccountSuccess();
                            // Clean
                            this.clearSensitiveData();
                            // Hide modal
                            $("#addAccountModal").modal('hide');
                        }, 0)
                    },
                    (err) => {
                        this._$timeout(() => {
                            this._Alert.bip32GenerationFailed(err);
                            return;
                        }, 0);
                    });
            },
            (err) => {
                this._$timeout(() => {
                    this._Alert.derivationFromSeedFailed(err);
                    return;
                }, 0);
            });
    }

    /**
     * Reset the common object
     */
    clearSensitiveData() {
        this.common = {
            'password': '',
            'privateKey': ''
        };
        this.showPrivateKeyField = false;
        this.newAccountLabel = "";
    }


}

export default AccountCtrl;