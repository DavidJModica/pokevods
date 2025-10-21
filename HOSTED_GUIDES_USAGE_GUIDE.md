# Hosted Guides - Usage Guide

## Overview

The Hosted Guides feature is now integrated into PokeVods! You can manage guides directly through the admin panel.

## How to Access

### For Admins

1. **Open your PokeVods app** (http://localhost:3000 or your deployed URL)
2. **Click the "Admin" button** in the top right
3. **Login** with your admin credentials if prompted
4. **Click the "📝 Hosted Guides" tab** in the admin panel

## Managing Hosted Guides (Admin)

### In the Hosted Guides Tab

You'll see:
- **Filter tabs**: All / Published / Drafts
- **List of all hosted guides** with metadata
- **Author Permissions section** at the bottom

### Guide Actions

Each guide has action buttons:

- **View** - Opens the public guide page (only for published guides)
- **Edit** - Opens the guide editor in a new tab
- **Publish/Unpublish** - Toggle between draft and published status
- **Delete** - Permanently delete the guide

### Managing Author Permissions

In the "Author Permissions" section, you can:
- Toggle the "Can Create Guides" switch for each author
- Authors need this permission enabled to create guides

## Creating a Guide

### Step 1: Enable Permission

Before creating guides, ensure your author account has the "Can Create Guides" permission enabled by an admin.

### Step 2: Create the Guide

1. **Click "Create New Hosted Guide"** button in the Hosted Guides tab
2. This opens a new tab with the guide editor

### Step 3: Fill in Basic Info

- **Guide Title**: Enter a descriptive title (e.g., "Complete Charizard ex Guide")
- **Deck**: Select the deck this guide is for from the dropdown
- **Thumbnail URL** (optional): Add a banner image URL

### Step 4: Add Sections

The editor starts with one Introduction section. You can:

#### Add More Sections
- Click "+ Add Section" to create a new section
- Choose the section type:
  - **Introduction** - Overview of the deck/guide
  - **Decklist** - Deck list and card counts
  - **Card Explanations** - Detailed card explanations
  - **Possible Inclusions** - Cards that could be added
  - **Notable Exclusions** - Cards you chose not to include
  - **Matchups** - Matchup analysis (special section type)
  - **Custom Section** - Any other content

#### Edit Section Content

For **most section types**, you get a **Rich Text Editor** with:
- **Bold** (`Ctrl/Cmd + B`)
- **Italic** (`Ctrl/Cmd + I`)
- **Headings** (H2, H3)
- **Lists** (Bulleted, Numbered)
- **Links** (Click link icon or `Ctrl/Cmd + K`)
- **Images** (Click image icon to upload)
- **Undo/Redo**

For **Matchups sections**, you get a **Matchups Builder** with:
- Add multiple matchups with "+ Add Matchup"
- For each matchup:
  - Select opposing deck
  - Set win rate percentage (0-100% slider)
  - Choose difficulty (Favored, Even, Unfavored, Very Unfavored)
  - Write matchup strategy notes
  - Add key cards with importance levels

#### Reorder Sections
- Use the ↑ and ↓ arrows to move sections up or down
- The order affects how they display in the published guide

#### Remove Sections
- Click "Remove Section" to delete a section
- You must have at least one section

### Step 5: Save or Publish

- **Save Draft**: Saves your work without making it public
  - You can continue editing later
  - Only visible to you in the admin panel

- **Publish**: Makes the guide live and visible to all users
  - The guide will appear in the guides list
  - Users can view it at `/guides/{your-guide-slug}`

## Editing an Existing Guide

1. Go to **Admin Panel → Hosted Guides tab**
2. Find your guide in the list
3. Click **"Edit"** - opens the editor in a new tab
4. Make your changes
5. Click **"Save Draft"** or **"Publish"**

## Publishing Workflow

```
Draft → Publish → Public
  ↑________________↓
    Unpublish
```

- Guides start as **drafts** when created
- **Publishing** makes them visible to everyone
- You can **unpublish** to take them offline temporarily
- **Drafts** can still be edited and improved

## Viewing Published Guides

### As an Admin

You have two options:
1. **From Hosted Guides tab**: Click "View" on any published guide
2. **Direct URL**: Navigate to `/guides/{guide-slug}`

### As a User

Currently, users need to navigate directly to:
- `/guides` - To see all published guides (GuidesList component)
- `/guides/{slug}` - To view a specific guide

**Note**: You may want to add a "Guides" navigation link in your main menu for easier access.

## Guide Features

### Rich Text Content

- Write formatted content with headings, lists, bold, italic
- Add images directly in the editor
- Include links to external resources
- All content is saved as HTML

### Matchup Analysis

- Visual win rate bars
- Color-coded difficulty badges
- Detailed strategy notes
- Key cards with priority levels
- Automatic matchup cards in the viewer

### Author Attribution

Published guides show:
- Author name
- Author profile picture (if set)
- Author bio and social links
- Link to author's profile page

### View Tracking

- Each guide tracks view counts
- Visible in the admin panel
- Increments when users view the guide

## Tips for Great Guides

### Title
- Make it descriptive and specific
- Include the deck name
- Example: "Complete Charizard ex Guide for Louisville Regional"

### Structure
1. **Introduction** - What the deck does, why it's good
2. **Decklist** - Full list with card counts
3. **Card Explanations** - Why each card is included
4. **Matchups** - Key matchups with strategy
5. **Possible Inclusions** - Tech cards to consider
6. **Notable Exclusions** - Why you didn't include certain cards

### Writing Style
- Be clear and concise
- Use headings to organize content
- Add images for visual appeal
- Include specific card names and counts

### Matchups
- Cover the most common/important matchups
- Be realistic with win percentages
- List 2-4 key cards per matchup
- Write actionable strategy notes

## Troubleshooting

### Can't Create Guides
- Check that you're logged in as an author
- Ensure "Can Create Guides" is enabled by an admin

### Images Not Uploading
- Check file size (max 10MB)
- Ensure `BLOB_READ_WRITE_TOKEN` is set in `.env`
- Verify internet connection

### Guide Not Showing
- Check it's published (not draft)
- Verify slug doesn't conflict with existing guides
- Check browser console for errors

### Matchups Not Displaying
- Ensure section type is set to "Matchups"
- Check that opposing deck is selected
- Verify matchup data was saved

## API Endpoints Reference

For integration or custom functionality:

### Public
- `GET /api/hosted-guides?slug={slug}` - Get published guide
- `POST /api/guide-view` - Increment view count

### Authenticated (Author)
- `POST /api/hosted-guides` - Create guide
- `PUT /api/hosted-guides` - Update guide
- `DELETE /api/hosted-guides` - Delete guide
- `POST /api/upload-guide-image` - Upload image

### Admin
- `GET /api/hosted-guides?all=true` - Get all guides
- `PUT /api/authors` - Update author permissions

## Database Schema

Guides are stored in PostgreSQL with:
- **Resource** table - Guide metadata (title, slug, status, views)
- **GuideSection** table - Section content and type
- **Matchup** table - Matchup data (win %, difficulty, key cards)
- **Author** table - Author info and permissions

## Environment Variables

Required in `.env`:
```env
DATABASE_URL="your-postgres-url"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
JWT_SECRET="your-jwt-secret"
```

## Future Enhancements

Possible additions:
- Public guides navigation in main menu
- Search and filtering on guides list
- Guide categories/tags
- Comments and ratings
- Analytics dashboard
- Guide templates
- Collaborative editing
- PDF export

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Check network tab for failed API calls
4. Review the integration guide: [HOSTED_GUIDES_INTEGRATION.md](HOSTED_GUIDES_INTEGRATION.md)

---

**Happy Guide Writing! 📝**
