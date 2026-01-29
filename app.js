// TODO: Configure Gun.js peer connections
// Current peers are public test servers - replace with your own for production
const gun = Gun(['https://gunjs.herokuapp.com/gun', 'https://gun-manhattan.herokuapp.com/gun']);
const user = gun.user();
// TODO: Initialize Web3.0 provider for blockchain authentication
// This should be called before any authentication attempts
let web3Provider = null;
let signer = null;
let userWalletAddress = null;

// ============================================
// TODO: Web3.0 Integration - Currently Optional (for testing)
// ============================================
// NOTE: Web3.0 is currently optional to allow testing without MetaMask
// To make it required again, change return false to block authentication
// Initialize Web3.0 connection (OPTIONAL for now - will be REQUIRED later)
async function initWeb3Auth() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await web3Provider.send("eth_requestAccounts", []);
            signer = web3Provider.getSigner();
            userWalletAddress = accounts[0];
            console.log('Web3.0 connected:', userWalletAddress);
            return true;
        } catch (error) {
            console.error('Web3.0 connection failed:', error);
            // TODO: Uncomment below to make Web3.0 required
            // showMessage('Web3.0 wallet required for authentication. Please install MetaMask.', 'error');
            // return false;
            console.log('Web3.0 optional - continuing without wallet');
            return false; // Return false but don't block (for testing)
        }
    } else {
        // TODO: Uncomment below to make Web3.0 required
        // showMessage('Web3.0 wallet required. Please install MetaMask or another Web3 provider.', 'error');
        // return false;
        console.log('Web3.0 not available - continuing without wallet (for testing)');
        return false; // Return false but don't block (for testing)
    }
}

// ============================================
// Admin Account Configuration
// ============================================
// Admin credentials for testing
// TODO: Remove or secure this in production
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_WALLET = '0x0000000000000000000000000000000000000000'; // Placeholder

// Check if user is admin
function isAdminAccount(username, password) {
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const messageDiv = document.getElementById('message');

//login and signup forms
loginToggle.addEventListener('click', () => {
    loginToggle.classList.add('active');
    signupToggle.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    clearMessage();
});

signupToggle.addEventListener('click', () => {
    signupToggle.classList.add('active');
    loginToggle.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    clearMessage();
});

//message helper
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(clearMessage, 5000);
}

function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}
// TODO: Enhance this function with:
// 1. Web3.0 wallet signature verification
// 2. Store wallet address in Gun.js user profile
// 3. Verify user identity on blockchain
// 4. Link Gun.js account with Web3.0 wallet address
async function handleLogin(username, password) {
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // ============================================
    // ADMIN ACCOUNT CHECK (for testing)
    // ============================================
    if (isAdminAccount(username, password)) {
        console.log('Admin login detected');
        showMessage('Admin login successful!', 'success');
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('walletAddress', ADMIN_WALLET);
        sessionStorage.setItem('isWeb3Authenticated', 'false'); // Admin bypasses Web3.0
        
        // Store admin login in Gun.js
        gun.user(username).get('lastLogin').put(Date.now());
        gun.user(username).get('isAdmin').put(true);
        
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 1000);
        return;
    }

    // ============================================
    // TODO: Web3.0 Integration - Currently Optional
    // ============================================
    // STEP 1: Try to connect Web3.0 wallet (optional for now)
    // TODO: Make this required by uncommenting the return statement below
    const web3Connected = await initWeb3Auth();
    // TODO: Uncomment below to make Web3.0 required:
    // if (!web3Connected) {
    //     return; // User needs Web3.0 wallet
    // }

    // STEP 2: Authenticate with Gun.js (decentralized database)
    user.auth(username, password, async (ack) => {
        if (ack.err) {
            showMessage(ack.err, 'error');
            return;
        }

        // STEP 3: Verify and store Web3.0 wallet address in Gun.js (if available)
        // DATABASE INTEGRATION: Link user account with wallet address
        try {
            let walletAddress = null;
            let signature = null;
            
            // Only get wallet if Web3.0 is connected
            if (web3Connected && signer) {
                walletAddress = await signer.getAddress();
                
                // Store wallet address in user's Gun.js profile
                // DATABASE INTEGRATION POINT: User profile data structure
                gun.user(username).get('wallet').put(walletAddress);
                
                // Create signature for additional security
                // DATABASE INTEGRATION POINT: Signature verification
                const message = `Login: ${username} at ${Date.now()}`;
                signature = await signer.signMessage(message);
                gun.user(username).get('lastSignature').put(signature);
            } else {
                // TODO: Remove this fallback when Web3.0 is required
                console.log('Login without Web3.0 (testing mode)');
                walletAddress = 'no-wallet-connected';
            }
            
            // Store login timestamp
            gun.user(username).get('lastLogin').put(Date.now());
            
            showMessage('Login successful!', 'success');
            
            // Store authentication data
            sessionStorage.setItem('currentUser', username);
            sessionStorage.setItem('walletAddress', walletAddress || 'no-wallet');
            sessionStorage.setItem('isWeb3Authenticated', web3Connected ? 'true' : 'false');
            
            // Redirect to chat page
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        } catch (error) {
            console.error('Login process error:', error);
            // Continue with login even if Web3.0 fails (for testing)
            showMessage('Login successful (Web3.0 optional)', 'success');
            sessionStorage.setItem('currentUser', username);
            sessionStorage.setItem('walletAddress', 'no-wallet');
            sessionStorage.setItem('isWeb3Authenticated', 'false');
            
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        }
    });
}
// TODO: Enhance this function with:
// 1. Web3.0 wallet address verification
// 2. Store wallet address during registration
// 3. Create blockchain identity record
// 4. Link Gun.js account with Web3.0 wallet
async function handleSignup(username, password, confirmPassword) {
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // ============================================
    // TODO: Web3.0 Integration - Currently Optional
    // ============================================
    // STEP 1: Try to connect Web3.0 wallet (optional for now)
    // TODO: Make this required by uncommenting the return statement below
    const web3Connected = await initWeb3Auth();
    // TODO: Uncomment below to make Web3.0 required:
    // if (!web3Connected) {
    //     return; // User needs Web3.0 wallet to register
    // }

    // STEP 2: Get wallet address (if available)
    try {
        let walletAddress = null;
        let signature = null;
        
        if (web3Connected && signer) {
            walletAddress = await signer.getAddress();
        } else {
            // TODO: Remove this fallback when Web3.0 is required
            console.log('Registration without Web3.0 (testing mode)');
            walletAddress = 'no-wallet-connected';
        }
        
        // STEP 3: Create account in Gun.js (decentralized database)
        user.create(username, password, async (ack) => {
            if (ack.err) {
                showMessage(ack.err, 'error');
                return;
            }

            // STEP 4: Store Web3.0 wallet address in user profile (if available)
            // DATABASE INTEGRATION POINT: User registration data structure
            if (walletAddress && walletAddress !== 'no-wallet-connected') {
                gun.user(username).get('wallet').put(walletAddress);
                gun.user(username).get('isWeb3Verified').put(true);
                
                // Create registration signature
                // DATABASE INTEGRATION POINT: Signature storage for verification
                const message = `Register: ${username} with wallet ${walletAddress} at ${Date.now()}`;
                signature = await signer.signMessage(message);
                gun.user(username).get('registrationSignature').put(signature);
                
                // Store in blockchain records (Gun.js)
                // DATABASE INTEGRATION POINT: Blockchain verification records
                gun.get('blockchain').get('users').get(walletAddress).put({
                    username: username,
                    registeredAt: Date.now(),
                    signature: signature
                });
            } else {
                gun.user(username).get('isWeb3Verified').put(false);
            }
            
            gun.user(username).get('createdAt').put(Date.now());

            showMessage('Account created! Logging in...', 'success');
            
            // Auto-login after signup
            setTimeout(async () => {
                user.auth(username, password, async (authAck) => {
                    if (!authAck.err) {
                        sessionStorage.setItem('currentUser', username);
                        sessionStorage.setItem('walletAddress', walletAddress || 'no-wallet');
                        sessionStorage.setItem('isWeb3Authenticated', web3Connected ? 'true' : 'false');
                        window.location.href = 'chat.html';
                    }
                });
            }, 1000);
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Continue with registration even if Web3.0 fails (for testing)
        user.create(username, password, async (ack) => {
            if (ack.err) {
                showMessage(ack.err, 'error');
            } else {
                gun.user(username).get('createdAt').put(Date.now());
                gun.user(username).get('isWeb3Verified').put(false);
                showMessage('Account created (without Web3.0)! Logging in...', 'success');
                
                setTimeout(async () => {
                    user.auth(username, password, async (authAck) => {
                        if (!authAck.err) {
                            sessionStorage.setItem('currentUser', username);
                            sessionStorage.setItem('walletAddress', 'no-wallet');
                            sessionStorage.setItem('isWeb3Authenticated', 'false');
                            window.location.href = 'chat.html';
                        }
                    });
                }, 1000);
            }
        });
    }
}
// These handlers are already connected to database functions above
// No changes needed here unless you want to add additional validation

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    handleLogin(username, password);
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    handleSignup(username, password, confirmPassword);
});

// ============================================
// File Sharing and Storage UI
// ============================================
// TODO: Implement file encryption (AES-256) before upload
// TODO: Implement IPFS/Web3.Storage upload functionality
// TODO: Implement smart contract integration for content hash storage
// TODO: Implement file download and decryption functionality

const fileStorageSection = document.getElementById('fileStorageSection');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const refreshBtn = document.getElementById('refreshBtn');
const closeFileSection = document.getElementById('closeFileSection');
const fileList = document.getElementById('fileList');

// Open file storage section (can be called from other pages after login)
function openFileStorage() {
    if (fileStorageSection) {
        fileStorageSection.style.display = 'flex';
    }
}

// Close file storage section
if (closeFileSection) {
    closeFileSection.addEventListener('click', () => {
        if (fileStorageSection) {
            fileStorageSection.style.display = 'none';
        }
    });
}

// File input click handler
if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
}

if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
}

// File input change handler (placeholder for future implementation)
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Files selected:', files);
            // TODO: Implement file encryption and upload
            // 1. Encrypt files client-side using AES-256
            // 2. Upload encrypted files to IPFS/Web3.Storage
            // 3. Get content hash from IPFS
            // 4. Store content hash on-chain via smart contract
            // 5. Update file list UI
        }
    });
}

// Drag and drop handlers
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('Files dropped:', files);
            // TODO: Implement file encryption and upload
            // Same implementation as file input change handler
        }
    });
}

// Refresh file list (placeholder for future implementation)
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        console.log('Refreshing file list...');
        // TODO: Fetch files from IPFS/Web3.Storage
        // TODO: Retrieve content hashes from smart contract
        // TODO: Update file list UI
    });
}

// ============================================
// File Sharing Functionality
// ============================================
// TODO: Implement share link generation with IPFS hash
// TODO: Implement access control based on selected level
// TODO: Store share permissions on-chain via smart contract

const shareFileBtn = document.getElementById('shareFileBtn');
const shareDialogOverlay = document.getElementById('shareDialogOverlay');
const closeShareDialog = document.getElementById('closeShareDialog');
const shareFileSelect = document.getElementById('shareFileSelect');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const generateShareLinkBtn = document.getElementById('generateShareLinkBtn');
const cancelShareBtn = document.getElementById('cancelShareBtn');
const shareAccessLevel = document.getElementById('shareAccessLevel');

// Open share dialog
if (shareFileBtn && shareDialogOverlay) {
    shareFileBtn.addEventListener('click', () => {
        shareDialogOverlay.style.display = 'flex';
        // TODO: Populate shareFileSelect with available files
        // This should fetch files from IPFS/Web3.Storage and display them
        populateShareFileSelect();
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

// Populate file select dropdown (placeholder)
function populateShareFileSelect() {
    if (!shareFileSelect) return;
    
    // Clear existing options except the first one
    shareFileSelect.innerHTML = '<option value="">-- Select a file to share --</option>';
    
    // TODO: Fetch files from IPFS/Web3.Storage
    // TODO: Retrieve file metadata from smart contract
    // TODO: Populate dropdown with file names and IPFS hashes
    
    // Example structure (to be replaced with actual data):
    // const files = [
    //     { name: 'document.pdf', hash: 'QmHash123...', id: 'file1' },
    //     { name: 'image.jpg', hash: 'QmHash456...', id: 'file2' }
    // ];
    // files.forEach(file => {
    //     const option = document.createElement('option');
    //     option.value = file.id;
    //     option.textContent = file.name;
    //     option.dataset.hash = file.hash;
    //     shareFileSelect.appendChild(option);
    // });
    
    console.log('Populating share file select...');
}

// Generate share link
if (generateShareLinkBtn) {
    generateShareLinkBtn.addEventListener('click', () => {
        const selectedFileId = shareFileSelect.value;
        const accessLevel = shareAccessLevel.value;
        
        if (!selectedFileId) {
            alert('Please select a file to share');
            return;
        }
        
        // TODO: Generate share link
        // 1. Get IPFS hash for selected file
        // 2. Create share link with format: https://yourdomain.com/share/{hash}?access={level}
        // 3. Store share permissions on-chain if needed
        // 4. Display generated link in shareLinkInput
        
        const selectedOption = shareFileSelect.options[shareFileSelect.selectedIndex];
        const fileHash = selectedOption.dataset.hash || 'QmExampleHash...';
        
        // Generate share link (placeholder)
        const shareLink = `https://yourdomain.com/share/${fileHash}?access=${accessLevel}`;
        
        if (shareLinkInput) {
            shareLinkInput.value = shareLink;
        }
        
        console.log('Share link generated:', shareLink);
        console.log('Access level:', accessLevel);
    });
}

// Copy share link to clipboard
if (copyLinkBtn && shareLinkInput) {
    copyLinkBtn.addEventListener('click', () => {
        if (!shareLinkInput.value) {
            alert('No share link to copy. Please generate a link first.');
            return;
        }
        
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999); // For mobile devices
        
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
            // Fallback for older browsers
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
    if (shareFileSelect) {
        shareFileSelect.value = '';
    }
    if (shareLinkInput) {
        shareLinkInput.value = '';
    }
    if (shareAccessLevel) {
        shareAccessLevel.value = 'public';
    }
    if (copyLinkBtn) {
        copyLinkBtn.textContent = 'Copy';
        copyLinkBtn.classList.remove('copied');
    }
}

// Make openFileStorage available globally for access from other pages
window.openFileStorage = openFileStorage;

// ============================================
// Gamification and Rewards UI
// ============================================
// TODO: Implement ERC-20 token contract integration
// TODO: Implement token balance fetching from blockchain
// TODO: Implement contribution tracking (posts, file uploads)
// TODO: Implement reward claiming functionality
// TODO: Implement premium feature redemption
// TODO: Implement DEX integration for token trading
// TODO: Implement rewards history tracking

const rewardsSection = document.getElementById('rewardsSection');
const closeRewardsSection = document.getElementById('closeRewardsSection');
const claimRewardsBtn = document.getElementById('claimRewardsBtn');
const refreshRewardsBtn = document.getElementById('refreshRewardsBtn');
const connectDexBtn = document.getElementById('connectDexBtn');
const viewTokenContractBtn = document.getElementById('viewTokenContractBtn');
const tokenContractAddress = document.getElementById('tokenContractAddress');
const redeemButtons = document.querySelectorAll('.redeem-btn');
const copyContractBtn = document.querySelector('[data-copy="contract"]');

// Open rewards section (can be called from other pages after login)
function openRewards() {
    if (rewardsSection) {
        rewardsSection.style.display = 'flex';
        loadRewardsData();
    }
}

// Close rewards section
if (closeRewardsSection && rewardsSection) {
    closeRewardsSection.addEventListener('click', () => {
        rewardsSection.style.display = 'none';
    });
}

// Load rewards data (placeholder)
function loadRewardsData() {
    console.log('Loading rewards data...');
    // TODO: Fetch token balance from ERC-20 contract
    // TODO: Fetch contribution counts (helpful posts, file uploads)
    // TODO: Calculate pending rewards
    // TODO: Fetch rewards history
    // TODO: Update UI with fetched data
    
    // Example structure:
    // const tokenBalance = await tokenContract.balanceOf(userWalletAddress);
    // const helpfulPosts = await getUserContributions('posts');
    // const fileUploads = await getUserContributions('uploads');
    // const rewardsHistory = await getRewardsHistory();
    
    // Update UI elements
    updateTokenBalance('0.00');
    updateContributions(0, 0);
    updateRewardsHistory([]);
}

// Update token balance display
function updateTokenBalance(balance) {
    const tokenBalanceEl = document.getElementById('tokenBalance');
    const tokenValueEl = document.getElementById('tokenValue');
    
    if (tokenBalanceEl) {
        tokenBalanceEl.textContent = parseFloat(balance).toFixed(2);
    }
    
    // TODO: Calculate USD value based on current token price
    if (tokenValueEl) {
        const usdValue = (parseFloat(balance) * 0.1).toFixed(2); // Placeholder calculation
        tokenValueEl.textContent = `$${usdValue}`;
    }
}

// Update contributions display
function updateContributions(posts, uploads) {
    const postsCountEl = document.getElementById('helpfulPostsCount');
    const uploadsCountEl = document.getElementById('fileUploadsCount');
    const totalEarnedEl = document.getElementById('totalEarned');
    const postsRewardEl = document.getElementById('postsReward');
    const uploadsRewardEl = document.getElementById('uploadsReward');
    const totalRewardEl = document.getElementById('totalReward');
    
    // TODO: Calculate rewards based on contribution counts
    const postsReward = posts * 10; // 10 tokens per helpful post
    const uploadsReward = uploads * 5; // 5 tokens per file upload
    const totalReward = postsReward + uploadsReward;
    
    if (postsCountEl) postsCountEl.textContent = posts;
    if (uploadsCountEl) uploadsCountEl.textContent = uploads;
    if (totalEarnedEl) totalEarnedEl.textContent = posts + uploads;
    if (postsRewardEl) postsRewardEl.textContent = `+${postsReward}`;
    if (uploadsRewardEl) uploadsRewardEl.textContent = `+${uploadsReward}`;
    if (totalRewardEl) totalRewardEl.textContent = totalReward;
}

// Update rewards history
function updateRewardsHistory(history) {
    const historyList = document.getElementById('rewardsHistory');
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No rewards history yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="reward-history-item">
            <div class="reward-history-info">
                <div class="reward-history-type">${item.type}</div>
                <div class="reward-history-date">${item.date}</div>
            </div>
            <div class="reward-history-amount">+${item.amount} tokens</div>
        </div>
    `).join('');
}

// Claim pending rewards
if (claimRewardsBtn) {
    claimRewardsBtn.addEventListener('click', async () => {
        console.log('Claiming pending rewards...');
        // TODO: Implement reward claiming
        // 1. Calculate pending rewards from contributions
        // 2. Call ERC-20 contract to mint/transfer tokens
        // 3. Update token balance
        // 4. Add entry to rewards history
        // 5. Update UI
        
        // Example:
        // const pendingRewards = calculatePendingRewards();
        // await tokenContract.mint(userWalletAddress, pendingRewards);
        // await updateRewardsHistory();
        // loadRewardsData();
    });
}

// Refresh rewards balance
if (refreshRewardsBtn) {
    refreshRewardsBtn.addEventListener('click', () => {
        loadRewardsData();
    });
}

// Redeem premium features
if (redeemButtons.length > 0) {
    redeemButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const feature = e.target.dataset.feature;
            const featureCard = e.target.closest('.feature-card');
            const costElement = featureCard.querySelector('.feature-cost');
            const cost = parseInt(costElement.textContent);
            
            console.log(`Redeeming ${feature} for ${cost} tokens...`);
            
            // TODO: Implement feature redemption
            // 1. Check if user has enough tokens
            // 2. Call smart contract to burn/transfer tokens
            // 3. Activate premium feature
            // 4. Update token balance
            // 5. Show success message
            
            // Example:
            // const balance = await tokenContract.balanceOf(userWalletAddress);
            // if (balance < cost) {
            //     alert('Insufficient tokens');
            //     return;
            // }
            // await tokenContract.burn(userWalletAddress, cost);
            // await activatePremiumFeature(feature);
            // loadRewardsData();
        });
    });
}

// Connect to DEX
if (connectDexBtn) {
    connectDexBtn.addEventListener('click', async () => {
        console.log('Connecting to DEX...');
        // TODO: Implement DEX connection
        // 1. Connect to Uniswap, SushiSwap, or other DEX
        // 2. Get token pair information
        // 3. Open trading interface
        // 4. Allow user to swap tokens
        
        // Example:
        // const dexUrl = `https://app.uniswap.org/#/swap?inputCurrency=${tokenContractAddress}`;
        // window.open(dexUrl, '_blank');
    });
}

// View token contract
if (viewTokenContractBtn) {
    viewTokenContractBtn.addEventListener('click', () => {
        const contractAddress = tokenContractAddress ? tokenContractAddress.textContent : '';
        if (contractAddress && contractAddress !== '0x0000...0000') {
            // TODO: Open contract on blockchain explorer (Etherscan, etc.)
            const explorerUrl = `https://etherscan.io/address/${contractAddress}`;
            window.open(explorerUrl, '_blank');
        } else {
            alert('Token contract address not available');
        }
    });
}

// Copy contract address
if (copyContractBtn && tokenContractAddress) {
    copyContractBtn.addEventListener('click', () => {
        const address = tokenContractAddress.textContent;
        if (address && address !== '0x0000...0000') {
            navigator.clipboard.writeText(address).then(() => {
                copyContractBtn.textContent = 'Copied!';
                copyContractBtn.classList.add('copied');
                setTimeout(() => {
                    copyContractBtn.textContent = 'Copy';
                    copyContractBtn.classList.remove('copied');
                }, 2000);
            });
        }
    });
}

// Make openRewards available globally for access from other pages
window.openRewards = openRewards;

// ============================================
// Quick Access Buttons
// ============================================
const openFileStorageBtn = document.getElementById('openFileStorageBtn');
const openRewardsBtn = document.getElementById('openRewardsBtn');

// Open File Storage section
if (openFileStorageBtn) {
    openFileStorageBtn.addEventListener('click', () => {
        openFileStorage();
    });
}

// Open Rewards section
if (openRewardsBtn) {
    openRewardsBtn.addEventListener('click', () => {
        openRewards();
    });
}
