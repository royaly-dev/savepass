import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe, MailIcon, User2Icon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { PasswordData } from "@/types/Data";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";

export default function PasswordCard(props: { data: PasswordData, requestEdit(data: PasswordData): void, requestDelete(data: PasswordData): void }) {

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
                                <img style={{ height: 24, width: 24, borderRadius: "100%" }} src={"https://www.google.com/s2/favicons?domain=" + new URL(props.data.url)} onError={() => { setErrorLoadingImage(true) }} className="z-10 relative" />
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
                            {props.data.url && <span onClick={() => { copyToClipBoard(props.data.mail) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{props.data.mail.length > 20 ? props.data.mail.slice(0, 18) + "..." : props.data.mail}</span>}
                            <span onClick={() => { copyToClipBoard(props.data.password) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{showpass ?
                                props.data.password.length > 15 ? props.data.password.slice(0, 15) + "..." : props.data.password
                                : "********"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2.5">
                    {
                        !showpass
                            ? <Eye onClick={() => { setShowpass(true) }} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                            : <EyeOff onClick={() => { setShowpass(false) }} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    }
                    <Copy onClick={() => { copyToClipBoard(props.data.password) }} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { props.requestEdit(props.data) }} variant="default">Modify</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { props.requestDelete(props.data) }} variant="destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}