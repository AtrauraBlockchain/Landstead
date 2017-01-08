# LANDSTEAD #
## Land And Immovable Property Ownership Register ##
Implementation of a Proof of Concept (POC) of an ownership register or cadastral system to prove the viability and usability of blockchain technologym for such a system in real life situations. The system is based on unique identifications and immutable registrations on the blockchain.

##Terminology ##
BW - Brain wallet
MS - Multi Signature
IDc - Citizen Identification Number or Code
IDp - Property Identification Number or Code
[G] - Government's account (Private Key)
[C] - Citizen's account (Private Key, in other examples NAAAAA), must have received a country:citizen Asset with IDc as message
[PC] - Pointer to Citizen and brainwallet from IDc@atlantis:citizen (in other examples NPOINT1)
[P] - Property Account and brainwallet from IDp@atlantis:parcel (in other examples NPOINT2, although it is not needed to use it as a pointer account with a pointer message). Must have received a country:parcel Asset (representing the Property Type) with IDp as message 
[N] - Notary Account (one that has received a country:notary Asset)

##Assets##
•  atlantis:citizen 

•  atlantis:notary

•  atlantis:parcel

##Use Cases Implemented ##
###1. Register a Citizen###
0. User creates [C] on it's own and submits his account [C] for validation and registration 
0. Gov. creates [G] and all the Assets

Civil Servant continues registration use case
1. Civil Servant logs in to [G], and accesses 'Validate an account'.
2. A form with 2 fields is presented: the IDc of the citizen and the Citizen’s Account number [C].
    2.1  Civil Servant inputs ID Firstname Lastname@country:citizen (We could use Firstname and Lastname so nobody else can guess upfront what the account numbers will be, and because the date of birth is already integrated in the ID. At least that’s the case in Belgium)  
    2.2 [PC] BW gets created
    2.3 [PC] is set to be a MS acct from [G] 
    2.4 [G] inputs account number of [C] to send message (ID=C) to [PC]
    2.5 [G] sends atlantis:citizen to [C]
    
###2. Register a Property###
1. Civil Servant logs in to [G] and accesses ‘Register a Property’
2. A form is presented with the following fields
  2.1 Selection of Property Type: (drop down, for the moment ‘parcel’ is the only one for Atlantis) 
  2.2 IDp, identification code of the property: 
3. Civil Servant enters the following information
  3.1 he selects Property Type ‘Parcel’
  3.2 he enters the Parcel identification as IDp
  3.3 he confirms with Send
    3.3.1 [P] gets created from IDp@country:parcel
    3.3.2 [G] sends message <IDp> together with 1 country:parcel Asset to [P]
    3.3.3 Convert [P] into MS with cosigner [G] for protection
    
Optional: When cadastral documents are available they can be Apostilled using [P] 

###3. Register a Property Ownership###
Once the Civil Servant has proof of ownership, based on existing cadastral services or existing paper Notary Acts, the magic can happen ;-)
1. Civil Servant logs in to [G] and accesses ‘Register property ownership’ 
2. Form is presented with fields for 
  2.1 Type of owner (must be a country Asset, default citizen) 
  2.2 IDc
  2.3 Property type (must be a country Asset, default parcel)
  2.4 IDp
3. After providing the info and confirmation, the following steps are performed
  3.1 [P] is determined based on IDp@country:parcel, Asset presence of country:parcel is checked in [P]. 
  3.2 [PC] is determined based on IDc@country:citizen
  3.3 In [PC], Incoming messages from [G] are read to find the last message starting with “<IDc>=” 
  3.4 If that last message has an account after the “=”, that is the actual Account of the Citizen: |C]
  3.5 Asset presence of country:citizen is checked in [C]
  3.6 [P] is converted to multisig with 1 cosigner: [C]
  This represents the Citizen’s ownership of the property! 

###4. Verify an account###
1. Citizen logs in to [C] and accesses ‘Verify account’
2. Citizen can see in his balance he has received 1 country:citizen Asset from the Country, confirming the country has validated his IDc
3. Citizen can see in his balance he has received 1 or more country:parcel Assets from the Country, confirming the country has validated him/her as owner of the properties.
4. Additional info about the Properties can be provided based on:
  4.1 the IDp mentioned in the same message from the Country in which the country:parcel Asset was received
  4.2 the multisig accounts (can be more than one for rich people ;-) of which [C] is cosigner: [P] in this example
  4.3 Any optional Apostille Accounts created for Property documents. These can be found as outgoing messages from [P] (See Use case Register a Property)


##Developers##
Build from source

1) Install gulp

npm install -g gulp-cli

2) Open a console to the path of the NanoWallet folder and install all the needed dependencies

npm install

3) Build:

gulp

##Thanks##
This project is based on:
https://github.com/QuantumMechanics/NanoWallet
https://github.com/saulgray/NanoWallet

We'd like to thank QuantumMechanics, SaulGray and the rest of NEM's development team for they great effort.
