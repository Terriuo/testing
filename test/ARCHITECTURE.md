# SDCP Platform Architecture Documentation

## Overview

The Study Decentralized Collaboration Platform (SDCP) is built using **Next.js** and **React** to deliver a responsive, performant, and scalable single-page application. The platform leverages modern web technologies, decentralized databases, and Web3.0 blockchain integration to provide a secure, censorship-resistant collaboration environment.

## Technology Stack

### Frontend Framework
- **Next.js 14**: Server-side rendering for faster initial page loads and enhanced SEO
- **React 18**: Component-based structure supporting modular development and state management
- **TypeScript**: Type-safe development

### State Management
- **Zustand**: Lightweight state management library for user authentication and chat state

### UI Libraries
- **Material-UI (MUI)**: Modern, responsive UI components
- **Emotion**: CSS-in-JS styling solution

### API Integration
- **Axios**: HTTP client for API requests (when needed for external services)

### Decentralized Technologies
- **Gun.js**: Decentralized, peer-to-peer database for real-time messaging and data storage
- **SEA (Security, Encryption, Authorization)**: Client-side encryption for Gun.js data
- **Ethers.js**: Web3.0 library for blockchain interactions
- **IPFS/Web3.Storage**: Decentralized file storage (to be implemented)

### Blockchain Integration
- **Ethereum-compatible networks**: Goerli, Sepolia, Mumbai testnets
- **Smart Contracts**: Solidity contracts for group management, rewards, and permissions
- **OpenZeppelin**: Secure contract standards and libraries

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages      │  │  Components   │  │    Hooks     │    │
│  │  (App Router)│  │   (React)     │  │  (Custom)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                            │                                │
│                   ┌─────────▼─────────┐                     │
│                   │   Zustand Store   │                     │
│                   │  (State Management)│                     │
│                   └─────────┬─────────┘                     │
│                              │                                │
│         ┌────────────────────┼────────────────────┐          │
│         │                    │                    │          │
│  ┌──────▼──────┐    ┌────────▼────────┐  ┌───────▼──────┐  │
│  │  Gun.js     │    │   Web3.0 Lib   │  │   IPFS Lib   │  │
│  │  (Database) │    │  (Blockchain)   │  │  (Storage)   │  │
│  └──────┬──────┘    └────────┬────────┘  └───────┬──────┘  │
│         │                    │                    │          │
└─────────┼────────────────────┼────────────────────┼──────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Gun.js Peers   │  │  Ethereum       │  │  IPFS Network   │
│  (P2P Network)  │  │  (Blockchain)   │  │  (Storage)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Key Integration Points

### 🔐 Authentication Integration

**Location**: `components/auth/LoginPage.tsx`, `lib/web3.ts`, `lib/gun.ts`

#### Web3.0 Integration Points:
1. **Wallet Connection** (`lib/web3.ts:initWeb3Provider`)
   - Connects to MetaMask, WalletConnect, or Phantom Wallet
   - Retrieves wallet address and signer
   - **TODO**: Add support for WalletConnect and Phantom Wallet

2. **Digital Signature** (`lib/web3.ts:createSignature`)
   - Creates digital signatures for identity verification
   - Proves user controls the wallet address
   - Used during login and registration

3. **Signature Verification** (`lib/web3.ts:verifySignature`)
   - Verifies message signatures to ensure authenticity
   - Prevents replay attacks

#### Decentralized Database Integration Points:
1. **User Authentication** (`lib/gun.ts:authenticateUser`)
   - Authenticates user with Gun.js decentralized database
   - No central server required

2. **User Registration** (`lib/gun.ts:createUser`)
   - Creates new user account in Gun.js
   - Stores user profile data

3. **Wallet Address Storage** (`lib/gun.ts:storeUserData`)
   - Links Gun.js account with Web3.0 wallet address
   - Stores wallet address in user profile: `gun.user(username).get('wallet').put(walletAddress)`

4. **Blockchain Record Storage** (`lib/gun.ts:storeBlockchainRecord`)
   - Stores user registration records in blockchain collection
   - Links wallet address to username

---

### 💬 Messaging Integration

**Location**: `components/chat/ChatInterface.tsx`, `hooks/useChat.ts`, `lib/gun.ts`

#### Decentralized Database Integration Points:
1. **Real-time Message Sync** (`lib/gun.ts:listenToMessages`)
   - Sets up Gun.js real-time listener for messages
   - Automatically syncs messages across all peers
   - Works offline with automatic conflict resolution

2. **Message Storage** (`hooks/useChat.ts:sendMessage`)
   - Stores messages in Gun.js: `gun.get('groups').get(groupId).get('messages').get(messageId).put(messageData)`
   - Messages are encrypted client-side using SEA before synchronization

3. **Message Encryption** (To be implemented)
   - **TODO**: Implement SEA encryption for messages
   - Only intended recipients can decrypt content

#### Web3.0 Integration Points:
1. **Message Signatures** (`hooks/useChat.ts:sendMessage`)
   - Each message includes a Web3.0 signature
   - Proves message authenticity and prevents tampering
   - Signature stored with message: `messageData.signature`

2. **Blockchain Message Records** (`hooks/useChat.ts:sendMessage`)
   - Message hash stored in blockchain records: `gun.get('blockchain').get('messages').get(messageId).put({hash, ...})`
   - Creates permanent, tamper-proof audit trail

---

### 👥 Group Management Integration

**Location**: `components/chat/ChatInterface.tsx`, `hooks/useChat.ts`, `lib/gun.ts`

#### Decentralized Database Integration Points:
1. **Group Storage** (`lib/gun.ts:storeGroup`)
   - Groups stored in Gun.js: `gun.get('groups').get(groupId).put(groupData)`
   - Real-time synchronization across peers

2. **Group Membership** (`hooks/useChat.ts:createGroup`, `joinGroup`)
   - Members stored in: `gun.get('groups').get(groupId).get('members').get(username).put({...})`
   - User's groups list: `gun.user(username).get('groups').get(groupId).put({...})`

3. **Real-time Group Updates** (`lib/gun.ts:listenToUserGroups`)
   - Real-time listener for user's groups
   - Newly created/joined groups appear automatically

#### Web3.0 Integration Points:
1. **Group Ownership Verification** (`hooks/useChat.ts:createGroup`)
   - Group creation includes wallet signature
   - Proves group creator controls the wallet address
   - Signature stored: `groupData.signature`

2. **Blockchain Group Records** (`hooks/useChat.ts:createGroup`)
   - Group hash stored in blockchain records: `gun.get('blockchain').get('groups').get(groupId).put({hash, owner, ...})`
   - Links wallet address to group ownership: `gun.get('blockchain').get('wallets').get(address).get('groups').get(groupId).put({...})`

3. **Smart Contract Integration** (To be implemented)
   - **TODO**: Interact with Solidity smart contracts for:
     - Group membership management
     - Permission enforcement
     - On-chain logging

---

### 📁 File Sharing Integration

**Location**: `lib/ipfs.ts`

#### Decentralized Storage Integration Points:
1. **IPFS Upload** (`lib/ipfs.ts:uploadFileToIPFS`)
   - **TODO**: Implement file upload to IPFS/Web3.Storage
   - Files encrypted client-side (AES-256) before upload
   - Returns content hash (CID)

2. **IPFS Download** (`lib/ipfs.ts:downloadFileFromIPFS`)
   - **TODO**: Implement file download from IPFS
   - Decrypts files using encryption key

3. **File Encryption** (`lib/ipfs.ts:encryptFile`)
   - **TODO**: Implement AES-256 encryption
   - Ensures files remain unreadable if intercepted

#### Web3.0 Integration Points:
1. **Blockchain File Records** (`lib/ipfs.ts:storeFileHashOnChain`)
   - **TODO**: Store file hash on-chain via smart contract
   - Creates permanent reference to IPFS content
   - Only content hash stored on-chain, not the file itself

---

## File Structure

```
UIUX/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Login/signup page
│   ├── chat/
│   │   └── page.tsx             # Chat interface page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ThemeProvider.tsx        # MUI theme provider
│   ├── auth/
│   │   └── LoginPage.tsx        # Login/signup component
│   └── chat/
│       └── ChatInterface.tsx    # Main chat interface
│
├── store/                        # Zustand state management
│   ├── authStore.ts             # Authentication state
│   └── chatStore.ts             # Chat state
│
├── lib/                          # Core libraries
│   ├── gun.ts                   # 🔗 Gun.js database integration
│   ├── web3.ts                  # 🔗 Web3.0 blockchain integration
│   └── ipfs.ts                  # 🔗 IPFS storage integration
│
├── hooks/                        # Custom React hooks
│   └── useChat.ts               # Chat operations with DB integration
│
├── package.json                  # Dependencies
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── ARCHITECTURE.md              # This file
```

---

## Data Flow

### Authentication Flow
```
User → LoginPage Component
  ↓
1. Connect Web3.0 Wallet (lib/web3.ts)
  ↓
2. Create Digital Signature (lib/web3.ts)
  ↓
3. Authenticate with Gun.js (lib/gun.ts)
  ↓
4. Store Wallet Address in User Profile (lib/gun.ts)
  ↓
5. Store Blockchain Record (lib/gun.ts)
  ↓
6. Update Auth Store (store/authStore.ts)
  ↓
Redirect to Chat Page
```

### Message Sending Flow
```
User Types Message → ChatInterface Component
  ↓
1. Create Message Signature (lib/web3.ts)
  ↓
2. Store Message in Gun.js (lib/gun.ts)
  ↓
3. Store Message Hash in Blockchain Records (lib/gun.ts)
  ↓
4. Real-time Sync to All Peers (Gun.js)
  ↓
5. Update Chat Store (store/chatStore.ts)
  ↓
Message Appears in All Connected Clients
```

### Group Creation Flow
```
User Creates Group → ChatInterface Component
  ↓
1. Create Group Signature (lib/web3.ts)
  ↓
2. Store Group in Gun.js (lib/gun.ts)
  ↓
3. Add Group to User's Groups List (lib/gun.ts)
  ↓
4. Store Group Members (lib/gun.ts)
  ↓
5. Store Blockchain Record (lib/gun.ts)
  ↓
6. Update Chat Store (store/chatStore.ts)
  ↓
Group Appears in Sidebar (Real-time Sync)
```

---

## Security Features

### ✅ Implemented
- Web3.0 wallet-based authentication
- Digital signature verification
- Gun.js decentralized storage
- Real-time message synchronization
- Blockchain record storage (via Gun.js)

### ⚠️ To Be Implemented
- **Message Encryption**: SEA encryption for messages
- **File Encryption**: AES-256 encryption for files
- **IPFS Integration**: File upload/download
- **Smart Contract Integration**: On-chain group management
- **Permission System**: Role-based access control
- **Rate Limiting**: Prevent spam and abuse

---

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or other Web3.0 wallet (for testing)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
npm start
```

---

## Integration Points Summary

### 🔗 Decentralized Database (Gun.js)
- **File**: `lib/gun.ts`
- **Purpose**: Peer-to-peer database for real-time data synchronization
- **Key Functions**:
  - User authentication and registration
  - Message storage and real-time sync
  - Group management
  - Blockchain record storage

### 🔗 Web3.0 Blockchain Integration
- **File**: `lib/web3.ts`
- **Purpose**: Wallet connection and blockchain interactions
- **Key Functions**:
  - Wallet connection (MetaMask, WalletConnect, Phantom)
  - Digital signature creation and verification
  - Smart contract interaction (to be implemented)

### 🔗 IPFS/Web3.Storage
- **File**: `lib/ipfs.ts`
- **Purpose**: Decentralized file storage
- **Key Functions**:
  - File upload with encryption
  - File download and decryption
  - Blockchain hash storage

---

## Next Steps

1. **Implement Message Encryption**: Use SEA for client-side message encryption
2. **Implement File Storage**: Complete IPFS/Web3.Storage integration
3. **Smart Contract Integration**: Deploy and integrate Solidity contracts
4. **Permission System**: Implement role-based access control
5. **Testing**: Comprehensive testing with multiple users
6. **Production Deployment**: Configure production Gun.js peers and blockchain networks

---

## Notes

- All integration points are clearly marked with comments: `WEB3.0 INTEGRATION POINT` and `DECENTRALIZED DATABASE INTEGRATION POINT`
- Web3.0 is currently optional for testing but can be made required
- Gun.js peers are using public test servers - replace with your own for production
- Smart contract addresses and ABIs need to be configured when contracts are deployed
