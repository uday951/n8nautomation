const axios = require('axios');

async function testLinkedInPost() {
  try {
    console.log('🧪 Testing LinkedIn post creation...');
    
    const response = await axios.post('http://localhost:3000/post', {
      text: '🧪 Test post from automation - ' + new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3000/');
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server not running. Please start with: npm start');
    return false;
  }
}

async function runTest() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testLinkedInPost();
  }
}

runTest(); 