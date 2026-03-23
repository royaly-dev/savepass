import { GetSyncData } from "@/lib/storage"
import { syncData, syncDevice } from "@/types/Data"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { Text } from '@/components/ui/text';
import { Button } from "./ui/button"
import { Service } from "react-native-zeroconf"
import SyncModal from "./SyncModal"

export default function SettingsArea({ scanedDevice }: { scanedDevice: Set<Service> }) {

    const [SyncData, setSyncData] = useState<syncDevice | null>(null)

    useEffect(() => {
        const getsync = async () => {
            const tempsync = await GetSyncData()
            if (typeof tempsync !== "boolean") {
                setSyncData(tempsync)
            }
        }
        getsync()
    }, [])

    return (
        <View className="gap-2">
            <Button variant="default"><Text className="text-white dark:text-black">Recover password</Text></Button>
            <View className="w-full flex-row gap-4">
                <Button variant="default" className="flex-1"><Text className="text-white dark:text-black">Import</Text></Button>
                <Button variant="default" className="flex-1"><Text className="text-white dark:text-black">Export</Text></Button>
            </View>
            <Button variant="default"><Text className="text-white dark:text-black">{SyncData && SyncData?.data.length > 0 ? "Manage Sync" : "Setup Sync"}</Text></Button>
            <View className="w-full gap-1">
                <Text className="dark:text-white">Status : {SyncData?.status ? "Enabled" : "Disabled"}</Text>
                <Text className="dark:text-white">Last sycn : {new Date(Number(SyncData?.lastSync)).toLocaleDateString()}</Text>
                <Text className="dark:text-white">connected device : {SyncData?.data.length}</Text>
            </View>
            <SyncModal open data={SyncData || { data: [], lastSync: 0, status: false, syncKey: "test" }} scanedDevice={scanedDevice} />
        </View>
    )
}