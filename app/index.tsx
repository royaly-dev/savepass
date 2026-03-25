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
import { Data, syncDevice } from '@/types/Data';
import PasswordArea from '@/components/PasswordArea';
import TOTPArea from '@/components/TOTPArea';
import SettingsArea from '@/components/SettingsArea';
import Zeroconf, { Service } from 'react-native-zeroconf'

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
    }
  })

  useEffect(() => {
    setIsStorageChecked(false)
    setIsStorageExist(isExist())
    instance.scan("http", "tcp", "local.")
  }, [])

  const Refresh = async () => {
    const data: Data | boolean = await GetStorageData()
    if (typeof data !== 'boolean') {
      setData(data)
    }
  }

  const syncDevices = async () => {
    const Devicesdata: syncDevice = await GetSyncData() || { data: [], lastSync: 0, status: false, syncKey: "" }
    for (const device of Devicesdata.data) {
      const ip = Array.from(services || new Set<Service>).filter(item => item.name.split("_")[item.name.split("_").length - 1] === device.syncKey)[0]?.addresses[0]
      if (ip) {
        try {
          const req = await fetch("http://" + ip + ":5263/sync", {
            method: 'POST',
            body: JSON.stringify({
              data: await GetStorageData(),
              syncKey: Devicesdata.syncKey
            })
          })
          if (req.status === 200) {
            const reqJSON = await req.json()
            await SaveStorageData(reqJSON.data)
            Refresh()
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
            ? <CheckPasswordCard PasswordChecked={async () => { setIsStorageChecked(true); await Refresh(); setTimeout(() => { syncDevices() }, 500); }} />
            : <CreatePasswordCard PasswordCreated={() => { setIsStorageExist(true) }} />
        }
      </View>
    </>
  }

  return (
    <>
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
            <PasswordArea data={data || { opt: [], password: [] }} refresh={Refresh} />
          </TabsContent>
          <TabsContent value="auth" className="flex-1 pt-4">
            <TOTPArea data={data || { opt: [], password: [] }} refresh={Refresh} />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <SettingsArea scanedDevice={services || new Set<Service>()} refresh={Refresh} data={data || { opt: [], password: [] }} />
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

