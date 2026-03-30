import 'react-native-get-random-values'
import { createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv'
import { Data, syncDevice } from '@/types/Data'
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { RSA } from 'react-native-rsa-native';

let KEY = ""

export const isExist = () => {
    return existsMMKV("savepass")
}

export const GetStorage = async (key: string) => {

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    try {
        const decrypt = CryptoJS.AES.decrypt(String(instance.getString("test")), key).toString(CryptoJS.enc.Utf8)
        if (decrypt === "test") {
            KEY = key
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }

}

export const CreateStorage = async (key: string) => {

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    instance.set("test", String(CryptoJS.AES.encrypt("test", key)))

    instance.set("data", String(CryptoJS.AES.encrypt(JSON.stringify(<Data>{ password: [], opt: [] }), key)))

    const keyGen = await RSA.generateKeys(2048)

    instance.set("sync", String(JSON.stringify(<syncDevice>{ lastSync: 0, syncKey: uuidv4(), status: false, data: [], private: keyGen.private, public: keyGen.public })))

    return true

}

export const SaveStorageData = async (data: Data) => {
    if (!KEY || KEY.length < 1) {
        return false
    }

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    instance.set("data", String(CryptoJS.AES.encrypt(JSON.stringify(data), KEY)))

    return true
}

export const GetStorageData = async () => {
    if (!KEY || KEY.length < 1) {
        return false
    }

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    return <Data>JSON.parse(String(CryptoJS.AES.decrypt(String(instance.getString("data")), KEY).toString(CryptoJS.enc.Utf8)))
}

export const GetSyncData = async (): Promise<syncDevice | false> => {
    if (!KEY || KEY.length < 1) {
        return false
    }

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    return <syncDevice>JSON.parse(String(instance.getString("sync")))
}

export const SetSyncData = async (data: syncDevice) => {
    if (!KEY || KEY.length < 1) {
        return false
    }

    const instance = createMMKV({
        id: "savepass",
        mode: "multi-process",
        readOnly: false,
    })

    instance.set("sync", String(JSON.stringify(data)))

    return true
}