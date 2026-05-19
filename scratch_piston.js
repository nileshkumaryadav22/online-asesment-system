fetch('https://emkc.org/api/v2/piston/runtimes')
  .then(res => res.json())
  .then(data => {
    const supported = ['javascript', 'python', 'java', 'c++', 'cpp'];
    console.log(data.filter(r => supported.includes(r.language)));
  });
