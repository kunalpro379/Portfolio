import fetch from 'node-fetch';

const API_URL = 'http://api.kunalpatil.me/api/documentation';

// Sample documentation content
const sampleDoc = {
  title: 'Getting Started with React Hooks',
  subject: 'React',
  content: `
    <h1>Introduction to React Hooks</h1>
    <p>React Hooks are functions that let you use state and other React features without writing a class.</p>
    
    <h2>useState Hook</h2>
    <p>The <code>useState</code> hook allows you to add state to functional components.</p>
    <pre>const [count, setCount] = useState(0);</pre>
    
    <h2>useEffect Hook</h2>
    <p>The <code>useEffect</code> hook lets you perform side effects in functional components.</p>
    
    <h3>Key Points</h3>
    <ul>
      <li>Hooks are backwards-compatible</li>
      <li>Hooks don't replace your knowledge of React concepts</li>
      <li>You can use multiple hooks in a single component</li>
    </ul>
  `,
  isPublic: true
};

async function testDocumentation() {
  try {
    console.log('🧪 Testing Documentation API...\n');

    // 1. Create a document
    console.log('1️⃣ Creating document...');
    const createResponse = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleDoc)
    });
    const created = await createResponse.json();
    console.log('✅ Created:', created.doc.title);
    console.log('   DocID:', created.doc.docId);
    console.log('   Slug:', created.doc.slug);
    console.log('   Azure URL:', created.doc.azureBlobUrl);
    console.log('');

    const docId = created.doc.docId;

    // 2. Get all documents
    console.log('2️⃣ Fetching all documents...');
    const allResponse = await fetch(API_URL);
    const allDocs = await allResponse.json();
    console.log(`✅ Found ${allDocs.docs.length} document(s)`);
    console.log('');

    // 3. Get single document with content
    console.log('3️⃣ Fetching single document with content...');
    const singleResponse = await fetch(`${API_URL}/${docId}`);
    const singleDoc = await singleResponse.json();
    console.log('✅ Retrieved:', singleDoc.doc.title);
    console.log('   Content length:', singleDoc.doc.content.length, 'characters');
    console.log('');

    // 4. Update document
    console.log('4️⃣ Updating document...');
    const updateResponse = await fetch(`${API_URL}/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Advanced React Hooks Guide',
        isPublic: false
      })
    });
    const updated = await updateResponse.json();
    console.log('✅ Updated:', updated.doc.title);
    console.log('   New slug:', updated.doc.slug);
    console.log('   Is public:', updated.doc.isPublic);
    console.log('');

    // 5. Delete document
    console.log('5️⃣ Deleting document...');
    const deleteResponse = await fetch(`${API_URL}/${docId}`, {
      method: 'DELETE'
    });
    const deleted = await deleteResponse.json();
    console.log('✅', deleted.message);
    console.log('');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDocumentation();
