# Admin Authentication Implementation

## Step-by-Step Implementation Guide

### Step 1: Update State (Line 98)

**Find this:**
```javascript
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

**Replace with:**
```javascript
const [isAuthenticated, setIsAuthenticated] = useState(() => {
  // Check sessionStorage for existing session on load
  return sessionStorage.getItem('adminToken') !== null;
});
```

---

### Step 2: Add Handler Functions (After line 792, after `handleScanAuthorChannels`)

**Add these two functions:**

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError('');

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: loginPassword })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      sessionStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
      setLoginPassword('');
      setCurrentView('admin');
    } else {
      setLoginError('Invalid password');
    }
  } catch (error) {
    setLoginError('Login failed. Please try again.');
  }
};

const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setCurrentView('home');
  }
};
```

---

### Step 3: Add Login Page (Before line 2489, before "Render Admin Panel")

**Add this entire component before the admin panel:**

```javascript
// Render Login Page
if (currentView === 'admin' && !isAuthenticated) {
  return (
    <div className="App">
      <header className="header">
        <button onClick={() => setCurrentView('home')} className="back-btn">
          ← Back to Home
        </button>
        <h1>🔐 Admin Login</h1>
      </header>

      <div style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '2rem',
        border: '2px solid #007bff',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '4px',
                border: '2px solid #ddd'
              }}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {loginError && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          >
            Login
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <strong>Default Password:</strong> admin123
        </div>
      </div>
    </div>
  );
}
```

---

### Step 4: Update Admin Panel Header (Line 2492-2497)

**Find this:**
```javascript
<header className="header">
  <button onClick={() => setCurrentView('home')} className="back-btn">
    ← Back to Home
  </button>
  <h1>🎴 PokeVods - Admin Panel</h1>
</header>
```

**Replace with:**
```javascript
<header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
  <button onClick={() => setCurrentView('home')} className="back-btn">
    ← Back to Home
  </button>
  <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>🎴 PokeVods - Admin Panel</h1>
  <button
    onClick={handleLogout}
    className="btn btn-secondary"
    style={{ padding: '0.5rem 1rem' }}
  >
    Logout
  </button>
</header>
```

---

### Step 5: Find and Remove Public Admin Links

**Search for these patterns and remove/hide them:**

1. **Search for:** `setCurrentView('admin')`
   - Any buttons that directly set currentView to 'admin' should be removed from public pages
   - Keep only the ones that first check `isAuthenticated`

2. **Common locations to check:**
   - Homepage header
   - Footer links
   - Deck page
   - Any "Admin" buttons visible to public

3. **If you find an admin button, either:**
   - Delete it completely, OR
   - Wrap it with: `{isAuthenticated && <button...>}`

**Example - If you find this:**
```javascript
<button onClick={() => setCurrentView('admin')}>
  Admin Panel
</button>
```

**Either delete it, or change to:**
```javascript
{isAuthenticated && (
  <button onClick={() => setCurrentView('admin')}>
    Admin Panel
  </button>
)}
```

---

### Step 6: Test the Implementation

After making all changes:

1. **Clear sessionStorage:**
   ```javascript
   sessionStorage.clear();
   ```

2. **Refresh the page** - should start logged out

3. **Try to access admin:**
   - Click any button that goes to admin
   - Should show login page

4. **Login with password:** `admin123`
   - Should redirect to admin panel

5. **Refresh page:**
   - Should stay logged in (session persists)

6. **Click Logout:**
   - Should clear session and return home

7. **Verify no admin links visible** on public pages

---

## Quick Implementation Checklist

- [ ] Step 1: Update `isAuthenticated` state with sessionStorage check
- [ ] Step 2: Add `handleLogin` and `handleLogout` functions
- [ ] Step 3: Add Login Page component before admin panel
- [ ] Step 4: Update admin panel header with logout button
- [ ] Step 5: Remove/hide all public admin links
- [ ] Step 6: Test login flow
- [ ] Step 7: Test logout flow
- [ ] Step 8: Test session persistence (refresh page)
- [ ] Step 9: Verify no admin access without login

---

## Security Notes

1. **Current Implementation:**
   - Simple password check (admin123)
   - Session token stored in sessionStorage
   - Good for basic protection

2. **Future Improvements (Later):**
   - Use environment variable for password
   - Implement JWT tokens
   - Add HTTPS requirement
   - Add rate limiting
   - Add proper session expiration

3. **For Now:**
   - Change password via Vercel env variable `ADMIN_PASSWORD`
   - Default is `admin123` if not set

---

## Troubleshooting

**Issue: Still can access admin without login**
- Check that login page component is BEFORE admin panel render
- Verify condition: `if (currentView === 'admin' && !isAuthenticated)`

**Issue: Gets logged out on refresh**
- Check sessionStorage.getItem('adminToken') is working
- Open DevTools > Application > Session Storage
- Should see `adminToken` entry

**Issue: Login not working**
- Check `/api/auth` endpoint is deployed
- Check browser console for errors
- Verify password matches (case sensitive)

**Issue: Can't find where admin links are**
- Search codebase for: `setCurrentView('admin')`
- Search for: `currentView === 'admin'`
- Search for: `Admin Panel` or `Admin`
