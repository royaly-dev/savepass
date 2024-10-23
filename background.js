chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPassword") {
    const site = request.data.site;


    const handleUpdateUser = async sendResponse => {

      // Get the password
      const reqforpass = await fetch("http://localhost:9560/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ service: site })
      });

      const reqforpassJson = await reqforpass.json();

      sendResponse({password: reqforpassJson.password, username: reqforpassJson.username});
    }

    handleUpdateUser(sendResponse);

    return true;
  }
});