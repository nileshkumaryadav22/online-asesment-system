fetch('https://wandbox.org/api/compile.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    compiler: 'gcc-head',
    code: '#include <iostream>\nusing namespace std;\nint main() {\n  int a, b, c;\n  if (a > b a > c) {\n    cout << a;\n  }\n  return 0;\n}',
    stdin: '12 45 30'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
