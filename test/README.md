# SDCP - Decentralized Study Collaboration Platform

A decentralized platform for study groups, collaboration, and rewards built with Next.js, React, and Web3.0 technologies.

## 🚀 Features

- **Decentralized Authentication**: Wallet-based authentication via MetaMask, WalletConnect, and Phantom
- **Real-time Messaging**: Peer-to-peer messaging using Gun.js decentralized database
- **Group Management**: Create and join study groups with blockchain verification
- **File Sharing**: IPFS-based file storage with client-side encryption (to be implemented)
- **Gamification**: ERC-20 token rewards for contributions (to be implemented)
- **Smart Contracts**: Ethereum-compatible smart contracts for group management and rewards

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Material-UI (MUI)
- **State Management**: Zustand
- **Database**: Gun.js (decentralized, peer-to-peer)
- **Blockchain**: Ethers.js, Ethereum-compatible networks
- **Storage**: IPFS/Web3.Storage (to be implemented)
- **Encryption**: SEA (Security, Encryption, Authorization)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or other Web3.0 wallet browser extension
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd UIUX
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
UIUX/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── store/                  # Zustand state management
├── lib/                    # Core libraries (Gun.js, Web3.0, IPFS)
├── hooks/                  # Custom React hooks
└── ARCHITECTURE.md         # Detailed architecture documentation
```

## 🔗 Integration Points

### Decentralized Database (Gun.js)
All database operations are handled through `lib/gun.ts`. Key integration points:
- User authentication and registration
- Real-time message synchronization
- Group management
- Blockchain record storage

### Web3.0 Blockchain Integration
Web3.0 operations are handled through `lib/web3.ts`. Key integration points:
- Wallet connection (MetaMask, WalletConnect, Phantom)
- Digital signature creation and verification
- Smart contract interaction (to be implemented)

### IPFS/Web3.Storage
File storage operations are handled through `lib/ipfs.ts`. Key integration points:
- File upload with encryption (to be implemented)
- File download and decryption (to be implemented)
- Blockchain hash storage (to be implemented)

## 🔐 Security

- **Wallet-based Authentication**: No passwords, users control their identity
- **Digital Signatures**: All messages and groups are signed for authenticity
- **Client-side Encryption**: Messages encrypted before storage (to be implemented)
- **Decentralized Storage**: No central point of failure
- **Blockchain Verification**: Permanent, tamper-proof records

## 📝 Development Notes

- Web3.0 is currently optional for testing but can be made required
- Gun.js peers are using public test servers - replace with your own for production
- All integration points are clearly marked in code comments
- See `ARCHITECTURE.md` for detailed architecture documentation

## 🚧 TODO

- [ ] Implement message encryption using SEA
- [ ] Complete IPFS/Web3.Storage integration
- [ ] Deploy and integrate Solidity smart contracts
- [ ] Implement role-based access control
- [ ] Add file sharing functionality
- [ ] Implement ERC-20 token rewards
- [ ] Add comprehensive testing
- [ ] Configure production Gun.js peers

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

## 📧 Contact

[Your Contact Information Here]
