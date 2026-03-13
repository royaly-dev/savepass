import { PasswordData } from "@/types/Data";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import RecoverPasswordCard from "./RecoverPasswordCard";

export default function RecoverPasswordModal({ data, requestRecover }: { data: PasswordData[], requestRecover(data: PasswordData): void }) {

    const [ModalOpen, setModalOpen] = useState<boolean>(false)

    return (
        <>
            <Button className="cursor-pointer text-lg w-full mt-2" onClick={() => { setModalOpen(true) }} variant="default" >Recover Password</Button>
            <Dialog open={ModalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        Recover your password
                    </DialogHeader>
                    <div style={{ scrollbarWidth: "thin" }} className="w-full max-h-[70vh] overflow-y-auto flex flex-col items-center gap-2 pr-2">
                        {
                            data.filter(item => item.deleted).length > 0
                                ? data.filter(item => item.deleted).map((item, index) => {
                                    return <RecoverPasswordCard key={index} data={item} requestRecover={requestRecover} />
                                })
                                : <div className='flex justify-center items-center flex-col'>
                                    <h3 className='text-xl text-muted-foreground'>No password to recover</h3>
                                </div>
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )

}