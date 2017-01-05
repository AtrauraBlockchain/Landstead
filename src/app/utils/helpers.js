/** @module utils/helpers */

import convert from './convert';
import CryptoHelpers from './CryptoHelpers';
import TransactionTypes from './TransactionTypes';

/**
 * Check if wallet already present in an array
 *
 * @param {string} walletName - A wallet name
 * @param {array} array - A wallets array
 *
 * @return {boolean} - True if present, false otherwise
 */
let haveWallet = function(walletName, array) {
    let i = null;
    for (i = 0; array.length > i; i++) {
        if (array[i].name === walletName) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a multisig transaction needs signature
 *
 * @param {object} multisigTransaction - A multisig transaction
 * @param {object} data - An account data
 *
 * @return {boolean} - True if it needs signature, false otherwise
 */
let needsSignature = function(multisigTransaction, data) {
    if (multisigTransaction.transaction.signer === data.account.publicKey) {
        return false;
    }
    if (multisigTransaction.transaction.otherTrans.signer === data.account.publicKey) {
        return false;
    }
    // Check if we're already on list of signatures
    for (let i = 0; i < multisigTransaction.transaction.signatures.length; i++) {
        if (multisigTransaction.transaction.signatures[i].signer === data.account.publicKey) {
            return false;
        }
    }

    if (!data.meta.cosignatoryOf.length) {
        return false;
    } else {
        for (let k = 0; k < data.meta.cosignatoryOf.length; k++) {
            if (data.meta.cosignatoryOf[k].publicKey === multisigTransaction.transaction.otherTrans.signer) {
                return true;
            } else if (k === data.meta.cosignatoryOf.length - 1) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Return the name of a transaction type id
 *
 * @param {number} id - A transaction type id
 *
 * @return {string} - The transaction type name
 */
let txTypeToName = function(id) {
    switch (id) {
        case TransactionTypes.Transfer:
            return 'Transfer';
        case TransactionTypes.ImportanceTransfer:
            return 'ImportanceTransfer';
        case TransactionTypes.MultisigModification:
            return 'MultisigModification';
        case TransactionTypes.ProvisionNamespace:
            return 'ProvisionNamespace';
        case TransactionTypes.MosaicDefinition:
            return 'MosaicDefinition';
        case TransactionTypes.MosaicSupply:
            return 'MosaicSupply';
        default:
            return 'Unknown_' + id;
    }
}

/**
 * Check if a transaction is already present in an array of transactions
 *
 * @param {string} hash - A transaction hash
 * @param {array} array - An array of transactions
 *
 * @return {boolean} - True if present, false otherwise
 */
let haveTx = function(hash, array) {
    let i = null;
    for (i = 0; array.length > i; i++) {
        if (array[i].meta.hash.data === hash) {
            return true;
        }
    }
    return false;
};

/**
 * Gets the index of a transaction in an array of transactions.
 * It must be present in the array.
 *
 * @param {string} hash - A transaction hash
 * @param {array} array - An array of transactions
 *
 * @return {number} - The index of the transaction
 */
let getTransactionIndex = function(hash, array) {
    let i = null;
    for (i = 0; array.length > i; i++) {
        if (array[i].meta.hash.data === hash) {
            return i;
        }
    }
    return 0;
};

/**
 * Return mosaic name from mosaicId object
 *
 * @param {object} mosaicId - A mosaicId object
 *
 * @return {string} - The mosaic name
 */
let mosaicIdToName = function(mosaicId) {
    if (!mosaicId) return mosaicId;
    return mosaicId.namespaceId + ":" + mosaicId.name;
}

/**
 * Parse uri to get hostname
 *
 * @param {string} uri - An uri string
 *
 * @return {string} - The uri hostname
 */
let getHostname = function(uri) {
    let _uriParser = document.createElement('a');
    _uriParser.href = uri;
    return _uriParser.hostname;
}

/**
 * Check if a cosignatory is already present in modifications array
 *
 * @param {string} address - A cosignatory address
 * @param {string} pubKey - A cosignatory public key
 * @param {array} array - A modifications array
 *
 * @return {boolean} - True if present, false otherwise
 */
let haveCosig = function(address, pubKey, array) {
    let i = null;
    for (i = 0; array.length > i; i++) {
        if (array[i].address === address || array[i].pubKey === pubKey) {
            return true;
        }
    }
    return false;
};

/**
 * Remove extension of a file name
 *
 * @param {string} filename - A file name with extension
 *
 * @return {string} - The file name without extension
 */
let getFileName = function(filename) {
    return filename.replace(/\.[^/.]+$/, "");
};

/**
 * Gets extension of a file name
 *
 * @param {string} filename - A file name with extension
 *
 * @return {string} - The file name extension
 */
let getExtension = function(filename) {
    return filename.split('.').pop();
}

/***
 * NEM epoch time
 *
 * @type {number}
 */
let NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);

/**
 * Create a time stamp for a NEM transaction
 *
 * @return {number} - The NEM transaction time stamp in milliseconds
 */
let createNEMTimeStamp = function() {
    return Math.floor((Date.now() / 1000) - (NEM_EPOCH / 1000));
}

/**
 * Fix a private key
 *
 * @param {string} privatekey - An hex private key
 *
 * @return {string} - The fixed hex private key
 */
let fixPrivateKey = function(privatekey) {
    return ("0000000000000000000000000000000000000000000000000000000000000000" + privatekey.replace(/^00/, '')).slice(-64);
}

/**
 * Calculate minimum fees from an amount of XEM
 *
 * @param {number} numNem - An amount of XEM
 *
 * @return {number} - The minimum fee
 */
let calcMinFee = function(numNem) {
    let fee = Math.floor(Math.max(1, numNem / 10000));
    return fee > 25 ? 25 : fee;
}

/**
 * Calculate mosaic quantity equivalent in XEM
 *
 * @param {number} multiplier - A mosaic multiplier
 * @param {number} q - A mosaic quantity
 * @param {number} sup - A mosaic supply
 * @param {number} divisibility - A mosaic divisibility
 *
 * @return {number} - The XEM equivalent of a mosaic quantity
 */
let calcXemEquivalent = function(multiplier, q, sup, divisibility) {
    if (sup === 0) {
        return 0;
    }
    // TODO: can this go out of JS (2^54) bounds? (possible BUG)
    return 8999999999 * q * multiplier / sup / Math.pow(10, divisibility + 6);
}

/**
 * Build a message object
 *
 * @param {object} common - An object containing wallet private key
 * @param {object} tx - A transaction object containing the message
 *
 * @return {object} - The message object
 */
let prepareMessage = function(common, tx) {
    if (tx.encryptMessage && common.privateKey) {
        return {
            'type': 2,
            'payload': CryptoHelpers.encode(common.privateKey, tx.recipientPubKey, tx.message.toString())
        };
    } else {
        return {
            'type': 1,
            'payload': convert.utf8ToHex(tx.message.toString())
        };
    }
}

/**
 * Check and format an url
 *
 * @param {string} node - A custom node from user input
 * @param {number} defaultWebsocketPort - A default websocket port
 *
 * @return {string|number} - The formatted node as string or 1
 */
let checkAndFormatUrl = function (node, defaultWebsocketPort) {
    // Detect if custom node doesn't begin with "http://"
        var pattern = /^((http):\/\/)/;
        if (!pattern.test(node)) {
            node = "http://" + node;
            let _uriParser = document.createElement('a');
            _uriParser.href = node;
            // If no port we add it
            if (!_uriParser.port) {
                node = node + ":" + defaultWebsocketPort;
            } else if (_uriParser.port !== defaultWebsocketPort) {
                // Port is not default websocket port
                return 1;
            }
        } else {
            // Start with "http://""
            let _uriParser = document.createElement('a');
            _uriParser.href = node;
            // If no port we add it
            if (!_uriParser.port) {
                node = node + ":" + defaultWebsocketPort;
            } else if (_uriParser.port !== defaultWebsocketPort) {
                // Port is not default websocket port
                return 1;
            }
        }
        return node;
}
 
/**
 * Create a time stamp
 *
 * @return {object} - A date object
 */
let createTimeStamp = function() {
    return new Date();
}

/**
 * Date object to YYYY-MM-DD format
 *
 * @param {object} date - A date object
 *
 * @return {string} - The short date
 */
let getTimestampShort = function(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1; //January is 0!
    let yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    return yyyy + '-' + mm + '-' + dd;
};

/**
 * Date object to date string
 *
 * @param {object} date - A date object
 *
 * @return {string} - The date string
 */
let convertDateToString = function(date) {
    return date.toDateString();
};

module.exports = {
    haveWallet,
    needsSignature,
    txTypeToName,
    haveTx,
    getTransactionIndex,
    mosaicIdToName,
    getHostname,
    haveCosig,
    getFileName,
    getExtension,
    createNEMTimeStamp,
    fixPrivateKey,
    calcMinFee,
    calcXemEquivalent,
    prepareMessage,
    checkAndFormatUrl,
    createTimeStamp,
    getTimestampShort,
    convertDateToString
}