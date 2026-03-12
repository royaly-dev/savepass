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
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import PasswordInput from "./passwordInput"

export default function ManagePassword(props: { data: Data, updateData?: PasswordData, type: string, requestPassword: boolean, refresh(): void, openChange(): void }) {

    const [password, setPassword] = useState<PasswordData>({ id: (crypto as any).randomUUID(), password: "", url: "", mail: "", deleted: false, lastedit: Date.now() })
    const [tempNewMailValue, setTempNewMailValue] = useState<string>("")
    const tempNewMailRef = React.useRef<string>("")
    const selectedFromListRef = React.useRef(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (props.requestPassword) {
            const timer = setTimeout(() => {
                setIsReady(true)
            }, 180) // remove the bug where the modal instently close in modify mode (because the modal is set to false)
            return () => clearTimeout(timer)
        } else {
            setIsReady(false)
        }
    }, [props.requestPassword])

    useEffect(() => {
        if (props?.updateData?.id) {
            setPassword(props.updateData)
        }

        console.log([...new Set(props?.data?.password?.map(p => p.mail))])
    }, [props.requestPassword])

    const savepassord = () => {

        try {
            const testurl = new URL(password.url);
        } catch (error) {
            toast.error("You need to provide a valid URl (ex: https://name.com/)")
            return
        }

        password.lastedit = Date.now()
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

        (window as any).savepass.SaveData(newdata)
        props.openChange()
        setPassword({ id: (crypto as any).randomUUID(), password: "", url: "", mail: "", deleted: false, lastedit: Date.now() })
        setTempNewMailValue(null)
    }

    const existingMails = [...new Set(props?.data?.password?.map(p => p.mail).filter(Boolean)), (tempNewMailValue != null && tempNewMailValue)]

    return (
        <Dialog modal={false} open={props.requestPassword && isReady} onOpenChange={() => { props.openChange(); setPassword({ id: (crypto as any).randomUUID(), password: "", url: "", mail: "", deleted: false, lastedit: Date.now() }) }} >
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>{props.type == "add" ? "Add a new Password" : "Modify your password"}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="url">URL</Label>
                    <Input value={password.url} onChange={(e) => { setPassword({ ...password, url: e.currentTarget.value }) }} id="url" type="url" placeholder="https://exemple.com/"></Input>

                    <Label htmlFor="mail">Email / Username</Label>
                    <Combobox items={existingMails} value={password.mail}
                        onValueChange={(value) => {
                            selectedFromListRef.current = true; setPassword({
                                ...password, mail: String(value || "")
                            })
                        }}
                        onOpenChange={(open) => {
                            if (!open && !selectedFromListRef.current && tempNewMailRef.current) {
                                setPassword({ ...password, mail: tempNewMailRef.current })
                            }
                            selectedFromListRef.current = false
                        }}
                        onInputValueChange={(value) => {
                            setTempNewMailValue(value)
                            tempNewMailRef.current = value
                        }}>
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
                    <div className='relative flex justify-center items-center w-full'>
                        <PasswordInput form={false} value={password.password} valueChange={(text) => { setPassword({ ...password, password: text }) }} id="password" />
                    </div>
                    <Button onClick={savepassord} variant="default" className="w-full mt-4">Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}