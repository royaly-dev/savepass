import { Data, PasswordData } from "@/types/Data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Globe } from "lucide-react-native";
import { SaveStorageData } from "@/lib/storage";

export default function RecoverPassword({ data, refresh, open, onchange }: { open: boolean, data: Data, refresh(): void, onchange(value: boolean): void }) {

    const { width, height } = useWindowDimensions()

    const recover = async (recoverData: PasswordData) => {
        const index = data.password.findIndex(item => item.id === recoverData.id)
        if (index !== -1) {
            data.password[index] = { ...data.password[index], deleted: false, lastedit: Date.now() }
            await SaveStorageData(data)
            refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onchange}>
            <DialogContent className="flex-1" style={{ maxHeight: height - 150, width: width - 10 }}>
                <DialogHeader>
                    <DialogTitle>Recover Password</DialogTitle>
                </DialogHeader>
                <ScrollView contentContainerClassName="gap-2" >
                    {
                        data.password.filter(item => item.deleted).length > 0 ?
                            data.password.filter(item => item.deleted).map(item => (
                                <Card key={item.id} className="w-full p-3">
                                    <CardContent className="flex-row justify-between items-center gap-2 px-0">
                                        <View className="flex-row justify-center items-center gap-2">
                                            <View className="p-3 box-content bg-[#0769e152] rounded-md">
                                                <Globe size={24} color="#0769e1e8" />
                                            </View>
                                            <Text className="text-base">{new URL(item.url).host.slice(0, 10)}</Text>
                                        </View>
                                        <Button onPress={() => { recover(item) }} variant="default"><Text>Recover</Text></Button>
                                    </CardContent>
                                </Card>
                            )) : <View className="flex-1 justify-center items-center">
                                <Text className="text-muted-foreground text-base">No password to recover</Text>
                            </View>
                    }
                </ScrollView>
            </DialogContent>
        </Dialog>
    )
}