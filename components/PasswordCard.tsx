import { PasswordData } from "@/types/Data"
import { Card, CardContent } from "./ui/card"
import { ArrowUpRight, Copy, EllipsisVertical, Eye, EyeOff, Globe } from "lucide-react-native"
import { useState } from "react"
import { Image, Pressable, TouchableOpacity, View } from "react-native"
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
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

export default function PassowrdCard({ data, requestDelete, requestEdit }: { data: PasswordData, requestEdit(data: PasswordData): void, requestDelete(data: PasswordData): void }) {

    const [errorLoadingImage, setErrorLoadingImage] = useState<boolean>(false)
    const [showpass, setShowpass] = useState<boolean>(false)
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const openLink = (url: string) => {
        Linking.openURL(url)
    }

    const copyToClipBoard = async (text: string) => {
        await Clipboard.setStringAsync(text)
    }

    return (
        <Card key={data.id} className="w-full p-3">
            <CardContent className="flex justify-between items-center flex-row gap-2 px-0">
                <View className="flex justify-center items-center flex-row gap-2">
                    {errorLoadingImage
                        ? <View className="p-3 box-content rounded-md relative overflow-hidden"><Globe size={32} color="#0769e1e8" className="p-3 box-content bg-[#0769e152] rounded-md" /></View>
                        : <View className="p-3 box-content rounded-md relative overflow-hidden">
                            <Image style={{ height: 32, width: 32, borderRadius: 8 }} src={"https://www.google.com/s2/favicons?domain=" + new URL(data.url)} onError={() => { setErrorLoadingImage(true) }} className="z-10 relative" />
                        </View>
                    }
                    <View className="flex justify-center items-start flex-col">
                        <View className="flex justify-center items-center flex-row group cursor-pointer">
                            <Text onPress={() => { openLink(data.url) }}>{new URL(data.url).host.length > 15 ? new URL(data.url).host.slice(0, 15) + "..." : new URL(data.url).host}</Text>
                            <ArrowUpRight onPress={() => { openLink(data.url) }} color={colorScheme === "dark" ? "#fff" : "#000"} className="group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200" size={24} />
                        </View>
                        <View className="text-muted-foreground flex justify-center flex-row items-center gap-1">
                            <Text onPress={() => { copyToClipBoard(data.mail) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">{data.mail.length > 10 ? data.mail.slice(0, 7) + "..." : data.mail}</Text>
                            <Text onPress={() => { copyToClipBoard(data.password) }} className="p-0.5 px-1 hover:bg-muted-foreground hover:text-white rounded-sm cursor-pointer transition-all duration-300">
                                {showpass
                                    ? data.password.length > 10 ? data.password.slice(0, 7) + "..." : data.password
                                    : "********"}
                            </Text>
                        </View>
                    </View>
                </View>
                <View className="flex justify-center flex-row items-center gap-2.5">
                    {
                        !showpass
                            ? <Eye onPress={() => { setShowpass(true) }} size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                            : <EyeOff onPress={() => { setShowpass(false) }} size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    }
                    <Copy onPress={() => { copyToClipBoard(data.password) }} size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" />
                    <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical size={18} color={colorScheme === "dark" ? "#fff" : "#000"} className="cursor-pointer p-1 box-content hover:bg-muted-foreground/50 rounded-md duration-300 transition-all" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onPress={() => { requestEdit(data) }} variant="default"><Text>Modify</Text></DropdownMenuItem>
                            <DropdownMenuItem onPress={() => { requestDelete(data) }} variant="destructive"><Text>Delete</Text></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>
            </CardContent>
        </Card>
    )
}