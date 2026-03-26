import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe, MailIcon, User2Icon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { PasswordData } from "@/types/Data";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function RecoverPasswordCard(props: { data: PasswordData, requestRecover(data: PasswordData): void }) {

    const [showpass, setShowpass] = useState<boolean>(false)
    const [errorLoadingImage, setErrorLoadingImage] = useState<boolean>(false)

    const openLink = (link: string) => {
        (window as any).savepass.openLink(link)
    }

    const copyToClipBoard = (text: string) => {
        (window as any).savepass.copyToClipBoard(text)
        toast.success("Copied to clipboard !")
    }

    return (
        <Card key={props.data.id} className="w-full p-3">
            <CardContent className="flex justify-between items-center gap-2 px-0">
                <div className="flex justify-center items-center gap-2">
                    {props.data.url && (
                        errorLoadingImage
                            ? <Globe size={24} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md" />
                            : <div className="p-3 box-content rounded-md relative overflow-hidden">
                                <img style={{ height: 24, width: 24, minHeight: 24, minWidth: 24, borderRadius: "100%" }} src={"https://www.google.com/s2/favicons?domain=" + new URL(props.data.url)} onError={() => { setErrorLoadingImage(true) }} className="z-10 relative" />
                                <img src={"https://www.google.com/s2/favicons?domain=" + new URL(props.data.url)} onError={() => { setErrorLoadingImage(true) }} className="absolute w-full top-0 left-0 z-0 rounded-md blur-md" />
                            </div>
                    )
                    }
                    {
                        !props.data.url && (
                            props.data.mail.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                                ? <MailIcon size={24} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md" />
                                : <User2Icon size={24} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md" />
                        )
                    }
                    <div className="flex justify-center items-start flex-col">
                        <div onClick={() => { openLink(props.data.url) }} className="flex justify-center items-center group cursor-pointer">
                            {
                                props.data.url && (
                                    <>
                                        <span>{new URL(props.data.url).host}</span>
                                        <ArrowUpRight className="group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200" size={24} />
                                    </>
                                )
                            }
                            {
                                !props.data.url && <span onClick={() => { copyToClipBoard(props.data.mail) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{props.data.mail.length > 20 ? props.data.mail.slice(0, 18) + "..." : props.data.mail}</span>
                            }
                        </div>
                        <div className="text-muted-foreground flex justify-center items-center gap-1">
                            <span onClick={() => { copyToClipBoard(props.data.mail) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{props.data.mail.length > 20 ? props.data.mail.slice(0, 18) + "..." : props.data.mail}</span>
                            <span onClick={() => { copyToClipBoard(props.data.password) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{showpass ? props.data.password : "********"}</span>
                        </div>
                    </div>
                </div>
                <Button variant="default" className="cursor-pointer" onClick={() => { props.requestRecover(props.data) }}>Recover</Button>
            </CardContent>
        </Card>
    )
}