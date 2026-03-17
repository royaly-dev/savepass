import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreateStorage, GetStorage, isExist } from '@/lib/storage';
import { Input } from '@/components/ui/input';

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
  const [isStorageExist, setIsStorageExist] = useState<boolean>(false)
  const [MastrePass, setMasterPass] = useState<string>("")

  useEffect(() => {
    setIsStorageExist(false)
  }, [])

  if (!isStorageExist) {
    return <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className='flex-1 w-full p-4 pt-20'>
        <Card>
          <CardContent>
            <Input secureTextEntry placeholder='Your master password' value={MastrePass} onChangeText={setMasterPass} />
            <Button variant="default" onPress={async () => { setIsStorageExist(await GetStorage(MastrePass)) }} ><Text>Unlock password</Text></Button>
          </CardContent>
        </Card>
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
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingBottom: 24, paddingTop: 8 }}>
              {cards.map((_, index) => (
                <Card key={index} className="w-full">
                  <CardContent>
                    <Text>test card {index + 1}</Text>
                  </CardContent>
                </Card>
              ))}
            </ScrollView>
          </TabsContent>
          <TabsContent value="auth" className="pt-4">
            <Text>Change your TOTP code here.</Text>
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

