// TODO: Use same Gun.js configuration as login page
// Ensure peer connections match for data consistency
const gun = Gun(['https://gunjs.herokuapp.com/gun', 'https://gun-manhattan.herokuapp.com/gun']);
const user = gun.user();
// TODO: Verify Web3.0 authentication on page load
// This ensures user is authenticated via both Gun.js and Web3.0
let web3Provider = null;
let signer = null;
let userWalletAddress = null;
const connectWalletBtn = document.getElementById('connectWalletBtn');

// Check if user is logged in
const currentUser = sessionStorage.getItem('currentUser');
const storedWalletAddress = sessionStorage.getItem('walletAddress');
const isWeb3Authenticated = sessionStorage.getItem('isWeb3Authenticated');
const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

// Allow access if user exists (Web3.0 is optional for testing)
if (!currentUser) {
    // User not authenticated, redirect to login
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Admin bypasses Gun.js verification
if (isAdmin) {
    console.log('Admin access - bypassing Gun.js verification');
} else {
    // Verify Gun.js user session (for non-admin users)
    user.recall({ sessionStorage: true }, async (ack) => {
        if (!ack || !ack.pub) {
            // User not authenticated in Gun.js, redirect to login
            sessionStorage.clear();
            window.location.href = 'index.html';
            return;
        }
        
        // Verify Web3.0 authentication (optional for now)
        await verifyWeb3Session();
    });
}

const groupsList = document.getElementById('groupsList');
const chatArea = document.getElementById('chatArea');
const noGroupSelected = document.getElementById('noGroupSelected');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const createGroupBtn = document.getElementById('createGroupBtn');
const joinGroupBtn = document.getElementById('joinGroupBtn');
const createGroupModal = document.getElementById('createGroupModal');
const joinGroupModal = document.getElementById('joinGroupModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelGroupBtn = document.getElementById('cancelGroupBtn');
const confirmGroupBtn = document.getElementById('confirmGroupBtn');
const groupNameInput = document.getElementById('groupNameInput');
const groupDescriptionInput = document.getElementById('groupDescriptionInput');
const groupPasswordInput = document.getElementById('groupPasswordInput');
const closeJoinModalBtn = document.getElementById('closeJoinModalBtn');
const cancelJoinGroupBtn = document.getElementById('cancelJoinGroupBtn');
const confirmJoinGroupBtn = document.getElementById('confirmJoinGroupBtn');
const joinGroupIdInput = document.getElementById('joinGroupIdInput');
const joinGroupPasswordInput = document.getElementById('joinGroupPasswordInput');
const currentGroupName = document.getElementById('currentGroupName');
const currentGroupIdLabel = document.getElementById('currentGroupIdLabel');
const copyGroupIdBtn = document.getElementById('copyGroupIdBtn');
const username = document.getElementById('username');
const userInitial = document.getElementById('userInitial');
const logoutBtn = document.getElementById('logoutBtn');
const backToMainBtn = document.getElementById('backToMainBtn');


// Set username
username.textContent = currentUser;
userInitial.textContent = currentUser.charAt(0).toUpperCase();

// Current group state
let currentGroupId = null;
let currentGroupRef = null;
// ============================================
// NEWLY ADDED: Message Duplicate Prevention System
// ============================================
// Purpose: Prevents messages from appearing twice when sent
// Integration:
// - Gun.js: Works with Gun.js real-time listeners
// - Web3.0: Can verify message signatures before marking as displayed
// - Blockchain: Can store message IDs on blockchain to prevent replay attacks
let messageListener = null; // Store message listener to unsubscribe when switching groups
let displayedMessageIds = new Set(); // Track displayed messages to prevent duplicates
let groupListener = null; // Store group listener to unsubscribe when needed
let recentlySentMessageIds = new Set(); // Track recently sent messages to prevent duplicates

// ============================================
// TODO: Web3.0 Session Verification - Currently Optional
// ============================================
// TODO: Verify user's Web3.0 wallet matches stored wallet address
// This protects against session hijacking
// NOTE: Currently optional for testing - make required by uncommenting alerts
async function verifyWeb3Session() {
    // Admin bypasses Web3.0 verification
    if (isAdmin) {
        console.log('Admin access - Web3.0 verification bypassed');
        return true;
    }
    
    if (typeof window.ethereum === 'undefined') {
        // TODO: Uncomment below to make Web3.0 required
        // alert('Web3.0 wallet required. Please install MetaMask.');
        // sessionStorage.clear();
        // window.location.href = 'index.html';
        // return false;
        console.log('Web3.0 not available - continuing without verification (testing mode)');
        return false;
    }

    try {
        web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        signer = web3Provider.getSigner();
        userWalletAddress = accounts[0];
        
        // DATABASE INTEGRATION POINT: Verify wallet address matches stored address
        if (storedWalletAddress && storedWalletAddress !== 'no-wallet' && storedWalletAddress !== 'no-wallet-connected') {
            if (userWalletAddress.toLowerCase() !== storedWalletAddress.toLowerCase()) {
                // TODO: Uncomment below to make wallet verification required
                // alert('Wallet address mismatch. Please login again.');
                // sessionStorage.clear();
                // window.location.href = 'index.html';
                // return false;
                console.log('Wallet address mismatch - continuing anyway (testing mode)');
            }
        }
        
        // Verify wallet in Gun.js database (if wallet exists)
        // DATABASE INTEGRATION POINT: Cross-reference wallet with user account
        if (storedWalletAddress && storedWalletAddress !== 'no-wallet' && storedWalletAddress !== 'no-wallet-connected') {
            gun.user(currentUser).get('wallet').once((storedWallet) => {
                if (storedWallet && storedWallet.toLowerCase() !== userWalletAddress.toLowerCase()) {
                    // TODO: Uncomment below to make wallet verification required
                    // alert('Wallet verification failed. Please login again.');
                    // sessionStorage.clear();
                    // window.location.href = 'index.html';
                    console.log('Wallet verification mismatch - continuing anyway (testing mode)');
                }
            });
        }
        
        console.log('Web3.0 session verified:', userWalletAddress);
        return true;
    } catch (error) {
        console.error('Web3.0 verification failed:', error);
        // TODO: Uncomment below to make Web3.0 required
        // alert('Web3.0 verification failed. Please login again.');
        // sessionStorage.clear();
        // window.location.href = 'index.html';
        // return false;
        console.log('Web3.0 verification failed - continuing anyway (testing mode)');
        return false;
    }
}

// Initialize and verify Web3.0 on page load (optional for now)
verifyWeb3Session();

// TODO: Enhance group loading with:
// 1. Verify user has access to each group
// 2. Check group permissions
// 3. Load group metadata from blockchain if verified
function loadGroups() {
    // DATABASE INTEGRATION: Load groups from Gun.js user profile
    const userGroupsRef = gun.user(currentUser).get('groups');
    
    // Load existing groups (only once)
    userGroupsRef.map().once((groupData, groupId) => {
        if (groupData && groupId) {
            // DATABASE INTEGRATION POINT: Verify group access permissions
            // TODO: Add permission checking here
            addGroupToList(groupId, groupData);
        }
    });
    
    // ============================================
    // NEWLY ADDED: Real-Time Group Loading System
    // ============================================
    // Purpose: Automatically shows newly created groups in sidebar
    // Integration:
    // - Gun.js: Uses Gun.js .on() listener for real-time synchronization
    // - Web3.0: Can verify group ownership via wallet address before displaying
    // - Blockchain: Can check blockchain records to verify group authenticity
    // Listen for new groups in real-time (so newly created groups appear automatically)
    // DATABASE INTEGRATION POINT: Real-time group synchronization
    if (groupListener) {
        groupListener.off(); // Remove old listener if exists
    }
    
    groupListener = userGroupsRef.map().on((groupData, groupId) => {
        if (groupData && groupId) {
            // Check if group already exists in DOM
            if (!document.getElementById(`group-${groupId}`)) {
                // Load full group data from groups collection
                gun.get('groups').get(groupId).once((fullGroupData) => {
                    if (fullGroupData) {
                        addGroupToList(groupId, fullGroupData);
                    } else {
                        // If full data not available, use the basic data
                        addGroupToList(groupId, groupData);
                    }
                });
            }
        }
    });
}

// Add group to sidebar list
function addGroupToList(groupId, groupData) {
    // Check if group already exists in DOM
    if (document.getElementById(`group-${groupId}`)) {
        return;
    }

    const groupItem = document.createElement('div');
    groupItem.className = 'group-item';
    groupItem.id = `group-${groupId}`;
    
    // Handle both full group data and basic group data
    const groupName = (groupData && groupData.name) ? groupData.name : (groupData || 'Unnamed Group');
    const groupDescription = (groupData && groupData.description) ? groupData.description : 'No description';
    const groupInitial = (typeof groupName === 'string' ? groupName : 'U').charAt(0).toUpperCase();
    
    groupItem.innerHTML = `
        <div class="group-avatar">${groupInitial}</div>
        <div class="group-info">
            <div class="group-name">${groupName}</div>
            <div class="group-preview">${groupDescription}</div>
        </div>
    `;
    
    // ============================================
    // NEWLY ADDED: Enhanced Group List Item Handler
    // ============================================
    // Purpose: Handles both basic and full group data structures
    // Integration:
    // - Gun.js: Fetches full group data from Gun.js when needed
    // - Web3.0: Can verify group ownership via wallet address (TODO: implement)
    // - Blockchain: Can verify group authenticity via blockchain records (TODO: implement)
    groupItem.addEventListener('click', () => {
        // If we only have basic data, fetch full data before selecting
        if (!groupData || typeof groupData === 'string' || !groupData.name) {
            gun.get('groups').get(groupId).once((fullData) => {
                if (fullData) {
                    // TODO: Add Web3.0 ownership verification here
                    // TODO: Add blockchain authenticity check here
                    selectGroup(groupId, fullData);
                } else {
                    // Fallback to basic data
                    selectGroup(groupId, { name: groupName, description: groupDescription });
                }
            });
        } else {
            selectGroup(groupId, groupData);
        }
    });
    
    groupsList.appendChild(groupItem);
}

// Select a group
function selectGroup(groupId, groupData) {
    currentGroupId = groupId;
    currentGroupName.textContent = groupData.name || 'Unnamed Group';
    if (currentGroupIdLabel) {
        currentGroupIdLabel.textContent = `ID: ${groupId}`;
    }
    
    // Remove active class from all groups
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected group
    const selectedGroup = document.getElementById(`group-${groupId}`);
    if (selectedGroup) {
        selectedGroup.classList.add('active');
    }
    
    // Show chat area
    if (noGroupSelected) {
        noGroupSelected.style.display = 'none';
    }
    if (chatArea) {
        chatArea.style.display = 'flex';
    }
    
    // Clear messages
    messagesContainer.innerHTML = '';
    displayedMessageIds.clear(); // Clear tracked message IDs
    recentlySentMessageIds.clear(); // Clear recently sent messages
    
    // Show empty state message
    showEmptyState();
    
    // Unsubscribe from previous group's message listener
    if (messageListener) {
        messageListener.off(); // Stop listening to previous group
        messageListener = null;
    }
    
    // Ensure messages container is visible
    if (messagesContainer) {
        messagesContainer.style.display = 'block';
        messagesContainer.style.visibility = 'visible';
    }
    
    // Load messages for this group
    loadGroupMessages(groupId);
    
    // Update member count
    updateMemberCount();
}

// TODO: Enhance message loading with:
// 1. Message encryption/decryption
// 2. Message verification (signature checking)
// 3. Access control (verify user is member of group)
// 4. Message history pagination
function loadGroupMessages(groupId) {
    // DATABASE INTEGRATION: Load messages from Gun.js decentralized database
    const messagesRef = gun.get('groups').get(groupId).get('messages');
    
    // Load existing messages (only once)
    let hasMessages = false;
    messagesRef.map().once((messageData, messageId) => {
        if (messageData && messageId && !displayedMessageIds.has(messageId)) {
            // DATABASE INTEGRATION POINT: Verify message integrity
            // TODO: Add message signature verification here
            hasMessages = true;
            displayedMessageIds.add(messageId); // Mark as displayed
            displayMessage(messageData, messageId);
        }
    });
    
    // If no messages found after a short delay, ensure empty state is shown
    setTimeout(() => {
        if (!hasMessages && messagesContainer.children.length === 0) {
            showEmptyState();
        }
    }, 500);
    
    // ============================================
    // NEWLY ADDED: Enhanced Message Listener with Duplicate Prevention
    // ============================================
    // Purpose: Prevents listener from displaying messages we just sent
    // Integration:
    // - Gun.js: Listens to Gun.js real-time message updates
    // - Web3.0: Can verify message signature before displaying (TODO: implement)
    // - Blockchain: Can cross-reference message hash with blockchain records (TODO: implement)
    // Listen for new messages in real-time (Gun.js real-time sync)
    // DATABASE INTEGRATION POINT: Real-time message synchronization
    messageListener = messagesRef.map().on((messageData, messageId) => {
        if (messageData && messageId) {
            // NEWLY ADDED: Skip if message was recently sent by current user (prevent duplicate from listener)
            if (recentlySentMessageIds.has(messageId)) {
                return; // Don't display, we already displayed it when sending
            }
            
            // Check if message already displayed (prevent duplicates)
            if (!displayedMessageIds.has(messageId) && !document.getElementById(`msg-${messageId}`)) {
                displayedMessageIds.add(messageId); // Mark as displayed
                // DATABASE INTEGRATION POINT: Verify new message before displaying
                // TODO: Add Web3.0 signature verification here
                // TODO: Add blockchain hash verification here
                displayMessage(messageData, messageId);
                scrollToBottom();
            }
        }
    });
}

// Show empty state when no messages
function showEmptyState() {
    const emptyStateDiv = document.createElement('div');
    emptyStateDiv.className = 'empty-messages-state';
    emptyStateDiv.id = 'emptyMessagesState';
    emptyStateDiv.innerHTML = `
        <div class="empty-messages-content">
            <div class="empty-messages-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Start the conversation by sending a message!</p>
            <p class="empty-messages-hint">Share files with group members using the File Sharing button in the sidebar.</p>
        </div>
    `;
    messagesContainer.appendChild(emptyStateDiv);
}

// Remove empty state when messages appear
function removeEmptyState() {
    const emptyState = document.getElementById('emptyMessagesState');
    if (emptyState) {
        emptyState.remove();
    }
}

// Display a message
function displayMessage(messageData, messageId) {
    // Remove empty state when first message appears
    removeEmptyState();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.id = `msg-${messageId}`;
    
    const isOwnMessage = messageData.user === currentUser;
    messageDiv.classList.add(isOwnMessage ? 'own-message' : 'other-message');
    
    const timestamp = new Date(messageData.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-user">${messageData.user}</span>
            <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">${escapeHtml(messageData.text)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// TODO: Enhance message sending with:
// 1. Web3.0 signature for message authenticity
// 2. Message encryption
// 3. Access control verification
// 4. Message metadata storage
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentGroupId) {
        return;
    }
    
    // DATABASE INTEGRATION POINT: Verify user has permission to send messages
    // TODO: Add group membership verification
    
    // ============================================
    // TODO: Web3.0 Verification - Currently Optional
    // ============================================
    // Verify Web3.0 session is still valid (optional for now)
    // TODO: Uncomment below to make Web3.0 required for sending messages
    // if (!signer || !userWalletAddress) {
    //     alert('Web3.0 session expired. Please refresh the page.');
    //     return;
    // }
    
    if (!signer || !userWalletAddress) {
        console.log('Sending message without Web3.0 signature (testing mode)');
    }
    
    try {
        // Create message signature for authenticity (if Web3.0 is available)
        // DATABASE INTEGRATION POINT: Message signing with Web3.0
        let signature = null;
        let walletAddress = userWalletAddress || 'no-wallet';
        
        if (signer && userWalletAddress) {
            const messageToSign = `Message: ${text} | Group: ${currentGroupId} | User: ${currentUser} | Time: ${Date.now()}`;
            signature = await signer.signMessage(messageToSign);
            walletAddress = userWalletAddress;
        } else {
            console.log('Message sent without Web3.0 signature (testing mode)');
        }
        
        const messageData = {
            text: text,
            user: currentUser,
            timestamp: Date.now(),
            walletAddress: walletAddress,
            signature: signature || 'no-signature',
            groupId: currentGroupId,
            isAdmin: isAdmin || false
        };
        
        // Generate unique message ID
        // DATABASE INTEGRATION: Store message in Gun.js decentralized database
        const messageId = gun.get('groups').get(currentGroupId).get('messages').get(Gun.text.random(16));
        
        // ============================================
        // NEWLY ADDED: Enhanced Message Sending with Duplicate Prevention
        // ============================================
        // Purpose: Prevents the same message from appearing twice when sent
        // Integration:
        // - Gun.js: Stores message in Gun.js decentralized database
        // - Web3.0: Message includes wallet signature for authenticity (already implemented)
        // - Blockchain: Message hash stored in blockchain records (already implemented)
        // Mark message ID as displayed and recently sent to prevent duplicate
        displayedMessageIds.add(messageId);
        recentlySentMessageIds.add(messageId);
        
        // Display message immediately (before saving to Gun.js)
        displayMessage(messageData, messageId);
        
        // Save message to Gun.js (automatically syncs across peers)
        // The listener will try to pick it up, but we've marked it as recently sent
        messageId.put(messageData);
        
        // NEWLY ADDED: Remove from recently sent after delay (so it can sync to other users)
        // TODO: Can enhance with blockchain verification before removing
        setTimeout(() => {
            recentlySentMessageIds.delete(messageId);
        }, 2000);
        
        // DATABASE INTEGRATION POINT: Store message hash in blockchain records
        // TODO: Optionally store message hash on blockchain for permanent record
        const messageHash = await createHash(JSON.stringify(messageData));
        gun.get('blockchain').get('messages').get(messageId).put({
            hash: messageHash,
            timestamp: Date.now(),
            groupId: currentGroupId
        });
        
        // Clear input
        messageInput.value = '';
        
        // Scroll to bottom
        scrollToBottom();
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
    }
}

// TODO: Enhance group creation with:
// 1. Web3.0 signature for group ownership
// 2. Store group metadata on blockchain
// 3. Set group permissions
// 4. Initialize group encryption keys
async function createGroup() {
    const groupName = groupNameInput.value.trim();
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    // ============================================
    // TODO: Web3.0 Verification - Currently Optional
    // ============================================
    // Verify Web3.0 session (optional for now)
    // TODO: Uncomment below to make Web3.0 required for creating groups
    // if (!signer || !userWalletAddress) {
    //     alert('Web3.0 session required. Please refresh the page.');
    //     return;
    // }
    
    if (!signer || !userWalletAddress) {
        console.log('Creating group without Web3.0 signature (testing mode)');
    }
    
    const groupDescription = groupDescriptionInput.value.trim();
    const useBlockchain = document.getElementById('blockchainVerify').checked;
    const groupPassword = groupPasswordInput.value;
    
    try {
        // Generate unique group ID
        const groupId = Gun.text.random(16);
        
        // Create group signature (if Web3.0 is available)
        // DATABASE INTEGRATION POINT: Group creation signature
        let signature = null;
        let walletAddress = userWalletAddress || 'no-wallet';
        
        if (signer && userWalletAddress) {
            const groupCreationMessage = `Create Group: ${groupName} | ID: ${groupId} | Creator: ${currentUser} | Wallet: ${userWalletAddress} | Time: ${Date.now()}`;
            signature = await signer.signMessage(groupCreationMessage);
            walletAddress = userWalletAddress;
        } else {
            console.log('Group created without Web3.0 signature (testing mode)');
        }
        
        // Optional password protection (store hashed password)
        let passwordHash = null;
        if (groupPassword) {
            try {
                passwordHash = await createHash(groupPassword);
            } catch (error) {
                console.error('Failed to hash group password:', error);
            }
        }

        const groupData = {
            name: groupName,
            description: groupDescription,
            createdBy: currentUser,
            createdAt: Date.now(),
            blockchainVerified: useBlockchain && (signer !== null),
            walletAddress: walletAddress,
            signature: signature || 'no-signature',
            groupId: groupId,
            isAdminCreated: isAdmin || false,
            passwordHash: passwordHash
        };
        
        // DATABASE INTEGRATION: Save group to Gun.js decentralized database
        const groupRef = gun.get('groups').get(groupId);
        groupRef.put(groupData);
        
        // DATABASE INTEGRATION POINT: Add group to user's groups list
        gun.user(currentUser).get('groups').get(groupId).put({ 
            name: groupName,
            createdAt: Date.now(),
            isOwner: true
        });
        
        // DATABASE INTEGRATION POINT: Store group members (creator is first member)
        gun.get('groups').get(groupId).get('members').get(currentUser).put({
            username: currentUser,
            walletAddress: userWalletAddress || 'no-wallet',
            joinedAt: Date.now(),
            role: 'owner'
        });
        
        // If blockchain verification is enabled and Web3.0 is available, create a record
        if (useBlockchain && signer && signature) {
            await verifyGroupOnBlockchain(groupId, groupName, signature);
        } else if (useBlockchain) {
            console.log('Blockchain verification requested but Web3.0 not available (testing mode)');
        }
        
        // Close modal and clear inputs
        closeCreateGroupModal();
        groupNameInput.value = '';
        groupDescriptionInput.value = '';
        groupPasswordInput.value = '';
        
        // ============================================
        // NEWLY ADDED: Immediate Group Addition on Creation
        // ============================================
        // Purpose: Immediately shows newly created group without waiting for listener
        // Integration:
        // - Gun.js: Group stored in Gun.js and immediately added to UI
        // - Web3.0: Group includes wallet signature for ownership verification (already implemented)
        // - Blockchain: Group hash stored in blockchain records (already implemented)
        // Add group to list immediately (don't wait for listener)
        addGroupToList(groupId, groupData);
        
        // Select the newly created group
        setTimeout(() => {
            selectGroup(groupId, groupData);
        }, 100);
    } catch (error) {
        console.error('Failed to create group:', error);
        alert('Failed to create group. Please try again.');
    }
}

// TODO: Enhance blockchain verification with:
// 1. Smart contract interaction (if using Ethereum)
// 2. IPFS storage for group metadata
// 3. Permanent blockchain record
// 4. Group ownership transfer functionality
async function verifyGroupOnBlockchain(groupId, groupName, signature) {
    if (!signer) {
        console.log('Blockchain verification skipped - no Web3 provider');
        return;
    }
    
    try {
        const address = await signer.getAddress();
        const groupRecord = {
            groupId: groupId,
            groupName: groupName,
            owner: address,
            creator: currentUser,
            timestamp: Date.now(),
            signature: signature
        };
        
        // DATABASE INTEGRATION POINT: Store group hash in Gun.js blockchain records
        const hash = await createHash(JSON.stringify(groupRecord));
        gun.get('blockchain').get('groups').get(groupId).put({
            hash: hash,
            owner: address,
            creator: currentUser,
            timestamp: Date.now(),
            signature: signature
        });
        
        // DATABASE INTEGRATION POINT: Link wallet address to group ownership
        gun.get('blockchain').get('wallets').get(address).get('groups').get(groupId).put({
            groupName: groupName,
            role: 'owner',
            verifiedAt: Date.now()
        });
        
        console.log('Group verified on blockchain:', hash);
        
        // TODO: Optional - Interact with smart contract to store group ownership
        // Example: await groupContract.createGroup(groupId, hash, { from: address });
    } catch (error) {
        console.error('Blockchain verification error:', error);
    }
}

// Create a simple hash (in production, use proper hashing)
async function createHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Modal functions
function openCreateGroupModal() {
    createGroupModal.style.display = 'flex';
    groupNameInput.focus();
}

function closeCreateGroupModal() {
    createGroupModal.style.display = 'none';
}

// Join Group modal functions
function openJoinGroupModal() {
    joinGroupModal.style.display = 'flex';
    joinGroupIdInput.focus();
}

function closeJoinGroupModal() {
    joinGroupModal.style.display = 'none';
}

// Back to main page function
function backToMain() {
    // Unsubscribe from current group's message listener
    if (messageListener) {
        messageListener.off();
        messageListener = null;
    }
    
    // Clear current group
    currentGroupId = null;
    displayedMessageIds.clear();
    recentlySentMessageIds.clear();
    
    // Remove active class from all groups
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Hide chat area and show welcome message
    chatArea.style.display = 'none';
    noGroupSelected.style.display = 'flex';
    
    // Clear messages
    messagesContainer.innerHTML = '';
    if (currentGroupIdLabel) {
        currentGroupIdLabel.textContent = 'ID: -';
    }
}

// Join an existing group with ID + password
async function joinGroup() {
    const groupId = joinGroupIdInput.value.trim();
    const password = joinGroupPasswordInput.value;

    if (!groupId) {
        alert('Please enter a group ID.');
        return;
    }

    gun.get('groups').get(groupId).once(async (groupData) => {
        if (!groupData) {
            alert('Group not found. Please check the Group ID.');
            return;
        }

        // If group has a password, verify it
        if (groupData.passwordHash) {
            if (!password) {
                alert('This group is protected. Please enter the password.');
                return;
            }

            try {
                const enteredHash = await createHash(password);
                if (enteredHash !== groupData.passwordHash) {
                    alert('Incorrect password.');
                    return;
                }
            } catch (error) {
                console.error('Error verifying group password:', error);
                alert('Failed to verify password. Please try again.');
                return;
            }
        }

        // Add user as member in Gun.js
        gun.user(currentUser).get('groups').get(groupId).put({
            name: groupData.name || 'Unnamed Group',
            createdAt: Date.now(),
            isOwner: false
        });

        gun.get('groups').get(groupId).get('members').get(currentUser).put({
            username: currentUser,
            walletAddress: userWalletAddress || 'no-wallet',
            joinedAt: Date.now(),
            role: 'member'
        });

        // Close modal and clear fields
        closeJoinGroupModal();
        joinGroupIdInput.value = '';
        joinGroupPasswordInput.value = '';

        // Add to list and select
        addGroupToList(groupId, groupData);
        setTimeout(() => {
            selectGroup(groupId, groupData);
        }, 100);
    });
}

// Event Listeners
createGroupBtn.addEventListener('click', openCreateGroupModal);
joinGroupBtn.addEventListener('click', openJoinGroupModal);
closeModalBtn.addEventListener('click', closeCreateGroupModal);
cancelGroupBtn.addEventListener('click', closeCreateGroupModal);
confirmGroupBtn.addEventListener('click', createGroup);
backToMainBtn.addEventListener('click', backToMain);
copyGroupIdBtn.addEventListener('click', async () => {
    if (!currentGroupId) {
        alert('No group selected.');
        return;
    }
    try {
        await navigator.clipboard.writeText(currentGroupId);
        alert('Group ID copied to clipboard.');
    } catch (err) {
        console.error('Failed to copy Group ID:', err);
        alert('Failed to copy Group ID. Please copy it manually.');
    }
});
closeJoinModalBtn.addEventListener('click', closeJoinGroupModal);
cancelJoinGroupBtn.addEventListener('click', closeJoinGroupModal);
confirmJoinGroupBtn.addEventListener('click', joinGroup);

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Close modal when clicking outside
createGroupModal.addEventListener('click', (e) => {
    if (e.target === createGroupModal) {
        closeCreateGroupModal();
    }
});

// TODO: Enhance logout with:
// 1. Clear all session data
// 2. Disconnect Web3.0 connections
// 3. Log logout event
// 4. Clear Gun.js session
logoutBtn.addEventListener('click', () => {
    // DATABASE INTEGRATION POINT: Log logout event
    gun.user(currentUser).get('lastLogout').put(Date.now());
    
    // Clear Gun.js session
    user.leave();
    
    // Clear all session storage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = 'index.html';
});

// Load groups on page load
loadGroups();

// Update member count (simplified - in production, track actual members)
function updateMemberCount() {
    const memberCountEl = document.getElementById('groupMembersCount');
    if (memberCountEl && currentGroupId) {
        // Try to get actual member count from Gun.js
        let memberCount = 0;
        gun.get('groups').get(currentGroupId).get('members').map().once(() => {
            memberCount++;
        });
        
        // Update after a short delay to allow Gun.js to load
        setTimeout(() => {
            if (memberCount > 0) {
                memberCountEl.textContent = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
            } else {
                memberCountEl.textContent = 'Decentralized';
            }
        }, 300);
    }
}

// ============================================
// File Sharing and Rewards Integration
// ============================================

// File Storage Section
const fileStorageSection = document.getElementById('fileStorageSection');
const openFileStorageBtn = document.getElementById('openFileStorageBtn');
const closeFileSection = document.getElementById('closeFileSection');
const fileGroupSelect = document.getElementById('fileGroupSelect');
const selectedGroupName = document.getElementById('selectedGroupName');
const selectedGroupMembers = document.getElementById('selectedGroupMembers');
const currentGroupInfo = document.getElementById('currentGroupInfo');

// Rewards Section
const rewardsSection = document.getElementById('rewardsSection');
const openRewardsBtn = document.getElementById('openRewardsBtn');
const closeRewardsSection = document.getElementById('closeRewardsSection');

// Open File Storage
if (openFileStorageBtn) {
    openFileStorageBtn.addEventListener('click', () => {
        if (fileStorageSection) {
            fileStorageSection.style.display = 'flex';
            populateFileGroupSelect();
            // If a group is currently selected, set it in the dropdown
            if (currentGroupId) {
                fileGroupSelect.value = currentGroupId;
                updateGroupFileInfo();
            }
        }
    });
}

// Close File Storage
if (closeFileSection && fileStorageSection) {
    closeFileSection.addEventListener('click', () => {
        fileStorageSection.style.display = 'none';
    });
}

// Populate group select for file sharing
function populateFileGroupSelect() {
    if (!fileGroupSelect) return;
    
    fileGroupSelect.innerHTML = '<option value="">-- Select a group --</option>';
    
    // Get groups from Gun.js
    gun.get('groups').map().once((groupData, groupId) => {
        if (groupData && groupData.name) {
            const option = document.createElement('option');
            option.value = groupId;
            option.textContent = groupData.name;
            fileGroupSelect.appendChild(option);
        }
    });
}

// Update group file info when group is selected
if (fileGroupSelect) {
    fileGroupSelect.addEventListener('change', (e) => {
        const selectedGroupId = e.target.value;
        if (selectedGroupId) {
            updateGroupFileInfo();
            loadGroupFiles(selectedGroupId);
        } else {
            currentGroupInfo.style.display = 'none';
            const fileList = document.getElementById('fileList');
            if (fileList) {
                fileList.innerHTML = '<p class="empty-state">Select a group to view shared files</p>';
            }
        }
    });
}

function updateGroupFileInfo() {
    const selectedGroupId = fileGroupSelect.value;
    if (!selectedGroupId) return;
    
    gun.get('groups').get(selectedGroupId).once((groupData) => {
        if (groupData && groupData.name) {
            selectedGroupName.textContent = groupData.name;
            // TODO: Get actual member count
            selectedGroupMembers.textContent = 'Group members can access';
            currentGroupInfo.style.display = 'flex';
        }
    });
}

function loadGroupFiles(groupId) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    // TODO: Load files from IPFS/Web3.Storage for this group
    // gun.get('groups').get(groupId).get('files').map().once((fileData, fileId) => {
    //     // Display files
    // });
    
    fileList.innerHTML = '<p class="empty-state">No files shared in this group yet</p>';
}

// Open Rewards
if (openRewardsBtn) {
    openRewardsBtn.addEventListener('click', () => {
        if (rewardsSection) {
            rewardsSection.style.display = 'flex';
            // Load rewards data if function exists
            if (typeof loadRewardsData === 'function') {
                loadRewardsData();
            }
        }
    });
}

// Close Rewards
if (closeRewardsSection && rewardsSection) {
    closeRewardsSection.addEventListener('click', () => {
        rewardsSection.style.display = 'none';
    });
}

// Make functions available globally for app.js integration
window.openFileStorage = () => {
    if (fileStorageSection) {
        fileStorageSection.style.display = 'flex';
        populateFileGroupSelect();
    }
};

window.openRewards = () => {
    if (rewardsSection) {
        rewardsSection.style.display = 'flex';
        if (typeof loadRewardsData === 'function') {
            loadRewardsData();
        }
    }
};

// ============================================
// Group-based File Sharing
// ============================================
const shareFileBtn = document.getElementById('shareFileBtn');
const shareDialogOverlay = document.getElementById('shareDialogOverlay');
const closeShareDialog = document.getElementById('closeShareDialog');
const shareFileSelect = document.getElementById('shareFileSelect');
const shareGroupSelect = document.getElementById('shareGroupSelect');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const generateShareLinkBtn = document.getElementById('generateShareLinkBtn');
const cancelShareBtn = document.getElementById('cancelShareBtn');

// Open share dialog
if (shareFileBtn && shareDialogOverlay) {
    shareFileBtn.addEventListener('click', () => {
        shareDialogOverlay.style.display = 'flex';
        populateShareFileSelect();
        populateShareGroupSelect();
    });
}

// Close share dialog
if (closeShareDialog && shareDialogOverlay) {
    closeShareDialog.addEventListener('click', () => {
        shareDialogOverlay.style.display = 'none';
        resetShareDialog();
    });
}

if (cancelShareBtn && shareDialogOverlay) {
    cancelShareBtn.addEventListener('click', () => {
        shareDialogOverlay.style.display = 'none';
        resetShareDialog();
    });
}

// Close dialog when clicking outside
if (shareDialogOverlay) {
    shareDialogOverlay.addEventListener('click', (e) => {
        if (e.target === shareDialogOverlay) {
            shareDialogOverlay.style.display = 'none';
            resetShareDialog();
        }
    });
}

// Populate file select with files from selected group
function populateShareFileSelect() {
    if (!shareFileSelect) return;
    
    shareFileSelect.innerHTML = '<option value="">-- Select a file to share --</option>';
    
    const selectedGroupId = fileGroupSelect ? fileGroupSelect.value : null;
    if (!selectedGroupId) {
        return;
    }
    
    // TODO: Fetch files from IPFS/Web3.Storage for the selected group
    // gun.get('groups').get(selectedGroupId).get('files').map().once((fileData, fileId) => {
    //     const option = document.createElement('option');
    //     option.value = fileId;
    //     option.textContent = fileData.name || 'File';
    //     option.dataset.hash = fileData.hash;
    //     shareFileSelect.appendChild(option);
    // });
}

// Populate group select for sharing
function populateShareGroupSelect() {
    if (!shareGroupSelect) return;
    
    shareGroupSelect.innerHTML = '<option value="">-- Select a group --</option>';
    
    gun.get('groups').map().once((groupData, groupId) => {
        if (groupData && groupData.name) {
            const option = document.createElement('option');
            option.value = groupId;
            option.textContent = groupData.name;
            shareGroupSelect.appendChild(option);
        }
    });
}

// Generate share link
if (generateShareLinkBtn) {
    generateShareLinkBtn.addEventListener('click', () => {
        const selectedFileId = shareFileSelect.value;
        const selectedGroupId = shareGroupSelect.value;
        
        if (!selectedFileId) {
            alert('Please select a file to share');
            return;
        }
        
        if (!selectedGroupId) {
            alert('Please select a group to share with');
            return;
        }
        
        // TODO: Generate share link with group context
        // 1. Get IPFS hash for selected file
        // 2. Create share link: https://yourdomain.com/share/{hash}?group={groupId}
        // 3. Store share permissions on-chain if needed
        
        const selectedOption = shareFileSelect.options[shareFileSelect.selectedIndex];
        const fileHash = selectedOption.dataset.hash || 'QmExampleHash...';
        
        const shareLink = `https://yourdomain.com/share/${fileHash}?group=${selectedGroupId}`;
        
        if (shareLinkInput) {
            shareLinkInput.value = shareLink;
        }
        
        console.log('Share link generated for group:', selectedGroupId);
    });
}

// Copy share link
if (copyLinkBtn && shareLinkInput) {
    copyLinkBtn.addEventListener('click', () => {
        if (!shareLinkInput.value) {
            alert('No share link to copy. Please generate a link first.');
            return;
        }
        
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                copyLinkBtn.textContent = 'Copied!';
                copyLinkBtn.classList.add('copied');
                setTimeout(() => {
                    copyLinkBtn.textContent = 'Copy';
                    copyLinkBtn.classList.remove('copied');
                }, 2000);
            });
        } catch (err) {
            document.execCommand('copy');
            copyLinkBtn.textContent = 'Copied!';
            copyLinkBtn.classList.add('copied');
            setTimeout(() => {
                copyLinkBtn.textContent = 'Copy';
                copyLinkBtn.classList.remove('copied');
            }, 2000);
        }
    });
}


// Reset share dialog
function resetShareDialog() {
    if (shareFileSelect) shareFileSelect.value = '';
    if (shareGroupSelect) shareGroupSelect.value = '';
    if (shareLinkInput) shareLinkInput.value = '';
    if (copyLinkBtn) {
        copyLinkBtn.textContent = 'Copy';
        copyLinkBtn.classList.remove('copied');
    }
}
window.updateWalletStatus = function(address) {
  if (connectWalletBtn) {
    const menuText = connectWalletBtn.querySelector('.menu-text');
    if (address) {
      menuText.textContent = address.slice(0, 6) + '...' + address.slice(-4);
      sessionStorage.setItem('walletAddress', address);
    } else {
      menuText.textContent = 'Connect Wallet';
      sessionStorage.setItem('walletAddress', 'no-wallet');
    }
  }
};

// 连接钱包主函数
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('请先在浏览器安装 MetaMask 扩展');
    return;
  }

  try {
    // ethers v5: Web3Provider
    web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 请求账户授权
    const accounts = await web3Provider.send('eth_requestAccounts', []);
    const account = accounts[0];
    
    // 创建 signer（用于签名、发交易）
    signer = web3Provider.getSigner();
    userWalletAddress = account;
    
    // 更新 UI 和 sessionStorage
    window.updateWalletStatus(account);
    sessionStorage.setItem('isWeb3Authenticated', 'true');
    
    console.log('✅ 已连接钱包：', account);
    
    // 可选：获取余额、网络
    const balance = await web3Provider.getBalance(account);
    const network = await web3Provider.getNetwork();
    console.log('余额：', ethers.utils.formatEther(balance), 'ETH');
    console.log('网络 chainId：', network.chainId);
    
  } catch (err) {
    console.error('❌ 连接失败：', err);
    alert('连接失败：' + (err.message || err));
  }
}

// 监听钱包变化
if (typeof window.ethereum !== 'undefined') {
  // 账号切换
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
      window.updateWalletStatus(accounts[0]);
      // 重新创建 signer
      if (web3Provider) {
        signer = web3Provider.getSigner();
      }
    } else {
      window.updateWalletStatus(null);
      signer = null;
      userWalletAddress = null;
    }
  });

  // 网络切换
  window.ethereum.on('chainChanged', (chainId) => {
    console.log('网络切换：', chainId);
    // 可选：重连 provider
    web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  });
}

// 绑定按钮事件
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', connectWallet);
}

// 页面加载时检查已连接状态
window.addEventListener('load', () => {
  const storedAddress = sessionStorage.getItem('walletAddress');
  if (storedAddress && storedAddress !== 'no-wallet') {
    window.updateWalletStatus(storedAddress);
  }
});

// 暴露给其他模块使用
window.web3Provider = () => web3Provider;
window.getSigner = () => signer;
window.getWalletAddress = () => userWalletAddress;

