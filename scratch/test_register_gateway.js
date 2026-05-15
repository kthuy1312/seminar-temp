const axios = require('axios');

async function testRegister() {
  const email = `test_${Date.now()}@gmail.com`;
  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      email: email,
      password: 'Password123',
      fullName: 'Test Automation'
    });
    console.log('Register Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Register Failed:', error.response ? error.response.data : error.message);
  }
}

testRegister();
