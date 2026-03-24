import { useState } from "react"
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
import PassowrdCard from "./PasswordCard"
import { Data, PasswordData } from "@/types/Data"
import ManagePassword from "./ManagePassword"
import { SaveStorageData } from "@/lib/storage"

export default function PasswordArea({ data, refresh }: { data: Data, refresh(): void }) {
    const [SelectValueSearch, setSelectValueSearch] = useState<Option>({ label: "Site", value: "web" })
    const [SearchInput, setSearchInput] = useState<string>("")
    const [editData, setEditData] = useState<PasswordData | null>(null)
    const [modalOpen, setModalOpen] = useState<boolean>(false)


    const onModalClose = async (Modaldata: PasswordData, confirm: boolean) => {
        setModalOpen(false)
        if (confirm) {
            if (editData?.id) {
                const index = data.password.findIndex(item => item.id === Modaldata.id)
                if (index !== -1) {
                    data.password[index] = Modaldata
                    await SaveStorageData(data)
                }
            } else {
                data.password.push(Modaldata)
                await SaveStorageData(data)
            }
            refresh()
        }
        setEditData(null)
    }

    const RequestDelete = async (DeleteData: PasswordData) => {
        const index = data.password.findIndex(item => item.id === DeleteData.id)
        if (index !== -1) {
            data.password[index] = { ...DeleteData, deleted: true, lastedit: Date.now() }
            await SaveStorageData(data)
            refresh()
        }
    }

    return (
        <View className="flex-1">
            <View className="w-full flex-row justify-start items-center gap-2 py-2">
                <Button onPress={() => { setModalOpen(true) }} variant="default"><Text className="dark:text-black text-white">Add password</Text></Button>
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
                {data?.password.map((item, index) => (
                    SelectValueSearch?.value === "web"
                        ? item.url.includes(SearchInput) && !item.deleted && <PassowrdCard data={item} requestDelete={RequestDelete} requestEdit={(data) => { setModalOpen(true); setEditData(data) }} key={index} />
                        : item.mail.includes(SearchInput) && !item.deleted && <PassowrdCard data={item} requestDelete={RequestDelete} requestEdit={(data) => { setModalOpen(true); setEditData(data) }} key={index} />
                ))}
            </ScrollView>
            <ManagePassword mode={editData?.id ? "modifiy" : "add"} editData={editData} edit={editData?.id ? true : false} open={modalOpen} modalClose={onModalClose} />
        </View>
    )
}