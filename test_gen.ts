async function run() {
  console.log("Initializing unit...");
  const initRes = await fetch("http://localhost:3000/api/units/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Unit",
      subject: "Physics",
      targetLevel: "High School",
      constraints: { difficulty: "CORE", answerRevealPolicy: "AFTER_ATTEMPT" },
      sources: [{ name: "Test source", preview: "A quick test." }],
      objectives: [{ identifier: "LO1", text: "Learn physics." }]
    })
  });
  
  if (!initRes.ok) {
    const text = await initRes.text();
    console.error("Initialize failed:", text);
    return;
  }
  
  const { unitId } = await initRes.json();
  console.log("Got unitId:", unitId);
  
  console.log("Generating...");
  const genRes = await fetch(`http://localhost:3000/api/units/${unitId}/generate`, {
    method: "POST"
  });
  
  if (!genRes.ok) {
    const text = await genRes.text();
    console.error("Generate failed:", text);
    return;
  }
  
  const genData = await genRes.json();
  console.log("Generate succeeded!", JSON.stringify(genData, null, 2));
}

run();
