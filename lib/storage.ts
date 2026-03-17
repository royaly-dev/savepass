import { createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv'
import Aes from 'react-native-aes-crypto'
import { Data } from '@/types/Data'

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
        const decrypt = (await Aes.decrypt(String(instance.getString("test")), await Aes.sha256(key), String(instance.getString("iv")), 'aes-256-cbc')).toString()
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

    instance.set("iv", String(await Aes.randomKey(16)))

    instance.set("test", String((await Aes.encrypt("test", await Aes.sha256(key), String(instance.getString("iv")), 'aes-256-cbc'))))

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

    instance.set("data", String((await Aes.encrypt(JSON.stringify(data), KEY, String(instance.getString("iv")), 'aes-256-cbc'))))

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

    return <Data>JSON.parse(String((await Aes.decrypt(String(instance.getString("data")), KEY, String(instance.getString("iv")), 'aes-256-cbc'))))
}