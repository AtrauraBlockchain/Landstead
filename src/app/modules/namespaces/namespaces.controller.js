import CryptoHelpers from '../../utils/CryptoHelpers';
import Sinks from '../../utils/sinks';

class NamespacesCtrl {
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
         *  Default provision namespace transaction properties  
         */
        this.formData = {};
        this.formData.rentalFeeSink = Sinks.sinks.namespace[this._Wallet.network];
        this.formData.rentalFee = 0;
        this.formData.namespaceName = '';
        this.formData.namespaceParent = null;
        this.formData.fee = 0;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };
        // Default current address (used in view to get namespace owned by account)
        this.currentAccount = this._Wallet.currentAccount.address;

        this.updateCurrentAccountNS();

        this.updateFees();

    }

    /**
     * isNotNamespaceLevel3() Exclude level 3 namespace
     *
     * @param elem: The element to check
     */
    isNotNamespaceLevel3(elem) {
        return elem.fqn.split('.').length < 3
    };

    /**
     * processNamespaceName() Set name to lowercase and check it
     */
    processNamespaceName() {
        // lowercase namespace name
        this.formData.namespaceName = this._$filter('lowercase')(this.formData.namespaceName);
        // Check namespace validity
        if(!this.namespaceIsValid(this.formData.namespaceName)) {
            this._Alert.invalidNamespaceName();
            return;
        }
    }

    /**
     * updateCurrentAccountNS() Get current account namespaces & mosaic names
     *
     * @note: Used in view (ng-update) on multisig changes
     */
    updateCurrentAccountNS() {
        //Fix this.formData.multisigAccount error on logout
        if (null === this.formData.multisigAccount) {
            return;
        }
        // Update current account if multisig selected
        if (this.formData.isMultisig) {
            this.currentAccount = this.formData.multisigAccount.address;
        } else {
            this.currentAccount = this._Wallet.currentAccount.address;
        }
        // Set current account mosaics names if namespaceOwned is not undefined
        if (undefined !== this._DataBridge.namespaceOwned[this.currentAccount]) {
            let namespaceOwned = this._DataBridge.namespaceOwned[this.currentAccount];
            this.formData.namespaceParent = namespaceOwned[Object.keys(namespaceOwned)[0]];
        } else {
            this.formData.namespaceParent = '';
        }
        this.updateFees();
    }

    /**
     * updateFees() Update transaction fee
     */
    updateFees() {
        let entity = this._Transactions.prepareNamespace(this.common, this.formData);
        if (this.formData.isMultisig) {
            this.formData.innerFee = entity.otherTrans.fee;
            this.formData.rentalFee = entity.otherTrans.rentalFee;
        } else {
            this.formData.rentalFee = entity.rentalFee;
            this.formData.innerFee = 0;
        }
        this.formData.fee = entity.fee;
    }

    /**
     * namespaceIsValid() Check validity of namespace name
     *
     * @param ns: The namespace name
     */
    namespaceIsValid(ns) {
        // Test if correct length and if name starts with number or hyphens
        if (!this.formData.namespaceParent ? ns.length > 16 : ns.length > 64 || /^\d/.test(ns) || /^([_-])/.test(ns)) {
            return false;
        }
        let pattern = /^[a-z0-9.\-_]*$/;
        // Test if has special chars or space excluding hyphens
        if (pattern.test(ns) == false) {
            return false;
          } else {
            return true;
          }
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
        let entity = this._Transactions.prepareNamespace(this.common, this.formData);
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

export default NamespacesCtrl;