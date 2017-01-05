import helpers from '../../../utils/helpers';
import Address from '../../../utils/Address';
import KeyPair from '../../../utils/KeyPair';
import Sinks from '../../../utils/sinks';
import CryptoHelpers from '../../../utils/CryptoHelpers';
import Nty from '../../../utils/nty';
import Network from '../../../utils/Network';
import convert from '../../../utils/convert';
import apostille from '../../../utils/apostille';

class CreateApostilleCtrl {
    constructor(DataBridge, Wallet, Alert, Transactions, $timeout, $location, $filter, $q) {
        'ngInject';

        // DataBidge service
        this._DataBridge = DataBridge;
        // Wallet service
        this._Wallet = Wallet;
        // Alert service
        this._Alert = Alert;
        // Transaction service
        this._Transactions = Transactions;
        // $timeout to delay digests when available
        this._$timeout = $timeout;
        // $location to redirect
        this._location = $location;
        // Filters
        this._$filter = $filter;
        // Promises
        this._$q = $q;

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

        this.types = [{
            name: this._$filter('translate')('GENERAL_PUBLIC'),
            value: false
        },{
            name: this._$filter('translate')('APOSTILLE_KEEP_PRIVATE'),
            value: true
        }]

        /**
         * Default apostille properties
         */
        this.formData = {}
        this.formData.recipient = '';
        this.formData.amount = 0;
        this.formData.message = '';
        this.formData.encryptMessage = false;
        // Default hashing is sha256
        this.formData.hashing = this.hashing[2];
        this.formData.fee = 0;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        // Upload files by default
        this.formData.isFiles = true;
        // To show text area
        this.formData.isText = false;
        // Hash signed by default
        this.formData.isPrivate = true;
        // Apostille tags
        this.formData.tags = '';
        // Array of valid files to apostille
        this.filesToApostille = [];
        // Array of rejected files to apostille
        this.rejected = [];
        // Array to contain initial base64 data of files to apostille
        this.fileContentArray = [];
        // Init JSzip
        this.zip = new JSZip();

        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Show valid files in view by default
        this.viewRejected = false;

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };

        // Files to apostille pagination properties
        this.currentPage = 0;
        this.pageSize = 5;
        this.numberOfPages = function() {
            return Math.ceil(this.filesToApostille.length / this.pageSize);
        }

        // Rejected files pagination properties
        this.currentPageRej = 0;
        this.pageSizeRej = 5;
        this.numberOfPagesRej = function() {
            return Math.ceil(this.rejected.length / this.pageSizeRej);
        }

        // Load nty Data if any
        this._Wallet.setNtyData();

    }

    /**
     * Remove a file from filesToApostille array
     *
     * @param {array} array - The array of files to apostilles
     * @param {object} elem - The object to delete
     */
    removeFileFromList(array, elem) {
        // If the deleted element is the elem 0 and length of array mod 5 gives 0 (means it is the last object of the page), 
        // we return a page behind unless it is page 1.
        if (array.indexOf(elem) === 0 && this.currentPage + 1 > 1 && (array.length - 1) % 5 === 0) {
            this.currentPage = this.currentPage - 1;
        }
        array.splice(array.indexOf(elem), 1);
    }

    /**
     * Process the file to apostille and push to array
     *
     * @param {object} $fileContent - Base 64 content of the file 
     * @param {object} $fileData - Meta data of the file
     */
    processFile($fileContent, $fileData) {

        // Limit is 25 files to apostille
        if (this.filesToApostille.length < 25) {

            // Arrange data if custom text
            if (this.formData.isText) {
                $fileData = { 
                    name: $fileData + ".txt", 
                    lastModified: new Date().getTime(), 
                    lastModifiedDate: new Date().toISOString(), 
                    size: Buffer.byteLength($fileContent, 'utf8'), 
                    type: "text/plain" 
                }
                $fileContent = "data:application/x-pdf;base64," + CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse($fileContent));
            }

            // Remove the data:application/octet-stream;base64 part
            let cleanedDataContent = $fileContent.split(/,(.+)?/)[1];
            // Base 64 to word array
            let parsedData = CryptoJS.enc.Base64.parse(cleanedDataContent);

            // Original filename
            let currentFileName = $fileData.name;

            // Check if name is too long, otherwise when apostille infos are appended it can go out of bounds
            if (helpers.getFileName(currentFileName).length > 40) {
                this.rejected.push({
                    "filename": currentFileName,
                    "tags": this.formData.tags,
                    "reason": this._$filter('translate')('APOSTILLE_NAME_TOO_LONG')
                });
                return;
            }

            // Decrypt/generate private key and check it. Returned private key is contained into this.common
            if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, false)) {
                this._Alert.invalidPassword();
                this.cleanData();
                return;
            } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
                this._Alert.invalidPassword();
                this.cleanData();
                return;
            } else {
                // Private key successfully decrypted
                let recipientPrivateKey;

                if (this.formData.isPrivate) {
                    let kp = KeyPair.create(helpers.fixPrivateKey(this.common.privateKey));
                    // Create recipient account from signed sha256 hash of new filename
                    let signedFilename = kp.sign(CryptoJS.SHA256(currentFileName).toString(CryptoJS.enc.Hex)).toString();
                    let recipientKp = KeyPair.create(helpers.fixPrivateKey(signedFilename));
                    this.formData.recipient = Address.toAddress(recipientKp.publicKey.toString(), this._Wallet.network);
                    recipientPrivateKey = helpers.fixPrivateKey(signedFilename);

                    // Create hash from file content and selected hashing
                    let hash = this.hashFileData(parsedData, this.formData.hashing);
                    // Get checksum
                    let checksum = hash.substring(0, 10);
                    // Get hash without checksum
                    let dataHash = hash.substring(10);
                    // Set checksum + signed hash as message
                    this.formData.message = checksum + kp.sign(dataHash).toString();
                } else {
                    // Use sink account
                    this.formData.recipient = Sinks.sinks.apostille[this._Wallet.network].toUpperCase().replace(/-/g, '');
                    // Set recipient private key
                    recipientPrivateKey = "None (public sink)";
                    // No signing we just put the hash in message
                    this.formData.message = this.hashFileData(parsedData, this.formData.hashing);
                }

                // update the fee
                this.updateFee();

                // Add file to list
                this.addFileToList(currentFileName, cleanedDataContent, recipientPrivateKey, this.formData.isPrivate);
            }
        }
    }

    /**
     * Update transaction fee
     */
    updateFee() {
        let entity = this._Transactions.prepareApostilleTransfer(this.common, this.formData);
        this.formData.fee = entity.fee;
        if (this.formData.isMultisig) {
            this.formData.innerFee = entity.otherTrans.fee;
        }
    }

    /**
     * Hash the file content depending of hashing
     *
     * @param {string} data - Base 64 file content
     * @param {object} hashing - The chosen hashing object
     */
    hashFileData(data, hashing) {
        // Full checksum is 0xFE + 0x4E + 0x54 + 0x59 + hashing version byte
        let checksum;
        // Append byte to checksum
        if (this.formData.isPrivate) {
            checksum = "fe4e5459" + hashing.signedVersion;
        } else {
            checksum = "fe4e5459" + hashing.version;
        }

        // Build the apostille hash
        if (hashing.name === "MD5") {
            return checksum + CryptoJS.MD5(data);
        } else if (hashing.name === "SHA1") {
            return checksum + CryptoJS.SHA1(data);
        } else if (hashing.name === "SHA256") {
            return checksum + CryptoJS.SHA256(data);
        } else if (hashing.name === "SHA3-256") {
            return checksum + CryptoJS.SHA3(data, {
                outputLength: 256
            });
        } else {
            return checksum + CryptoJS.SHA3(data, {
                outputLength: 512
            });
        }
    };

    /**
     * Add the file to array of files to apostille
     *
     * @param {string} currentFileName - The original filename
     * @param {string} base64 - The file content data as base64
     * @param {string} recipientPrivateKey - The destination account private key
     * @param {boolean} isSigned - True if apostille is signed, false otherwise
     */
    addFileToList(currentFileName, base64, recipientPrivateKey, isSigned) {
        if (this.formData.isMultisig) {
            this.filesToApostille.push({
                "filename": currentFileName,
                "fileData": base64,
                "recipientPrivateKey": recipientPrivateKey,
                "message": this.formData.message,
                "tags": this.formData.tags,
                "recipient": this.formData.recipient,
                "private": isSigned,
                "fee": this.formData.fee,
                "multisig": [{
                    "innerFees": this.formData.innerFee
                }],
                'amount': 0,
                "innerFee": this.formData.innerFee,
                'encryptMessage': false,
                'isMultisig': this.formData.isMultisig,
                'multisigAccount': this.formData.multisigAccount
            });
        } else {
            this.filesToApostille.push({
                "filename": currentFileName,
                "fileData": base64,
                "recipientPrivateKey": recipientPrivateKey,
                "message": this.formData.message,
                "tags": this.formData.tags,
                "recipient": this.formData.recipient,
                "private": isSigned,
                "fee": this.formData.fee,
                "multisig": [],
                'amount': 0,
                "innerFee": 0,
                'encryptMessage': false,
                'isMultisig': false,
                'multisigAccount': this.formData.multisigAccount
            });
        }

        // Reset data
        this.cleanData();
    };

    /**
     * Download the archive of signed files
     */
    downloadSignedFiles() {
        // If there is success txes
        if (this.successTxes > 0) {
            // Generate the zip
            this.zip.generateAsync({
                type: "blob"
            }).then((content) => {
                // Trigger download
                saveAs(content, "NEMsigned -- Do not Edit -- " + helpers.getTimestampShort(helpers.createTimeStamp()) + ".zip");
                this._$timeout(() => {
                    // Reset all apostilles
                    this.clearAllApostille();
                })
            });
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
     *
     * @params {object} $fileContent - Content of an nty file
     */
    loadNty($fileContent) {
        this._Wallet.setNtyDataInLocalStorage(JSON.parse($fileContent));
        if (this._Wallet.ntyData.length) {
            this._Alert.ntyFileSuccess();
        }
    }


    /**
     * Clean temp data
     */
    cleanData() {
        $("#fileToNotary").val(null);
        this.formData.message = "";
        this.formData.fee = "";
        this.formData.amount = 0;
        this.formData.recipient = "";
        this.formData.textTitle = "";
        this.formData.textContent = "";
    }

    /**
     * Clear all data
     */
    clearAllApostille() {
        this.cleanData();
        this.zip = new JSZip();
        this.formData.tags = "";
        this.filesToApostille = [];
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


        // Number of success to prevent archive download if no txes sent
        this.successTxes = 0;

        // Prepare to chain the promises
        let chain = this._$q.when();

        //Looping transactions with file array
        for (let k = 0; k < this.filesToApostille.length; k++) {
            // Promises chain
            chain = chain.then(() => {
                // Build the entity to serialize
                let entity = this._Transactions.prepareApostilleTransfer(this.common, this.filesToApostille[k]);
                // Timestamp of the file
                let timeStamp = helpers.createTimeStamp();
                // Construct transaction byte array, sign and broadcast it to the network
                return this._Transactions.serializeAndAnnounceTransactionLoop(entity, this.common, this.filesToApostille[k], k).then((data) => {
                        let txHash = '';
                        let txMultisigHash = '';
                        let url = '';
                        let owner = this._Wallet.currentAccount.address;
                        let from = '';
                        let apostilleName = '';
                        // Check status
                        if (data.res.status === 200) {
                            // If code >= 2, it's an error
                            if (data.res.data.code >= 2) {
                                this._$timeout(() => {
                                    this._Alert.transactionError(data.res.data.message);
                                    // Push in rejected array
                                    this.rejected.push({
                                        "filename": data.tx.filename,
                                        "tags": data.tx.tags,
                                        "reason": data.res.data.message
                                    });
                                });
                            } else {
                                // Increment successes
                                this.successTxes++;
                                this._Alert.transactionSuccess();
                                // Transaction hash after tx success
                                txHash = data.res.data.transactionHash.data;
                                let ntyData;
                                if (data.tx.isMultisig) {
                                    txMultisigHash = data.res.data.innerTransactionHash.data;
                                    // Create the QR url
                                    url = this._Wallet.chainLink + txMultisigHash;
                                    // From multisig
                                    from = data.tx.multisigAccount.address;
                                    // Create nty data
                                    ntyData = Nty.createNotaryData(data.tx.filename, data.tx.tags, data.tx.message, txHash, txMultisigHash, owner, from, data.tx.recipient, data.tx.recipientPrivateKey);
                                } else {
                                    // No multisig hash
                                    txMultisigHash = "";
                                    // Create the QR url
                                    url = this._Wallet.chainLink + txHash;
                                    // From current account
                                    from = this._Wallet.currentAccount.address;
                                    // Create nty data
                                    ntyData = Nty.createNotaryData(data.tx.filename, data.tx.tags, data.tx.message, txHash, txMultisigHash, owner, "", data.tx.recipient, data.tx.recipientPrivateKey);
                                }
                               
                                apostilleName = helpers.getFileName(data.tx.filename) + " -- Apostille TX " + txHash + " -- Date " + helpers.getTimestampShort(timeStamp) + "." + helpers.getExtension(data.tx.filename);

                                if (!this._Wallet.ntyData) { // If not nty data, create and set in local storage
                                    this._Wallet.setNtyDataInLocalStorage(ntyData);
                                } else { // Or update current nty data
                                    let updatedNty = Nty.updateNotaryData(this._Wallet.ntyData, ntyData);
                                    this._Wallet.setNtyDataInLocalStorage(updatedNty);
                                }
                            }

                                this.drawCertificate(data.tx.filename, helpers.convertDateToString(timeStamp), owner, data.tx.tags, from, data.tx.recipient, data.tx.recipientPrivateKey, txHash, data.tx.message, url).then((certificate) => {
                                    if (data.res.data.code < 2) {
                                        this._$timeout(() => {
                                            // Add renamed file to archive
                                            this.zip.file(apostilleName, (data.tx.fileData).split(",").pop(), {
                                                base64: true
                                            });

                                            // Add certificate to archive
                                            this.zip.file("Apostille certificate of " + helpers.getFileName(data.tx.filename) + " -- TX " + txHash + " -- Date " + helpers.getTimestampShort(timeStamp) + ".png", (certificate).split(",").pop(), {
                                                base64: true
                                            });
                                        });
                                    }
                                    // If last file of the array
                                    if (data.k == this.filesToApostille.length - 1) {
                                        this._$timeout(() => {
                                            // Add created or updated nty file to archive
                                            this.zip.file("Nty-file-" + helpers.getTimestampShort(timeStamp) + ".nty", JSON.stringify(this._Wallet.ntyData));
                                            // Download archive of files
                                            this.downloadSignedFiles();
                                            // Enable send button
                                            this.okPressed = false;
                                            // Delete private key in common
                                            this.common.privateKey = '';
                                        });
                                    }
                                })
                        }
                    },
                    (err) => {
                        // Delete private key in common
                        this.common.privateKey = '';
                        // Enable send button
                        this.okPressed = false;
                        this._Alert.transactionError('Failed ' + err.data.error + " " + err.data.message);
                    });
            });
        }
    }

    // Draw the certificate
    drawCertificate(filename, dateCreated, owner, tags, from, to, recipientPrivateKey, txHash, txHex, url) {

        let deferred = this._$q.defer();

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        let qrCode = kjua({
            size: 256,
            render: canvas,
            text: url,
            fill: '#000',
            quiet: 0,
            ratio: 2,
        });

        qrCode.toBlob((blob) => {

            let imageObj = new Image();

            imageObj.onload = function() {
                context.canvas.width = imageObj.width;
                context.canvas.height = imageObj.height;
                context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
                context.font = "38px Roboto Arial sans-serif";
                // Top part
                context.fillText(filename, 541, 756);
                context.fillText(dateCreated, 607, 873);
                context.fillText(owner, 458, 989);
                context.fillText(tags, 426, 1105);

                // bottom part
                context.font = "30px Roboto Arial sans-serif";
                context.fillText(from, 345, 1550);
                context.fillText(to, 345, 1690);
                context.fillText(recipientPrivateKey, 345, 1846);
                context.fillText(txHash, 345, 1994);

                // Wrap file hash if too long
                if (txHex.length > 70) {
                    let x = 345;
                    let y = 2137;
                    let lineHeight = 35;
                    let lines = txHex.match(/.{1,70}/g)
                    for (var i = 0; i < lines.length; ++i) {
                        context.fillText(lines[i], x, y);
                        y += lineHeight;
                    }
                } else {
                    context.fillText(txHex, 345, 2137);
                }

                // Qr code
                let image = new Image();
                let URLobject = (window.URL ? URL : webkitURL).createObjectURL(blob);
                image.onload = function() {
                    context.drawImage(image, 1687, 688);

                    // Revoke url object
                    (window.URL ? URL : webkitURL).revokeObjectURL(URLobject);
                    // Resolve promise
                    deferred.resolve(canvas.toDataURL());
                };
                image.crossOrigin = "Anonymous";
                image.src = URLobject;
            };
            imageObj.crossOrigin = "Anonymous";
            imageObj.src = apostille.certificate;
        });

        return deferred.promise;
    }

}

export default CreateApostilleCtrl;