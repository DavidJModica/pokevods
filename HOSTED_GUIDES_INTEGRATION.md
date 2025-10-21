# Hosted Guides Integration Guide

This guide explains how to integrate the hosted guides feature into the main PokeVods application.

## Overview

The hosted guides feature allows authors to create rich, interactive guides directly on the PokeVods platform with a WYSIWYG editor, matchup data, and comprehensive formatting options.

## Components Created

### Frontend Components
- `src/components/RichTextEditor.jsx` - TipTap-based WYSIWYG editor
- `src/components/MatchupsBuilder.jsx` - Matchup data builder with deck selection
- `src/components/GuideEditor.jsx` - Main guide creation/editing component
- `src/components/GuideViewer.jsx` - Public guide display component
- `src/components/GuidesList.jsx` - Grid listing of all guides
- `src/components/HostedGuidesAdmin.jsx` - Admin management interface
- `src/pages/GuidesApp.jsx` - Router wrapper for guides subsystem

### Backend APIs
- `api/hosted-guides.js` - CRUD operations for guides
- `api/upload-guide-image.js` - Image upload to Vercel Blob
- `api/author-auth.js` - Author authentication
- `api/guide-view.js` - View count tracking
- `lib/authorMiddleware.js` - Author authentication middleware

### Database Schema
- `GuideSection` - Guide content sections
- `Matchup` - Matchup data with win rates and key cards
- Extended `Author` model with `email`, `password`, `canCreateGuides`
- Extended `Resource` model with `isHosted`, `slug`, `publishStatus`, `views`

## Integration Steps

### Step 1: Add Hosted Guides Admin Tab

In `src/App.js`, add a new admin tab for hosted guides management.

**Find the admin tabs section (around line 2741)** and add a new tab button after the "Manage Guides" tab:

```javascript
<button
  onClick={() => setAdminTab('hostedGuides')}
  style={{
    padding: '0.75rem 1.5rem',
    background: adminTab === 'hostedGuides' ? '#007bff' : 'transparent',
    color: adminTab === 'hostedGuides' ? 'white' : '#333',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderBottom: adminTab === 'hostedGuides' ? '3px solid #007bff' : 'none',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s'
  }}
>
  Hosted Guides
</button>
```

**Then add the tab content (around line 3812, after the manageGuides tab content):**

```javascript
{adminTab === 'hostedGuides' && (
  <HostedGuidesAdmin decks={decks} />
)}
```

**Add the import at the top of App.js:**

```javascript
import HostedGuidesAdmin from './components/HostedGuidesAdmin';
```

### Step 2: Add Guides Navigation Link

Add a "Guides" link to the main navigation to allow users to browse all published guides.

**Find the main navigation section** and add:

```javascript
<button
  onClick={() => setCurrentView('guides')}
  style={{
    // ... your nav button styling
  }}
>
  Guides
</button>
```

### Step 3: Add Guides View Rendering

**Find the view rendering section** where `currentView` determines what to display, and add:

```javascript
{currentView === 'guides' && (
  <div>
    <GuidesApp />
  </div>
)}
```

**Add the import:**

```javascript
import GuidesApp from './pages/GuidesApp';
```

### Step 4: Update Authors API

The existing `api/authors.js` needs to support the `canCreateGuides`, `email`, and `profilePicture` fields.

**Update the PUT case in `api/authors.js` (line 100):**

```javascript
case 'PUT': {
  const { id, name, bio, youtube, twitter, twitch, discord, website, metafy, canCreateGuides, profilePicture, email } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  // Update slug if name changed
  let slug;
  if (name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const updatedAuthor = await prisma.author.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name, slug }),
      ...(bio !== undefined && { bio }),
      ...(youtube !== undefined && { youtube }),
      ...(twitter !== undefined && { twitter }),
      ...(twitch !== undefined && { twitch }),
      ...(discord !== undefined && { discord }),
      ...(website !== undefined && { website }),
      ...(metafy !== undefined && { metafy }),
      ...(canCreateGuides !== undefined && { canCreateGuides }),
      ...(profilePicture !== undefined && { profilePicture }),
      ...(email !== undefined && { email })
    }
  });

  return res.status(200).json(updatedAuthor);
}
```

### Step 5: Environment Variables

Ensure your `.env` file includes the Vercel Blob token for image uploads:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Get this token from: https://vercel.com/dashboard/stores

### Step 6: Install Required Dependencies

If not already installed, add TipTap dependencies:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

## Usage Flow

### For Authors

1. **Register** - Authors register via `/api/author-auth` (POST with method: 'register')
2. **Get Permission** - Admin must grant `canCreateGuides` permission via admin panel
3. **Create Guide** - Navigate to `/guides/create` or click "Create New Guide" in admin
4. **Add Sections** - Use the tabbed interface to add multiple sections:
   - Introduction, Decklist, Card Explanations, Possible Inclusions, Notable Exclusions, Matchups, or Custom
5. **Add Content** - Use the rich text editor for most sections, or MatchupsBuilder for matchup sections
6. **Save Draft** - Save work-in-progress guides as drafts
7. **Publish** - When ready, click "Publish" to make the guide public

### For Admins

1. **Navigate to Admin Panel** - Click "Admin" in navigation
2. **Go to Hosted Guides Tab** - Click the "Hosted Guides" tab
3. **Manage Guides** - View, edit, publish/unpublish, or delete guides
4. **Manage Permissions** - Toggle `canCreateGuides` for authors in the Author Permissions section

### For Users

1. **Browse Guides** - Click "Guides" in navigation to see all published guides
2. **View Guide** - Click on any guide card to read the full guide
3. **Navigate Sections** - Use the table of contents to jump between sections
4. **View Matchups** - See detailed matchup data with win rates, difficulty, and key cards

## API Endpoints

### Public Endpoints
- `GET /api/hosted-guides?slug={slug}` - Get a published guide by slug
- `POST /api/guide-view` - Increment view count for a guide

### Author Endpoints (requires author token)
- `POST /api/author-auth` - Register/login/verify author
- `GET /api/hosted-guides?id={id}` - Get guide for editing (includes drafts)
- `POST /api/hosted-guides` - Create new guide
- `PUT /api/hosted-guides` - Update existing guide
- `DELETE /api/hosted-guides` - Delete a guide
- `POST /api/upload-guide-image` - Upload image to Vercel Blob

### Admin Endpoints (requires admin token)
- `GET /api/hosted-guides?all=true` - Get all guides (published and drafts)
- `PUT /api/authors` - Update author permissions (canCreateGuides)

## Authentication

### Author Authentication
Authors use JWT tokens stored in `localStorage` under the key `token`. The token is generated via `/api/author-auth` and includes:
- `authorId` - The author's database ID
- `name` - Author's name
- `canCreateGuides` - Permission boolean
- `role` - Always 'author'

### Token Usage
Include the token in API requests:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## Database Relationships

```
Author
  ├── canCreateGuides (boolean)
  ├── email (string, unique)
  ├── password (hashed)
  └── resources (Resource[])
        └── guideSections (GuideSection[])
              └── matchups (Matchup[])
```

## Customization Options

### Adding New Section Types
Edit `SECTION_TYPES` array in `GuideEditor.jsx`:

```javascript
const SECTION_TYPES = [
  { value: 'intro', label: 'Introduction' },
  { value: 'your_new_type', label: 'Your New Type' },
  // ... more types
];
```

### Styling
All components have corresponding `.css` files that can be customized:
- `RichTextEditor.css` - Editor styling
- `MatchupsBuilder.css` - Matchup builder styling
- `GuideEditor.css` - Editor page styling
- `GuideViewer.css` - Public guide display styling
- `GuidesList.css` - Guides grid styling
- `HostedGuidesAdmin.css` - Admin interface styling

### Image Upload Limits
Modify the size limit in `api/upload-guide-image.js` (currently 10MB):

```javascript
if (buffer.length > 10 * 1024 * 1024) {
  return res.status(400).json({ error: 'Image too large' });
}
```

## Troubleshooting

### Images Not Uploading
- Verify `BLOB_READ_WRITE_TOKEN` is set in `.env`
- Check Vercel Blob storage quota
- Ensure image is under 10MB

### Guides Not Showing
- Check `publishStatus` is 'published'
- Verify `isHosted` is `true`
- Check for JavaScript errors in browser console

### Author Can't Create Guides
- Verify `canCreateGuides` is `true` for the author
- Check JWT token is valid and not expired
- Ensure author is logged in (token in localStorage)

### Matchups Not Displaying
- Verify section `sectionType` is 'matchups'
- Check `opposingDeckId` is valid
- Ensure deck exists in database

## Next Steps

1. **Test the Integration** - Create a test guide end-to-end
2. **Add More Section Types** - Customize section types for your needs
3. **Implement Search** - Add search/filter to GuidesList
4. **Add Comments** - Implement a comment system for guides
5. **Analytics** - Track which sections users spend the most time on

## Support

If you encounter issues during integration:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure database migrations have run
4. Check that all dependencies are installed
5. Review the backend API logs for errors

## Architecture Diagram

```
┌─────────────┐
│   User/     │
│   Author    │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
┌──────▼──────┐  ┌───▼───────────┐
│  GuidesList │  │  GuideEditor  │
│             │  │               │
│ - Browse    │  │ - Create      │
│ - Search    │  │ - Edit        │
└──────┬──────┘  │ - Sections    │
       │         │ - Matchups    │
       │         └───┬───────────┘
       │             │
┌──────▼──────┐  ┌───▼───────────┐
│ GuideViewer │  │ RichTextEditor│
│             │  │MatchupsBuilder│
│ - Display   │  └───────────────┘
│ - TOC       │
│ - Author    │
└──────┬──────┘
       │
┌──────▼──────────────┐
│   Backend APIs      │
│                     │
│ - hosted-guides     │
│ - author-auth       │
│ - upload-image      │
│ - guide-view        │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│   Database          │
│                     │
│ - Resource          │
│ - GuideSection      │
│ - Matchup           │
│ - Author            │
└─────────────────────┘
```

Good luck with your integration! The hosted guides feature will provide a powerful content creation tool for your PokeVods community.
