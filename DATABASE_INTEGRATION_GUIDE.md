# Database Integration Guide

## Overview
This document highlights all database integration points that need to be connected to Gun.js (decentralized database) and Web3.0/blockchain technology.

## 🔐 Security Features Implemented
- **Web3.0 Authentication**: All login, registration, and chat operations require Web3.0 wallet (MetaMask)
- **Gun.js Decentralized Storage**: All data stored in peer-to-peer decentralized database
- **Blockchain Verification**: Optional blockchain verification for groups and messages
- **Signature Verification**: Messages and groups are signed with Web3.0 wallet signatures

---

## 📍 Database Integration Points

### **app.js (Login/Registration Page)**

#### **Integration Point #1: Gun.js Configuration**
**Location**: Line ~2-4
```javascript
const gun = Gun(['https://gunjs.herokuapp.com/gun', 'https://gun-manhattan.herokuapp.com/gun']);
```
**TODO**: 
- Replace with your own Gun.js peer servers
- Add more peers for redundancy
- Configure for production environment

#### **Integration Point #2: Web3.0 Provider Setup**
**Location**: Line ~10-30
**Function**: `initWeb3Auth()`
**TODO**: 
- Ensure MetaMask or Web3 provider is available
- Handle different Web3 providers
- Add fallback mechanisms

#### **Integration Point #3: Login with Web3.0 + Gun.js Protection**
**Location**: Line ~40-80
**Function**: `handleLogin(username, password)`
**Database Operations**:
- ✅ Gun.js user authentication
- ✅ Store wallet address in user profile: `gun.user(username).get('wallet').put(walletAddress)`
- ✅ Store last login timestamp: `gun.user(username).get('lastLogin').put(Date.now())`
- ✅ Create and store signature: `gun.user(username).get('lastSignature').put(signature)`
**TODO**:
- Add signature verification on server side
- Implement session timeout
- Add login attempt tracking

#### **Integration Point #4: Registration with Web3.0 + Gun.js Protection**
**Location**: Line ~90-140
**Function**: `handleSignup(username, password, confirmPassword)`
**Database Operations**:
- ✅ Create Gun.js user account
- ✅ Store wallet address: `gun.user(username).get('wallet').put(walletAddress)`
- ✅ Store creation timestamp: `gun.user(username).get('createdAt').put(Date.now())`
- ✅ Store registration signature: `gun.user(username).get('registrationSignature').put(signature)`
- ✅ Store in blockchain records: `gun.get('blockchain').get('users').get(walletAddress).put({...})`
**TODO**:
- Add username validation (uniqueness check)
- Implement email verification (optional)
- Add password strength requirements

#### **Integration Point #5: Form Event Handlers**
**Location**: Line ~150-170
**Status**: ✅ Complete - No changes needed

### **chat.js (Chat Page)**

#### **Integration Point #6: Gun.js Configuration (Chat Page)**
**Location**: Line ~2-4
**TODO**: Ensure same peer configuration as login page

#### **Integration Point #7: Web3.0 Authentication Check**
**Location**: Line ~10-30
**Function**: `verifyWeb3Session()`
**Database Operations**:
- ✅ Verify Gun.js user session
- ✅ Verify Web3.0 wallet address matches stored address
- ✅ Cross-reference wallet with user account
**TODO**:
- Add session refresh mechanism
- Implement automatic re-authentication
- Add session expiry handling

#### **Integration Point #8: Web3.0 Session Verification**
**Location**: Line ~50-80
**Function**: `verifyWeb3Session()`
**Status**: ✅ Complete - Verifies wallet on page load

#### **Integration Point #9: Load User Groups**
**Location**: Line ~90-110
**Function**: `loadGroups()`
**Database Operations**:
- ✅ Load groups from: `gun.user(currentUser).get('groups')`
**TODO**:
- Add group permission checking
- Implement group access control
- Load group metadata from blockchain if verified

#### **Integration Point #10: Load Group Messages**
**Location**: Line ~140-170
**Function**: `loadGroupMessages(groupId)`
**Database Operations**:
- ✅ Load messages from: `gun.get('groups').get(groupId).get('messages')`
- ✅ Real-time message synchronization
**TODO**:
- Add message encryption/decryption
- Implement message signature verification
- Add access control (verify user is member)
- Implement message history pagination

#### **Integration Point #11: Send Message (Protected)**
**Location**: Line ~200-250
**Function**: `sendMessage()`
**Database Operations**:
- ✅ Store message: `gun.get('groups').get(groupId).get('messages').get(messageId).put(messageData)`
- ✅ Store message hash: `gun.get('blockchain').get('messages').get(messageId).put({hash, ...})`
- ✅ Create Web3.0 signature for message
**TODO**:
- Add message encryption before storing
- Implement message verification on receive
- Add rate limiting
- Store message metadata

#### **Integration Point #12: Create Group (Protected)**
**Location**: Line ~260-330
**Function**: `createGroup()`
**Database Operations**:
- ✅ Store group: `gun.get('groups').get(groupId).put(groupData)`
- ✅ Add to user's groups: `gun.user(currentUser).get('groups').get(groupId).put({...})`
- ✅ Store group members: `gun.get('groups').get(groupId).get('members').get(currentUser).put({...})`
**TODO**:
- Add group encryption keys initialization
- Implement group permission system
- Add member invitation system
- Store group settings

#### **Integration Point #13: Blockchain Group Verification**
**Location**: Line ~340-380
**Function**: `verifyGroupOnBlockchain(groupId, groupName, signature)`
**Database Operations**:
- ✅ Store group hash: `gun.get('blockchain').get('groups').get(groupId).put({...})`
- ✅ Link wallet to group: `gun.get('blockchain').get('wallets').get(address).get('groups').get(groupId).put({...})`
**TODO**:
- Interact with smart contract (if using Ethereum)
- Store group metadata on IPFS
- Implement group ownership transfer
- Add group verification status

#### **Integration Point #14: Logout (Clean Session)**
**Location**: Line ~450-460
**Function**: Logout button handler
**Database Operations**:
- ✅ Log logout event: `gun.user(currentUser).get('lastLogout').put(Date.now())`
- ✅ Clear Gun.js session: `user.leave()`
**Status**: ✅ Complete

---

## 🔒 Security Implementation Status

### ✅ Implemented
- Web3.0 wallet connection required for login/registration
- Gun.js user authentication
- Wallet address storage and verification
- Message and group signatures
- Session verification on chat page
- Blockchain record storage (via Gun.js)

### ⚠️ TODO / Needs Enhancement
- Message encryption/decryption
- Smart contract integration (optional)
- IPFS storage for large files
- Group permission system
- Member invitation system
- Message rate limiting
- Session timeout handling
- Password strength requirements
- Username uniqueness validation

---

## 📝 Data Structure Reference

### User Profile (Gun.js)
```
gun.user(username)
  ├── wallet (wallet address)
  ├── lastLogin (timestamp)
  ├── lastLogout (timestamp)
  ├── createdAt (timestamp)
  ├── isWeb3Verified (boolean)
  ├── lastSignature (signature string)
  ├── registrationSignature (signature string)
  └── groups
      └── [groupId]
          ├── name (string)
          └── createdAt (timestamp)
```

### Group Data (Gun.js)
```
gun.get('groups').get(groupId)
  ├── name (string)
  ├── description (string)
  ├── createdBy (username)
  ├── createdAt (timestamp)
  ├── blockchainVerified (boolean)
  ├── walletAddress (address)
  ├── signature (signature string)
  ├── messages
  │   └── [messageId]
  │       ├── text (string)
  │       ├── user (username)
  │       ├── timestamp (number)
  │       ├── walletAddress (address)
  │       ├── signature (signature string)
  │       └── groupId (string)
  └── members
      └── [username]
          ├── username (string)
          ├── walletAddress (address)
          ├── joinedAt (timestamp)
          └── role (string: 'owner' | 'member')
```

### Blockchain Records (Gun.js)
```
gun.get('blockchain')
  ├── users
  │   └── [walletAddress]
  │       ├── username (string)
  │       ├── registeredAt (timestamp)
  │       └── signature (signature string)
  ├── groups
  │   └── [groupId]
  │       ├── hash (string)
  │       ├── owner (address)
  │       ├── creator (username)
  │       ├── timestamp (number)
  │       └── signature (signature string)
  ├── messages
  │   └── [messageId]
  │       ├── hash (string)
  │       ├── timestamp (number)
  │       └── groupId (string)
  └── wallets
      └── [walletAddress]
          └── groups
              └── [groupId]
                  ├── groupName (string)
                  ├── role (string)
                  └── verifiedAt (timestamp)
```

---

## 🚀 Next Steps for Your Team

1. **Review all Integration Points** marked with `DATABASE INTEGRATION POINT` comments
2. **Test Web3.0 Authentication** - Ensure MetaMask integration works
3. **Configure Gun.js Peers** - Set up your own peer servers
4. **Implement TODO Items** - Enhance security and features as needed
5. **Add Message Encryption** - For enhanced privacy
6. **Smart Contract Integration** - If using Ethereum blockchain
7. **Testing** - Test all database operations with multiple users

