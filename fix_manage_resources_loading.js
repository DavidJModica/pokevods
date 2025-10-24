const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Adding useEffect to auto-load resources when Manage Resources tab is active...\n');

// Find the fetchAllResources function and add a useEffect after it
const fetchAllResourcesFunc = `  const fetchAllResources = async () => {
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

const fetchAllResourcesWithEffect = `  const fetchAllResources = async () => {
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
  };

  // Auto-fetch resources when Manage Resources tab becomes active
  useEffect(() => {
    if (adminTab === 'manageResources' && allResources.length === 0) {
      fetchAllResources();
    }
  }, [adminTab]);`;

if (content.includes(fetchAllResourcesFunc)) {
  content = content.replace(fetchAllResourcesFunc, fetchAllResourcesWithEffect);
  console.log('✅ Added useEffect to auto-load resources');
} else {
  console.log('⚠️  Could not find fetchAllResources function');
}

fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ Fix applied!');
console.log('Resources will now automatically load when you click the Manage Resources tab.');
