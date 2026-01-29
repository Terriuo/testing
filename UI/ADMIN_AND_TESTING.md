# Admin Account & Testing Guide

## 🔐 Admin Account

For testing purposes, an admin account has been created:

**Username:** `admin`  
**Password:** `admin123`

### Admin Features:
- ✅ Can login without Web3.0 wallet
- ✅ Bypasses Gun.js verification
- ✅ Can create groups and send messages
- ✅ Full access to all features

### Security Note:
⚠️ **IMPORTANT:** Remove or secure the admin account before production deployment!

The admin credentials are defined in `app.js`:
```javascript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
```

---

## 🌐 Web3.0 Status: Currently Optional

Web3.0 wallet integration is **currently optional** to allow testing without MetaMask. All Web3.0 code is still present and functional, but it won't block authentication if a wallet is not available.

### What Changed:

1. **Login/Registration:**
   - ✅ Works without MetaMask
   - ✅ Web3.0 code still runs if wallet is available
   - ✅ All Web3.0 features work when wallet is connected

2. **Chat Page:**
   - ✅ Works without Web3.0 verification
   - ✅ Messages can be sent without signatures
   - ✅ Groups can be created without blockchain verification

### To Make Web3.0 Required Again:

Search for these comments in the code:
- `// TODO: Uncomment below to make Web3.0 required`
- `// TODO: Uncomment below to make Web3.0 required for sending messages`
- `// TODO: Uncomment below to make Web3.0 required for creating groups`

Uncomment the code blocks marked with these TODOs to restore Web3.0 requirements.

### Locations to Update:

**app.js:**
- Line ~23-24: `initWeb3Auth()` function
- Line ~78-80: Login Web3.0 requirement
- Line ~140-142: Registration Web3.0 requirement

**chat.js:**
- Line ~64-68: Web3.0 session verification
- Line ~78-80: Wallet address verification
- Line ~260-262: Message sending Web3.0 check
- Line ~350-352: Group creation Web3.0 check

---

## 🧪 Testing Without Web3.0

You can now test the application without installing MetaMask:

1. **Login as Admin:**
   - Username: `admin`
   - Password: `admin123`
   - No MetaMask needed

2. **Create Regular Account:**
   - Sign up with any username/password
   - No MetaMask needed
   - All features work

3. **Test Features:**
   - ✅ Create groups
   - ✅ Send messages
   - ✅ View chat history
   - ✅ All Gun.js features work

---

## 📝 For Your Team Mates

All Web3.0 integration points are clearly marked with:
- `// TODO: Web3.0 Integration - Currently Optional`
- `// TODO: Uncomment below to make Web3.0 required`

Search for "TODO: Web3.0" to find all locations that need to be updated when making Web3.0 required.

The Web3.0 code is fully functional - it just doesn't block access when a wallet is not available. This allows testing while keeping all the integration code visible for your team.

---

## 🔄 Next Steps

1. **Test with Admin Account** - Verify all features work
2. **Test with Regular Account** - Create a new account and test
3. **Test with Web3.0** - Install MetaMask and test with wallet connected
4. **Review Integration Points** - Check all marked locations
5. **Make Web3.0 Required** - When ready, uncomment the TODO sections
