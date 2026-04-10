import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GetStorage } from '@/lib/storage';
import { Text } from './ui/text';
import { Label } from './ui/label';
import { View } from 'react-native';
import { Alert, AlertTitle } from './ui/alert';
import { AlertCircleIcon } from 'lucide-react-native';
import PasswordInput from './PasswordInput';
import ResetPasswordModal from './ResetPasswordModal';

export default function CheckPasswordCard({ PasswordChecked }: { PasswordChecked(): void }) {

    const [MastrePass, setMasterPass] = useState<string>("")
    const [ErrorMsg, setErrorMsg] = useState<string>("")

    const CheckPassword = async () => {
        setErrorMsg("")
        const storage = await GetStorage(MastrePass)
        if (storage) {
            PasswordChecked()
        } else {
            setErrorMsg("The password you provided is not correct !")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unlock your password</CardTitle>
                <CardDescription>
                    You need to type your master password to unlock your saved password.
                </CardDescription>
                {
                    ErrorMsg.length > 0 && (
                        <Alert icon={AlertCircleIcon} variant='destructive'>
                            <AlertTitle>{ErrorMsg}</AlertTitle>
                        </Alert>
                    )
                }
            </CardHeader>
            <CardContent className='flex justify-center items-start flex-col w-full gap-4'>
                <Label className='self-start' htmlFor='master' nativeID='master'><Text>Master Password :</Text></Label>
                <View className='relative flex justify-center items-center w-full'>
                    <PasswordInput gen={false} id='master' onchange={setMasterPass} value={MastrePass} />
                </View>
                <Button className='w-full' variant="default" onPress={async () => { CheckPassword() }} ><Text>Unlock</Text></Button>
                <ResetPasswordModal />
            </CardContent>
        </Card>
    )
}