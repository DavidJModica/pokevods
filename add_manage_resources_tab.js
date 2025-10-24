const fs = require('fs');

// Read App.js
let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Adding "Manage Resources" tab to admin section...\n');

// 1. Update adminTab state to include 'manageResources'
const oldAdminTabState = `  const [adminTab, setAdminTab] = useState('bulkImport'); // 'bulkImport', 'reviewQueue', 'matchupQueue', 'manageGuides', 'manageAuthors', 'hostedGuides'`;

const newAdminTabState = `  const [adminTab, setAdminTab] = useState('bulkImport'); // 'bulkImport', 'reviewQueue', 'matchupQueue', 'manageGuides', 'manageAuthors', 'manageResources', 'hostedGuides'`;

if (content.includes(oldAdminTabState)) {
  content = content.replace(oldAdminTabState, newAdminTabState);
  console.log('✅ Updated adminTab state comment');
} else {
  console.log('⚠️  Could not find adminTab state');
}

// 2. Add state for all resources
const paidGuidesState = `  const [paidGuides, setPaidGuides] = useState([]);`;

const newStates = `  const [paidGuides, setPaidGuides] = useState([]);
  const [allResources, setAllResources] = useState([]);`;

if (content.includes(paidGuidesState) && !content.includes('allResources')) {
  content = content.replace(paidGuidesState, newStates);
  console.log('✅ Added allResources state');
} else {
  console.log('⚠️  Could not add allResources state (may already exist)');
}

// 3. Add fetchAllResources function after fetchAuthors
const fetchAuthorsFunction = `  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };`;

const fetchAuthorsWithAllResources = `  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchAllResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      // Sort by createdAt, newest first
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      setAllResources(sorted);
    } catch (error) {
      console.error('Error fetching all resources:', error);
    }
  };`;

if (content.includes(fetchAuthorsFunction) && !content.includes('fetchAllResources')) {
  content = content.replace(fetchAuthorsFunction, fetchAuthorsWithAllResources);
  console.log('✅ Added fetchAllResources function');
} else {
  console.log('⚠️  Could not add fetchAllResources function');
}

// 4. Add the Manage Resources tab button after Manage Authors button
const manageAuthorsButton = `            <button
              onClick={() => {
                setAdminTab('manageAuthors');
                fetchAuthors();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'manageAuthors' ? '#007bff' : 'transparent',
                color: adminTab === 'manageAuthors' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'manageAuthors' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              Manage Authors
            </button>`;

const manageAuthorsWithResourcesButton = `            <button
              onClick={() => {
                setAdminTab('manageAuthors');
                fetchAuthors();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'manageAuthors' ? '#007bff' : 'transparent',
                color: adminTab === 'manageAuthors' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'manageAuthors' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              Manage Authors
            </button>
            <button
              onClick={() => {
                setAdminTab('manageResources');
                fetchAllResources();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'manageResources' ? '#007bff' : 'transparent',
                color: adminTab === 'manageResources' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'manageResources' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              Manage Resources
            </button>`;

if (content.includes(manageAuthorsButton)) {
  content = content.replace(manageAuthorsButton, manageAuthorsWithResourcesButton);
  console.log('✅ Added Manage Resources tab button');
} else {
  console.log('⚠️  Could not add Manage Resources tab button');
}

// Write the updated file
fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ Phase 1 complete: Added state and fetch function');
console.log('Next step: Run the second script to add the tab content');
