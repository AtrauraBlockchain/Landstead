import CryptoHelpers from '../../../utils/CryptoHelpers';
import Sinks from '../../../utils/sinks';

class editMosaicCtrl {
    constructor($location, Wallet, Alert, Transactions, DataBridge) {
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

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }
 
        /**
         *  Default mosaic supply change transaction properties  
         */
        this.formData = {};
        this.formData.mosaic = '';
        this.formData.supplyType = 1;
        this.formData.delta = 0;
        this.formData.fee = 0;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        // Default current account address (used in view to get mosaic owned by account)
        this.currentAccount = this._Wallet.currentAccount.address;
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

        // Get mosaics for current account
        this.updateCurrentAccountMosaics();

        this.updateFees();
    }

    /**
     * updateMosaic() Update mosaic data for selected mosaic
     *
     * @note: Used in view (ng-update) on selected mosaic changes
     */
    updateMosaic() {
        this.formData.mosaic = this._DataBridge.mosaicOwned[this.currentAccount][this.selectedMosaic].mosaicId;
    }

    /**
     * updateCurrentAccountMosaics() Get current account mosaics owned names
     *
     * @note: Used in view (ng-update) on multisig changes
     */
    updateCurrentAccountMosaics() {
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
            this.currentAccountMosaicNames = ['nem:xem'];
        }
        // Default mosaic selected
        this.selectedMosaic = "nem:xem";

        this.updateFees();
    }

    /**
     * updateFees() Update transaction fee
     */
    updateFees() {
        let entity = this._Transactions.prepareMosaicSupply(this.common, this.formData);
        if (this.formData.isMultisig) {
            this.formData.innerFee = entity.otherTrans.fee;
        } else {
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
        let entity = this._Transactions.prepareMosaicSupply(this.common, this.formData);
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

export default editMosaicCtrl;