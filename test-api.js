async function test() {
  const res = await fetch('http://localhost:3000/api/pages/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Test Page",
      schemaJson: '[{"@context":"https://schema.org","@type":"FAQPage"}]'
    })
  });
  const data = await res.json();
  console.log("PATCH Response:", data.schemaJson);

  const getRes = await fetch('http://localhost:3000/api/pages/1');
  const getData = await getRes.json();
  console.log("GET Response:", getData.schemaJson);
}
test().catch(console.error);
