import { useState } from "react";
import { Input } from "./ui/input";
import { TextInputChangeEvent, View } from "react-native";
import { Eye, EyeOff, RotateCcwKey } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./ui/icon";

export default function PasswordInput({ value, onchange, gen, id, className }: { value: string, onchange(text: string): void, gen: boolean, id: string, className?: string }) {
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const generatePassword = () => {
        let pass = '';
        let finalPass = '';

        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz';
        const specialstr = '@#$_-';
        const numbers = '0123456789';

        for (let i = 1; i <= 30 * 3; i++) {
            let rndm_idx = Math.floor(Math.random()
                * str.length + 1);

            pass += str.charAt(rndm_idx)

            rndm_idx = Math.floor(Math.random()
                * specialstr.length + 1);

            pass += specialstr.charAt(rndm_idx)

            rndm_idx = Math.floor(Math.random()
                * numbers.length + 1);

            pass += numbers.charAt(rndm_idx)
        }

        for (let i = 1; i <= 30; i++) {

            let rndm_idx = Math.floor(Math.random()
                * pass.length + 1);

            finalPass += pass.charAt(rndm_idx)

        }

        return finalPass;
    }

    return (
        <>
            <Input value={value} onChange={(e) => { onchange(e.nativeEvent.text) }} id={id} nativeID={id} secureTextEntry={!showPassword} className={className} />
            <View className="absolute flex-1 self-end flex-row px-4 gap-2 elevation">
                {
                    showPassword
                        ? <Icon as={EyeOff} onPress={() => { setShowPassword(false) }} className="bg-muted rounded-sm" size={22} />
                        : <Icon as={Eye} onPress={() => { setShowPassword(true) }} className="bg-muted rounded-sm" size={22} />
                }
                {gen && <Icon as={RotateCcwKey} onPress={() => { onchange(generatePassword()) }} className="bg-muted rounded-sm" size={22} />}
            </View>
        </>
    )
}