const fs = require('fs');

console.log('Adding force re-render mechanism...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Step 1: Add a dummy state variable for forcing re-renders
// Find where other state variables are declared (after the useState imports)
const stateDeclarations = 'const [allResources, setAllResources] = useState([]);';
const newState = `const [allResources, setAllResources] = useState([]);
  const [, forceUpdate] = useState({});`;

if (content.includes(stateDeclarations)) {
  content = content.replace(stateDeclarations, newState);
  console.log('✅ Added forceUpdate state variable');
} else {
  console.log('⚠️  Could not find allResources state declaration');
}

// Step 2: Modify fetchAllResources to call forceUpdate after setting resources
const oldFetch = `    setAllResources(sorted);
  } catch (error) {
    console.error('Error fetching all resources:', error);
  }
};`;

const newFetch = `    setAllResources(sorted);
    // Force a re-render to ensure UI updates
    forceUpdate({});
  } catch (error) {
    console.error('Error fetching all resources:', error);
  }
};`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  console.log('✅ Added forceUpdate() call to fetchAllResources');
} else {
  console.log('⚠️  Could not find fetchAllResources function');
}

// Step 3: Add forceUpdate to Edit button onClick
const oldEditClick = `                        onClick={() => {
                          setEditingResource(resource);
                          setEditDeckSearch(resource.deck?.name || '');
                          setShowEditDeckDropdown(false);
                        }}`;

const newEditClick = `                        onClick={() => {
                          setEditingResource(resource);
                          setEditDeckSearch(resource.deck?.name || '');
                          setShowEditDeckDropdown(false);
                          // Force re-render to show modal immediately
                          forceUpdate({});
                        }}`;

if (content.includes(oldEditClick)) {
  content = content.replace(oldEditClick, newEditClick);
  console.log('✅ Added forceUpdate() call to Edit button onClick');
} else {
  console.log('⚠️  Could not find Edit button onClick');
}

fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\\n✅ Force re-render mechanism added!');
console.log('This will force React to update the component immediately after state changes.');
