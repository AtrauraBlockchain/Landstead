import CryptoHelpers from '../../../utils/CryptoHelpers';
import Sinks from '../../../utils/sinks';

class createMosaicCtrl {
    constructor($location, Wallet, Alert, Transactions, DataBridge, $filter) {
        'ngInject';

        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // Wallet service
        this._Wallet = Wallet;
        // Transactions service
        this._Transactions = Transactions;
        // DataBridge service
        this._DataBridge = DataBridge;
        // Filters
        this._$filter = $filter;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        /**
         *  Default mosaic definition transaction properties  
         */
        this.formData = {};
        this.formData.mosaicFeeSink = Sinks.sinks.mosaic[this._Wallet.network];
        this.formData.mosaicName = '';
        this.formData.namespaceParent = '';
        this.formData.mosaicDescription = '';
        this.formData.properties = {
           'initialSupply': 0,
            'divisibility': 0,
            'transferable': true,
            'supplyMutable': true
        }
        // Current address as default levy recipient
        this.formData.levy = {
            'mosaic': null,
            'address': this._Wallet.currentAccount.address,
            'feeType': 1,
            'fee': 5
        }
        this.formData.fee = 0;
        this.formData.mosaicFee = 0;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        // Default current account address (used in view to get namespace and mosaic owned by account)
        this.currentAccount = this._Wallet.currentAccount.address;
        // Has no levy by default
        this.hasLevy = false;
        // Mosaics owned names for current account
        this.currentAccountMosaicNames = '';
        // Selected mosaic from view
        this.selectedMosaic = '';

        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };

        // Get mosaics and namespaces for current account
        this.updateCurrentAccountNSM();

        this.updateFees();
    }

    /**
     * processMosaicName() Set name to lowercase and check it
     */
    processMosaicName(){
        // Lowercase mosaic name
        this.formData.mosaicName = this._$filter('lowercase')(this.formData.mosaicName);
        // Check mosaic name validity
        if(!this.mosaicIsValid(this.formData.mosaicName)) {
            this._Alert.invalidMosaicName();
            return;
        }
        this.updateFees();
    }

    /**
     * processMosaicDescription() Check description
     */
    processMosaicDescription() {
        if(!this.mosaicDescriptionIsValid(this.formData.mosaicDescription)) {
            this._Alert.invalidMosaicDescription();
            return;
        }
        this.updateFees();
    }

    /**
     * updateLevyMosaic() Update levy mosaic data
     *
     * @note: Used in view (ng-update) on hasLevy and selectedMosaic changes
     *
     * @param val: true or false
     */
    updateLevyMosaic(val) {
        if (val) {
            this.formData.levy.mosaic = this._DataBridge.mosaicOwned[this.currentAccount][this.selectedMosaic].mosaicId;
        } else {
            this.formData.levy.mosaic = null;
        }
    }

    /**
     * updateCurrentAccountNSM() Get current account namespaces & mosaic names
     *
     * @note: Used in view (ng-update) on multisig changes
     */
    updateCurrentAccountNSM() {
        //Fix this.formData.multisigAccount error on logout
        if (null === this.formData.multisigAccount) {
            return;
        }
        if (this.formData.isMultisig) {
            this.currentAccount = this.formData.multisigAccount.address;
        } else {
            this.currentAccount = this._Wallet.currentAccount.address;
        }
        // Set current account mosaics names if mosaicOwned is not undefined
        if (undefined !== this._DataBridge.mosaicOwned[this.currentAccount]) {
            this.currentAccountMosaicNames = Object.keys(this._DataBridge.mosaicOwned[this.currentAccount]).sort();
        } else {
            // 'nem:xem' is default
            this.currentAccountMosaicNames = ['nem:xem'];
        }
        // Default mosaic selected
        this.selectedMosaic = "nem:xem";
        // Set current account mosaics names if namespaceOwned is not undefined
        if (undefined !== this._DataBridge.namespaceOwned[this.currentAccount]) {
            let namespaceOwned = this._DataBridge.namespaceOwned[this.currentAccount];
            this.formData.namespaceParent = namespaceOwned[Object.keys(namespaceOwned)[0]];
        } else {
            this._Alert.noNamespaceOwned();
            this.formData.namespaceParent = '';
        }
        this.updateFees();
    }

     /**
     * mosaicIsValid() Check validity of mosaic name
     */
    mosaicIsValid(m) {
        // Test if correct length and if name starts with number or hyphens
        if (m.length > 32 || /^\d/.test(m) || /^([_-])/.test(m)) {
            return false;
        }
        let pattern = /^[a-z0-9.\-_]*$/;
        // Test if has special chars or space excluding hyphens
        if (pattern.test(m) == false) {
            return false;
          } else {
            return true;
          }
    }

    /**
     * mosaicDescriptionIsValid() Check validity of mosaic description
     */
    mosaicDescriptionIsValid(m) {
        // Test if correct length
        if (m.length > 512) {
            return false;
        }
        return true;
    }

    /**
     * updateFees() Update transaction fee
     */
    updateFees() {
        let entity = this._Transactions.prepareMosaicDefinition(this.common, this.formData);
        if (this.formData.isMultisig) {
            this.formData.innerFee = entity.otherTrans.fee;
            this.formData.mosaicFee = entity.otherTrans.creationFee;
        } else {
            this.formData.mosaicFee = entity.creationFee;
            this.formData.innerFee = 0;
        }
        this.formData.fee = entity.fee;
    }

    /**
     * send() Build and broadcast the transaction to the network
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
        let entity = this._Transactions.prepareMosaicDefinition(this.common, this.formData);
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
                this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
            });
    }

}

export default createMosaicCtrl;