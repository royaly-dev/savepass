import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GetStorage } from '@/lib/storage';
import { Text } from './ui/text';
import { Label } from './ui/label';
import { View } from 'react-native';

export default function CheckPasswordCard({ PasswordChecked }: { PasswordChecked(): void }) {

    const [MastrePass, setMasterPass] = useState<string>("")

    const CheckPassword = async () => {
        const storage = await GetStorage(MastrePass)
        if (storage) {
            PasswordChecked()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unlock your password</CardTitle>
                <CardDescription>
                    You need to type your master password to unlock your saved password.
                </CardDescription>
            </CardHeader>
            <CardContent className='flex justify-center items-start flex-col w-full'>
                <Label className='self-start' htmlFor='master' nativeID='master'><Text>Master Password :</Text></Label>
                <Input className='mt-2 mb-5' id="master" secureTextEntry placeholder='Your master password' value={MastrePass} onChangeText={setMasterPass} />
                <Button className='w-full' variant="default" onPress={async () => { CheckPassword() }} ><Text>Unlock</Text></Button>
            </CardContent>
        </Card>
    )
}