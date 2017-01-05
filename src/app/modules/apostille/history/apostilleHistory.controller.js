import Sinks from '../../../utils/sinks';
import helpers from '../../../utils/helpers';

class ApostilleHistoryCtrl {
    constructor(Wallet, Alert, $location) {
        'ngInject';

        // Wallet service
        this._Wallet = Wallet;
        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        // Get sink depending of ntwork
        this.sink = Sinks.sinks.apostille[this._Wallet.network].toUpperCase().replace(/-/g, '');

        // Load nty Data from local storage if any
        this._Wallet.setNtyData();

        // User's apostilles pagination properties
        this.currentPage = 0;
        this.pageSize = 5;
        this.numberOfPages = function() {
            return Math.ceil(this._Wallet.ntyData !== undefined ? this._Wallet.ntyData.data.length / this.pageSize : 1 / this.pageSize);
        }

    }

    /**
     * Trigger file uploading for nty
     */
    uploadNty() {
        document.getElementById("uploadNty").click();
    }

    /**
     * Save nty in Wallet service and local storage
     */
    loadNty($fileContent) {
        this._Wallet.setNtyDataInLocalStorage(JSON.parse($fileContent));
        if (this._Wallet.ntyData !== undefined) {
            this._Alert.ntyFileSuccess();
        }
    }

    /**
     * Trigger download of the nty file
     */
    download() {
        if (this._Wallet.ntyData !== undefined) {
            // Wallet object string to word array
            let wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(this._Wallet.ntyData));
            // Word array to base64
            let base64 = CryptoJS.enc.Base64.stringify(wordArray);
            // Set download element attributes
            $("#downloadNty").attr('href', 'data:plain/text,' + JSON.stringify(this._Wallet.ntyData));
            $("#downloadNty").attr('download', "Nty-file-" + helpers.getTimestampShort(helpers.createTimeStamp()) + ".nty");
            // Simulate click to trigger download
            document.getElementById("downloadNty").click();
        }
    }

    /**
     * Purge nty data from local storage
     */
    purge() {
        return this._Wallet.purgeNtyDataInLocalStorage();
    }

}

export default ApostilleHistoryCtrl;