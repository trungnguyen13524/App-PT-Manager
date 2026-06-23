const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    let loginRes;
    try {
      loginRes = await axios.post('https://test-nutricoach.onrender.com/api/v1/auth/login', {
        email: 'testnutri123@example.com',
        password: 'Password123!'
      });
    } catch(e) {
      console.log('Login failed', e.response?.data);
      return;
    }

    const token = loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
    
    if (!token) {
      console.log('No token');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 1. Log a food
    console.log('Logging food...');
    const logFoodPayload = {
        mealType: 'LUNCH',
        consumedAt: '2026-06-22T12:00:00.000Z',
        customName: 'Bún chả',
        calories: 600,
        macros: {
          proteinG: 30,
          carbsG: 60,
          fatG: 15
        },
        portion: 1
    };
    
    try {
        const postRes = await axios.post('https://test-nutricoach.onrender.com/api/v1/nutrition/food-logs', logFoodPayload, { headers });
        console.log('POST Res:', postRes.data);
    } catch(e) {
        console.log('POST failed:', e.response?.data || e.message);
    }

    // 2. Fetch it back
    console.log('Fetching logs...');
    const today = '2026-06-22'; // Fetch for 22
    const getRes = await axios.get(`https://test-nutricoach.onrender.com/api/v1/nutrition/food-logs?date=${today}`, { headers });
    
    console.log('GET Res:', JSON.stringify(getRes.data, null, 2));

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

test();
