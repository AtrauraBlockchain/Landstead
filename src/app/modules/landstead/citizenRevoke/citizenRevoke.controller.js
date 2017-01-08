import CryptoHelpers from '../../../utils/CryptoHelpers';
import Network from '../../../utils/Network';
import helpers from '../../../utils/helpers';
import KeyPair from '../../../utils/KeyPair';
import Address from '../../../utils/Address';


class citizenRevokeCtrl {
    // Set services as constructor parameter

    constructor($q, $location, $timeout, $localStorage, Alert, WalletBuilder, AppConstants, NetworkRequests, Wallet, Transactions, DataBridge ) {
        'ngInject';

        // Location service <- check
        this._location = $location;
        this._q = $q;

        // $timeout to digest asynchronously
        this._$timeout = $timeout;

        //Local storage
        this._storage = $localStorage;
        
        // Alert service
        this._Alert = Alert;

        // WalletBuilder service
        this._WalletBuilder = WalletBuilder;
        
        // $state for redirect
        //this._$state = $state;
        
        // App constants
        this._AppConstants = AppConstants;
        
        // Get wallets from local storage or create empty array
        this._storage.wallets = this._storage.wallets || [];

        // NetworkRequests service
        this._NetworkRequests = NetworkRequests;

        // Wallet service
        this._Wallet = Wallet;

        // Transactions service
        this._Transactions = Transactions;

        // DataBridge service
        this._DataBridge = DataBridge;

        // To store our password and decrypted/generated private key
        this.common = {
        "password": "",
        "privateKey": ""
        }

        //If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        // current network
        this.network = this._Wallet.network;


        /**
        * Default simple transfer properties
        */
        this.transferData = {}
        this.transferData.recipient = '';
        this.transferData.amount = 0;
        this.transferData.message = '';
        this.transferData.encryptMessage = false;
        this.transferData.fee = 0;
        this.transferData.innerFee = 0;
        // TODO: What if multisig?
        this.transferData.isMultisig = false;
        this.transferData.multisigAccount = '';

        // Mosaics data
        // Counter for mosaic gid
        this.counter = 1;
        this.transferData.mosaics = null;
        this.mosaicsMetaData = this._DataBridge.mosaicDefinitionMetaDataPair;
        this.transferData.isMosaicTransfer = false;
        this.currentAccountMosaicNames = [];
        this.selectedMosaic = "nem:xem";
        // Mosaics data for current account
        this.currentAccountMosaicData = "";


        /****** USECASE Variables ******/

        this.step = {}
        this.country = "atlantis";

        this.namespaces = {}
        this.namespaces.country = this.country;
        this.namespaces.register = this.country+".register";
        this.namespaces.revoke = this.country+".revoke";


        //2.1  Officer inputs ID:country
        this.citizenID = "ATRAURA BLOCKCHAIN LOVES NEM";
        this.citizenAccount = "TAGX3L3FKQPL7PZ7UKU2VMDO5QZLNU7POM36SACJ";
      
        this.buttonDisabled = false;
        
        //2.2 [CP] BW gets created
        this.step.bwCreated = false;
        this.cpAccount = "";

        //2.3 [CP] is set to be a MultiSignature acct from [G] 
        this.step.cpMultiSigReady = false;

        //2.4 [G] sends message (ID=C) to [CP]
        this.step.cpLinked = false;
        //2.5 [G] creates and sends atlantis.register:citizen to [CP]
        this.step.tokensToCP = false;
        //2.6 [G] creates and sends atlantis:citizen to [C]
        this.step.tokensToC = false;

        // Init account mosaics
        this._updateCurrentAccountMosaics();
    }

    /**
     * _updateCurrentAccountMosaics() Get current account mosaics names
     */
    _updateCurrentAccountMosaics() {
        //Fix this.transferData.multisigAccount error on logout
        if (null === this.transferData.multisigAccount) {
            return;
        }
            // Get current account
            let acct = this._Wallet.currentAccount.address;
            if (this.transferData.isMultisig) {
                // Use selected multisig
                acct = this.transferData.multisigAccount.address;
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
     * _checkAccess() Ensure that the user is authentic by checking his password and setting the private key to this.common
     */
    _checkAccess(){
        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, true)) {
            this._Alert.invalidPassword();
            // Enable send button
            this.buttonDisabled = false;
            return false;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();
            // Enable send button
            this.buttonDisabled = false;
            return false;
        }
        return true;
    }

    /**
     * _processRecipient() Process recipient input and get data from network
     */
    _processRecipient(transferData) {
        // return if no value or address length < to min address length
        if (!transferData || !transferData.recipient || transferData.recipient.length < 40) {
            return;
        }

        // Clean address
        let recipientAddress = transferData.recipient.toUpperCase().replace(/-/g, '');
        // Check if address is from the same network
        if (Address.isFromNetwork(recipientAddress, this.network)) {
            // Get recipient account data from network
            return this._NetworkRequests.getAccountData(helpers.getHostname(this._Wallet.node), recipientAddress).then((data) => {
                    // Store recipient public key (needed to encrypt messages)
                    transferData.recipientPubKey = data.account.publicKey;
                    console.log(transferData.recipientPubKey)
                    // Set the address to send to
                    transferData.recipient = recipientAddress;
                },
                (err) => {
                    this._Alert.getAccountDataError(err.data.message);
                    // Reset recipient data
                    // this.resetRecipientData();
                    return;
                });
        } else {
            // Error
            this._Alert.invalidAddressForNetwork(recipientAddress, this._Wallet.network);
            // Reset recipient data
            return;
        }

    }

    /**
     * _createBrainWallet() creates a new brain wallet using the seed as name and passphrase and sets it for further operations
     */
    _createBrainWallet(seed) {
        var deferred = this._q.defer();
        var promise = deferred.promise;

        if (!seed) {
            this._Alert.missingtransferData();
            this.buttonDisabled = false;
            return;
        }

        // Create the brain wallet from the seed on the form. 
        // We want the official to create the brainwallet 
        this._WalletBuilder.createBrainWallet(seed, seed, this.network).then((wallet) => {
            this._$timeout(() => {
                if (wallet) {
                    // On success concat new wallet to local storage wallets
                    this._storage.wallets = this._storage.wallets.concat(wallet);
                    this._Alert.createWalletSuccess();
                    
                    this.step.bwCreated = true;
                    this.cpAccount = wallet['accounts']['0']['address'];
                    deferred.resolve(true);
                }
            }, 10);
        },
        (err) => {
            this._Alert.createWalletFailed(err);
            this.buttonDisabled = false;
            deferred.reject(false);
        });

        return deferred.promise;
    }

    /**
     * _send(transferData) Sends a transaction to the network based on transferData
     */
    _send(transferData){
        // Check that the recipient is a valid account and process it's public key
        this._processRecipient(transferData);

        // Build the entity to serialize
        let entity = this._Transactions.prepareTransfer(this.common, transferData, this.mosaicsMetaData);

        // Construct transaction byte array, sign and broadcast it to the network
        return this._Transactions.serializeAndAnnounceTransaction(entity, this.common).then((result) => {
            // Check status
            if (result.status === 200) {
                // If code >= 2, it's an error
                if (result.data.code >= 2) {
                    this._Alert.transactionError(result.data.message);
                } else {
                    this._Alert.transactionSuccess();
                }
            }
        },
        (err) => {
            // Delete private key in common
            // this.common.privateKey = '';
            // Enable send button
            this.buttonDisabled = false;
            this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
        });
    }

    /**
     * _sendMessage() Sends a minimal transaction containing a message to poin 
     */
    _sendMessage(recipient, message) {

        var transferData = {}
        transferData = this.transferData;
        transferData.recipient = recipient;
        transferData.amount = 0;
        transferData.message = message;
        transferData.encryptMessage = false; // Maybe better to encrypt?

        return this._send(transferData);
    }

    _sendMosaic(recipient, namespaceId, mosaic, amount) {
        var transferData = {}
        transferData = this.transferData;
        console.log(this.transferData);

        transferData.recipient = recipient;
        transferData.amount = 0;
        transferData.message = "";
        transferData.encryptMessage = false; // Maybe better to encrypt?

        // Setup mosaic information
        // Set the initial mosaic array
        transferData.mosaics = [{
            'mosaicId': {
                'namespaceId': namespaceId,
                'name': mosaic
            },
            'quantity': amount,
        }];
        // In case of mosaic transfer amount is used as multiplier,
        // set to 1 as default
        transferData.amount = 1;

        // this.updateFees();

        return this._send(transferData);
    }

    /**
     * This usecase showcases how to revoke a citizen account
     *    - 0. A Government officer is logged into this account and a Citizen already owns an account (citizenAccount)
     *    - 1. [G] creates and sends atlantis:citizen to [C]
     */
    submit(){

        // Verify password and generate/get the PK into this.common
        if(!this._checkAccess()){
            return;
        }

        // User is authorized, starting...
        this.buttonDisabled = true;
        console.log("Invalidating  citizen...");

        //2.6 [G] creates and sends atlantis:revoke:citizen to [C]
        console.log("Sending token to C: " + this.citizenAccount);
        this._sendMosaic(this.citizenAccount, this.namespaces.revoke, "citizen", 1).then((data)=>{
            this.step.tokensToC = true;
        },
        (err) => {
            // Delete private key in common
            this.common.privateKey = '';
            // Enable send button
            this.buttonDisabled = false;
            this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
        });  
    }
}

export default citizenRevokeCtrl;