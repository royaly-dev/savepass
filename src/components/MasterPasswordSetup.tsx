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

export default function MasterPasswordSetup() {
    const [isRegister, setIsRegister] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        const getregistred = async () => {
            const registered = await (window as any).savepass?.IsRegistred();
            setIsRegister(registered)
        }
        getregistred()
    }, []);

    return (
        <Dialog open={!isRegister} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-106.25">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget)

                    const master = String(formData.get("Master"))
                    const masterCheck = String(formData.get("masterCheck"))

                    console.log(master)
                    console.log(masterCheck)

                    if (master.toString().length < 8) {
                        toast.error("Your password must be at least 8 characters")
                        return
                    }

                    if (master !== masterCheck) {
                        toast.error("Both passwords must be the same.")
                        return
                    }

                    const register = await (window as any).savepass.Register(master)

                    if (register) {
                        setIsRegister(!isRegister)
                        toast.success("Your password has been successfully saved !")
                        window.location.reload()
                    } else {
                        toast.error("An error occurred")
                    }

                }}>
                    <DialogHeader>
                        <DialogTitle>Setup your Master password</DialogTitle>
                        <DialogDescription>
                            This is the only password you need to remember, it's the key that secures all of your passwords in this application.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 mt-4">
                        <div className="grid gap-3">
                            <Label htmlFor="Master">Password :</Label>
                            <div className='relative flex justify-center items-center'>
                                <PasswordInput form id='Master' />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="masterCheck">Repeat password :</Label>
                            <div className='relative flex justify-center items-center'>
                                <PasswordInput form id='masterCheck' />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className='cursor-pointer mt-4' type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
