function passgenn(longueur) {

    const min = "abcdefghijklmnopqrstuvwxyz";
    const maj = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const number = "0123456789";
    const spec = "!@#$%:?/.*-_";

    let pass = [
        min[Math.floor(Math.random() * min.length)],
        maj[Math.floor(Math.random() * maj.length)],
        number[Math.floor(Math.random() * number.length)],
        spec[Math.floor(Math.random() * spec.length)]
    ];

    const all = min + maj + number + spec;
    for (let i = 4; i < longueur; i++) {
        pass.push(all[Math.floor(Math.random() * all.length)]);
    }

    pass = pass.sort(() => Math.random() - 0.5);

    return pass.join('');
}

module.exports = {
    passgenn
}