import helpers from '../utils/helpers';
import Network from '../utils/Network';
import CryptoHelpers from '../utils/CryptoHelpers';
import KeyPair from '../utils/KeyPair';
import Address from '../utils/Address';

let incr = 0;

function TagTransaction(NetworkRequests, Alert, Wallet, $filter, Transactions, $timeout, $state) {
    'ngInject';

    return {
        restrict: 'E',
        scope: {
            d: '=',
            z: '=',
            tooltipPosition: '=',
            accountData: '=',
            h: '='
        },
        template: '<ng-include src="templateUri"/>',
        link: (scope) => {
            if (scope.d.transaction.type == 4100) {
                scope.tx = scope.d.transaction.otherTrans;
                scope.meta = scope.d.meta;
                scope.parent = scope.d.transaction;
                scope.mainAccount = scope.z;
                scope.number = incr++;
                scope.walletScope = scope.h;
                scope.confirmed = !(scope.meta.height === Number.MAX_SAFE_INTEGER);
                scope.needsSignature = scope.parent && !scope.confirmed && scope.h.accountData && helpers.needsSignature(scope.d, scope.h.accountData);
            } else {
                scope.tx = scope.d.transaction;
                scope.meta = scope.d.meta;
                scope.parent = undefined;
                scope.mainAccount = scope.z;
                scope.number = incr++;
                scope.walletScope = scope.h;
                //console.log(scope.walletScope);
            }

            // If called the accounts explorer we hide message decryption
            scope.disableDecryption = false;
            if ($state.current.name === 'app.accountsExplorer') {
                scope.disableDecryption = true;
            }

            scope.templateName = helpers.txTypeToName(scope.tx.type);
            scope.templateUri = 'layout/lines/line' + scope.templateName + '.html';

            scope.mosaicIdToName = helpers.mosaicIdToName;
            scope.mosaicDefinitionMetaDataPair = scope.walletScope.mosaicDefinitionMetaDataPair;
            scope.cosignCallback = scope.$parent.cosignTransaction;
            scope.displayTransactionDetails = scope.$parent.displayTransactionDetails;
            scope.networkId = Wallet.network;
            scope.walletScope.common = {
                'password': '',
                'privateKey': ''
            }

            /**
             * decode() Decode an encrypted message in a transaction
             *
             * @param tx: The transaction object
             */
            scope.decode = (tx) => {
                // Check and decrypt/generate private key. Returned private key is contained into scope.walletScope.common
                if (!CryptoHelpers.passwordToPrivatekeyClear(scope.walletScope.common, Wallet.currentAccount, Wallet.algo, true)) {
                    Alert.invalidPassword();
                    return;
                } else if (!CryptoHelpers.checkAddress(scope.walletScope.common.privateKey, Wallet.network, Wallet.currentAccount.address)) {
                    Alert.invalidPassword();
                    return;
                }
                // Get sender account info
                NetworkRequests.getAccountData(helpers.getHostname(Wallet.node), tx.recipient).then((data) => {
                        // Set right public key if sender or recipient
                        let recipientPubKey;
                        let kp = KeyPair.create(scope.walletScope.common.privateKey);
                        if(kp.publicKey.toString() === tx.signer) {
                            recipientPubKey = data.account.publicKey;
                        } else {
                            recipientPubKey = tx.signer;
                        }
                        let decoded = CryptoHelpers.decode(scope.walletScope.common.privateKey, recipientPubKey, tx.message.payload);
                        // Decode the message
                        if (!decoded) {
                            Alert.emptyDecodedMessage();
                        } else {
                            // Set decrypted message in the right template,
                            // use the tx timeStamp to identify each element in the array of templates generated with 
                            // ng-repeat and tag-transaction directive.                                  
                            // There is two parts in the template, the line and the details
                            $("#line-" + tx.timeStamp).html($filter('fmtHexMessage')({
                                "type": 1,
                                "payload": decoded
                            }));
                            $("#details-" + tx.timeStamp).html($filter('fmtHexMessage')({
                                "type": 1,
                                "payload": decoded
                            }));
                            // Reset common
                            scope.walletScope.common.password = "";
                            scope.walletScope.common.privateKey = "";
                            //remove the the decode part of the template
                            $("#decodeTxMessage-" + tx.timeStamp).remove();
                        }
                    },
                    (err) => {
                        // Reset common
                        scope.walletScope.common.password = "";
                        scope.walletScope.common.privateKey = "";
                        Alert.getAccountDataError(err.statusText);
                        return;
                    });
            };

            /**
             * cosign() Cosign a multisig transaction
             *
             * @param parentTx: The transaction object
             * @param tx: The inner transaction object
             * @param meta: The meta data of transaction object
             */
            scope.walletScope.cosign = (parentTx, tx, meta) => {
                let txCosignData = {
                    'fee': 0,
                    'multisigAccount': parentTx.otherTrans.signer, // inner tx signer is a multisig account
                    'multisigAccountAddress': Address.toAddress(parentTx.otherTrans.signer, Wallet.network),
                    'hash': meta.innerHash.data // hash of an inner tx is needed
                };

                // Check and decrypt/generate private key. Returned private key is contained into scope.walletScope.common
                if (!CryptoHelpers.passwordToPrivatekeyClear(scope.walletScope.common, Wallet.currentAccount, Wallet.algo, true)) {
                    Alert.invalidPassword();
                    return;
                } else if (!CryptoHelpers.checkAddress(scope.walletScope.common.privateKey, Wallet.network, Wallet.currentAccount.address)) {
                    Alert.invalidPassword();
                    return;
                }
                // Construct transaction byte array, sign and broadcast it to the network
                Transactions.prepareSignature(txCosignData, scope.walletScope.common).then((res) => {
                        // Check status
                        if (res.status === 200) {
                            // If code >= 2, it's an error
                            if (res.data.code >= 2) {
                                Alert.transactionError(res.data.message);
                            } else {
                                Alert.transactionSignatureSuccess();
                                // update transaction state
                                $timeout(() => {
                                    $("#needsSignature-" + tx.timeStamp).remove();
                                    $("#needsSignature2-" + tx.timeStamp).remove();
                                    parentTx.signatures.push({ "signer": scope.h.accountData.account.publicKey, "timeStamp": helpers.createNEMTimeStamp()});
                                });
                            }
                        }
                        // Reset common
                        scope.walletScope.common.password = "";
                        scope.walletScope.common.privateKey = "";
                    },
                    (err) => {
                        // Reset common
                        scope.walletScope.common.password = "";
                        scope.walletScope.common.privateKey = "";
                        Alert.transactionError('Failed ' + res.data.error + " " + res.data.message);
                    });
            }

        }
    };
}

export default TagTransaction;