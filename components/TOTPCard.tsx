import { OptData } from "@/types/Data"
import { Card, CardContent } from "./ui/card"
import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"
import { useColorScheme } from 'nativewind';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Text } from './ui/text';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

export default function TOTPCard({ data, requestDelete, time }: { data: OptData, time: number, requestDelete(data: OptData): void }) {

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const [key, setKey] = useState<number>(0)

    useEffect(() => {
        setKey(prev => prev + 1)
    }, [time])

    const copyToClipBoard = (text: string) => {

    }

    return (
        <Card key={data.id} className="w-full p-3">
            <CardContent className="flex justify-between items-center flex-row gap-2 px-0">
                <View className="flex justify-center items-center flex-row gap-2">
                    <View className="p-3 box-content rounded-md relative overflow-hidden"><Globe size={32} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md" /></View>
                    <View className="flex justify-center items-start flex-col mr-4">
                        <Pressable onPress={() => { copyToClipBoard(data.provider) }}>
                            <View className="flex justify-center items-center flex-row group cursor-pointer gap-2">
                                <Text>{data.provider.length > 8 ? data.provider.slice(0, 8) + "..." : data.provider}</Text>
                                <Text className="text-muted-foreground">{data.name.length > 8 ? data.name.slice(0, 8) + "..." : data.name}</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={() => { copyToClipBoard(data.key) }}>
                            <View className="text-muted-foreground flex justify-center flex-row items-center gap-1">
                                <Text className="font-['DM_Sans'] text-[28px] text-[#2F80ED] duration-150 transition-all group-hover:text-[#FFA184] font-bold tracking-[3px]">{data.key.slice(0, 3)} {data.key.slice(3, 6)}</Text>
                            </View>
                        </Pressable>
                    </View>
                    <CountdownCircleTimer
                        key={key}
                        duration={time}
                        strokeWidth={25}
                        size={50}
                        isPlaying
                        strokeLinecap="butt"
                        colors="#3b82f6"
                    />
                </View>
                <View className="flex justify-center flex-row items-center gap-2.5">
                    <Copy onPress={() => { copyToClipBoard(data.key) }} size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onPress={() => { requestDelete(data) }} variant="destructive"><Text>Delete</Text></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>
            </CardContent>
        </Card>
    )
}