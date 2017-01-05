import CryptoHelpers from '../../utils/CryptoHelpers';
import Network from '../../utils/Network';
import helpers from '../../utils/helpers';

class LandsteadCtrl {
	// Set services as constructor parameter

    constructor($q, $location, $timeout, $localStorage, Alert, WalletBuilder, AppConstants, Wallet, Transactions ) {
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

        // Declaring services
        
        this._Wallet = Wallet;
        this._Transactions = Transactions;

        // If no wallet show alert and redirect to home
        // if (!this._Wallet.current) {
        //     this._Alert.noWalletLoaded();
        //     this._location.path('/');
        //     return;
        // }


        // current network
        this.network = this._AppConstants.defaultNetwork;

        /**
        * Default simple transfer properties
        */
        this.formData = {}
        this.formData.recipient = '';
        this.formData.amount = 0;
        this.formData.message = '';
        this.formData.encryptMessage = false;
        this.formData.fee = 0;

        // To store our password and decrypted/generated private key
        this.common = {
        "password": "",
        "privateKey": ""
        }

        // Multisig data, we won't use it but it is needed anyway
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = '';

        // Mosaic data, we won't use it but it is needed anyway
        this.formData.mosaics = null;
        this.mosaicsMetaData = null;

        ///// USECASE Variables /////
        this.step = {}
        this.country = "atlantis";

        //2.1  Officer inputs ID:country
        this.formData.citizenID = "ATRAURA BLOCKCHAIN LOVES NEM";
        this.formData.citizenAccount = "TAGX3L3FKQPL7PZ7UKU2VMDO5QZLNU7POM36SACJ";
      
        this.okPressed = false;
        
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

    }

    /**
     * createBrainWallet() create a new brain wallet
     */
    _createBrainWallet(seed) {
            // Check form
            var deferred = this._q.defer();
            var promise = deferred.promise;

            if (!seed) {
                this._Alert.missingFormData();
                this.okPressed = false;
                return;
            }

            // Create the wallet from form data
            this._WalletBuilder.createBrainWallet(seed, seed, this.network).then((wallet) => {
                this._$timeout(() => {
                    if (wallet) {
                        // On success concat new wallet to local storage wallets
                        this._storage.wallets = this._storage.wallets.concat(wallet);
                        this._Alert.createWalletSuccess();
                        
                        // Reset form data
                        //this.formData = "";

                        // Trigger download
                        // this.download(wallet)
                        // console.log(this._storage.wallets);

                        console.log(wallet);
                        this.step.bwCreated = true;
                        this.cpAccount = wallet['accounts']['0']['address'];
                        deferred.resolve(true);
                    }
                }, 10);
            },
            (err) => {
                this._Alert.createWalletFailed(err);
                this.okPressed = false;
                deferred.reject(false);
            });

            return deferred.promise;
    }

    submitCitizen(){

      //2.1  Officer inputs ID:country
      this.okPressed = true;
      console.log("Submitting new citizen...");
      let seed = this.formData.citizenID+":"+this.country;

      //2.2 [PC] BW gets created
      this._createBrainWallet(seed).then(function(){
        console.log("Linking PC to C"); 




      });


      //2.3 [PC] is set to be a MS acct from [G] 
      //2.4 [G] sends message (ID=C) to [PC]
      

      //2.5 [G] creates and sends atlantis.register:citizen to [PC]
      //2.6 [G] creates and sends atlantis:citizen to [C]
    }
}

export default LandsteadCtrl;