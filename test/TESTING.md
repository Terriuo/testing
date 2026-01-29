# Testing Guide

This guide will help you test the SDCP platform locally.

## Prerequisites

1. **Node.js 18+** installed
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **npm or yarn** package manager
   - Check: `npm --version` or `yarn --version`

3. **Web Browser** (Chrome, Firefox, Edge, or Brave recommended)

4. **MetaMask Extension** (Optional - for Web3.0 testing)
   - Install: https://metamask.io/

---

## Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Material-UI components
- Zustand state management
- Gun.js decentralized database
- Ethers.js for Web3.0

**Expected output**: Dependencies installed successfully

---

## Step 2: Start Development Server

Run the development server:

```bash
npm run dev
```

**Expected output**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

---

## Step 3: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the **Login/Sign Up** page.

---

## Testing Scenarios

### Scenario 1: Test Without Web3.0 (Basic Testing)

**Note**: Web3.0 is currently optional, so you can test without MetaMask.

#### 1.1 Create a New Account

1. Click the **"Sign Up"** tab
2. Enter:
   - Username: `testuser1`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **"Sign Up"**
4. **Expected**: Account created, auto-login, redirect to chat page

#### 1.2 Login

1. If logged out, go to **"Login"** tab
2. Enter:
   - Username: `testuser1`
   - Password: `password123`
3. Click **"Login"**
4. **Expected**: Login successful, redirect to chat page

#### 1.3 Create a Group

1. On the chat page, click **"Create"** button in the sidebar
2. Enter:
   - Group Name: `Study Group 1`
   - Description: `Math study group` (optional)
3. Click **"Create"**
4. **Expected**: Group appears in sidebar, chat area opens

#### 1.4 Send Messages

1. Select a group from the sidebar
2. Type a message in the input field
3. Press **Enter** or click the send button
4. **Expected**: Message appears in the chat area

#### 1.5 Join a Group

1. Create a group (note the Group ID if shown)
2. Open a new browser window/tab (or use incognito mode)
3. Create another account: `testuser2`
4. Click **"Join"** button
5. Enter the Group ID from step 1
6. Click **"Join"**
7. **Expected**: Group appears in sidebar, can see messages

---

### Scenario 2: Test With Web3.0 (MetaMask)

#### 2.1 Setup MetaMask

1. Install MetaMask browser extension
2. Create a new wallet or import existing
3. Switch to a test network (Goerli, Sepolia, or Mumbai)
4. Get some test ETH (from faucets)

#### 2.2 Connect Wallet During Signup

1. Go to **"Sign Up"** tab
2. Enter username and password
3. Click **"Sign Up"**
4. **Expected**: MetaMask popup appears asking to connect
5. Click **"Connect"** in MetaMask
6. **Expected**: Account created with wallet address linked

#### 2.3 Verify Wallet Connection

1. After login, check browser console (F12)
2. Look for: `Web3.0 connected: 0x...`
3. **Expected**: Wallet address logged

#### 2.4 Test Signed Messages

1. Create a group (should be blockchain verified)
2. Send a message
3. **Expected**: Message includes signature (check console logs)

---

## Testing Checklist

### Authentication
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] Can logout
- [ ] Session persists on page refresh
- [ ] Redirects to login if not authenticated

### Groups
- [ ] Can create a new group
- [ ] Group appears in sidebar
- [ ] Can join existing group with Group ID
- [ ] Groups persist after refresh
- [ ] Can see group name and description

### Messaging
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Messages persist after refresh
- [ ] Can see message sender and timestamp
- [ ] Messages sync across multiple users

### Web3.0 (Optional)
- [ ] MetaMask connection works
- [ ] Wallet address stored in profile
- [ ] Messages include signatures
- [ ] Groups are blockchain verified

---

## Testing with Multiple Users

To test real-time features:

1. **Open multiple browser windows/tabs**
   - Window 1: User `testuser1`
   - Window 2: User `testuser2`
   - Window 3: User `testuser3` (optional)

2. **Create a group** in Window 1

3. **Join the group** in Window 2 using the Group ID

4. **Send messages** from both windows

5. **Expected**: Messages appear in real-time in both windows

---

## Common Issues & Troubleshooting

### Issue: `npm install` fails

**Solution**:
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Port 3000 already in use

**Solution**:
- Stop other applications using port 3000
- Or change port: `npm run dev -- -p 3001`

### Issue: Gun.js connection errors

**Solution**:
- This is normal - Gun.js uses public test servers
- Messages will still work, but may be slower
- For production, configure your own Gun.js peers

### Issue: Web3.0 not connecting

**Solution**:
- Ensure MetaMask is installed and unlocked
- Check browser console for errors
- Web3.0 is optional - app works without it

### Issue: Messages not appearing

**Solution**:
- Check browser console for errors
- Ensure you're in the same group
- Refresh the page
- Check Gun.js peer connection in console

### Issue: TypeScript errors

**Solution**:
- Run: `npm install` to ensure all types are installed
- Check `tsconfig.json` is correct
- Restart the dev server

---

## Browser Console Commands

Open browser console (F12) to debug:

```javascript
// Check if Gun.js is connected
console.log(window.gun);

// Check auth state (in browser console)
// Note: This requires accessing the store directly

// Check Web3.0 connection
console.log(window.ethereum);
```

---

## Testing Production Build

To test the production build:

```bash
# Build the application
npm run build

# Start production server
npm start
```

Then open `http://localhost:3000`

---

## Next Steps

After basic testing:

1. **Test with multiple devices** on the same network
2. **Test offline functionality** (Gun.js supports offline)
3. **Test with different browsers**
4. **Test Web3.0 features** with MetaMask
5. **Test error handling** (invalid credentials, network errors)

---

## Need Help?

- Check browser console for errors
- Review `ARCHITECTURE.md` for system overview
- Review `INTEGRATION_POINTS.md` for integration details
- Check Gun.js documentation: https://gun.eco/
- Check Next.js documentation: https://nextjs.org/docs
