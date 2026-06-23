const axios = require('axios');

async function testWorkout() {
  const baseURL = 'https://test-nutricoach.onrender.com/api/v1';
  
  try {
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'xuanhaodoan@gmail.com',
      password: 'Test1234!'
    });
    const token = loginRes.data.data.accessToken;

    const payload = {
      name: 'Bài tập tự do',
      performedAt: new Date().toISOString(),
      durationSec: 1800,
      caloriesBurned: 150,
      notes: 'Ngực',
      logs: [{
        exerciseId: 'ex_random_unmatched_slug_from_csv',
        orderIndex: 0,
        setNumber: 1,
        reps: 15,
        weightKg: 0,
        restSec: 30,
        notes: ''
      }]
    };

    try {
      const res = await axios.post(`${baseURL}/workout/sessions`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log('SUCCESS:', res.data);
    } catch (e) {
      console.log('FAIL:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

testWorkout();
