/** Service to create the connection to NIS websocket channels */
class Connector {

     /**
     * Initialize services and properties
     *
     * @param {service} DataBridge - The DataBridge service
     */
     constructor(DataBridge) {
         'ngInject';

         /***
         * Declare services
         */
         this._DataBridge = DataBridge
     }

     /**
     * Create a connector and subscribe an account to default channels
     *
     * @param {string} _node - A node uri
     * @param {string} _accountAddress - An account address 
     *
     * @return {object} - A connector
     */
     create(_node, _accountAddress) {
         return {

             originalAddress: _accountAddress,
             // This is important, we need upper case when subscribing
             accountAddress: _accountAddress.replace(/-/g, "").toUpperCase(),
             socket: undefined,
             stompClient: undefined,
             timeoutHandle: undefined,
             timeoutReconnect: undefined,
             alreadyForced: false,
             nisNode: _node,
             DataBridge: this._DataBridge,

             subscribeToMultisig(address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }
                 self.stompClient.send("/w/api/account/subscribe", {}, "{'account':'" + address + "'}");
                 return true;
             },

             requestAccountData(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestAccountData(_address);
                     }, 100);
                 } else {
                     // triggers sending of initial account state
                     // mind that we need to pass a STRING not an object
                     var address = _address || self.accountAddress;
                     self.stompClient.send("/w/api/account/get", {}, "{'account':'" + address + "'}");
                 }
             },
             requestAccountTransactions(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestAccountTransactions(_address);
                     }, 100);
                 } else {
                     // triggers sending of most recent transfers
                     var address = _address || self.accountAddress;
                     self.stompClient.send("/w/api/account/transfers/all", {}, "{'account':'" + address + "'}");
                 }
             },
             requestAccountMosaicDefinitions(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestAccountMosaicDefinitions(_address);
                     }, 100);
                 } else {
                     // triggers sending of most recent transfers
                     var address = _address || self.accountAddress;
                     self.stompClient.send("/w/api/account/mosaic/owned/definition", {}, "{'account':'" + address + "'}");
                 }
             },
             requestAccountMosaics(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestAccountMosaics(_address);
                     }, 100);
                 } else {
                     // triggers sending of most recent transfers
                     var address = _address || self.accountAddress;
                     self.stompClient.send("/w/api/account/mosaic/owned", {}, "{'account':'" + address + "'}");
                 }
             },
             requestAccountNamespaces(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestAccountNamespaces(_address);
                     }, 100);
                 } else {
                     // triggers sending of most recent transfers
                     var address = _address || self.accountAddress;
                     self.stompClient.send("/w/api/account/namespace/owned", {}, "{'account':'" + address + "'}");
                 }
             },

             requestUnconfirmedTransactions(_address) {
                 var self = this;
                 // if not ready, wait a bit more...
                 if (self.socket.readyState !== SockJS.OPEN) {
                     self.timeoutHandle = setTimeout(function() {
                         self.requestUnconfirmedTransactions(_address);
                     }, 100);
                 } else {
                     // triggers sending of most recent transfers
                     var address = _address || self.accountAddress;
                     console.log(address)
                     self.stompClient.send("/account/transfers/unconfirmed", {}, "{'account':'" + address + "'}");
                 }
             },


             on(name, cb) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 switch (name) {
                     case 'errors':
                         self.stompClient.subscribe('/errors', function(data) {
                             var error = JSON.parse(data.body);
                             cb('errors', error);
                         });
                         break;
                     case 'newblocks':
                         self.stompClient.subscribe('/blocks/new', function(data) {
                             var blockHeight = JSON.parse(data.body);
                             cb(blockHeight);
                         });
                         break;
                     case 'account':
                         self.stompClient.subscribe('/account/' + self.accountAddress, function(data) {
                             cb(JSON.parse(data.body));
                         });
                         break;
                     case 'recenttransactions':
                         self.stompClient.subscribe('/recenttransactions/' + self.accountAddress, function(data) {
                             cb(JSON.parse(data.body));
                         });
                         break;
                     default:
                         throw "Invalid argument";
                 }
                 return true;
             },

             onUnconfirmed(cbUnconfirmed, _address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 var address = _address || self.accountAddress;
                 //console.log(address);
                 self.stompClient.subscribe('/unconfirmed/' + address, function(data) {
                     //console.log(data);
                     cbUnconfirmed(JSON.parse(data.body));
                 });
                 return true;
             }, 

             onConfirmed(cbConfirmed, _address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 // we could have subscribed only to /unconfirmed/
                 // but then in case of multisig txes, we wouldn't have any indication if it got included or not
                 var address = _address || self.accountAddress;
                 self.stompClient.subscribe('/transactions/' + address, function(data) {
                     cbConfirmed(JSON.parse(data.body));
                 });
                 return true;
             },

             onMosaicDefinition(cbMosaic, _address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 var address = _address || self.accountAddress;
                 self.stompClient.subscribe('/account/mosaic/owned/definition/' + address, function(data) {
                     cbMosaic(JSON.parse(data.body));
                 });
             },

             onMosaic(cbMosaic, _address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 var address = _address || self.accountAddress;
                 self.stompClient.subscribe('/account/mosaic/owned/' + address, function(data) {
                     cbMosaic(JSON.parse(data.body), address);
                 });
             },

             onNamespace(cbNamespace, _address) {
                 var self = this;
                 if (self.socket.readyState !== SockJS.OPEN) {
                     return false;
                 }

                 var address = _address || self.accountAddress;
                 self.stompClient.subscribe('/account/namespace/owned/' + address, function(data) {
                     cbNamespace(JSON.parse(data.body), address);
                 });
             },

             close() {
                 var self = this;
                 console.log("Connection to "+ self.nisNode.uri +" must be closed now !");
                 // Stop trying to reconnect
                 clearTimeout(self.timeoutReconnect);
                 self.socket.close();
                 self.socket.onclose = function(e) {
                     console.log(e);
                 };
             },

             connect(asyncConnectCb) {
                 var self = this;
                 self.socket = new SockJS(_node.uri + '/w/messages');
                 self.stompClient = Stomp.over(self.socket);
                 self.stompClient.debug = undefined;
                 self.stompClient.connect({}, function(frame) {
                     if (undefined !== asyncConnectCb) {
                         asyncConnectCb();

                     }
                 }, () => {
                     // This will reconnect on failure, but will keep trying even when it shouldn't (e.g. server dies)
                     clearTimeout(self.timeoutHandle);
                     self.timeoutReconnect = setTimeout(function() {
                        console.log("Trying to reconnect...")
                        self.DataBridge.openConnection(self);
                     }, 1000);
                 });
             }
         };
     };

 }

export default Connector;