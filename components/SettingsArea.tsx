import { GetStorageData, GetSyncData, SaveStorageData, SetSyncData } from "@/lib/storage"
import { Data, syncData, syncDevice } from "@/types/Data"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { Text } from '@/components/ui/text';
import { Button } from "./ui/button"
import { Service } from "react-native-zeroconf"
import SyncModal from "./SyncModal"
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths, Directory } from 'expo-file-system';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import RecoverPassword from "./RecoverPasswordModal";

export default function SettingsArea({ scanedDevice, refresh, data }: { scanedDevice: Set<Service>, refresh(): void, data: Data }) {

    const [SyncData, setSyncData] = useState<syncDevice | null>(null)
    const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false)
    const [recoverModalOpen, setRecoverModalOpen] = useState<boolean>(false)

    useEffect(() => {
        getsync()
    }, [])

    const getsync = async () => {
        const tempsync = await GetSyncData()
        if (typeof tempsync !== "boolean") {
            setSyncData(tempsync)
        }
    }

    const importData = async () => {
        const selectedDocument = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: 'application/json' })
        if (!selectedDocument.canceled) {
            const data: Data = JSON.parse(new File(selectedDocument.assets[0].uri).textSync())
            if (data?.opt && data?.password) {
                await SaveStorageData(data)
                refresh()
            }
        }
    }

    const exportData = async () => {
        const directory = await Directory.pickDirectoryAsync("Documents")
        if (directory) {
            const file = directory.createFile("SavePassExport.json", "application/json")
            file.write(JSON.stringify(await GetStorageData()))
        }
    }

    return (
        <View className="gap-2">
            <Button onPress={() => { setRecoverModalOpen(true) }} variant="default"><Text className="text-white dark:text-black">Recover password</Text></Button>
            <View className="w-full flex-row gap-4">
                <AlertDialog className="flex-1">
                    <AlertDialogTrigger asChild>
                        <Button variant="default"><Text className="text-white dark:text-black">Import</Text></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will erase all of your password and TOTP code saved on this device.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                <Text>Cancel</Text>
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive" onPress={importData}>
                                <Text className="text-white">Continue</Text>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button onPress={exportData} variant="default" className="flex-1"><Text className="text-white dark:text-black">Export</Text></Button>
            </View>
            <Button onPress={() => { setSyncModalOpen(true) }} variant="default"><Text className="text-white dark:text-black">{SyncData && SyncData?.data.length > 0 ? "Manage Sync" : "Setup Sync"}</Text></Button>
            <View className="w-full gap-1">
                <Text className="dark:text-white">Status : {SyncData?.status ? "Enabled" : "Disabled"}</Text>
                <Text className="dark:text-white">Last sycn : {new Date(Number(SyncData?.lastSync)).toLocaleDateString()}</Text>
                <Text className="dark:text-white">connected device : {SyncData?.data.length}</Text>
            </View>
            <SyncModal open={syncModalOpen} onchange={setSyncModalOpen} data={SyncData || { data: [], lastSync: 0, status: false, syncKey: "test", private: "", public: "" }} scanedDevice={scanedDevice} refreshData={getsync} />
            <RecoverPassword onchange={setRecoverModalOpen} open={recoverModalOpen} refresh={refresh} data={data} />
        </View>
    )
}