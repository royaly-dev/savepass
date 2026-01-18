import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff } from 'lucide-react'


export default function MasterPasswordCheck(props: {confirmCheck(): void}) {
    const [isRegister, setIsRegister] = useState<boolean>(false)
    const [pass, setPass] = useState<string>()

    useEffect(() => {
        const CurrentWindow = window
        const checkRegister = async () => {
            if (await (CurrentWindow as any).savepass.IsRegistred()) {
                setIsRegister(true)
            }
        }
        checkRegister()
    }, [])

    const checkMasterPassword = async (password: string) => {
        const CurrentWindow = window

        const check = await (CurrentWindow as any).savepass.Check(password)

        if (check) {
            toast.success("Your password has been unlocked !")
            setIsRegister(false)
            props.confirmCheck()
        } else {
            toast.error("The password you provided is incorrect !")
        }
    }

    return isRegister && (
            <Dialog open={isRegister} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>Unlock your password</DialogTitle>
                        <DialogDescription>
                            You need to type your master password to unlock your saved password.
                        </DialogDescription>
                    </DialogHeader>
                    <Label htmlFor="MasterPassword">Master Password :</Label>
                    <Input value={pass} onChange={(e) => {setPass(e.currentTarget.value)}} id="MasterPassword" name='MasterPassword' type='password' placeholder='cat123' />
                    <Button onClick={() => {checkMasterPassword(pass)}} variant="default">Unlock</Button>
                </DialogContent>
            </Dialog>
        )

    return (
        <></>
    )
}