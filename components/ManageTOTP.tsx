import 'react-native-get-random-values'
import { OptData } from "@/types/Data";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useRef, useState } from "react";
import { Modal, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react-native";
import { Text } from "./ui/text";
import Svg, { Path } from "react-native-svg"
import { CameraView, useCameraPermissions } from 'expo-camera'
import { generate } from "otplib";
import { useColorScheme } from 'nativewind';
import PasswordInput from "./PasswordInput";
import { v4 as uuidv4 } from 'uuid';

export default function ManageTOTP({ open, modalClose }: { open: boolean, modalClose(data: OptData, confirm: boolean): void }) {

    const [totpcode, setTotpcode] = useState<OptData | null>(null)
    const [ErrorMsg, setErrorMsg] = useState<string>("")
    const [Manual, setManual] = useState<boolean>(false)
    const { width } = useWindowDimensions()
    const [permission, requestPermission] = useCameraPermissions();
    const [takeMode, setTakeMode] = useState<boolean>(false)
    const cam = useRef<CameraView>(null)
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        const totp = async () => {
            setTotpcode({ deleted: false, id: uuidv4(), key: "", name: "", provider: "" })
        }
        totp()
    }, [open])

    const savepassord = async () => {
        setErrorMsg("")
        if (totpcode) {

            if (!totpcode.provider) {
                setErrorMsg("You need to provide a provider / Website name !")
                return
            }

            if (!totpcode.name) {
                setErrorMsg("You need to provide a mail / username !")
                return
            }

            if (!totpcode.key) {
                setErrorMsg("You need to provide a TOTP key !")
                return
            }

            try {
                await generate({ secret: totpcode.key })
            } catch (error) {
                setErrorMsg("You need to provide a valid TOTP key !")
                return
            }

            setManual(false)

            modalClose(totpcode, true)

        }
    }

    const permisionSetup = async () => {
        if (!permission?.granted) {
            const perm = await requestPermission()
            if (perm.granted) {
                setTakeMode(true)
                setErrorMsg("")
            } else {
                setErrorMsg("Camera permission is required to scan a QR code.")
            }
        } else {
            setTakeMode(true)
            setErrorMsg("")
        }
    }

    if (totpcode === null) {
        return
    }

    return (
        <>
            <Modal visible={takeMode && permission?.granted} animationType="slide" onRequestClose={() => setTakeMode(false)}>
                <View style={{ flex: 1, backgroundColor: "#000" }}>
                    <CameraView
                        ref={cam}
                        style={{ flex: 1 }}
                        facing="back"
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        onBarcodeScanned={(data) => {
                            const parsedData = data.data.split(/[?&/=:]/).filter(Boolean)
                            setTotpcode({ ...totpcode, provider: parsedData[2], name: decodeURIComponent(parsedData[3]), key: parsedData[5] })
                            setManual(true)
                            setTakeMode(false)
                        }}
                    />
                    <View style={{ position: "absolute", top: 56, right: 16 }}>
                        <Button variant="secondary" onPress={() => setTakeMode(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            <Dialog open={open && !takeMode} onOpenChange={() => { modalClose(totpcode, false); setErrorMsg(""); setManual(false) }} >
                <DialogContent className="max-w-none" style={{ width: Number(width) - 24 }}>
                    <DialogHeader>
                        <DialogTitle>Add a new Authentificator</DialogTitle>
                        {
                            ErrorMsg && <Alert icon={AlertCircle}>
                                <AlertDescription>{ErrorMsg}</AlertDescription>
                            </Alert>
                        }
                    </DialogHeader>
                    <View className="flex justify-center items-start flex-col gap-4">
                        {!Manual && (
                            <View className="flex justify-center items-center flex-row gap-4">
                                <Button className="flex-1" onPress={permisionSetup}>
                                    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none" >
                                        <Path d="M0 4.167V0h4.167v1.667h-2.5v2.5H0m0 12.5V12.5h1.667V15h2.5v1.667H0m12.5 0V15H15v-2.5h1.667v4.167H12.5m2.5-12.5v-2.5h-2.5V0h4.167v4.167H15m-2.083 8.75h1.25v1.25h-1.25v-1.25m0-2.5h1.25v1.25h-1.25v-1.25m-1.25 1.25h1.25v1.25h-1.25v-1.25m-1.25 1.25h1.25v1.25h-1.25v-1.25m-1.25-1.25h1.25v1.25h-1.25v-1.25m2.5-2.5h1.25v1.25h-1.25v-1.25m-1.25 1.25h1.25v1.25h-1.25v-1.25m-1.25-1.25h1.25v1.25h-1.25v-1.25m5-6.667v5h-5v-5h5M7.5 9.167v5h-5v-5h5m0-6.667v5h-5v-5h5M6.25 12.917v-2.5h-2.5v2.5h2.5m0-6.667v-2.5h-2.5v2.5h2.5m6.667 0v-2.5h-2.5v2.5h2.5" fill={colorScheme === "dark" ? "#000" : "#fff"} />
                                    </Svg>
                                    <Text>Scan QR</Text>
                                </Button>
                                <Button variant="outline" onPress={() => { setManual(true) }} className="flex-1">
                                    <Svg width={17} height={12} viewBox="0 0 17 12" fill="none">
                                        <Path d="M1.667 11.667c-.459 0-.851-.163-1.177-.49A1.605 1.605 0 010 10V1.667C0 1.208.163.816.49.49.816.163 1.208 0 1.667 0H15c.458 0 .85.163 1.177.49.326.326.49.718.49 1.177V10c0 .458-.164.85-.49 1.177-.326.327-.719.49-1.177.49H1.667zm0-1.667H15V1.667H1.667V10zM5 9.167h6.667V7.5H5v1.667zm-2.5-2.5h1.667V5H2.5v1.667zm2.5 0h1.667V5H5v1.667zm2.5 0h1.667V5H7.5v1.667zm2.5 0h1.667V5H10v1.667zm2.5 0h1.667V5H12.5v1.667zm-10-2.5h1.667V2.5H2.5v1.667zm2.5 0h1.667V2.5H5v1.667zm2.5 0h1.667V2.5H7.5v1.667zm2.5 0h1.667V2.5H10v1.667zm2.5 0h1.667V2.5H12.5v1.667zM1.667 10V1.667 10z" fill={colorScheme === "dark" ? "#fff" : "#0B1C30"} />
                                    </Svg>
                                    <Text>Manual</Text>
                                </Button>
                            </View>
                        )}
                        {Manual && (
                            <>
                                <Label htmlFor="url" nativeID="url">Provider</Label>
                                <Input value={totpcode.provider} onChange={(e) => { setTotpcode({ ...totpcode, provider: e.nativeEvent.text }) }} id="url" placeholder="https://exemple.com/" />

                                <Label htmlFor="mail" nativeID="mail">Email / Username</Label>
                                <Input value={totpcode.name} onChange={(e) => { setTotpcode({ ...totpcode, name: e.nativeEvent.text }) }} id="mail" placeholder="username" />

                                <Label htmlFor="password" nativeID="password">TOTP key</Label>
                                <View className='relative flex justify-center items-center w-full'>
                                    <PasswordInput id="password" onchange={(text) => { setTotpcode({ ...totpcode, key: text }) }} gen={false} value={totpcode.key} />
                                </View>
                                <Button onPress={savepassord} variant="default" className="w-full mt-4"><Text>Save</Text></Button>
                            </>
                        )}
                    </View>
                </DialogContent>
            </Dialog>
        </>
    )
}