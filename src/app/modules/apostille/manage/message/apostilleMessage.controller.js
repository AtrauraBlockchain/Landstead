import helpers from '../../../../utils/helpers';
import Address from '../../../../utils/Address';
import CryptoHelpers from '../../../../utils/CryptoHelpers';
import Network from '../../../../utils/Network';
import KeyPair from '../../../../utils/KeyPair';

class ApostilleMessageCtrl {
    constructor($location, Wallet, Alert, Transactions, NetworkRequests, DataBridge, $stateParams) {
        'ngInject';

        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // NetworkRequests service
        this._NetworkRequests = NetworkRequests;
        // Wallet service
        this._Wallet = Wallet;
        // Transactions service
        this._Transactions = Transactions;
        // DataBridge service
        this._DataBridge = DataBridge;
        // State parameters
        this._$stateParams = $stateParams;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        /**
         * Default transfer transaction properties 
         */
        this.formData = {};
        this.formData.recipient = this._$stateParams.address;
        this.formData.recipientPubKey = KeyPair.create(this._$stateParams.privateKey).publicKey.toString();
        this.formData.message = '';
        this.formData.amount = 0;
        this.formData.fee = 0;
        this.formData.encryptMessage = false;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];
        // Mosaics data
        // Counter for mosaic gid
        this.counter = 1;
        this.formData.mosaics = null;
        this.mosaicsMetaData = this._DataBridge.mosaicDefinitionMetaDataPair;
        this.formData.isMosaicTransfer = false;
        this.addNamespace = false;
        this.currentAccountMosaicNames = [];
        this.selectedMosaic = "nem:xem";
        // Mosaics data for current account
        this.currentAccountMosaicData = "";

        // Invoice mode not active by default
        this.invoice = false;

        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };

        // Message request QR
        this.invoiceData = {
            "v": this._Wallet.network === Network.data.Testnet.id ? 1 : 2,
            "data": {
                "addr": this.formData.recipient,
                "msg": "",
                "name": "Apostille message request"
            }
        };

        // Init account mosaics
        this.updateCurrentAccountMosaics();

        this.updateCurrentAccountNS();

        // Init invoice QR
        this.updateInvoiceQR();

        this.updateFees();
    }

    /**
     * Generate QR using kjua lib
     *
     * @param {string} text - A text string
     */
    generateQRCode(text) {
        let qrCode = kjua({
            size: 256,
            text: text,
            fill: '#000',
            quiet: 0,
            ratio: 2,
        });
        $('#invoiceQR').html(qrCode);
    }

    /**
     * Create the QR according to invoice data
     */
    updateInvoiceQR() {
        // Clean input address
        this.invoiceData.data.addr = this.invoiceData.data.addr.toUpperCase().replace(/-/g, '');
        this.invoiceString = JSON.stringify(this.invoiceData);
        // Generate the QR
        this.generateQRCode(this.invoiceString);
    }

    /**
     * Set or unset data for mosaic transfer
     */
    setMosaicTransfer() {
        if (this.formData.isMosaicTransfer) {
            // Set the initial mosaic array
            this.formData.mosaics = [{
                'mosaicId': {
                    'namespaceId': 'nem',
                    'name': 'xem'
                },
                'quantity': 0,
                'gid': 'mos_id_0'
            }];
            // In case of mosaic transfer amount is used as multiplier,
            // set to 1 as default
            this.formData.amount = 1;
        } else {
            // Reset mosaics array
            this.formData.mosaics = null;
            // Reset amount
            this.formData.amount = 0;
        }
        this.updateFees();
    }

    /**
     * Update transaction fee
     */
    updateFees() {
        let entity = this._Transactions.prepareTransfer(this.common, this.formData, this.mosaicsMetaData);
        if (this.formData.isMultisig) {
            this.formData.innerFee = entity.otherTrans.fee;
        } else {
             this.formData.innerFee = 0;
        }
        this.formData.fee = entity.fee;
    }

    /**
     * Get selected mosaic and push it in mosaics array
     */
    attachMosaic() {
        // increment counter 
        this.counter++;
        // Get current account
        let acct = this._Wallet.currentAccount.address;
        if (this.formData.isMultisig) {
            // Use selected multisig
            acct = this.formData.multisigAccount.address;
        }
        // Get the mosaic selected
        let mosaic = this._DataBridge.mosaicOwned[acct][this.selectedMosaic];
        // Check if mosaic already present in mosaics array
        let elem = $.grep(this.formData.mosaics, function(w) {
            return helpers.mosaicIdToName(mosaic.mosaicId) === helpers.mosaicIdToName(w.mosaicId);
        });
        // If not present, update the array
        if (elem.length === 0) {
            this.formData.mosaics.push({
                'mosaicId': mosaic['mosaicId'],
                'quantity': 0,
                'gid': 'mos_id_' + this.counter
            });

            this.updateFees();
        }
    }

    /**
     * Remove a mosaic from mosaics array
     * 
     * @param {number} index - Index of mosaic object in the array 
     */
    removeMosaic(index) {
        this.formData.mosaics.splice(index, 1);
        this.updateFees();
    }

    /**
     * Get current account mosaics names
     */
    updateCurrentAccountMosaics() {
            // Get current account
            let acct = this._Wallet.currentAccount.address;
            if (this.formData.isMultisig) {
                // Use selected multisig
                acct = this.formData.multisigAccount.address;
            }
            // Set current account mosaics names if mosaicOwned is not undefined
            if (undefined !== this._DataBridge.mosaicOwned[acct]) {
                this.currentAccountMosaicData = this._DataBridge.mosaicOwned[acct];
                this.currentAccountMosaicNames = Object.keys(this._DataBridge.mosaicOwned[acct]).sort(); 
            } else {
                this.currentAccountMosaicNames = ["nem:xem"]; 
                this.currentAccountMosaicData = "";
            }
            // Default selected is nem:xem
            this.selectedMosaic = "nem:xem";
    }

    /**
     * Get current account namespaces
     */
    updateCurrentAccountNS() {
        // Update current account if multisig selected
        if (this.formData.isMultisig) {
            this.currentAccount = this.formData.multisigAccount.address;
        } else {
            this.currentAccount = this._Wallet.currentAccount.address;
        }
        // Set current account mosaics names if namespaceOwned is not undefined
        if (undefined !== this._DataBridge.namespaceOwned[this.currentAccount]) {
            let namespaceOwned = this._DataBridge.namespaceOwned[this.currentAccount];
            this.namespaceParent = namespaceOwned[Object.keys(namespaceOwned)[0]];
        } else {
            this.namespaceParent = '';
        }
    }

    setMessage() {
        if(this.addNamespace && undefined !== this.namespaceParent.fqn) {
            this.formData.message = this.namespaceParent.fqn + ':';
        } else {
             this.formData.message = '';
        }
    }

    /**
     * Build and broadcast the transaction to the network
     */
    send() {
        // Disable send button;
        this.okPressed = true;

        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, true)) {
            this._Alert.invalidPassword();
            // Enable send button
            this.okPressed = false;
            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();
            // Enable send button
            this.okPressed = false;
            return;
        }

        // Build the entity to serialize
        let entity = this._Transactions.prepareTransfer(this.common, this.formData, this.mosaicsMetaData);
        // Construct transaction byte array, sign and broadcast it to the network
        return this._Transactions.serializeAndAnnounceTransaction(entity, this.common).then((res) => {
                // Check status
                if (res.status === 200) {
                    // If code >= 2, it's an error
                    if (res.data.code >= 2) {
                        this._Alert.transactionError(res.data.message);
                    } else {
                        this._Alert.transactionSuccess();
                    }
                }
                // Enable send button
                this.okPressed = false;
                // Delete private key in common
                this.common.privateKey = '';
            },
            (err) => {
                // Delete private key in common
                this.common.privateKey = '';
                // Enable send button
                this.okPressed = false;
                if(err.status === -1) {
                    this._Alert.connectionError();
                } else {
                    this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
                }
            });
    }

}

export default ApostilleMessageCtrl;