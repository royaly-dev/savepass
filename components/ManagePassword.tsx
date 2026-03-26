import { PasswordData } from "@/types/Data";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import Aes from 'react-native-aes-crypto'
import { useWindowDimensions, View } from "react-native";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react-native";
import { Text } from "./ui/text";
import PasswordInput from "./PasswordInput";

export default function ManagePassword({ mode, edit, editData, open, modalClose }: { mode: "add" | "modifiy", edit: boolean, editData?: PasswordData | null, open: boolean, modalClose(data: PasswordData, confirm: boolean): void }) {

    const [password, setPassword] = useState<PasswordData | null>(null)
    const [ErrorMsg, setErrorMsg] = useState<string>("")
    const { width } = useWindowDimensions()

    useEffect(() => {
        const password = async () => {
            if (edit && editData) {
                setPassword(editData)
            } else {
                setPassword({ id: await Aes.randomUuid(), password: "", url: "", mail: "", deleted: false, lastedit: Date.now() })
            }
        }
        password()
    }, [open])

    const savepassord = () => {
        setErrorMsg("")
        if (password) {

            if (password.url) {
                try {
                    const urlcheck = new URL(password?.url)
                } catch (error) {
                    setErrorMsg("You need to provide a valid url like : https://exemple.com")
                    return
                }
            }

            if (!password.mail) {
                setErrorMsg("You need to provide a mail / username !")
                return
            }

            if (!password.password) {
                setErrorMsg("You need to provide a password !")
                return
            }

            if (edit) {
                password.lastedit = Date.now()
            }

            modalClose(password, true)

        }
    }

    if (password === null) {
        return
    }

    return (
        <Dialog open={open} onOpenChange={() => { modalClose(password, false); setErrorMsg("") }} >
            <DialogContent className="max-w-none" style={{ width: Number(width) - 24 }}>
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Add a new Password" : "Modify your password"}</DialogTitle>
                    {
                        ErrorMsg && <Alert icon={AlertCircle}>
                            <AlertDescription>{ErrorMsg}</AlertDescription>
                        </Alert>
                    }
                </DialogHeader>
                <View className="flex justify-center items-start flex-col gap-4">
                    <Label htmlFor="url" nativeID="url">URL (optional)</Label>
                    <Input value={password.url} onChange={(e) => { setPassword({ ...password, url: e.nativeEvent.text }) }} id="url" placeholder="https://exemple.com/" />

                    <Label htmlFor="mail" nativeID="mail">Email / Username</Label>
                    <Input value={password.mail} onChange={(e) => { setPassword({ ...password, mail: e.nativeEvent.text }) }} id="mail" placeholder="username" />

                    <Label htmlFor="password" nativeID="password">Password</Label>
                    <View className='relative flex justify-center items-center w-full'>
                        <PasswordInput gen id="password" onchange={(text) => { setPassword({ ...password, password: text }) }} value={password.password} />
                    </View>
                    <Button onPress={savepassord} variant="default" className="w-full mt-4"><Text>Save</Text></Button>
                </View>
            </DialogContent>
        </Dialog>
    )
}