import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
    Option,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollView, View } from "react-native"
import { Text } from '@/components/ui/text';
import { Input } from "./ui/input"
import { Data, OptData } from "@/types/Data"
import { SaveStorageData } from "@/lib/storage"
import TOTPCard from "./TOTPCard"
import ManageTOTP from "./ManageTOTP"
import { generate } from "otplib";
import { getRemainingTime } from "@otplib/totp";

export default function TOTPArea({ data, refresh }: { data: Data, refresh(): void }) {
    const [SelectValueSearch, setSelectValueSearch] = useState<Option>({ label: "Site", value: "web" })
    const [SearchInput, setSearchInput] = useState<string>("")
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [RemainingTime, setRemainingTime] = useState<number>(30)
    const [TOTPcode, setTOTPcode] = useState<OptData[] | null>([])

    useEffect(() => {
        genTOTP()
    }, [data])

    const genTOTP = async () => {
        const remaing = getRemainingTime()
        setRemainingTime(remaing)
        const codes: OptData[] = []
        for (const TOTPData of data.opt) {
            try {
                codes.push({ ...TOTPData, key: await generate({ secret: TOTPData.key }) })
            } catch (error) {
                codes.push({ ...TOTPData, key: "000000", provider: "invalid", name: "invalid" })
            }
        }
        setTOTPcode(codes)
        setTimeout(() => {
            genTOTP()
        }, remaing * 1000);
    }


    const onModalClose = async (Modaldata: OptData, confirm: boolean) => {
        setModalOpen(false)
        if (confirm) {
            data.opt.push(Modaldata)
            await SaveStorageData(data)
            refresh()
        }
    }

    const RequestDelete = async (DeleteData: OptData) => {
        const index = data.opt.findIndex(item => item.id === DeleteData.id)
        if (index !== -1) {
            data.opt[index] = { ...DeleteData, deleted: true, key: data.opt[index].key }
            await SaveStorageData(data)
            refresh()
        }
    }

    return (
        <View className="flex-1">
            <View className="w-full flex-row justify-start items-center gap-2 py-2">
                <Button onPress={() => { setModalOpen(true) }} variant="default"><Text className="dark:text-black text-white">Add Auth</Text></Button>
                <Select value={SelectValueSearch} onValueChange={setSelectValueSearch}>
                    <SelectTrigger>
                        <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent position='popper'>
                        <SelectGroup>
                            <SelectItem value="name" key={'name'} label={'Mail'} />
                            <SelectItem value="web" key={'web'} label={'Site'} />
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input value={SearchInput} onChangeText={setSearchInput} className="flex-1" placeholder="Search" />
            </View>
            <ScrollView className="flex-1" contentContainerClassName="gap-2">
                {TOTPcode?.map((item, index) => {
                    return (
                        SelectValueSearch?.value === "web"
                            ? item.provider.includes(SearchInput) && !item.deleted && <TOTPCard data={item} time={RemainingTime} requestDelete={RequestDelete} key={index} />
                            : item.name.includes(SearchInput) && !item.deleted && <TOTPCard data={item} time={RemainingTime} requestDelete={RequestDelete} key={index} />
                    )
                })}
            </ScrollView>
            <ManageTOTP open={modalOpen} modalClose={onModalClose} />
        </View>
    )
}