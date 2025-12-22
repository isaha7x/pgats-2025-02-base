const fs = require('fs');
const readline = require('readline');

const inputFile = 'test/k6/reports/report.json'; 
const outputFile = 'test/k6/reports/report.html';

const groups = {};
let totalDurations = [];
let totalChecks = { pass: 0, fail: 0 };

async function processFile() {
  const fileStream = fs.createReadStream(inputFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.metric === 'http_req_duration') {
        const group = obj.data.tags.group || 'Default';
        if (!groups[group]) groups[group] = { durations: [], checks: { pass: 0, fail: 0 } };
        groups[group].durations.push(obj.data.value);
        totalDurations.push(obj.data.value);
      }
      if (obj.metric === 'checks') {
        const group = obj.data.tags.group || 'Default';
        if (!groups[group]) groups[group] = { durations: [], checks: { pass: 0, fail: 0 } };
        groups[group].checks.pass += obj.data.passes || 0;
        groups[group].checks.fail += obj.data.fails || 0;
        totalChecks.pass += obj.data.passes || 0;
        totalChecks.fail += obj.data.fails || 0;
      }
    } catch (e) {
    }
  }

  generateHTML();
}

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a,b) => a + b, 0) / arr.length;
}

function min(arr) {
  if (arr.length === 0) return 0;
  return Math.min(...arr);
}

function max(arr) {
  if (arr.length === 0) return 0;
  return Math.max(...arr);
}

function generateHTML() {
  let html = `
<html>
<head>
  <title>Relatório K6</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h1>Relatório de Performance K6</h1>
  <h2>Duração total das requisições:</h2>
  <p>Média: ${avg(totalDurations).toFixed(2)} ms</p>
  <p>Min: ${min(totalDurations).toFixed(2)} ms</p>
  <p>Max: ${max(totalDurations).toFixed(2)} ms</p>
  <p>Checks: ${totalChecks.pass} pass / ${totalChecks.fail} fail</p>
  <hr/>
`;

  for (const [groupName, data] of Object.entries(groups)) {
    html += `<h2>Grupo: ${groupName}</h2>`;
    html += `<p>Média: ${avg(data.durations).toFixed(2)} ms | Min: ${min(data.durations).toFixed(2)} ms | Max: ${max(data.durations).toFixed(2)} ms</p>`;
    html += `<p>Checks: ${data.checks.pass} pass / ${data.checks.fail} fail</p>`;
    html += `<hr/>`;
  }

  html += `</body></html>`;

  fs.writeFileSync(outputFile, html);
  console.log(`Relatório HTML gerado em: ${outputFile}`);
}

processFile();
