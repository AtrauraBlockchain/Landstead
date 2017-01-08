import CryptoHelpers from '../../../utils/CryptoHelpers';
import Network from '../../../utils/Network';
import helpers from '../../../utils/helpers';
import KeyPair from '../../../utils/KeyPair';
import Address from '../../../utils/Address';

class propertyOwnershipRegisterCtrl {
    // Set services as constructor parameter

    constructor($q, $location, $timeout, $localStorage, $filter, Alert, WalletBuilder, AppConstants, NetworkRequests, Wallet, Transactions, DataBridge ) {
        'ngInject';

        // Location service <- check
        this._location = $location;
        this._q = $q;
        this._filter = $filter;

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

        this.namespaces = {};
        this.namespaces.country = "country."+this.country;
        this.namespaces.register = this.namespaces.country+".register";
        this.namespaces.revoke = this.namespaces.country+".revoke";


        this.buttonDisabled = false;

        // 0. Officer inputs ID:dateOfBirth,NIS,...:country
        //Randomize sample
        var randomnumber = Math.floor(Math.random() * (999999999999 - 111111111111 + 1)) + 111111111111;
        this.propertyID = randomnumber;
        this.citizenID = '807897777200';
        this.citizenAccount = "TDTSZ6TYSPR7PBH3SQJJ4F3Q3URQJGQMODY7PYME"; //"this is a test wallet2"
        // 1. [P] gets created from IDp@country:parcel
        this.step.bwCreated = false;
        // 2. [G] sends message IDp together with 1 country:parcel Mosaic to [P]
        this.step.cpLinked = false;
        this.step.tokensToCP = false;
        // 3. [CP] is set to be a MultiSignature acct from [G] 
        this.step.cpOwned = false;
        // 4. [P] becomes MS for protection
        this.step.success = false;

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

                    var mainAccount = {};
                    mainAccount.address = wallet.accounts[0].address;
                    mainAccount.password = seed;
                    mainAccount.privateKey = "";

                    // Decrypt/generate private key and check it. Returned private key is contained into this.common
                    if (!CryptoHelpers.passwordToPrivatekeyClear(mainAccount, wallet.accounts[0], wallet.accounts[0].algo, false)) {
                        this._Alert.invalidPassword();
                        return;
                    } 

                    mainAccount.publicKey = KeyPair.create(mainAccount.privateKey).publicKey.toString();

                    // On success concat new wallet to local storage wallets
                    this._storage.wallets = this._storage.wallets.concat(wallet);
                    this._Alert.createWalletSuccess();
                    
                    this.cpAccount = wallet['accounts']['0']['address'];

                    this.step.bwCreated = true;
                    deferred.resolve(mainAccount);
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
     * _send(entity) Sends a transaction to the network based on an entity
     */
    _send(entity, common){
        // Construct transaction byte array, sign and broadcast it to the network
        return this._Transactions.serializeAndAnnounceTransaction(entity, common).then((result) => {
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
            // Enable send button
            this.buttonDisabled = false;
            this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
        });
    }

    /**
     * _sendMessage(recipient, message) Sends a minimal transaction containing a message to poin 
     */
    _sendMessage(recipient, message, common) {

        var transferData = {}

        // Check that the recipient is a valid account and process it's public key
        transferData.recipient = recipient;
        this._processRecipient(transferData);
        // transferData.recipientPubKey is set now

        transferData.amount = 0;
        transferData.message = message;
        transferData.encryptMessage = false; // Maybe better to encrypt?
        transferData.isMultisig = false;
        transferData.isMosaicTransfer = false;


        // Build the entity to send
        let entity = this._Transactions.prepareTransfer(common, transferData, this.mosaicsMetaData);
        return this._send(entity, common);
    }

    /**
     * _sendMosaic(recipient, namespaceId, mosaics, amount) Sends a minimal transaction containing one or more mosaics 
     */
    _sendMosaic(recipient, namespaceId, mosaics, amount, common, options) {

        var xem = ""
        var message = ""
        if(options.xem) xem = options.xem;
        if(options.message) message = options.message;

        var transferData = {}
        
        // Check that the recipient is a valid account and process it's public key
        transferData.recipient = recipient;
        this._processRecipient(transferData);
        // transferData.recipientPubKey is set now

        // In case of mosaic transfer amount is used as multiplier, set to 1 as default
        transferData.amount = 1;

        // Other necessary
        transferData.message = message;
        transferData.encryptMessage = false;

        // Setup mosaics information
        transferData.mosaics = [{
            'mosaicId': {
                'namespaceId': namespaceId,
                'name': mosaics
            },
            'quantity': amount,
        }];

        if(xem > 0){
            transferData.mosaics[1] = {
                'mosaicId': {
                    'namespaceId': "nem",
                    'name': 'xem'
                },
                'quantity': xem,
            }
        }
        
        // Build the entity to send
        let entity = this._Transactions.prepareTransfer(common, transferData, this.mosaicsMetaData);
        return this._send(entity, common);
    }

    /**
     * _sendOwnedBySelf(subjectAccount)
     *    > subjectFullAccount.publicKey
     *    > subjectFullAccount.privateKey
     *    > subjectFullAccount.account
     *    > ownersArray[0].publicKey
     */
    _sendOwnedBy(subjectFullAccount, ownerAccoutAddress) {

        return this._NetworkRequests.getAccountData(helpers.getHostname(this._Wallet.node), ownerAccoutAddress).then((account)=>{

            // Obtain public key and address
            console.log("account",account);
            let owner = {};
            owner.address = account.account.address;
            owner.publicKey = account.account.publicKey;

            // Set current account as owner
            let ownersArray = [{}];
            ownersArray[0].pubKey = owner.publicKey;

            // Set transferData
            let transferData = {};

            transferData.minCosigs = 1;
            transferData.accountToConvert = subjectFullAccount.publicKey; // OJO!!!!
            transferData.cosignatoryAddress = owner.address;
            transferData.multisigPubKey = subjectFullAccount.publicKey;
            
            // Build the entity to send
            console.log("subjectFullAccount", subjectFullAccount);
            let entity = this._Transactions._constructAggregate(transferData, ownersArray);
            return this._send(entity, subjectFullAccount);
        });
    }

    /**
     * _ownsMosaic(address,namespace, mosaic) Checks if address owns any mosaics from namespace:mosaic
     * Returns: bool
     */
    _ownsMosaic(address,namespace, mosaic){
        var deferred = this._q.defer();
        var promise = deferred.promise;
        this._NetworkRequests.getMosaicsDefinitions(helpers.getHostname(this._Wallet.node), address).then((result)=>{
            let owns = false;
            if(result.data.length) {
                for (let i = 0; i < result.data.length; ++i) {
                    let rNamespace = result.data[i].id.namespaceId;
                    let rMosaic = result.data[i].id.name;   
                    if(namespace == rNamespace && mosaic == rMosaic){
                        owns = true;
                    }
                }
            }
            deferred.resolve(owns);
        }, 
        (err) => {
            if(err.status === -1) {
                this._Alert.connectionError();
            } else {
                this._Alert.errorGetMosaicsDefintions(err.data.message);
            }
        });
        return deferred.promise;
    }

    /**
     * _getTransactionMessagesWithString(address,str,start){
     * Returns: array
     */
    _getTransactionMessagesWithString(address,str,start){

        var deferred = this._q.defer();
        var promise = deferred.promise;

        this._NetworkRequests.getAllTransactions(helpers.getHostname(this._Wallet.node), address).then((result)=>{
            console.log('result',result);
            if(result.data.length) {
                var messages = [];
                for (let i = 0; i < result.data.length; ++i) {
                    let transaction = result.data[i].transaction;
                    if(transaction.type==257){
                        // On this version we are only using decoded messages
                        let msg = this._filter('fmtHexMessage')(transaction.message);
                        if(msg.includes(str,start)){
                            messages[messages.length]=msg;
                        }
                    }
                }
            }
            deferred.resolve(messages);
        });
        return deferred.promise;
    }


    /**
     * _getLastMessagesWithString(address,str,start){
     * Returns: string
     */
    _getLastMessagesWithString(address,str,start){

        var deferred = this._q.defer();
        var promise = deferred.promise;

        this._getTransactionMessagesWithString(address,str,start).then((result)=>{
            console.log("arr",result);
            deferred.resolve(result[result.length-1]);
        });
        return deferred.promise;
    }

    test(){
        let msg = "9079867";
        let act = "TB4LDKZPPSFLJ2IUTTBUWFU2X25YX5OXASCT6QFJ";
        this._getLastMessagesWithString(act, msg,0).then((res)=>{
            console.log("res",res);
        });
    }
    

    /**
     * This usecase showcases how to create and validate a citizen account on the blockchain with the following steps:
     *    - 0. A Government officer is logged into this account and a Citizen already owns an account (citizenAccount)
     *    - 1. XXXX
     */
    submit(){

        // Verify password and generate/get the PK into this.common
        if(!this._checkAccess()){
            this.buttonDisabled = false;
            return;
        }
        // OPTIONAL: Check that the citizen is the owner of the account he is showing or even load account from ID!!

        // 1. [P] is determined based on IDp@country:parcel
        let seed = this.propertyID +"@"+this.country+":"+"parcel";
        var ppBwMainAccount = {};
        this._createBrainWallet(seed).then((ppBwMainAccount)=>{

            console.log("// 2. Asset presence of country:parcel is checked in [P].");
            this._ownsMosaic(ppBwMainAccount.address, this.namespaces.country, "parcel").then((ppIsValidParcel)=>{

                console.log("// 3. [PC], Incoming messages from [G] are read to find the last message starting with “<IDc>=” ");
                this._getLastMessagesWithString(this._Wallet.currentAccount.address,this.citizenID+"=",0).then((registeredAccountForIDc)=>{
                    registeredAccountForIDc = registeredAccountForIDc.split('=')[1];

                    if(!registeredAccountForIDc){
                        // This is not right, we should audit why the citizen says he owns an account from a parcel that isn't a valid parcel.
                        this._Alert.transactionError("ALERT! This user has not been registered yet");
                    }
                    else if(registeredAccountForIDc!=this.citizenAccount){
                        this._Alert.transactionError("ALARM! This user's account is not registered as his");
                    }
                    else if(!ppIsValidParcel){
                        // This is a newly created parcel, we need to load it with mosaics
                        console.log("// 3.1 [G] sends message IDp together with 1 country:parcel Mosaic to [P]    ");
                        this._sendMosaic(ppBwMainAccount.address, this.namespaces.country, "parcel", 1, this.common, {'xem':22000000}).then((data)=>{
                            
                            // 4 [P] is converted to multisig with 1 cosigner: [C]
                            console.log("// 4 [P] is converted to multisig with 1 cosigner: [C]");
                            this._sendOwnedBy(ppBwMainAccount, this.citizenAccount).then((data)=>{
                                this.step.cpOwned = true;
                            },
                            (err) => {
                                // Enable send button
                                this.buttonDisabled = false;
                                this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
                            }); 
                        });
                    }
                    else if(ppIsValidParcel){
                        // This is an old parcel that needs to be given to the citizen
                        // TODO: What if that account is already a MS?;
                        
                        // 3.2 [P] is converted to multisig with 1 cosigner: [C]
                        console.log("// 3.2 [P] is converted to multisig with 1 cosigner: [C]");
                        this._sendOwnedBy(ppBwMainAccount.address, registeredAccountForIDc).then((data)=>{
                            this.step.cpOwned = true;

                        },
                        (err) => {
                            // Enable send button
                            this.buttonDisabled = false;
                            this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
                        }); 
                    }
                });
            });
                
        },
        (err) => {
            // Enable send button
            this.buttonDisabled = false;
            this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
        });  
    }
}

export default propertyOwnershipRegisterCtrl;