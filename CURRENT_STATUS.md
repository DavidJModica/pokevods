# Hosted Guides - Current Status

## ✅ What's Deployed and Working

### **Admin Panel Integration**
The Hosted Guides admin management interface is fully integrated and deployed!

**Access it at:**
1. Go to your PokeVods site (https://pokevods.vercel.app or localhost:3000)
2. Click **"Admin"** button (top right)
3. Login with admin credentials
4. Click **"📝 Hosted Guides"** tab (last tab after "Manage Authors")

### **Features Available Now**

✅ **View All Guides**
- See all hosted guides in one place
- Filter by status: All / Published / Drafts
- View metadata: sections count, views, creation date

✅ **Manage Guide Status**
- **Publish** - Make a draft guide public
- **Unpublish** - Take a published guide offline
- **Delete** - Permanently remove a guide

✅ **Author Permissions**
- Toggle "Can Create Guides" permission for each author
- View author email and profile info
- See which authors have guides

✅ **Guide Actions**
- **View** - Opens public guide page (published guides only)
- **Edit** - Opens guide editor in new tab
- **Publish/Unpublish** - Toggle status
- **Delete** - Remove guide permanently

## 🔧 Backend APIs (Fully Working)

All backend infrastructure is deployed and functional:

- ✅ `POST /api/hosted-guides` - Create guide
- ✅ `GET /api/hosted-guides?slug={slug}` - Get published guide
- ✅ `GET /api/hosted-guides?id={id}` - Get guide for editing
- ✅ `GET /api/hosted-guides?all=true` - Get all guides (admin)
- ✅ `PUT /api/hosted-guides` - Update guide
- ✅ `DELETE /api/hosted-guides` - Delete guide
- ✅ `POST /api/upload-guide-image` - Upload images to Vercel Blob
- ✅ `POST /api/guide-view` - Track view counts
- ✅ `POST /api/author-auth` - Author login/register
- ✅ `PUT /api/authors` - Update author permissions

## 🚧 What's NOT Yet Available (UI Components)

The following UI components were built but removed from deployment due to React Router dependency conflicts:

- ❌ **GuideEditor** - Visual editor for creating/editing guides
- ❌ **GuideViewer** - Public display of published guides
- ❌ **GuidesList** - Grid browse view of all guides

These exist in git history but need to be either:
1. Rewritten to work without React Router, OR
2. React Router needs to be added to the app

## 💡 How to Create Guides Now

Since the UI editor isn't deployed yet, you have these options:

### Option 1: Use the API Directly

Create a guide using curl or Postman:

```bash
# 1. Get an author token (register or login)
curl -X POST https://pokevods.vercel.app/api/author-auth \
  -H "Content-Type: application/json" \
  -d '{
    "method": "login",
    "email": "your@email.com",
    "password": "yourpassword"
  }'

# 2. Create a guide
curl -X POST https://pokevods.vercel.app/api/hosted-guides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Complete Charizard ex Guide",
    "deckId": 1,
    "thumbnail": "https://example.com/image.jpg",
    "sections": [
      {
        "type": "intro",
        "title": "Introduction",
        "content": "<p>This is a complete guide...</p>",
        "order": 1,
        "matchups": []
      }
    ]
  }'
```

### Option 2: Use Prisma Studio

1. Run `npx prisma studio` locally
2. Navigate to the `Resource` table
3. Create a new record with:
   - `type`: "Hosted Guide"
   - `title`: Your guide title
   - `isHosted`: true
   - `publishStatus`: "draft" or "published"
   - `deckId`: ID of the deck
   - `authorId`: Your author ID
4. Add sections in the `GuideSection` table
5. Add matchups in the `Matchup` table (if needed)

### Option 3: Direct Database Insert

```sql
-- Insert a guide
INSERT INTO "Resource" (
  "type", "title", "slug", "deckId", "authorId",
  "isHosted", "platform", "publishStatus", "createdAt"
) VALUES (
  'Hosted Guide',
  'Complete Charizard ex Guide',
  'complete-charizard-ex-guide',
  1,
  1,
  true,
  'PokeVods Hosted',
  'draft',
  NOW()
);

-- Insert a section
INSERT INTO "GuideSection" (
  "resourceId", "sectionType", "title", "content", "order", "createdAt"
) VALUES (
  1, -- The guide ID from above
  'intro',
  'Introduction',
  '<p>This guide covers...</p>',
  1,
  NOW()
);
```

## 📊 Database Schema

The database tables are fully set up:

- ✅ **Resource** - Extended with `isHosted`, `slug`, `publishStatus`, `views`
- ✅ **GuideSection** - Sections with type, title, HTML content, order
- ✅ **Matchup** - Matchup data with win %, difficulty, notes, key cards (JSON)
- ✅ **Author** - Extended with `email`, `password`, `canCreateGuides`
- ✅ **GuideImage** - Image metadata (currently unused)

## 🎯 Immediate Next Steps

To get the full guide creation experience working:

### Quick Option: Add React Router (30 min)
```bash
npm install react-router-dom
git checkout 03a3d69  # Restore the editor components
# Then integrate routing into App.js
```

### Better Option: Rewrite Components (2-3 hours)
Rewrite GuideEditor, GuideViewer, and GuidesList to work without React Router:
- Replace `useNavigate()` with `window.location.href` or state updates
- Replace `useParams()` with props or state management
- Replace `Link` components with `<a>` tags or `onClick` handlers
- Integrate into the existing App.js view switching pattern

## 📝 What You Can Do Right Now

1. ✅ **Access the admin panel** - View and manage guides
2. ✅ **Grant author permissions** - Enable authors to create guides
3. ✅ **Change guide status** - Publish or unpublish guides
4. ✅ **Delete guides** - Remove unwanted guides
5. ✅ **Use the APIs** - Create guides programmatically
6. ✅ **View guide stats** - See view counts and metadata

## 📚 Documentation

- **[HOSTED_GUIDES_INTEGRATION.md](HOSTED_GUIDES_INTEGRATION.md)** - Technical integration guide
- **[HOSTED_GUIDES_USAGE_GUIDE.md](HOSTED_GUIDES_USAGE_GUIDE.md)** - Full usage documentation (written for when UI is complete)

## 🐛 Known Issues

- ❌ No visual editor UI (temporarily removed due to React Router dependency)
- ❌ Can't view guides publicly (viewer component removed)
- ❌ Can't browse guide list (list component removed)

## ✨ What's Awesome

Despite the UI components being temporarily unavailable, the entire backend infrastructure is production-ready:

- Complete CRUD API
- JWT authentication for authors
- Image upload to Vercel Blob
- Rich text content support
- Matchup system with full data structure
- Draft/publish workflow
- View tracking
- Author permission system
- Admin management interface

**The foundation is solid - we just need the UI components back!**

---

**Need Help?** Check the documentation files or use the API directly for now.
