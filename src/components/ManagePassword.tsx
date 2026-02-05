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
import { Data, PasswordData } from "@/types/Data"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagePassword(props: {data: Data, updateData?: PasswordData, type: string, requestPassword: boolean, refresh(): void, openChange(): void} ) {

    const [password, setPassword] = useState<PasswordData>({accountid: "", id: (crypto as any).randomUUID(), password: "", url: "", mail: ""})
    const [tempNewMailValue, setTempNewMailValue] = useState<string>(null)

    useEffect(() => {
        if(props?.updateData?.id) {
            setPassword(props.updateData)
        }

        console.log([...new Set(props?.data?.password?.map(p => p.mail))])
    }, [props.requestPassword])

    const savepassord = () => {
        try {
            let newdata = props.data
            if (props.type == "add") {
                newdata.password.push(password)
            } else {

                const index = newdata.password.findIndex(
                    item => item.id === password.id
                )

                if (index != -1) {
                    newdata.password[index] = password
                }
            }
            if (new URL(password.url).hostname) {
                (window as any).savepass.SaveData(newdata)
                props.openChange()
                setPassword({accountid: "", id: (crypto as any).randomUUID(), password: "", url: "", mail: ""})
            }
            setTempNewMailValue(null)
        } catch (error) {
            toast.error("Your your must be a valid url !")
        }
    }

    const existingMails = [...new Set(props?.data?.password?.map(p => p.mail).filter(Boolean)), (tempNewMailValue != null && tempNewMailValue)]

    return (
        <Dialog modal={false} open={props.requestPassword} onOpenChange={() => {props.openChange(); setPassword({accountid: "", id: (crypto as any).randomUUID(), password: "", url: "", mail: ""})}} >
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>{props.type == "add" ? "Add a new Password" : "Modify your password"}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="url">URL</Label>
                    <Input value={password.url} onChange={(e) => {setPassword({...password, url: e.currentTarget.value})}} id="url" type="url"></Input>
                    
                    <Label htmlFor="mail">Email / Username</Label>
                    <Combobox items={existingMails} onValueChange={(value) => {setPassword({...password, mail: String(value)})}} onInputValueChange={setTempNewMailValue}>
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

                    <Label htmlFor="password">Password</Label>
                    <Input value={password.password} onChange={(e) => {setPassword({...password, password: e.currentTarget.value})}} id="password" type="password"></Input>
                    <Button onClick={savepassord} variant="default" className="w-full mt-4">Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}