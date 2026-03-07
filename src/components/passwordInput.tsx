import { useState } from "react";
import { Input } from "./ui/input";
import { EyeOff, Eye, RotateCcwKey } from "lucide-react";
import { getRandomValues } from "crypto";

export default function PasswordInput({ valueChange, value, form, id }: { valueChange?(text: string): void, value?: string, form: boolean, id: string }) {

    const [showPassword, setShowPassword] = useState<boolean>(false);

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

    if (!form) {
        return (
            <>
                <Input value={value} onChange={(e) => { valueChange(e.target.value) }} id={id} name={id} type={showPassword ? "text" : "password"} />
                {
                    showPassword
                        ? <EyeOff onClick={() => { setShowPassword(false) }} className='absolute right-3 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content bg-white' size={18} />
                        : <Eye onClick={() => { setShowPassword(true) }} className='absolute right-3 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content bg-white' size={18} />
                }
                <RotateCcwKey onClick={() => { valueChange(generatePassword()) }} className='absolute right-10 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content bg-white' size={18} />
            </>
        )
    }

    return (
        <>
            <Input id={id} name={id} type={showPassword ? "text" : "password"} />
            {
                showPassword
                    ? <EyeOff onClick={() => { setShowPassword(false) }} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
                    : <Eye onClick={() => { setShowPassword(true) }} className='absolute right-4 cursor-pointer hover:bg-foreground/20 p-1 rounded-sm box-content' size={18} />
            }
        </>
    )
}