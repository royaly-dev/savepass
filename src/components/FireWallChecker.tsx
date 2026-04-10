import { CircleAlertIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function FireWallChecker() {

    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        const checkFireWall = async () => {

            const savepass = (window as any).savepass

            const registered = await (window as any).savepass?.IsRegistred();

            if (!registered) return

            const Use = await savepass.GetUse()

            if (!Use) {
                setOpen(true)
            }
        }
        checkFireWall()
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Check your firewall !</DialogTitle>
                </DialogHeader>
                <Alert>
                    <CircleAlertIcon size={32} />
                    <AlertTitle>Check your firewall !</AlertTitle>
                    <AlertDescription>
                        Make sure your firewall doesn't block the local web server of the app, that makes the sync system not work properly. Please allow the following port on your firewall: 5263
                    </AlertDescription>
                </Alert>
                <Button variant="default" onClick={() => { setOpen(false) }}>Continue</Button>
            </DialogContent>
        </Dialog>
    )
}