fetch('https://localhost:9560/status')
.then(response => {
    if (response.status === 200) {
    document.querySelector('#msg').textContent = 'SavePass is running';
    } else {
    document.querySelector('#msg').textContent = 'SavePass is not running';
    }
})
.catch(error => {
    document.querySelector('#msg').textContent = 'SavePass is not running';
});