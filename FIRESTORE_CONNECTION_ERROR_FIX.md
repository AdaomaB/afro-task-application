# Firestore Connection Error Fix

## Error
```
Error: 14 UNAVAILABLE: No connection established. 
Last error: Error: Client network socket disconnected before secure TLS connection was established.
```

## Root Cause
This error occurs when the Node.js server cannot establish a secure connection to Google Firestore. Common causes:

1. **Network/Internet Issues** - Unstable or blocked connection
2. **Firewall/Antivirus** - Blocking gRPC connections (port 443)
3. **Proxy Settings** - Corporate proxy blocking connections
4. **Service Account Key** - Invalid or expired credentials
5. **DNS Issues** - Cannot resolve firestore.googleapis.com

## Quick Fixes

### 1. Check Internet Connection
```bash
# Test if you can reach Google
ping google.com

# Test if you can reach Firestore
ping firestore.googleapis.com
```

### 2. Restart Server
Sometimes the connection just needs to be re-established:
```bash
# Stop the server (Ctrl+C)
# Then restart
cd server
npm start
```

### 3. Check Firewall/Antivirus
- Temporarily disable antivirus to test
- Allow Node.js through Windows Firewall
- Ensure port 443 (HTTPS) is not blocked

### 4. Verify Service Account Key
Check that `server/serviceAccountKey.json` exists and is valid:
```bash
# File should exist
ls server/serviceAccountKey.json

# File should have valid JSON structure
```

### 5. Check Environment Variables
Verify `server/.env` has correct Firebase config:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 6. Network Proxy (If Behind Corporate Firewall)
If you're behind a corporate proxy, you may need to configure it:

```javascript
// Add to server/config/firebase.js
const { setGlobalDispatcher, ProxyAgent } = require('undici');

if (process.env.HTTP_PROXY) {
  const dispatcher = new ProxyAgent(process.env.HTTP_PROXY);
  setGlobalDispatcher(dispatcher);
}
```

### 7. Use Different Network
Try connecting from:
- Mobile hotspot
- Different WiFi network
- VPN (if corporate network is blocking)

## Long-term Solution: Add Retry Logic

Update the Firebase initialization to handle connection issues better:

### server/config/firebase.js
```javascript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db;
let isInitialized = false;

const initializeFirebase = () => {
  try {
    if (isInitialized) {
      return db;
    }

    const serviceAccount = require('../serviceAccountKey.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    db = admin.firestore();
    
    // Configure Firestore settings for better connection handling
    db.settings({
      ignoreUndefinedProperties: true,
      // Add retry settings
      maxRetries: 3,
      retryDelayMs: 1000
    });

    isInitialized = true;
    console.log('✅ Firebase initialized successfully');
    
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

// Initialize on module load
try {
  db = initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase on startup:', error);
}

// Export with getter to ensure initialization
export { admin };
export const getDb = () => {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
};

// For backward compatibility
export { db };
```

## Add Connection Health Check

Create a health check endpoint to monitor Firebase connection:

### server/server.js
Add this route:
```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Try to read from Firestore
    await db.collection('_health_check').limit(1).get();
    res.json({ 
      status: 'healthy', 
      firebase: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      firebase: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## Add Better Error Handling in Controllers

Wrap Firestore calls with better error handling:

```javascript
// Example for any controller
export const getData = async (req, res) => {
  try {
    const snapshot = await db.collection('data').get();
    // ... process data
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if it's a connection error
    if (error.code === 14 || error.message.includes('UNAVAILABLE')) {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable. Please try again.',
        error: 'Connection issue'
      });
    }
    
    // Other errors
    res.status(500).json({ 
      message: 'Failed to fetch data',
      error: error.message 
    });
  }
};
```

## Windows-Specific Fixes

### Allow Node.js Through Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js or add it manually
4. Check both Private and Public networks

### Disable IPv6 (Sometimes Helps)
```bash
# In PowerShell (as Administrator)
netsh interface ipv6 set global randomizeidentifiers=disabled
netsh interface ipv6 set privacy state=disabled
```

## Testing Connection

Create a test script to verify Firestore connection:

### server/test-firestore.js
```javascript
import { db } from './config/firebase.js';

async function testConnection() {
  console.log('Testing Firestore connection...');
  
  try {
    const testRef = db.collection('_connection_test');
    await testRef.add({
      test: true,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Connection successful!');
    
    // Clean up
    const snapshot = await testRef.where('test', '==', true).get();
    snapshot.forEach(doc => doc.ref.delete());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
cd server
node test-firestore.js
```

## Immediate Workaround

If you need to continue development while fixing the connection:

1. **Use Firebase Emulator** (local development):
```bash
npm install -g firebase-tools
firebase emulators:start --only firestore
```

2. **Update firebase config** to use emulator:
```javascript
if (process.env.NODE_ENV === 'development') {
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
}
```

## Prevention

To prevent this in the future:

1. **Add connection retry logic** (shown above)
2. **Monitor connection health** with health check endpoint
3. **Use connection pooling** (Firestore does this automatically)
4. **Add timeout handling** for all Firestore operations
5. **Log connection status** on server startup

## When to Contact Support

Contact Firebase Support if:
- Error persists after trying all fixes
- Only happens with your project (not others)
- Started after Firebase console changes
- Happens on multiple networks/machines

## Summary

**Most Common Fix**: Restart your server and check your internet connection.

**If that doesn't work**: Check firewall/antivirus settings.

**Still not working**: Try a different network (mobile hotspot).

**Long-term**: Add retry logic and better error handling as shown above.
