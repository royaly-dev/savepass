window.addEventListener('load', async () => {
    // cheking if save pass is launched
    const check = await fetch('http://localhost:9560/status');
    if (check.status !== 200) {
        return;
    }

    const verifurl = window.location.href;
    if (!verifurl.includes('login') ) {
        return;
    }

    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 0) {
        const additionalData = {
            site: window.location.hostname
        };

        // get the password with the url hostname
        chrome.runtime.sendMessage({ action: "getPassword", data: additionalData }, (response) => {
            passwordFields.forEach(field => {
                field.value = response.password;
                if (field.parentElement.querySelector('input[type="text"]')) {
                    field.parentElement.querySelector('input[type="text"]').value = response.username;
                } else if (field.parentElement.querySelector('input[type="email"]')) {
                    field.parentElement.querySelector('input[type="email"]').value = response.username
                }
            });
        });
    }
});