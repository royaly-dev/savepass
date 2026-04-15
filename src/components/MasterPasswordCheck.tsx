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
import PasswordInput from './passwordInput'
import ResetPasswordModal from './ResetPasswordModal'


export default function MasterPasswordCheck(props: { confirmCheck(): void }) {
    const [isRegister, setIsRegister] = useState<boolean>(false)

    useEffect(() => {
        const CurrentWindow = window
        const checkRegister = async () => {
            if (await (CurrentWindow as any).savepass.IsRegistred()) {
                setIsRegister(true)
            }
        }
        checkRegister()
        checkstart()
    }, [])

    const checkstart = async () => {
        const check = await (window as any).savepass.Check("test");
        console.log(check)
        if (check) {
            props.confirmCheck()
        }
    }

    return isRegister && (
        <Dialog open={isRegister} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-106.25">
                <form onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const password = String(formData.get("master"))
                    const check = await (window as any).savepass.Check(password);

                    if (check) {
                        toast.success("Your password has been unlocked !")
                        setIsRegister(false)
                        props.confirmCheck()
                    } else {
                        toast.error("The password you provided is incorrect !")
                    }
                }}>
                    <DialogHeader>
                        <DialogTitle>Unlock your password</DialogTitle>
                        <DialogDescription>
                            You need to type your master password to unlock your saved password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-3 mt-3'>
                        <Label htmlFor="master">Master Password :</Label>
                        <div className='relative flex justify-center items-center'>
                            <PasswordInput form id='master' />
                        </div>
                    </div>
                    <DialogFooter className='mt-3 flex justify-between! items-center!'>
                        <ResetPasswordModal />
                        <Button type='submit' variant="default">Unlock</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )

    return (
        <></>
    )
}