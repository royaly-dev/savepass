import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Service } from "react-native-zeroconf";
import { syncData, syncDevice } from "@/types/Data";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useWindowDimensions, View } from "react-native";
import { Text } from '@/components/ui/text';
import { RefObject, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertCircleIcon, Check, MonitorSmartphoneIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { SetSyncData } from "@/lib/storage";
import { getDeviceName } from 'react-native-device-info'
import { Alert, AlertDescription } from "./ui/alert";


export const addDevice = async (dataAdd: Service, data: syncDevice, refreshData: () => void, setErrorMsg: (text: string) => void, CarouselRef?: RefObject<ICarouselInstance | null>) => {
    setErrorMsg("")
    const device = dataAdd.name.split("_")
    if (data.data.findIndex(item => item.syncKey === device[device.length - 1]) !== -1) {
        console.log("already added")
    } else {
        try {
            const req = await fetch("http://" + dataAdd.addresses[0] + ":5263/setupSync", {
                method: "POST",
                body: JSON.stringify({
                    name: await getDeviceName(),
                    syncKey: data.syncKey,
                    key: data.public
                })
            })
            if (req.status !== 200) {
                throw new Error("error")
            }
            data.data.push({ lastSync: Date.now(), name: device[0], syncKey: device[device.length - 1], public: (await req.json()).key })
        } catch (error) {
            console.log(error)
            setErrorMsg("The device is not reachable, check your firewall rules !")
            return
        }
        data.status = data.data.length > 0
        await SetSyncData(data)
    }
    if (CarouselRef?.current) {
        CarouselRef.current?.next()
    }
    refreshData()
}

export default function SyncModal({ scanedDevice, data, open, refreshData, onchange }: { scanedDevice: Set<Service>, data: syncDevice, open: boolean, refreshData(): void, onchange(value: boolean): void }) {

    const { width } = useWindowDimensions()
    const CarouselRef = useRef<ICarouselInstance>(null)
    const { colorScheme } = useColorScheme();
    const [ErrorMsg, setErrorMsg] = useState<string>("")

    useEffect(() => {
        if (CarouselRef) {
            if (data.data.length === 0) {
                CarouselRef.current?.scrollTo({ index: 2, animated: false })
            }
        }
    }, [CarouselRef])

    const next = () => {
        if (CarouselRef) {
            CarouselRef.current?.next()
        }
    }

    const removeDevice = async (dataRemove: syncData) => {
        const index = data.data.findIndex(item => item.syncKey === dataRemove.syncKey)

        if (index !== -1) {
            data.data = data.data.filter(item => item.syncKey !== dataRemove.syncKey)
        }

        const ip: string = Array.from(scanedDevice).filter(item => item.name.split("_")[item.name.split("_").length - 1] === dataRemove.syncKey)[0]?.addresses[0]

        try {
            if (ip) {
                fetch("http://" + ip + ":5263/removeSync", {
                    method: "POST",
                    body: JSON.stringify({
                        syncKey: data.syncKey,
                        name: await getDeviceName()
                    })
                })
            }
        } catch (error) {
        }

        data.status = data.data.length > 0

        await SetSyncData(data)
        refreshData()
    }

    return (
        <Dialog onOpenChange={onchange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{data.data.length > 0 ? "Manage Sync" : "Setup Sync"}</DialogTitle>
                    {
                        ErrorMsg && (
                            <Alert icon={AlertCircleIcon}>
                                <AlertDescription>{ErrorMsg}</AlertDescription>
                            </Alert>
                        )
                    }
                </DialogHeader>
                <Carousel enabled={false} loop={false} ref={CarouselRef} data={[{ id: 'manage' }, { id: 'info' }, { id: 'add' }, { id: "confirm" }]} renderItem={({ item }) => (
                    <View className="flex-1">
                        {
                            item.id === "manage"
                                ?
                                <>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-base">Manage Devices</Text>
                                        <Button variant="default" onPress={next}><Text>Add new device</Text></Button>
                                    </View>
                                    <View className="flex-1 gap-2 mt-4">
                                        {
                                            data.data.length > 0 ?
                                                data.data.map(item => (
                                                    <Card key={item.syncKey} className="justify-between items-center flex-row w-full p-2" style={{ width: '100%' }}>
                                                        <View className="flex-row gap-2">
                                                            <MonitorSmartphoneIcon color={colorScheme === 'dark' ? '#fff' : '#000'} />
                                                            <Text>{item.name}</Text>
                                                        </View>
                                                        <Button onPress={() => { removeDevice(item) }} variant="destructive"><Text>X</Text></Button>
                                                    </Card>
                                                )) :
                                                <Text className="text-base text-muted-foreground text-center mt-4">No devices found</Text>
                                        }
                                    </View>
                                </>
                                : item.id === "info" ?
                                    <View className="flex-1 justify-center items-center h-full gap-4">
                                        <MonitorSmartphoneIcon color={colorScheme === 'dark' ? '#fff' : '#000'} size={64} />
                                        <Text className="text-base text-center">Go to your PC and click on the "Wait to be paired" button, then click here on the "next" button.</Text>
                                        <Button onPress={next} className="w-full" variant="default"><Text>Next</Text></Button>
                                    </View>
                                    : item.id === "add" ?
                                        <View className="flex-1 gap-2">
                                            <Text className="text-xl">Devices list :</Text>
                                            {
                                                scanedDevice.size > 0 ?
                                                    <View className="flex-col justify-center items-center gap-2 overflow-y-auto">
                                                        {
                                                            Array.from(scanedDevice).map((item, index) => (
                                                                <Card className="justify-between items-center flex-row p-2" style={{ width: '100%' }} key={item.name + index}>
                                                                    <View className="flex-row gap-2 flex-1">
                                                                        <MonitorSmartphoneIcon color={colorScheme === 'dark' ? '#fff' : '#000'} />
                                                                        <Text>{item.name.split("_")[0]}</Text>
                                                                    </View>
                                                                    <Button onPress={() => { addDevice(item, data, refreshData, setErrorMsg, CarouselRef) }} className="bg-green-500" variant="default"><Text>Add</Text></Button>
                                                                </Card>
                                                            ))
                                                        }
                                                    </View>
                                                    : <Text className="text-base text-muted-foreground text-center mt-4">No devices found</Text>
                                            }
                                        </View>
                                        : item.id === "confirm" ?
                                            <View className="flex-1 justify-center items-center gap-4">
                                                <View className="rounded-full p-2 bg-green-500">
                                                    <Check size={64} color="#fff" />
                                                </View>
                                                <Text className="text-base">Your device is now successfully paired !</Text>
                                            </View>
                                            : null

                        }
                    </View>
                )} width={width - 60} height={300} />
            </DialogContent>
        </Dialog>
    )
}