import helpers from '../../../utils/helpers';
import Sinks from '../../../utils/sinks';
import Network from '../../../utils/Network';
import Nodes from '../../../utils/nodes';

class AuditApostilleCtrl {
    constructor(AppConstants, Wallet, Alert, $timeout, NetworkRequests, $filter, $location) {
        'ngInject';

        // Application constants
        this._AppConstants = AppConstants;
        // Wallet service
        this._Wallet = Wallet;
        // Alert service
        this._Alert = Alert;
        // $timeout to delay digests when available
        this._$timeout = $timeout;
        // Network requests service
        this._NetworkRequests = NetworkRequests;
        // Filters
        this._$filter = $filter;
        // $location to redirect
        this._location = $location;
        // Network util (used in view)
        this._Network = Network;
        // Nodes util (used in view)
        this._Nodes = Nodes;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        // Apostille hashing info array
        this.hashing = [{
            name: "MD5",
            signedVersion: "81",
            version: "01"
        }, {
            name: "SHA1",
            signedVersion: "82",
            version: "02"
        }, {
            name: "SHA256",
            signedVersion: "83",
            version: "03"
        }, {
            name: "SHA3-256",
            signedVersion: "88",
            version: "08"
        }, {
            name: "SHA3-512",
            signedVersion: "89",
            version: "09"
        }];

        // Array of valid files to apostille
        this.auditResults = [];

        // Default node with search option activated
        this.searchNode = this._Wallet.searchNode;
        // Status of the node disconnected by default
        this.searchNodeStatus = false;
        // Init heartbeat
        this.getHeartBeat(this.searchNode.uri);
        // To show processing overlay
        this.isProcessing = false;
        // Show dropbox for files by default
        this.isFiles = true;

        // Audit result pagination properties
        this.currentPage = 0;
        this.pageSize = 5;
        this.numberOfPages = function() {
            return Math.ceil(this.auditResults.length / this.pageSize);
        }
    }

    /**
     * processFile() Process the file to audit and push to array
     *
     * @param $fileContent: Base 64 content of the file 
     * @param $fileData: Meta data of the file
     */
    processFile($fileContent, $fileData) {
        console.log($fileContent);
        console.log($fileData);

        this.isProcessing = true;

        // Remove the data:application/octet-stream;base64 part of $fileContent string
        let cleanedDataContent = $fileContent.split(/,(.+)?/)[1];
        // Base 64 to word array
        let parsedData = CryptoJS.enc.Base64.parse(cleanedDataContent);

        // Filename
        let currentFileName = $fileData.name;
        // Build an array out of the filename
        let nameArray = helpers.getFileName($fileData.name).match(/\S+\s*/g);

        // Check if file is in apostille format
        if (nameArray[nameArray.length - 6] === undefined || !checkApostilleName(nameArray[nameArray.length - 6].replace(/^\s+|\s+$/, '')) || nameArray[nameArray.length - 5].replace(/^\s+|\s+$/, '') !== 'TX') {
            this.auditResults.push({
                'filename': $fileData.name,
                'owner': '',
                'fileHash': '',
                'result': this._$filter('translate')('APOSTILLE_AUDIT_WRONG_FORMAT'),
                'hash': ''
            });
            this.isProcessing = false;
            return;
        }

        // Recomposing the initial filename before apostille
        let initialNameArray = nameArray.splice(0, nameArray.length - 7);
        let initialFileName = "";
        for (let h = 0; h < initialNameArray.length; h++) {
            initialFileName += initialNameArray[h];
        }
        // Initial filename 
        initialFileName = initialFileName.replace(/^\s+|\s+$/, '') + "." + helpers.getExtension($fileData.name);
        console.log(initialFileName);

        // Hash of the apostille transaction
        let apostilleHashTx = nameArray[nameArray.length - 4].replace(/^\s+|\s+$/, '');
        console.log(apostilleHashTx);

        // To know if multisig or not
        let isMultisig = false;

        // Get the transaction by it's hash
        this.getTransaction(apostilleHashTx).then((data) => {
            let payload;
            let owner = data.transaction.signer;
            let ownerAddress = this._$filter('fmtPubToAddress')(owner, this._Wallet.network);
            if (data.transaction.type === 257) {
                payload = this._$filter('fmtHexMessage')(data.transaction.message)
                isMultisig = false;
            } else {
                payload = this._$filter('fmtHexMessage')(data.transaction.otherTrans.message)
                isMultisig = true;
                // To direct to the right tx on explorer
                apostilleHashTx = data.meta.innerHash.data;
            }
            console.log(payload)
            // Get the checksum
            let checksum = payload.substring(5, 13);
            console.log("Checksum: " + payload.substring(5, 13));
            // Get signed data (without checksum)
            let dataHash = payload.substring(13);
            console.log("Hash: " + payload.substring(13));
            // Analize checksum and return the hash of audited file
            let checkResult = this.verifyChecksumAndHashData(checksum, parsedData);
            console.log(checkResult);
            // Object to contain our result
            let obj = resultObject(initialFileName, ownerAddress, checksum, dataHash, checkResult.isSigned, apostilleHashTx);
            // If signed apostille
            if (checkResult.isSigned) {
                // Verify signed message (dataHash) from non signed file content hash (checkResult.value) and signer public key
                // As no implementation of a signature verifier it is done via an api using nem core on another server
                this.auditSigned(owner, checkResult.value, dataHash, obj);
                this.isProcessing = false;
            } else {
                // If not signed
                // If audited file content hash
                if (dataHash === checkResult.value) {
                    // Success
                    obj.result = this._$filter('translate')('APOSTILLE_AUDIT_SUCCESS');
                    this.auditResults.push(obj);
                    this.isProcessing = false;
                    return;
                } else {
                    // Fail
                    obj.result = this._$filter('translate')('APOSTILLE_AUDIT_FAIL');
                    this.auditResults.push(obj);
                    this.isProcessing = false;
                    return;
                }
            }
        },
        (err) => {
            console.log(err)
            let obj = resultObject(initialFileName, '', '', '', '');
            obj.result = this._$filter('translate')('APOSTILLE_AUDIT_NOT_FOUND');
            this.auditResults.push(obj);
            this.isProcessing = false;
        });
    }

    /**
     * getTransaction() Get a transaction by it's hash
     *
     * @param txHash: The apostille transaction hash
     *
     * Return: TransactionMetaDataPair object
     */
    getTransaction(txHash) {
        return this._NetworkRequests.getTxByHash(helpers.getHostname(this.searchNode.uri), txHash).then((data) => {
            return data;
        })
    }

    /**
     * getHeartBeat() Get heartbeat of a given node
     *
     * @param host: The node to check
     */
    getHeartBeat(host) {
        this.searchNodeStatus = false;
        return this._NetworkRequests.heartbeat(helpers.getHostname(host)).then((data) => {
            if(data.code === 1 && data.type === 2) {
                this.searchNodeStatus = true;
            } else {
                this.searchNodeStatus = false;
            }
        },
        (err) => {
            this.searchNodeStatus = false;
        });
    }

    /**
     * verifyChecksumAndHashData() Hash audited file content depending of version byte into checksum
     * and return result object
     *
     * @param checksum: The apostille hash checksum
     * @param fileContent: The audited file content (word array)
     *
     * Return: Object with audited file hash and if signed or not
     */
    verifyChecksumAndHashData(checksum, fileContent) {
        // Get the version byte
        let hashingVersionBytes = checksum.substring(6);

        // Get if signed or not
        let signed = isSigned(hashingVersionBytes, this.hashing);

        // Hash depending of version byte
        if (hashingVersionBytes === "01" || hashingVersionBytes === "81") {
            return {
                "value": CryptoJS.MD5(fileContent).toString(CryptoJS.enc.Hex),
                "isSigned": signed
            };
        } else if (hashingVersionBytes === "02" || hashingVersionBytes === "82") {
            return {
                "value": CryptoJS.SHA1(fileContent).toString(CryptoJS.enc.Hex),
                "isSigned": signed
            };
        } else if (hashingVersionBytes === "03" || hashingVersionBytes === "83") {
            return {
                "value": CryptoJS.SHA256(fileContent).toString(CryptoJS.enc.Hex),
                "isSigned": signed
            };
        } else if (hashingVersionBytes === "08" || hashingVersionBytes === "88") {
            return {
                "value": CryptoJS.SHA3(fileContent, {
                    outputLength: 256
                }).toString(CryptoJS.enc.Hex),
                "isSigned": signed
            };
        } else {
            return {
                "value": CryptoJS.SHA3(fileContent, {
                    outputLength: 512
                }).toString(CryptoJS.enc.Hex),
                "isSigned": signed
            };
        }
    }

    /**
     * auditSigned() Audit signed files
     *
     * @param signerPublicKey: The signer public key
     * @param fileHash: The non signed file hash
     * @param signedDataHash: The signed file hash
     * @param obj: Apostille result object
     *
     */
    auditSigned(signerPublicKey, fileHash, signedDataHash, obj) {
        return this._NetworkRequests.auditApostille(signerPublicKey, fileHash, signedDataHash).then((data) => {
            // If api send back true
            if (data) {
                console.log("Signed file verifed !")
                obj.result = this._$filter('translate')('APOSTILLE_AUDIT_SUCCESS');
                this.auditResults.push(obj);
            } else {
                obj.result = this._$filter('translate')('APOSTILLE_AUDIT_FAIL');
                this.auditResults.push(obj);
            }
        },
        (err) => {
            console.log(err)
            obj.result = this._$filter('translate')('APOSTILLE_AUDIT_ERROR_SIGNATURE');
            this.auditResults.push(obj);
        });
    }

    /**
     * clearAll() Clear all audit data
     */
    clearAll() {
        // Clear result array
        this.auditResults = [];
        // Reinitiate to page 1
        this.currentPage = 0;
        // Clear file input
        $("#fileToNotary").val(null);
    }


}

export default AuditApostilleCtrl;

// Function to check if apostille is signed or not depending of byte
let isSigned = function(bytes, hashInfo) {
    for (let i = 0; hashInfo.length > i; i++) {
        if (hashInfo[i].signedVersion === bytes) {
            return true;
        }
    }
    return false;
};

// Check if apostilled file or not
let checkApostilleName = function(name) {
    if (name === "Apostille" || name === "ApostilleSigned") {
        return true;
    }
    return false;
};

// Create an apostille result object
let resultObject = function (initialFileName, apostilleSigner, checksum, signedDataHash, isPrivate, apostilleHashTx) {
    return {
        'filename': initialFileName,
        'owner': apostilleSigner,
        'fileHash': checksum + signedDataHash,
        'private': isPrivate,
        'result': '',
        'hash': apostilleHashTx
    }
}