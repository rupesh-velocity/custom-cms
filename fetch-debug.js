async function main() {
  const res = await fetch();
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
main();
