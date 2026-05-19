fetch('https://wandbox.org/api/list.json')
  .then(r => r.json())
  .then(list => {
    console.log(list.filter(c => c.name && (c.name.includes('gcc') || c.name.includes('nodejs') || c.name.includes('python') || c.name.includes('openjdk'))).map(c => c.name));
  });
