import { use, useEffect, useState } from 'react'
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

export default function MasterSetup() {
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
        <Dialog open={!isRegister} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-106.25">
                    <form onSubmit={async(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);

                        const master = formData.get("Master");
                        const masterCheck = formData.get("masterCheck");
                        
                        if (master.toString().length < 8) {
                            toast.error("Your password must be at least 8 characters")
                            return
                        }

                        if (master !== masterCheck) {
                            toast.error("Both passwords must be the same.")
                            return
                        }

                        await (window as any).savepass.RegisterMaster(master)
                        setIsRegister(!isRegister)
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
                                    <Input id="Master" name="Master" type={showPassword ? "text" : "password"} />
                                    {
                                        showPassword
                                        ? <EyeOff onClick={() => {setShowPassword(false)}} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
                                        : <Eye onClick={() => {setShowPassword(true)}} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
                                    }
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="masterCheck">Repeat password :</Label>
                                <div className='relative flex justify-center items-center'>
                                    <Input id="masterCheck" name="masterCheck" type={showPassword ? "text" : "password"} />
                                    {
                                        showPassword
                                        ? <EyeOff onClick={() => {setShowPassword(false)}} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
                                        : <Eye onClick={() => {setShowPassword(true)}} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
                                    }
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
