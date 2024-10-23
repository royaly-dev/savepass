window.addEventListener('load', async () => {
    // cheking if save pass is launched
    const check = await fetch('http://localhost:9560/status');
    if (check.status !== 200) {
        return;
    }

    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 0) {
        const additionalData = {
            site: window.location.hostname
        };

        // get the password with the url hostname
        chrome.runtime.sendMessage({ action: "getPassword", data: additionalData }, (response) => {
            console.log("Réponse reçue:", response);
            passwordFields.forEach(field => {
                console.log("Remplissage du champ de mot de passe");
                field.value = response.password;
                field.parentElement.querySelector('input[type="text"]').value = response.username;
            });
        });
    }
});