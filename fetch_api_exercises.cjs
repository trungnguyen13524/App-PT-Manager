const axios = require('axios');
const fs = require('fs');

async function fetchAllExercises() {
  const baseURL = 'https://test-nutricoach.onrender.com/api/v1';
  let allExercises = [];
  
  try {
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'xuanhaodoan@gmail.com',
      password: 'Test1234!'
    });
    const token = loginRes.data.data.accessToken;

    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const res = await axios.get(`${baseURL}/workout/exercises?limit=20&page=${page}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      allExercises = allExercises.concat(res.data.data.data);
      hasNext = res.data.data.pagination.hasNext;
      page++;
    }

    const mapping = {};
    allExercises.forEach(ex => {
      mapping[ex.nameVi] = ex.id;
    });

    fs.writeFileSync('C:/Users/ADMIN/.gemini/antigravity-ide/brain/51284fe4-6771-4d2c-8ab7-998423c90ac6/scratch/api_exercises.json', JSON.stringify(mapping, null, 2));
    console.log('Saved', allExercises.length, 'exercises to scratch/api_exercises.json');

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

fetchAllExercises();
