import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Service } from "react-native-zeroconf";
import { syncData, syncDevice } from "@/types/Data";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useWindowDimensions, View } from "react-native";
import { Text } from '@/components/ui/text';
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, MonitorSmartphoneIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";


export default function SyncModal({ scanedDevice, data, open }: { scanedDevice: Set<Service>, data: syncDevice, open: boolean }) {

    const { width } = useWindowDimensions()
    const CarouselRef = useRef<ICarouselInstance>(null)
    const { colorScheme } = useColorScheme();

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

    const addDevice = (data: Service) => {

    }

    const removeDevice = (data: syncData) => {

    }

    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{data.data.length > 0 ? "Manage Sync" : "Setup Sync"}</DialogTitle>
                </DialogHeader>
                <Carousel loop={false} ref={CarouselRef} data={[{ id: 'manage' }, { id: 'info' }, { id: 'add' }, { id: "confirm" }]} renderItem={({ item }) => (
                    <View className="flex-1">
                        {
                            item.id === "manage"
                                ?
                                <>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-base">Manage Devices</Text>
                                        <Button variant="default" onPress={next}><Text>Add new device</Text></Button>
                                    </View>
                                    <View className="flex-1 gap-2">
                                        {
                                            data.data.length > 0 ?
                                                data.data.map(item => (
                                                    <Card key={item.syncKey} className="justify-between items-center flex-row w-full">
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
                                                                    <Button onPress={() => { addDevice(item) }} className="bg-green-500" variant="default"><Text>Add</Text></Button>
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