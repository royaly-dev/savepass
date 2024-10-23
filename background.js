chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("Message reçu:", request);
  if (request.action === "getPassword") {
    const site = request.data.site;

    // Get the password
    const reqforpass = await fetch("http://localhost:9560/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ service: site })
    });

    const reqforpassJson = reqforpass.json();

    sendResponse({ password: reqforpassJson.password, user: reqforpassJson.username });
  }
});