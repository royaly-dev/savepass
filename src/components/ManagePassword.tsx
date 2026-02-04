import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Data, PasswordData } from "@/types/Data"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagePassword(props: {data: Data, updateData?: PasswordData, type: string, requestPassword: boolean, refresh(): void, openChange(): void} ) {

    const [password, setPassword] = useState<PasswordData>({accountid: "", id: (crypto as any).randomUUID(), password: "", url: "", mail: ""})

    useEffect(() => {
        if(props?.updateData?.id) {
            setPassword(props.updateData)
        }
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
        } catch (error) {
            toast.error("Your your must be a valid url !")
        }
    }

    return (
        <Dialog open={props.requestPassword} onOpenChange={() => {props.openChange(); setPassword({accountid: "", id: (crypto as any).randomUUID(), password: "", url: "", mail: ""})}} >
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>{props.type == "add" ? "Add a new Password" : "Modify your password"}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="url">URL</Label>
                    <Input value={password.url} onChange={(e) => {setPassword({...password, url: e.currentTarget.value})}} id="url" type="url"></Input>
                    <Label>Account</Label>
                    <Select value={password.accountid} onValueChange={(value) => {setPassword({...password, accountid: value})}}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">add an account</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="password">Password</Label>
                    <Input value={password.password} onChange={(e) => {setPassword({...password, password: e.currentTarget.value})}} id="password" type="password"></Input>
                    <Button onClick={savepassord} variant="default" className="w-full mt-4">Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}