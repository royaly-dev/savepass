import NodeRSA from "node-rsa";
import { ParentPort } from "electron";

const parentPort: ParentPort = process.parentPort

if (parentPort) {
    parentPort.on('message', (event) => {
        const { type, RSA, key, enc }: { type: string, RSA: string, key: string, enc: 'utf8' | 'base64' } = event.data

        const tempKeyRSA = new NodeRSA();
        tempKeyRSA.setOptions({ encryptionScheme: 'pkcs1' })

        if (type === "encrypt") {
            tempKeyRSA.importKey(RSA, 'pkcs1-public-pem')
            parentPort.postMessage(tempKeyRSA.encrypt(key, 'base64').toString())
        } else if (type === "decrypt") {
            tempKeyRSA.importKey(RSA, 'pkcs1-private-pem')
            parentPort.postMessage(tempKeyRSA.decrypt(key, enc).toString())
        } else if (type === "gen") {
            const RSAKey = tempKeyRSA.generateKeyPair(2048)
            parentPort.postMessage({ private: RSAKey.exportKey('pkcs1-private-pem'), public: RSAKey.exportKey('pkcs1-public-pem') })
        }
    })
}