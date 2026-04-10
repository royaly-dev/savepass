import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { Button } from './ui/button';
import { useState } from 'react';
import { resetStorage } from '@/lib/storage';
import RNRestart from 'react-native-restart';

export default function ResetPasswordModal() {

    const [open, setOpen] = useState<boolean>(false)

    const reset = async () => {
        await resetStorage()
        RNRestart.restart()
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen} className='w-full'>
            <AlertDialogTrigger>
                <Button className='w-full' variant="link" size="sm" onPress={() => { setOpen(true) }} ><Text>Reset your vault</Text></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your saved password and TOTP code from your vault.
                        The app will restart automatically.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction className='bg-destructive' onPress={() => { reset() }}>
                        <Text className='text-white'>Continue</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}