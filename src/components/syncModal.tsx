import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import DeviceCard from './deviceCard';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { syncData, syncDevice } from "@/types/Data";
import { useEffect, useState } from "react";
import { Service } from "bonjour-service";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

export default function SyncModal({ ImportData, ExportData }: { ImportData(): void, ExportData(): void }) {

    const [syncDeviceModal, setSyncDeviceModal] = useState<{ open: boolean, type: number, data: syncData[] }>({ open: false, type: 1, data: [] })
    const [syncModalPairMode, setSyncModalPairMode] = useState<string>(null)
    const [foundDevices, setFoundDevices] = useState<(Service)[]>(null);
    const [syncDeviceData, setSyncDeviceData] = useState<syncDevice>(null)
    const [carouselApiModal, setCarouselApiModal] = useState<CarouselApi>()

    useEffect(() => {
        if (syncDeviceModal.open) {
            SyncSetup("add").then((value: Service[]) => { setFoundDevices(value.filter(item => typeof item === "object")) });
        }

        if (!syncDeviceModal.open) {
            setFoundDevices([]);
        }

        GetSyncStatus()
    }, [syncDeviceModal.open]);

    const GetSyncStatus = async () => {
        const syncdata: syncDevice = await (window as any).savepass.GetSyncStatus()
        setSyncDeviceData(syncdata)
        if (syncDeviceModal.open) {
            setSyncDeviceModal({ ...syncDeviceModal, data: syncdata.data })
        }
    }

    const SyncSetup = async (type: string) => {
        return await (window as any).savepass.SyncSetup(type)
    }

    const addSyncDevice = async (data: { newdevice: syncData, ip: string }) => {
        await (window as any).savepass.addSyncDevice(data)
        GetSyncStatus()
    }

    const removeSyncDevice = async (data: syncData) => {
        await (window as any).savepass.removeSyncDevice(data)
        GetSyncStatus()
    }

    const next = async () => {
        if (!carouselApiModal) {
            return
        }

        if (syncModalPairMode === "Wait") {
            carouselApiModal.scrollTo(3)
            SyncSetup("wait")
        } else {
            carouselApiModal.scrollNext()
        }
    }

    return (
        <div className='h-screen py-4 flex items-start flex-col'>
            <Dialog onOpenChange={() => { setSyncDeviceModal({ open: false, data: [], type: 0 }) }} open={syncDeviceModal.open}>
                <DialogContent>
                    <DialogHeader>
                        {syncDeviceData?.status ? "Manage Sync" : "Setup Sync"}
                    </DialogHeader>
                    <Carousel className="min-w-0" setApi={setCarouselApiModal} opts={{ watchDrag: false, startIndex: syncDeviceModal.type }}>
                        <CarouselContent>
                            <CarouselItem className="flex justify-center items-center flex-col gap-2.5">
                                <Button variant='default' className='self-end' disabled={syncModalPairMode === null} onClick={() => { next() }}>Add a Device</Button>
                                {
                                    syncDeviceData?.data && syncDeviceData.data.map((item) => (
                                        <DeviceCard name={item.name} type='remove' request={() => { removeSyncDevice(item) }} />
                                    ))
                                }
                            </CarouselItem>
                            <CarouselItem className='flex justify-center items-center flex-col gap-2.5'>
                                <RadioGroup value={syncModalPairMode} onValueChange={setSyncModalPairMode}>
                                    <FieldLabel htmlFor="Search">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Search for a Device</FieldTitle>
                                                <FieldDescription>
                                                    This device will search for another device that is waiting to be paired.
                                                </FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value="Search" id="Search" />
                                        </Field>
                                    </FieldLabel>
                                    <FieldLabel htmlFor="Wait">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Wait to be Paired</FieldTitle>
                                                <FieldDescription>
                                                    This device will wait for another device to find and pair with it.
                                                </FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value="Wait" id="Wait" />
                                        </Field>
                                    </FieldLabel>
                                </RadioGroup>
                                <Button variant='default' className='self-end' disabled={syncModalPairMode === null} onClick={() => { next() }}>Next</Button>
                            </CarouselItem>
                            <CarouselItem>
                                <Button onClick={() => { setFoundDevices(null); SyncSetup("add").then((value: Service[]) => { setFoundDevices(value.filter(item => typeof item === "object")) }) }}>refresh</Button>
                                {
                                    foundDevices === null
                                        ? <p>Searcing...</p>
                                        : foundDevices.length === 0
                                            ? <p>No device found</p>
                                            : foundDevices.map((item) => {
                                                return item.name && <DeviceCard key={item.name.split("-")[item.name.split("-").length - 1]} name={item?.host} type='add' request={async () => { await addSyncDevice({ ip: item.addresses[0], newdevice: { syncKey: item.name.split("-")[item.name.split("-").length - 1], name: item.host, lastSync: Date.now() } }).then(() => { next() }) }} />
                                            })
                                }
                            </CarouselItem>
                            <CarouselItem className='flex justify-center items-center flex-col gap-4'>
                                <Check size={64} color='#fff' className='rounded-full p-2 bg-green-500' />
                                <p className='font-medium text-base'>{syncModalPairMode === "Wait" ? "Your device is now waiting to be paired !" : "Your device is now successfully paired !"}</p>
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
                </DialogContent>
            </Dialog>
            <div>
                <Button onClick={() => { ImportData() }} variant='default'>Import</Button>
                <Button onClick={() => { ExportData() }} variant='default'>Export</Button>
            </div>
            <div>
                <Button variant='default' onClick={async () => {
                    setSyncDeviceModal({ open: true, data: syncDeviceData?.data, type: syncDeviceData?.status ? 0 : 1 })
                }}>{syncDeviceData?.status ? "Manage Sync" : "Setup Sync"}</Button>
                {JSON.stringify(syncDeviceModal)}
                <div>
                    <p>Status : <span>{syncDeviceData?.status ? "Enabled" : "Disabled"}</span></p>
                    <p>Last sycn : <span>{new Date(syncDeviceData?.lastSync).toLocaleDateString()}</span></p>
                    <p>connected device : <span>{syncDeviceData?.data.length}</span></p>
                </div>
            </div>
        </div >
    )
}