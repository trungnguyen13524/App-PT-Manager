const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('https://test-nutricoach.onrender.com/api/v1/auth/login', {
      email: 'testnutri123@example.com',
      password: 'Password123!'
    });
    const token = loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const today = new Date().toISOString().split('T')[0];
    const getRes = await axios.get(`https://test-nutricoach.onrender.com/api/v1/nutrition/summary/daily?date=${today}`, { headers });
    
    console.log('GET Summary:', JSON.stringify(getRes.data, null, 2));
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}
test();
