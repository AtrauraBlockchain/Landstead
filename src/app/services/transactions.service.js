import Network from '../utils/Network';
import convert from '../utils/convert';
import KeyPair from '../utils/KeyPair';
import CryptoHelpers from '../utils/CryptoHelpers';
import Serialization from '../utils/Serialization';
import helpers from '../utils/helpers';
import Address from '../utils/Address';
import TransactionTypes from '../utils/TransactionTypes';

/** Service to build transactions */
class Transactions {

    /**
     * Initialize services and properties
     *
     * @param {service} Wallet - The Wallet service
     * @param {service} $http - The angular $http service
     * @param {service} DataBridge - The DataBridge service
     * @param {service} NetworkRequests - The NetworkRequests service
     */
    constructor(Wallet, $http, DataBridge, NetworkRequests) {
        'ngInject';

        /***
         * Declare services
         */
        this._Wallet = Wallet
        this._$http = $http;
        this._DataBridge = DataBridge;
        this._NetworkRequests = NetworkRequests;
    }


    /**
     * Set the network version
     *
     * @param {number} val - A version number (1 or 2)
     *
     * @return {number} - A network version
     */
    CURRENT_NETWORK_VERSION(val) {
        if (this._Wallet.network === Network.data.Mainnet.id) {
            return 0x68000000 | val;
        } else if (this._Wallet.network === Network.data.Testnet.id) {
            return 0x98000000 | val;
        }
        return 0x60000000 | val;
    }

    /**
     * Create the common part of a transaction
     *
     * @param {number} txType - A type of transaction
     * @param {string} senderPublicKey - The sender public key
     * @param {number} timeStamp - A timestamp for the transation
     * @param {number} due - A deadline in minutes
     * @param {number} version - A network version
     *
     * @return {object} - A common transaction object
     */
    CREATE_DATA(txtype, senderPublicKey, timeStamp, due, version) {
        return {
            'type': txtype,
            'version': version || this.CURRENT_NETWORK_VERSION(1),
            'signer': senderPublicKey,
            'timeStamp': timeStamp,
            'deadline': timeStamp + due * 60
        };
    }

    /**
     * Calculate fees for mosaics included in a transaction
     *
     * @param {number} multiplier - A quantity multiplier
     * @param {object} mosaics - A mosaicDefinitionMetaDataPair object
     * @param {array} attachedMosaics - An array of mosaics to send
     *
     * @return {number} - The fee amount for the mosaics in the transaction
     */
    calculateMosaicsFee(multiplier, mosaics, attachedMosaics) {
        if(this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000) {
            let totalFee = 0;
            let fee = 0;
            let supplyRelatedAdjustment = 0;
            for (let i = 0; i < attachedMosaics.length; i++) {
                let m = attachedMosaics[i];
                let mosaicName = helpers.mosaicIdToName(m.mosaicId);
                if (!(mosaicName in mosaics)) {
                    return ['unknown mosaic divisibility', data];
                }
                let mosaicDefinitionMetaDataPair = mosaics[mosaicName];
                let divisibilityProperties = $.grep(mosaicDefinitionMetaDataPair.mosaicDefinition.properties, function(w) {
                    return w.name === "divisibility";
                });
                let divisibility = divisibilityProperties.length === 1 ? ~~(divisibilityProperties[0].value) : 0;

                let supply = mosaicDefinitionMetaDataPair.supply;
                let quantity = m.quantity;
                // Small business mosaic fee
                if (supply <= 10000 && divisibility === 0) {
                    fee = 1;
                } else {
                    let maxMosaicQuantity = 9000000000000000;
                    let totalMosaicQuantity = supply * Math.pow(10, divisibility)
                    supplyRelatedAdjustment = Math.floor(0.8 * Math.log(maxMosaicQuantity / totalMosaicQuantity));
                    let numNem = helpers.calcXemEquivalent(multiplier, quantity, supply, divisibility);
                    // Using Math.ceil below because xem equivalent returned is sometimes a bit lower than it should
                    // Ex: 150'000 of nem:xem gives 149999.99999999997
                    fee = helpers.calcMinFee(Math.ceil(numNem));
                }
                totalFee += Math.max(1, fee - supplyRelatedAdjustment);
            }
            return Math.max(1, totalFee);
        } else {
            let totalFee = 0;
            for (let i = 0; i < attachedMosaics.length; i++) {
                let m = attachedMosaics[i];
                let mosaicName = helpers.mosaicIdToName(m.mosaicId);
                if (!(mosaicName in mosaics)) {
                    return ['unknown mosaic divisibility', data];
                }
                let mosaicDefinitionMetaDataPair = mosaics[mosaicName];
                let divisibilityProperties = $.grep(mosaicDefinitionMetaDataPair.mosaicDefinition.properties, function(w) {
                    return w.name === "divisibility";
                });
                let divisibility = divisibilityProperties.length === 1 ? ~~(divisibilityProperties[0].value) : 0;

                let supply = mosaicDefinitionMetaDataPair.supply;
                let quantity = m.quantity;
                let numNem = helpers.calcXemEquivalent(multiplier, quantity, supply, divisibility);
                let fee = Math.ceil(Math.max(10 - numNem, 2, Math.floor(Math.atan(numNem / 150000.0) * 3 * 33)));

                totalFee += fee;
            }
            return (totalFee * 5) / 4;
        }
    }

    /**
     * Wrap a transaction in otherTrans
     *
     * @param {string} senderPublicKey - The sender public key
     * @param {object} innerEntity - The transaction entity to wrap
     * @param {number} due - The transaction deadline in minutes
     *
     * @return {object} - A [MultisigTransaction]{@link http://bob.nem.ninja/docs/#multisigTransaction} object
     */
    _multisigWrapper(senderPublicKey, innerEntity, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.MultisigTransaction, senderPublicKey, timeStamp, due, version);
        let custom = {
            'fee': 6000000,
            'otherTrans': innerEntity
        };
        let entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Prepare a transfer and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     * @param {object} mosaicsMetaData - The mosaicDefinitionMetaDataPair object
     *
     * @return {object} - A [TransferTransaction]{@link http://bob.nem.ninja/docs/#transferTransaction} object ready for serialization
     */
    prepareTransfer(common, tx, mosaicsMetaData) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let recipientCompressedKey = tx.recipient.toString();
        let amount = Math.round(tx.amount * 1000000);
        let message = helpers.prepareMessage(common, tx);
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let mosaics = tx.mosaics;
        let mosaicsFee = null
        if (!tx.mosaics) {
            mosaicsFee = null;
        } else {
            mosaicsFee = this.calculateMosaicsFee(amount, mosaicsMetaData, mosaics);
        }
        let entity = this._constructTransfer(actualSender, recipientCompressedKey, amount, message, due, mosaics, mosaicsFee);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }

        return entity;
    }

    /***
     * Create a transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {string} recipientCompressedKey - The recipient account public key
     * @param {number} amount - The amount to send in micro XEM
     * @param {object} message - The message object
     * @param {number} due - The deadline in minutes
     * @param {array} mosaics - The array of mosaics to send
     * @param {number} mosaicFee - The fees for mosaics included in the transaction
     *
     * @return {object} - A [TransferTransaction]{@link http://bob.nem.ninja/docs/#transferTransaction} object
     */
    _constructTransfer(senderPublicKey, recipientCompressedKey, amount, message, due, mosaics, mosaicsFee) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = mosaics ? this.CURRENT_NETWORK_VERSION(2) : this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.Transfer, senderPublicKey, timeStamp, due, version);
        let msgFee = this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 && message.payload.length || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000 && message.payload.length ? Math.max(1, Math.floor((message.payload.length / 32) + 1)) : message.payload.length ? Math.max(1, Math.floor(message.payload.length / 2 / 16)) * 2 : 0;
        let fee = mosaics ? mosaicsFee : this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000 ? helpers.calcMinFee(amount / 1000000) : Math.ceil(Math.max(10 - (amount / 1000000), 2, Math.floor(Math.atan((amount / 1000000) / 150000.0) * 3 * 33)));
        let totalFee = (msgFee + fee) * 1000000;
        let custom = {
            'recipient': recipientCompressedKey.toUpperCase().replace(/-/g, ''),
            'amount': amount,
            'fee': totalFee,
            'message': message,
            'mosaics': mosaics
        };
        let entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Create an aggregate modification transaction object
     *
     * @param {object} tx - The transaction data
     * @param {array} signatoryArray - The cosignatories modifications array
     *
     * @return {object} - A [MultisigAggregateModificationTransaction]{@link http://bob.nem.ninja/docs/#multisigAggregateModificationTransaction} object
     */
    _constructAggregate(tx, signatoryArray) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(2);
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let data = this.CREATE_DATA(TransactionTypes.MultisigModification, tx.multisigPubKey, timeStamp, due, version);
        let totalFee = (10 + 6 * signatoryArray.length + 6) * 1000000;
        let custom = {
            'fee': totalFee,
            'modifications': [],
            'minCosignatories': {
                'relativeChange': tx.minCosigs
            }
        };
        for (let i = 0; i < signatoryArray.length; i++) {
            custom.modifications.push({
                "modificationType": 1,
                "cosignatoryAccount": signatoryArray[i].pubKey
            });
        }

        // Sort modification array by addresses
        if (custom.modifications.length > 1) {
            custom.modifications.sort((a, b) => {
                if (Address.toAddress(a.cosignatoryAccount, this._Wallet.network) < Address.toAddress(b.cosignatoryAccount, this._Wallet.network)) return -1;
                if (Address.toAddress(a.cosignatoryAccount, this._Wallet.network) > Address.toAddress(b.cosignatoryAccount, this._Wallet.network)) return 1;
                return 0;
            });
        }

        let entity = $.extend(data, custom);
        return entity;
    };

    /**
     * Create a multisignature aggregate modification transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {string} multisigPublicKey - The multisignature account public key
     * @param {array} signatoryArray: -The modification array of cosignatories
     * @param {number} minCosigs - The minimum number of cosignatories
     * @param {number} network - The network id
     * @param {number} due - The deadline in minutes
     *
     * @return {object} - A [MultisigCosignatoryModification]{@link http://bob.nem.ninja/docs/#multisigCosignatoryModification} object
     */
    _constructAggregateModifications(senderPublicKey, tx, signatoryArray) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version;
        let custom;
        let totalFee;
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        if (tx.minCosigs === null || tx.minCosigs === 0) {
            version = this.CURRENT_NETWORK_VERSION(1);
        } else {
            version = this.CURRENT_NETWORK_VERSION(2);
        }
        let data = this.CREATE_DATA(TransactionTypes.MultisigModification, tx.multisigPubKey, timeStamp, due, version);
        if (tx.minCosigs === null || tx.minCosigs === 0) {
            totalFee = (10 + 6 * signatoryArray.length) * 1000000;
            custom = {
                'fee': totalFee,
                'modifications': []
            };
        } else {
            totalFee = (10 + 6 * signatoryArray.length + 6) * 1000000;
            custom = {
                'fee': totalFee,
                'modifications': [],
                'minCosignatories': {
                    'relativeChange': tx.minCosigs
                }
            };
        }
        for (let i = 0; i < signatoryArray.length; i++) {
            custom.modifications.push({
                "modificationType": signatoryArray[i].type,
                "cosignatoryAccount": signatoryArray[i].pubKey
            });
        }

        // Sort modification array by types then by addresses
        if (custom.modifications.length > 1) {
            custom.modifications.sort((a, b) => {
                return a.modificationType - b.modificationType || Address.toAddress(a.cosignatoryAccount, this._Wallet.network).localeCompare(Address.toAddress(b.cosignatoryAccount, this._Wallet.network));
            });
        }

        let entity = $.extend(data, custom);
        entity = this._multisigWrapper(senderPublicKey, entity, due);
        return entity;
    };

    /**
     * Prepare a namespace provision transaction and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {object} - A [ProvisionNamespaceTransaction]{@link http://bob.nem.ninja/docs/#provisionNamespaceTransaction} object ready for serialization
     */
    prepareNamespace(common, tx) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let rentalFeeSink = tx.rentalFeeSink.toString();
        let rentalFee;
        if (this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000) {
            // Set fee depending if namespace or sub
            if (tx.namespaceParent) {
                rentalFee = 200 * 1000000;
            } else {
                rentalFee = 5000 * 1000000;
            }
        } else {
            // Set fee depending if namespace or sub
            if (tx.namespaceParent) {
                rentalFee = 5000 * 1000000;
            } else {
                rentalFee = 50000 * 1000000;
            }
        }
        let namespaceParent = tx.namespaceParent ? tx.namespaceParent.fqn : null;
        let namespaceName = tx.namespaceName.toString();
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let entity = this._constructNamespace(actualSender, rentalFeeSink, rentalFee, namespaceParent, namespaceName, due);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }
        return entity;
    };

    /***
     * Create a namespace provision transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {string} rentalFeeSink - The rental sink account
     * @param {number} rentalFee - The rental fee
     * @param {string} namespaceParent - The parent namespace
     * @param {string} namespaceName  - The namespace name
     * @param {number} due - The deadline in minutes
     *
     * @return {object} - A [ProvisionNamespaceTransaction]{@link http://bob.nem.ninja/docs/#provisionNamespaceTransaction} object
     */
    _constructNamespace(senderPublicKey, rentalFeeSink, rentalFee, namespaceParent, namespaceName, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.ProvisionNamespace, senderPublicKey, timeStamp, due, version);
        let fee = this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000 ? 20 * 1000000 : 2 * 3 * 18 * 1000000;
        let custom = {
            'rentalFeeSink': rentalFeeSink.toUpperCase().replace(/-/g, ''),
            'rentalFee': rentalFee,
            'parent': namespaceParent,
            'newPart': namespaceName,
            'fee': fee
        };
        let entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Prepare a mosaic definition transaction and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {object} - A [MosaicDefinitionCreationTransaction]{@link http://bob.nem.ninja/docs/#mosaicDefinitionCreationTransaction} object ready for serialization
     */
    prepareMosaicDefinition(common, tx) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let rentalFeeSink = tx.mosaicFeeSink.toString();
        let rentalFee;
        if(this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000) {
            rentalFee = 500 * 1000000;
        } else {
            rentalFee = 50000 * 1000000;
        }
        let namespaceParent = tx.namespaceParent.fqn;
        let mosaicName = tx.mosaicName.toString();
        let mosaicDescription = tx.mosaicDescription.toString();
        let mosaicProperties = tx.properties;
        let levy = tx.levy.mosaic ? tx.levy : null;
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let entity = this._constructMosaicDefinition(actualSender, rentalFeeSink, rentalFee, namespaceParent, mosaicName, mosaicDescription, mosaicProperties, levy, due);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }
        return entity;
    };

    /***
     * Create a mosaic definition transaction object
     *
     * @param {string} senderPublicKey: The sender account public key
     * @param {string} rentalFeeSink: The rental sink account
     * @param {number} rentalFee: The rental fee
     * @param {string} namespaceParent: The parent namespace
     * @param {string} mosaicName: The mosaic name
     * @param {string} mosaicDescription: The mosaic description
     * @param {object} mosaicProperties: The mosaic properties object
     * @param {object} levy: The levy object
     * @param {number} due: The deadline in minutes
     *
     * @return {object} - A [MosaicDefinitionCreationTransaction]{@link http://bob.nem.ninja/docs/#mosaicDefinitionCreationTransaction} object
     */
    _constructMosaicDefinition(senderPublicKey, rentalFeeSink, rentalFee, namespaceParent, mosaicName, mosaicDescription, mosaicProperties, levy, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.MosaicDefinition, senderPublicKey, timeStamp, due, version);

        let fee = this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000 ? 20 * 1000000 : 2 * 3 * 18 * 1000000;
        let levyData = levy ? {
            'type': levy.feeType,
            'recipient': levy.address.toUpperCase().replace(/-/g, ''),
            'mosaicId': levy.mosaic,
            'fee': levy.fee,
        } : null;
        let custom = {
            'creationFeeSink': rentalFeeSink.replace(/-/g, ''),
            'creationFee': rentalFee,
            'mosaicDefinition': {
                'creator': senderPublicKey,
                'id': {
                    'namespaceId': namespaceParent,
                    'name': mosaicName,
                },
                'description': mosaicDescription,
                'properties': $.map(mosaicProperties, function(v, k) {
                    return {
                        'name': k,
                        'value': v.toString()
                    };
                }),
                'levy': levyData
            },
            'fee': fee
        };
        var entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Prepare a mosaic supply change transaction and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {object} - A [MosaicSupplyChangeTransaction]{@link http://bob.nem.ninja/docs/#mosaicSupplyChangeTransaction} object ready for serialization
     */
    prepareMosaicSupply(common, tx) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let entity = this._constructMosaicSupply(actualSender, tx.mosaic, tx.supplyType, tx.delta, due);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }
        return entity;
    }

    /***
     * Create a mosaic supply change transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {object} mosaicId - The mosaic id
     * @param {number} supplyType - The type of change
     * @param {number} delta - The amount involved in the change
     * @param {number} due - The deadline in minutes
     *
     * @return {object} - A [MosaicSupplyChangeTransaction]{@link http://bob.nem.ninja/docs/#mosaicSupplyChangeTransaction} object
     */
    _constructMosaicSupply(senderPublicKey, mosaicId, supplyType, delta, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.MosaicSupply, senderPublicKey, timeStamp, due, version);

        let fee = this._Wallet.network === Network.data.Testnet.id && this._DataBridge.nisHeight >= 572500 || this._Wallet.network === Network.data.Mainnet.id && this._DataBridge.nisHeight >= 875000 ? 20 * 1000000 : 2 * 3 * 18 * 1000000;
        let custom = {
            'mosaicId': mosaicId,
            'supplyType': supplyType,
            'delta': delta,
            'fee': fee
        };
        let entity = $.extend(data, custom);
        return entity;
    };

    /**
     * Prepare an importance transfer transaction and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {object} - An [ImportanceTransferTransaction]{@link http://bob.nem.ninja/docs/#importanceTransferTransaction} object ready for serialization
     */
    prepareImportanceTransfer(common, tx) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let entity = this._constructImportanceTransfer(actualSender, tx.remoteAccount, tx.mode, due);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }
        return entity;
    }

    /***
     * Create an importance transfer transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {string} recipientKey - The remote account public key
     * @param {number} mode - The selected mode
     * @param {number} due - The deadline in minutes
     *
     * @return {object} - An [ImportanceTransferTransaction]{@link http://bob.nem.ninja/docs/#importanceTransferTransaction} object
     */
    _constructImportanceTransfer(senderPublicKey, recipientKey, mode, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.ImportanceTransfer, senderPublicKey, timeStamp, due, version);
        let custom = {
            'remoteAccount': recipientKey,
            'mode': mode,
            'fee': 6000000
        };
        let entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Prepare an apostille transfer and create the object to serialize
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {object} - A [TransferTransaction]{@link http://bob.nem.ninja/docs/#transferTransaction} object ready for serialization
     */
    prepareApostilleTransfer(common, tx) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = tx.isMultisig ? tx.multisigAccount.publicKey : kp.publicKey.toString();
        let recipientCompressedKey = tx.recipient.toString();
        let amount = parseInt(tx.amount * 1000000, 10);
        // Set the apostille file hash as hex message
        let message = {
            'type': 1,
            'payload': tx.message.toString()
        };
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let mosaics = null;
        let mosaicsFee = null
        let entity = this._constructTransfer(actualSender, recipientCompressedKey, amount, message, due, mosaics, mosaicsFee);
        if (tx.isMultisig) {
            entity = this._multisigWrapper(kp.publicKey.toString(), entity, due);
        }

        return entity;
    }

    /**
     * Prepare a multisig signature transaction, create the object, serialize and broadcast
     *
     * @param {object} common - A password/privateKey object
     * @param {object} tx - The transaction data
     *
     * @return {promise} - An announce transaction promise of the NetworkRequests service
     */
    prepareSignature(tx, common) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let actualSender = kp.publicKey.toString();
        let otherAccount = tx.multisigAccountAddress.toString();
        let otherHash = tx.hash.toString();
        let due = this._Wallet.network === Network.data.Testnet.id ? 60 : 24 * 60;
        let entity = this._constructSignature(actualSender, otherAccount, otherHash, due);
        let result = Serialization.serializeTransaction(entity);
        let signature = kp.sign(result);
        let obj = {
            'data': convert.ua2hex(result),
            'signature': signature.toString()
        };
        return this._NetworkRequests.announceTransaction(helpers.getHostname(this._Wallet.node), obj);
    };

    /***
     * Create a multisig signature transaction object
     *
     * @param {string} senderPublicKey - The sender account public key
     * @param {string} otherAccount - The multisig account address
     * @param {string} otherHash - The inner transaction hash
     * @param {number} due - The deadline in minutes
     *
     * @return {object} - An [MultisigSignatureTransaction]{@link http://bob.nem.ninja/docs/#multisigSignatureTransaction} object
     */
    _constructSignature(senderPublicKey, otherAccount, otherHash, due) {
        let timeStamp = helpers.createNEMTimeStamp();
        let version = this.CURRENT_NETWORK_VERSION(1);
        let data = this.CREATE_DATA(TransactionTypes.MultisigSignature, senderPublicKey, timeStamp, due, version);
        let totalFee = (2 * 3) * 1000000;
        let custom = {
            'otherHash': {
                'data': otherHash
            },
            'otherAccount': otherAccount,
            'fee': totalFee,
        };
        let entity = $.extend(data, custom);
        return entity;
    }

    /**
     * Serialize a transaction and broadcast it to the network
     *
     * @param {object} entity - The prepared transaction object
     * @param {object} common - A password/privateKey object
     *
     * @return {promise} - An announce transaction promise of the NetworkRequests service
     */
    serializeAndAnnounceTransaction(entity, common) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let result = Serialization.serializeTransaction(entity);
        let signature = kp.sign(result);
        let obj = {
            'data': convert.ua2hex(result),
            'signature': signature.toString()
        };
        return this._NetworkRequests.announceTransaction(helpers.getHostname(this._Wallet.node), obj);
    }

    /**
     * Serialize a transaction and broadcast it to the network (from a loop)
     *
     * @param {object} entity - The prepared transaction object
     * @param {object} common - A password/privateKey object
     * @param {anything} data - Any kind of data
     * @param {number} k - The position into the loop
     *
     * @return {promise} - An announce transaction promise of the NetworkRequests service, with isolated data
     */
    serializeAndAnnounceTransactionLoop(entity, common, data, k) {
        let kp = KeyPair.create(helpers.fixPrivateKey(common.privateKey));
        let result = Serialization.serializeTransaction(entity);
        let signature = kp.sign(result);
        let obj = {
            'data': convert.ua2hex(result),
            'signature': signature.toString()
        };
        return this._NetworkRequests.announceTransactionLoop(helpers.getHostname(this._Wallet.node), obj, data, k);
    }

}

export default Transactions;