import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { AccountData, OptData, PasswordData } from "@/types/Data";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";

export default function OptCodeCard(props: { data: OptData, time: number, requestDelete(data: OptData): void }) {

    const copyToClipBoard = (text: string) => {
        (window as any).savepass.copyToClipBoard(text)
        toast.success("Copied to clipboard !")
    }

    return (
        <Card key={props.data.id} className="w-full p-3">
            <CardContent className="flex justify-center items-center gap-2 px-0">
                <div className="flex justify-between items-center w-full gap-2">
                    <Globe size={24} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md"/>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex justify-center items-start flex-col">
                            <div className="flex justify-center items-center gap-2">
                                <h1 className="font-[DM_Sans] text-sm font-medium text-[#4C506B] hover:bg-muted-foreground rounded-lg cursor-pointer duration-150 transition-all hover:text-white px-1" onClick={() => {copyToClipBoard(props.data.name)}}>{props.data.name}</h1>
                                <span className="font-[DM_Sans] text-xs text-[#9FA2B2] font-normal">{props.data.provider}</span>
                            </div>
                            <div className="flex justify-center">
                                <p style={{ fontFeatureSettings: "'liga' off, 'clig' off" }} className="flex justify-center items-center gap-2 hover:bg-muted-foreground rounded-lg cursor-pointer duration-150 transition-all group px-1" onClick={() => {copyToClipBoard(props.data.key)}}>
                                    <span className="font-['DM_Sans'] text-[28px] text-[#2F80ED] duration-150 transition-all group-hover:text-[#FFA184] font-bold tracking-[3px]">{props.data.key.slice(0,3)}</span>
                                    <span className="font-['DM_Sans'] text-[28px] text-[#2F80ED] duration-150 transition-all group-hover:text-[#FFA184] font-bold tracking-[3px]">{props.data.key.slice(3,6)}</span>
                                </p>
                            </div>
                        </div>
                        <CircleLoader value={props.time} max={30} size={50} />
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2.5">
                    <Copy onClick={() => {copyToClipBoard(props.data.key)}} size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical size={18} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {props.requestDelete(props.data)}} variant="destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}

const CircleLoader = ({ value, max = 30, size = 150 }: {value: number, max: number, size: number}) => {
  const degree = (value / max) * 360;
  
  return (
    <div className="mr-3" style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `conic-gradient(#3b82f6 ${degree}deg, #e5e7eb 0deg)`,
      transition: 'background 0.5s ease-in-out',
      transform: 'scaleX(-1)'
    }} />
  );
};