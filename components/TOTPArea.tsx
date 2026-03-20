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
import { ScrollView, Text, View } from "react-native"
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
    const [editData, setEditData] = useState<OptData | null>(null)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [RemainingTime, setRemainingTime] = useState<number>(30)
    const [TOTPcode, setTOTPcode] = useState<OptData[] | null>([])

    useEffect(() => {
        genTOTP()
    }, [data])

    const genTOTP = async () => {
        console.log("render")
        const remaing = getRemainingTime()
        setRemainingTime(remaing)
        const codes: OptData[] = []
        for (const TOTPData of data.opt) {
            codes.push({ ...TOTPData, key: await generate({ secret: TOTPData.key }) })
        }
        setTOTPcode(codes)
        console.log(remaing)
        setTimeout(() => {
            genTOTP()
        }, remaing * 1000);
    }


    const onModalClose = async (Modaldata: OptData, confirm: boolean) => {
        setModalOpen(false)
        console.log(Modaldata)
        console.log(data.opt)
        if (confirm) {
            if (editData?.id) {
                const index = data.opt.findIndex(item => item.id === Modaldata.id)
                if (index !== -1) {
                    data.opt[index] = Modaldata
                    await SaveStorageData(data)
                }
            } else {
                data.opt.push(Modaldata)
                await SaveStorageData(data)
            }
            refresh()
        }
        setEditData(null)
    }

    const RequestDelete = async (DeleteData: OptData) => {
        const index = data.opt.findIndex(item => item.id === DeleteData.id)
        if (index !== -1) {
            data.opt[index] = { ...DeleteData, deleted: true }
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
            <ManageTOTP mode={editData?.id ? "modifiy" : "add"} open={modalOpen} modalClose={onModalClose} />
        </View>
    )
}