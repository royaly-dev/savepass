import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CreateStorage, GetStorage } from '@/lib/storage';
import { Text } from './ui/text';
import { Label } from './ui/label';
import { View } from 'react-native';
import { Alert, AlertTitle } from './ui/alert';
import { AlertCircleIcon } from 'lucide-react-native';

export default function CreatePasswordCard({ PasswordCreated }: { PasswordCreated(): void }) {

    const [MastrePass, setMasterPass] = useState<string>("")
    const [MastrePassCheck, setMasterPassCheck] = useState<string>("")
    const [ErrorMsg, setErrorMsg] = useState<string>("")

    const CreatePassword = async () => {
        if (MastrePass !== MastrePassCheck) {
            return setErrorMsg("Both passwords must be the same.")
        } else if (MastrePass.length < 8) {
            return setErrorMsg("Your password must be at least 8 characters")
        }
        const create = await CreateStorage(MastrePass)
        if (create) {
            PasswordCreated()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Setup your Master password</CardTitle>
                <CardDescription className='mb-2'>
                    This is the only password you need to remember, it's the key that secures all of your passwords in this application.
                </CardDescription>
                {
                    ErrorMsg.length > 0 && (
                        <Alert icon={AlertCircleIcon} variant='destructive'>
                            <AlertTitle>{ErrorMsg}</AlertTitle>
                        </Alert>
                    )
                }
            </CardHeader>
            <CardContent className='flex justify-center items-start flex-col w-full'>
                <Label className='self-start' htmlFor='master' nativeID='master'><Text>Password :</Text></Label>
                <Input className='mt-2 mb-3' id="master" secureTextEntry placeholder='Your master password' value={MastrePass} onChangeText={setMasterPass} />
                <Label className='self-start' htmlFor='mastercheck' nativeID='mastercheck'><Text>Repeat password :</Text></Label>
                <Input className='mt-2 mb-5' id="mastercheck" secureTextEntry placeholder='Your master password' value={MastrePassCheck} onChangeText={setMasterPassCheck} />
                <Button className='w-full' variant="default" onPress={async () => { CreatePassword() }} ><Text>Create</Text></Button>
            </CardContent>
        </Card>
    )
}