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
import { GetStorageData, isExist } from '@/lib/storage';
import CheckPasswordCard from '@/components/CheckPasswordCard';
import CreatePasswordCard from '@/components/CreatePasswordCard';
import { Data } from '@/types/Data';
import PasswordArea from '@/components/PasswordArea';
import TOTPArea from '@/components/TOTPArea';

const GOOD_TEST_KEY = 'testtest'
const BAD_TEST_KEY = 'testtestfsdgfsddgfgfsddfsg'

const SCREEN_OPTIONS = {
  title: 'SavePass Mobile',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export default function Screen() {
  const [value, setValue] = useState('password')
  const cards = Array.from({ length: 15 })
  const [isStorageChecked, setIsStorageChecked] = useState<boolean>(false)
  const [isStorageExist, setIsStorageExist] = useState<boolean>(false)
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    setIsStorageChecked(false)
    setIsStorageExist(isExist())
  }, [])

  const Refresh = async () => {
    const data: Data | boolean = await GetStorageData()
    if (typeof data !== 'boolean') {
      setData(data)
    }
  }

  if (!isStorageChecked) {
    return <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className='flex-1 justify-center w-full p-4 pt-20'>
        {
          isStorageExist
            ? <CheckPasswordCard PasswordChecked={() => { setIsStorageChecked(true); Refresh() }} />
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
            <Text>Change your setting here.</Text>
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

