# Integration Points Guide

This document highlights all **WEB3.0** and **DECENTRALIZED DATABASE** integration points in the codebase.

---

## 🔗 Decentralized Database Integration (Gun.js)

### File: `lib/gun.ts`

This is the main file for all Gun.js decentralized database operations.

#### Key Functions:

1. **`authenticateUser(username, password)`**
   - **Location**: Line ~32
   - **Purpose**: Authenticates user with Gun.js decentralized database
   - **Integration Point**: Used in login flow

2. **`createUser(username, password)`**
   - **Location**: Line ~45
   - **Purpose**: Creates new user account in Gun.js
   - **Integration Point**: Used in registration flow

3. **`storeUserData(username, data)`**
   - **Location**: Line ~67
   - **Purpose**: Stores user profile data (wallet address, timestamps, etc.)
   - **Integration Point**: Links Gun.js account with Web3.0 wallet

4. **`storeGroup(groupId, groupData)`**
   - **Location**: Line ~95
   - **Purpose**: Stores group information in Gun.js
   - **Integration Point**: Group creation and management

5. **`storeMessage(groupId, messageId, messageData)`**
   - **Location**: Line ~120
   - **Purpose**: Stores messages in Gun.js with real-time sync
   - **Integration Point**: Message sending and synchronization

6. **`listenToMessages(groupId, callback)`**
   - **Location**: Line ~135
   - **Purpose**: Sets up real-time listener for messages
   - **Integration Point**: Real-time message synchronization

7. **`listenToUserGroups(username, callback)`**
   - **Location**: Line ~155
   - **Purpose**: Sets up real-time listener for user's groups
   - **Integration Point**: Real-time group updates

8. **`storeBlockchainRecord(type, id, data)`**
   - **Location**: Line ~180
   - **Purpose**: Stores blockchain verification records
   - **Integration Point**: Links database records with blockchain

---

## ⛓️ Web3.0 Blockchain Integration

### File: `lib/web3.ts`

This is the main file for all Web3.0 blockchain operations.

#### Key Functions:

1. **`initWeb3Provider()`**
   - **Location**: Line ~20
   - **Purpose**: Connects to MetaMask or other Web3.0 wallet providers
   - **Integration Point**: Wallet connection during authentication
   - **TODO**: Add support for WalletConnect and Phantom Wallet

2. **`verifyWalletConnection(provider, expectedAddress)`**
   - **Location**: Line ~60
   - **Purpose**: Verifies connected wallet matches stored address
   - **Integration Point**: Session verification

3. **`createSignature(signer, message)`**
   - **Location**: Line ~80
   - **Purpose**: Creates digital signature for authentication and messages
   - **Integration Point**: Message authenticity, group ownership verification

4. **`verifySignature(message, signature, expectedAddress)`**
   - **Location**: Line ~100
   - **Purpose**: Verifies digital signature
   - **Integration Point**: Message verification on receive

5. **`getWalletAddress(provider)`**
   - **Location**: Line ~125
   - **Purpose**: Gets current connected wallet address
   - **Integration Point**: User identification

6. **`onWalletChange(provider, callback)`**
   - **Location**: Line ~140
   - **Purpose**: Listens for wallet account changes
   - **Integration Point**: Handle wallet switching

7. **`interactWithSmartContract(...)`**
   - **Location**: Line ~165
   - **Purpose**: Interacts with Solidity smart contracts
   - **Integration Point**: Group management, rewards, permissions
   - **Status**: TODO - Not yet implemented

---

## 📁 IPFS/Web3.Storage Integration

### File: `lib/ipfs.ts`

This file handles decentralized file storage (to be implemented).

#### Key Functions (All TODO):

1. **`uploadFileToIPFS(file, encryptionKey?)`**
   - **Purpose**: Upload file to IPFS with client-side encryption
   - **Integration Point**: File sharing feature

2. **`downloadFileFromIPFS(cid, encryptionKey)`**
   - **Purpose**: Download and decrypt file from IPFS
   - **Integration Point**: File retrieval

3. **`storeFileHashOnChain(fileHash, metadata, signer)`**
   - **Purpose**: Store file hash on blockchain via smart contract
   - **Integration Point**: Permanent file reference

4. **`encryptFile(file, key)`**
   - **Purpose**: Encrypt file client-side using AES-256
   - **Integration Point**: File privacy

5. **`decryptFile(encryptedData, key)`**
   - **Purpose**: Decrypt file that was encrypted client-side
   - **Integration Point**: File retrieval

---

## 🔐 Authentication Integration Points

### File: `components/auth/LoginPage.tsx`

#### Login Flow Integration Points:

1. **Web3.0 Wallet Connection** (Line ~50)
   ```typescript
   const web3Result = await initWeb3Provider();
   ```
   - Connects to MetaMask/WalletConnect/Phantom
   - Gets wallet address and signer

2. **Digital Signature Creation** (Line ~60)
   ```typescript
   const sigResult = await createSignature(web3Result.signer, message);
   ```
   - Creates signature for authentication
   - Proves user controls wallet

3. **Gun.js Authentication** (Line ~70)
   ```typescript
   const authResult = await authenticateUser(loginUsername, loginPassword);
   ```
   - Authenticates with decentralized database

4. **Wallet Address Storage** (Line ~75)
   ```typescript
   storeUserData(loginUsername, { wallet: walletAddress, ... });
   ```
   - Links Gun.js account with Web3.0 wallet

5. **Blockchain Record Storage** (Line ~85)
   ```typescript
   storeBlockchainRecord('users', walletAddress, {...});
   ```
   - Stores user registration record

#### Signup Flow Integration Points:

Same as login flow, plus:
- User account creation in Gun.js
- Registration signature storage
- Blockchain user record creation

---

## 💬 Messaging Integration Points

### File: `components/chat/ChatInterface.tsx` and `hooks/useChat.ts`

#### Message Sending Integration Points:

1. **Message Signature** (`hooks/useChat.ts:sendMessage`, Line ~60)
   ```typescript
   const sigResult = await createSignature(signer, messageToSign);
   ```
   - **WEB3.0 INTEGRATION**: Creates signature for message authenticity

2. **Message Storage** (`hooks/useChat.ts:sendMessage`, Line ~80)
   ```typescript
   storeMessage(groupId, messageId, messageData);
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Stores message in Gun.js

3. **Blockchain Record** (`hooks/useChat.ts:sendMessage`, Line ~90)
   ```typescript
   storeBlockchainRecord('messages', messageId, { hash, ... });
   ```
   - **WEB3.0 INTEGRATION**: Stores message hash for audit trail

#### Message Loading Integration Points:

1. **Real-time Listener** (`hooks/useChat.ts:loadMessages`, Line ~40)
   ```typescript
   const unsubscribe = listenToMessages(groupId, callback);
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Real-time message sync

---

## 👥 Group Management Integration Points

### File: `components/chat/ChatInterface.tsx` and `hooks/useChat.ts`

#### Group Creation Integration Points:

1. **Group Signature** (`hooks/useChat.ts:createGroup`, Line ~95)
   ```typescript
   const sigResult = await createSignature(signer, groupCreationMessage);
   ```
   - **WEB3.0 INTEGRATION**: Proves group creator controls wallet

2. **Group Storage** (`hooks/useChat.ts:createGroup`, Line ~120)
   ```typescript
   storeGroup(groupId, groupData);
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Stores group in Gun.js

3. **User Groups List** (`hooks/useChat.ts:createGroup`, Line ~125)
   ```typescript
   gunUser(createdBy).get('groups').get(groupId).put({...});
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Links group to user

4. **Group Members** (`hooks/useChat.ts:createGroup`, Line ~130)
   ```typescript
   gun.get('groups').get(groupId).get('members').get(createdBy).put({...});
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Stores group membership

5. **Blockchain Record** (`hooks/useChat.ts:createGroup`, Line ~140)
   ```typescript
   storeBlockchainRecord('groups', groupId, { hash, owner, ... });
   ```
   - **WEB3.0 INTEGRATION**: Stores group ownership on blockchain

#### Group Loading Integration Points:

1. **Real-time Listener** (`hooks/useChat.ts:loadGroups`, Line ~35)
   ```typescript
   const unsubscribe = listenToUserGroups(username, callback);
   ```
   - **DECENTRALIZED DATABASE INTEGRATION**: Real-time group updates

---

## 📊 State Management Integration Points

### File: `store/authStore.ts`

#### Web3.0 State:
- `walletAddress`: Stores connected wallet address
- `isWeb3Authenticated`: Web3.0 authentication status
- `web3Provider`: Web3.0 provider instance
- `signer`: Web3.0 signer for transactions

### File: `store/chatStore.ts`

#### Decentralized Database State:
- `groups`: Groups loaded from Gun.js
- `messages`: Messages synchronized via Gun.js
- Real-time updates trigger store updates

---

## 🔍 How to Find Integration Points in Code

All integration points are marked with clear comments:

### Decentralized Database Integration:
```typescript
// DECENTRALIZED DATABASE INTEGRATION: [Description]
// or
// DECENTRALIZED DATABASE INTEGRATION POINT: [Description]
```

### Web3.0 Integration:
```typescript
// WEB3.0 INTEGRATION: [Description]
// or
// WEB3.0 INTEGRATION POINT: [Description]
```

### Search Commands:
- Search for "DECENTRALIZED DATABASE INTEGRATION" to find all database points
- Search for "WEB3.0 INTEGRATION" to find all blockchain points
- Search for "TODO" to find unimplemented features

---

## 🚧 TODO Items (Not Yet Implemented)

### Web3.0:
- [ ] WalletConnect integration
- [ ] Phantom Wallet (Solana) integration
- [ ] Smart contract interaction for group management
- [ ] Smart contract interaction for rewards
- [ ] Smart contract interaction for permissions

### Decentralized Database:
- [ ] Message encryption using SEA
- [ ] Group permission system
- [ ] Member invitation system
- [ ] Message rate limiting

### IPFS/Storage:
- [ ] File upload to IPFS
- [ ] File download from IPFS
- [ ] File encryption (AES-256)
- [ ] File decryption
- [ ] Blockchain file hash storage

---

## 📝 Notes

1. **Web3.0 is currently optional** for testing but can be made required by uncommenting checks in `components/auth/LoginPage.tsx`

2. **Gun.js peers** are using public test servers - replace with your own for production in `lib/gun.ts`

3. **Smart contract addresses and ABIs** need to be configured when contracts are deployed

4. All integration points follow the same pattern:
   - Web3.0 operations in `lib/web3.ts`
   - Database operations in `lib/gun.ts`
   - Storage operations in `lib/ipfs.ts`
   - Components use these libraries through hooks and utilities
