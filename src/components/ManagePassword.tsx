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
import { useState } from "react"
import { toast } from "sonner"

export default function ManagePassword(props: {data: Data, requestPassword: boolean, refresh(): void, openChange(): void} ) {

    const [password, setPassword] = useState<PasswordData>({accountid: "", id: (crypto as any).randomUUID(), password: "", url: ""})

    const savepassord = () => {
        try {
            let newdata = props.data
            newdata.password.push(password)
            if (new URL(password.url).hostname) {
                (window as any).savepass.SaveData(newdata)
                props.openChange()
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={props.requestPassword} onOpenChange={props.openChange} >
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>Add a new Password</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="url">URL</Label>
                    <Input onChange={(e) => {setPassword({...password, url: e.currentTarget.value})}} id="url" type="url"></Input>
                    <Label>Account</Label>
                    <Select value={password.accountid} onValueChange={(value) => {setPassword({...password, accountid: value})}}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                props?.data?.acount && props.data.acount.map((account) => {
                                    return (
                                        <SelectItem value={account.id}>{account.mail}</SelectItem>
                                    )
                                })
                            }
                            <SelectItem value="New">add an account</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="password">Password</Label>
                    <Input onChange={(e) => {setPassword({...password, password: e.currentTarget.value})}} id="password" type="password"></Input>
                    <Button onClick={savepassord} variant="default" className="w-full mt-4">Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}