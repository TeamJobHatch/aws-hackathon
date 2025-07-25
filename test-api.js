const https = require('https');

const testAPI = () => {
  const url = 'https://aws-hackathon-mje2m1bk0-teamjobhatchs-projects.vercel.app/api/test-openai';
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('Response Body:', data);
      
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
};

testAPI(); 