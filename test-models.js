async function listModels() {
  const apiKey = 'YOUR_API_KEY_HERE';
  let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const models = [];
  try {
    let hasNext = true;
    while(hasNext) {
      const res = await fetch(url);
      const data = await res.json();
      if(data.models) models.push(...data.models.map(m => m.name));
      if(data.nextPageToken) {
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageToken=${data.nextPageToken}`;
      } else {
        hasNext = false;
      }
    }
    console.log("ALL MODELS:", models.join(', '));
  } catch (err) {
    console.error(err);
  }
}

listModels();
