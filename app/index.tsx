import 'react-native-get-random-values'
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { GetStorageData, GetSyncData, isExist, SaveStorageData, SetSyncData } from '@/lib/storage';
import CheckPasswordCard from '@/components/CheckPasswordCard';
import CreatePasswordCard from '@/components/CreatePasswordCard';
import { Data, syncData, syncDevice } from '@/types/Data';
import PasswordArea from '@/components/PasswordArea';
import TOTPArea from '@/components/TOTPArea';
import SettingsArea from '@/components/SettingsArea';
import Zeroconf, { Service } from 'react-native-zeroconf'
import CryptoJS from 'crypto-js';
import { RSA } from 'react-native-rsa-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { addDevice } from '@/components/SyncModal';

const SCREEN_OPTIONS = {
  title: 'SavePass Mobile',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export default function Screen() {
  const [value, setValue] = useState('password')
  const [isStorageChecked, setIsStorageChecked] = useState<boolean>(false)
  const [isStorageExist, setIsStorageExist] = useState<boolean>(false)
  const [data, setData] = useState<Data | null>(null)
  const [services, setServices] = useState<Set<Service> | null>(null)
  const [devicePairBox, setDevicePairBox] = useState<{ open: boolean, data: Service | null }>({ open: false, data: null })

  const instance = new Zeroconf()

  instance.on("found", services => {
  })
  instance.on('resolved', service => {
    if (service.name.split("_")[1] === "savepass") {
      console.log("adding newdevice")
      setServices(prev => {
        const newSet = prev ? new Set(prev) : new Set<Service>()
        const isExist: boolean = Array.from(newSet).filter(item => item.name === service.name).length > 0
        if (!isExist) {
          newSet.add(service)
        }
        return newSet
      })
      if (!(Array.from(services || []).filter(item => item.name === service.name).length > 0) && Boolean(service.txt.readytosync) && Date.now() - service.txt.time < 2000 && isStorageChecked) {
        setDevicePairBox({ open: true, data: service })
      }
    }
  })

  useEffect(() => {
    setIsStorageChecked(false)
    setIsStorageExist(isExist())
    instance.scan("http", "tcp", "local.")
  }, [])

  const Refresh = async (sync: boolean) => {
    if (sync) {
      syncDevices()
    }
    const data: Data | boolean = await GetStorageData()
    if (typeof data !== 'boolean') {
      setData(data)
    }
  }

  const syncDevices = async () => {
    const Devicesdata: syncDevice = await GetSyncData() || { data: [], lastSync: 0, status: false, syncKey: "", private: "", public: "" }
    if (!Devicesdata?.public || !Devicesdata?.private) {
      const keyGen = await RSA.generateKeys(2048)

      Devicesdata.private = keyGen.private
      Devicesdata.public = keyGen.public
    }
    for (const device of Devicesdata.data) {
      const ip = Array.from(services || new Set<Service>).filter(item => item.name.split("_")[item.name.split("_").length - 1] === device.syncKey)[0]?.addresses[0]
      if (ip) {
        try {
          const tempKey = CryptoJS.lib.WordArray.random(16).toString()
          const req = await fetch("http://" + ip + ":5263/sync", {
            method: 'POST',
            body: JSON.stringify({
              data: CryptoJS.AES.encrypt(JSON.stringify(await GetStorageData()), tempKey).toString(),
              syncKey: Devicesdata.syncKey,
              key: await RSA.encrypt64(tempKey, device.public),
              mobile: true
            })
          })
          if (req.status === 200) {
            const reqJSON = await req.json()
            const decryptedData = JSON.parse(CryptoJS.AES.decrypt(reqJSON.data, await RSA.decrypt(reqJSON.key, Devicesdata.private)).toString(CryptoJS.enc.Utf8))
            await SaveStorageData(decryptedData)
            Refresh(false)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    Devicesdata.lastSync = Date.now()
    await SetSyncData(Devicesdata)
  }

  if (!isStorageChecked) {
    return <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className='flex-1 justify-center w-full p-4 pt-20'>
        {
          isStorageExist
            ? <CheckPasswordCard PasswordChecked={async () => { setIsStorageChecked(true); Refresh(true) }} />
            : <CreatePasswordCard PasswordCreated={() => { setIsStorageExist(true) }} />
        }
      </View>
    </>
  }

  return (
    <>
      <AlertDialog open={devicePairBox.open} onOpenChange={() => { setDevicePairBox({ ...devicePairBox, open: !devicePairBox.open }) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A new device is waiting to be paired !</AlertDialogTitle>
            <AlertDialogDescription>
              A new device on your device is waiting to be paired, do you want to pair it ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>No</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={async () => { const syncdata = await GetSyncData(); if (devicePairBox.data && syncdata) addDevice(devicePairBox.data, syncdata, () => { Refresh(true) }, () => { }) }}>
              <Text>Yes</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 w-full p-4 pt-20">
        <Tabs value={value} onValueChange={setValue} className="flex-1 w-full">
          <TabsList className="flex w-full items-center justify-between">
            <TabsTrigger className="w-1/3" value="password">
              <Text>Passwords</Text>
            </TabsTrigger>
            <TabsTrigger className="w-1/3" value="auth">
              <Text>Authentificator</Text>
            </TabsTrigger>
            <TabsTrigger className="w-1/3" value="settings">
              <Text>Settings</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="flex-1">
            <PasswordArea data={data || { opt: [], password: [] }} refresh={() => { Refresh(true) }} />
          </TabsContent>
          <TabsContent value="auth" className="flex-1 pt-4">
            <TOTPArea data={data || { opt: [], password: [] }} refresh={() => { Refresh(true) }} />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <SettingsArea scanedDevice={services || new Set<Service>()} refresh={() => { Refresh(true) }} data={data || { opt: [], password: [] }} />
          </TabsContent>
        </Tabs>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

