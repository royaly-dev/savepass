import {
    Dialog,
    DialogContent,
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
import { Check, CircleAlert, MonitorSmartphone } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export default function SyncModal({ ImportData, ExportData }: { ImportData(): void, ExportData(): void }) {

    const [syncDeviceModal, setSyncDeviceModal] = useState<{ open: boolean, type: number, data: syncData[] }>({ open: false, type: 1, data: [] })
    const [syncModalPairMode, setSyncModalPairMode] = useState<string>(null)
    const [foundDevices, setFoundDevices] = useState<(Service)[]>(null);
    const [syncDeviceData, setSyncDeviceData] = useState<syncDevice>(null)
    const [carouselApiModal, setCarouselApiModal] = useState<CarouselApi>()
    const [ErrMsg, setErrMsg] = useState<string>("")

    useEffect(() => {
        if (syncDeviceModal.open) {
            SyncSetup("add").then((value: Service[]) => { setFoundDevices(value.filter(item => typeof item === "object")) });
        }

        if (!syncDeviceModal.open) {
            setFoundDevices([]);
        }

        (window as any).savepass.syncRefresh(async () => {
            setSyncDeviceData(await (window as any).savepass.GetSyncStatus())
        })

        GetSyncStatus()

        return () => {
            setErrMsg("")
        }
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
        setErrMsg("")
        const addedDevice = await (window as any).savepass.addSyncDevice(data)
        if (addedDevice.confirm) {
            GetSyncStatus()
        } else {
            setErrMsg("The device is not reachable, check your firewall rules !")
        }
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
            carouselApiModal.scrollTo(4)
            SyncSetup("wait")
        } else {
            carouselApiModal.scrollNext()
        }
    }

    return (
        <div className='h-full py-4 flex items-start flex-col max-w-full w-full'>
            <Dialog onOpenChange={() => { setSyncDeviceModal({ open: false, data: [], type: 0 }) }} open={syncDeviceModal.open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{syncDeviceData?.status ? "Manage Sync" : "Setup Sync"}</DialogTitle>
                        {
                            ErrMsg && (
                                <Alert>
                                    <CircleAlert />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>
                                        {ErrMsg}
                                    </AlertDescription>
                                </Alert>
                            )
                        }
                    </DialogHeader>
                    <Carousel className="min-w-0" setApi={setCarouselApiModal} opts={{ watchDrag: false, startIndex: syncDeviceModal.type }}>
                        <CarouselContent>
                            <CarouselItem className="flex justify-start items-center flex-col gap-2.5">
                                <Button variant='default' className='self-end mt-2.5' onClick={() => { next() }}>Add a Device</Button>
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
                            <CarouselItem className='flex justify-between items-center flex-col gap-4'>
                                <div className="mt-4 flex justify-center items-center flex-col gap-1">
                                    <MonitorSmartphone size={64} color='#fff' className='rounded-full p-3 box-content bg-[#0769e152]' />
                                    <p className='font-medium text-base'>Now go to the other device and click on the "Wait to be paired" button, then click here on the "next" button.</p>
                                </div>
                                <Button variant='default' className='self-end' disabled={syncModalPairMode === null} onClick={() => { next() }}>Next</Button>
                            </CarouselItem>
                            <CarouselItem>
                                <Button className="my-2.5" onClick={() => { setFoundDevices(null); SyncSetup("add").then((value: Service[]) => { setFoundDevices(value.filter(item => typeof item === "object")) }) }}>refresh</Button>
                                <div className="flex justify-center items-center flex-col gap-2.5">
                                    {
                                        foundDevices === null
                                            ? <h3 className='text-xl text-muted-foreground'>Searching...</h3>
                                            : foundDevices.length === 0
                                                ? <h3 className='text-xl text-muted-foreground'>No device found</h3>
                                                : foundDevices.map((item) => {
                                                    return item.name && <DeviceCard key={item.name.split("_")[item.name.split("_").length - 1]} name={item?.host} type='add' request={async () => { await addSyncDevice({ ip: String(item.referer?.address), newdevice: { syncKey: item.name.split("_")[item.name.split("_").length - 1], name: item.host, lastSync: Date.now() } }).then(() => { next() }) }} />
                                                })
                                    }
                                </div>
                            </CarouselItem>
                            <CarouselItem className='flex justify-center items-center flex-col gap-4'>
                                <Check size={64} color='#fff' className='rounded-full p-2 bg-green-500' />
                                <p className='font-medium text-base'>{syncModalPairMode === "Wait" ? "Your device is now waiting to be paired !" : "Your device is now successfully paired !"}</p>
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
                </DialogContent>
            </Dialog>
            <div className="flex justify-center items-center gap-6 max-w-full w-full my-6">
                <Button className="flex-1 cursor-pointer text-lg" onClick={() => { ImportData() }} variant='default'>Import</Button>
                <Button className="flex-1 cursor-pointer text-lg" onClick={() => { ExportData() }} variant='default'>Export</Button>
            </div>
            <div className="flex justify-center items-center flex-col w-full">
                <Button className="w-full cursor-pointer mb-6 text-lg" variant='default' onClick={async () => {
                    setSyncDeviceModal({ open: true, data: syncDeviceData?.data, type: syncDeviceData?.status ? 0 : 1 })
                }}>{syncDeviceData?.status ? "Manage Sync" : "Setup Sync"}</Button>
                <div className="flex justify-start items-start flex-col w-full">
                    <p className="text-base">Status : <span>{syncDeviceData?.status ? "Enabled" : "Disabled"}</span></p>
                    <p className="text-base">Last sycn : <span>{new Date(syncDeviceData?.lastSync).toLocaleDateString()}</span></p>
                    <p className="text-base">connected device : <span>{syncDeviceData?.data.length}</span></p>
                </div>
            </div>
        </div >
    )
}