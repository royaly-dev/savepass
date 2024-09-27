const CryptoJS = require('crypto-js');

function encryptPassword(password, masterPassword) {
    return CryptoJS.AES.encrypt(password, masterPassword).toString();
}

function decryptPassword(encryptedPassword, masterPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, masterPassword);
    if (bytes.toString(CryptoJS.enc.Utf8) == '') {
        return null
    } else {
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

let passwordManager = {};

function addPassword(service, password, masterPassword) {
    if (passwordManager[service]) {
        return null
    }
    const encryptedPassword = encryptPassword(password, masterPassword);
    passwordManager[service] = encryptedPassword;
}

function getPassword(service, masterPassword) {
    if (!passwordManager[service]) {
        return null;
    }
    const decryptedPassword = decryptPassword(passwordManager[service], masterPassword);
    return decryptedPassword;
}

function deletePassword(service) {
    if (passwordManager[service]) {
        delete passwordManager[service];
        return 0
    } else {
        return null
    }
}

module.exports = {
    addPassword,
    getPassword,
    deletePassword,
    passwordManager
}
