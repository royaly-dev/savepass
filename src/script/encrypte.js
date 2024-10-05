const CryptoJS = require('crypto-js');

function encryptPassword(password, masterPassword) {
    return CryptoJS.AES.encrypt(password, masterPassword).toString();
}

function decryptPassword(encryptedPassword, masterPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, masterPassword);
    if (bytes.toString(CryptoJS.enc.Utf8) == '') {
        return null;
    } else {
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

let passwordManager = [];

function setpasswordManager(data) {
    passwordManager = data;
}

function getpasswordManager() {
    return passwordManager;
}

function addPassword(service, username, password, masterPassword) {
    if (passwordManager.find(entry => entry.service === service)) {
        console.log("service already exists");
        return null;
    }
    const encryptedPassword = encryptPassword(password, masterPassword);
    passwordManager.push({ service, username, encryptedPassword });
    return 1;
}

function modifPassword(service, username, password, masterPassword) {
    const index = passwordManager.findIndex(entry => entry.service === service);
    if (index !== -1) {
        const encryptedPassword = encryptPassword(password, masterPassword);
        passwordManager[index] = { service, username, encryptedPassword };
        return 1;
    } else {
        return null;
    }
}

function getPassword(service, masterPassword) {
    const entry = passwordManager.find(entry => entry.service === service);
    if (!entry) {
        console.log("service doesn't exist");
        return null;
    }
    const decryptedPassword = decryptPassword(entry.encryptedPassword, masterPassword);
    return decryptedPassword;
}

function deletePassword(service) {
    const index = passwordManager.findIndex(entry => entry.service === service);
    if (index !== -1) {
        passwordManager.splice(index, 1);
        return 0;
    } else {
        return null;
    }
}

module.exports = {
    addPassword,
    getPassword,
    deletePassword,
    passwordManager,
    setpasswordManager,
    getpasswordManager,
    modifPassword
}