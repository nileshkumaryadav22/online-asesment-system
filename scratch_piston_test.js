fetch('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'c++',
    version: '10.2.0',
    files: [{ name: 'main.cpp', content: '#include <iostream>\nusing namespace std;\nint main() {\n  int a, b, c;\n  if (a > b a > c) {\n    cout << a;\n  }\n  return 0;\n}' }],
    stdin: ''
  })
}).then(r => r.json()).then(console.log).catch(console.error);
