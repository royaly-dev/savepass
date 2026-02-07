import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Data, OptData, PasswordData } from "@/types/Data"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManageTotp(props: {data: Data, request: boolean, refresh(): void, openChange(): void} ) {

    const [totp, setTotp] = useState<OptData>({key: "", id: (crypto as any).randomUUID(), name: "", provider: ""})
    const [tempNewMailValue, setTempNewMailValue] = useState<string>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        setTotp({key: "", id: (crypto as any).randomUUID(), name: "", provider: ""})
        if (props.request) {
            const timer = setTimeout(() => {
                setIsReady(true)
            }, 180) // remove the bug where the modal instently close in modify mode (because the modal is set to false)
            return () => clearTimeout(timer)
        } else {
            setIsReady(false)
        }
    }, [props.request])

    const savetopt = () => {
        try {
            let newdata = props.data
            newdata.opt.push(totp)
            setTempNewMailValue(null)
            if (newdata.opt[newdata.opt.length-1].key === totp.key) {
                (window as any).savepass.SaveData(newdata)
            }
            props.refresh()
        } catch (error) {
            toast.error("Your your must be a valid url !")
        }
    }

    const existingMails = [...new Set(props?.data?.password?.map(p => p.mail).filter(Boolean)), (tempNewMailValue != null && tempNewMailValue)]

    return (
        <Dialog modal={false} open={props.request && isReady} onOpenChange={() => {props.openChange(); setTotp({key: "", id: (crypto as any).randomUUID(), name: "", provider: ""})}} >
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>Add a new TOTP</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="website">WebSite name</Label>
                    <Input value={totp.provider} onChange={(e) => {setTotp({...totp, provider: e.currentTarget.value})}} id="website" type="text"></Input>
                    
                    <Label htmlFor="mail">Email / Username</Label>
                    <Combobox items={existingMails} onValueChange={(value) => {setTotp({...totp, name: String(value)})}} onInputValueChange={setTempNewMailValue}>
                        <ComboboxInput placeholder="Your email / username" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                    {item}
                                    </ComboboxItem>
                                )}
                                </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    <Label htmlFor="totpKey">TOTP Key</Label>
                    <Input value={totp.key} onChange={(e) => {setTotp({...totp, key: e.currentTarget.value})}} id="totpKey" type="totpKey"></Input>
                    <Button onClick={savetopt} variant="default" className="w-full mt-4">Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}