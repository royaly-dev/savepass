import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { AccountData, PasswordData } from "@/types/Data";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";

export default function PasswordCard(props: { data: PasswordData, requestEdit(data: PasswordData): void, requestDelete(data: PasswordData): void }) {

    const [showpass, setShowpass] = useState<boolean>(false)

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
                    <Globe size={24} color="#169c92" className="p-3 box-content bg-[#aeddd9] rounded-md"/>
                    <div className="flex justify-center items-start flex-col">
                        <div onClick={() => {openLink(props.data.url)}} className="flex justify-center items-center group cursor-pointer">
                            <span>{new URL(props.data.url).host}</span>
                            <ArrowUpRight className="group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200" size={24} />
                        </div>
                        <div className="text-muted-foreground flex justify-center items-center gap-1">
                            <span onClick={() => {copyToClipBoard(props.data.mail)}} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{props.data.mail}</span>
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
                    <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {props.requestEdit(props.data)}} variant="default">Modify</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {props.requestDelete(props.data)}} variant="destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}