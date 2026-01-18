import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { AccountData, PasswordData } from "@/types/Data";
import { useState } from "react";

export default function PasswordCard(props: { data: PasswordData, account: AccountData }) {

    const [showpass, setShowpass] = useState<boolean>(false)

    const openLink = (link: string) => {
        (window as any).savepass.openLink(link)
    }

    const copyToClipBoard = (text: string) => {
        (window as any).savepass.copyToClipBoard(text)
    }

    return (
        <Card className="w-full p-3">
            <CardContent className="flex justify-between items-center gap-2 px-0">
                <div className="flex justify-center items-center gap-2">
                    <Globe size={24} color="#169c92" className="p-3 box-content bg-[#aeddd9] rounded-md"/>
                    <div className="flex justify-center items-start flex-col">
                        <div onClick={() => {openLink(props.data.url)}} className="flex justify-center items-center group cursor-pointer">
                            <span>{new URL(props.data.url).host}</span>
                            <ArrowUpRight className="group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200" size={24} />
                        </div>
                        <div className="text-muted-foreground flex justify-center items-center gap-1">
                            <span onClick={() => {copyToClipBoard(props.account.mail)}} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{props.account.mail}</span>
                            <span onClick={() => {copyToClipBoard(props.data.password)}} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{showpass ? props.data.password : "********"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2.5">
                    {
                        !showpass
                        ? <Eye onClick={() => {setShowpass(true)}} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                        : <EyeOff onClick={() => {setShowpass(false)}} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    }
                    <Copy onClick={() => {copyToClipBoard(props.data.password)}} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    <EllipsisVertical size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                </div>
            </CardContent>
        </Card>
    )
}