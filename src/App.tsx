import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import MasterPasswordCheck from '@/components/MasterPasswordCheck';
import { KeyRound, RectangleEllipsis, Settings, User } from 'lucide-react';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { AccountData, Data, PasswordData } from '@/types/Data';
import { Button } from './components/ui/button';
import PasswordCard from './components/passwordCard';
import ManagePassword from './components/ManagePassword';

function Homepage() {

  const [confirm, setConfirm] = useState<boolean>(false)
  const [currentSection, setCurrentSection] = useState<string>("password")
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [data, setData] = useState<Data>()
  const [isAddingPassword, setIsAddingPassword] = useState<boolean>(false)
  const [typeAddingPassword, setTypeAddingPassword] = useState<string>("add")
  const [updatePasswordData, setUpdatePasswordData] = useState<PasswordData>(null)

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    if (currentSection) {
      carouselApi.scrollTo(currentSection == "password" ? 0 : currentSection == "opt" ? 1 : currentSection == "user" ? 2 : 3)
    }
    
    refresh()
  }, [carouselApi, currentSection])

  const refresh = async () => {
    setData(await (window as any).savepass.GetData())
    console.log(data)
    setTypeAddingPassword("add")
    setUpdatePasswordData(null)
  }

  const requestPasswordEdit = (data: PasswordData) => {
    setTypeAddingPassword("modify")
    setIsAddingPassword(true)
    setUpdatePasswordData(data)
  }

  const RequestPasswordDeletion = async (dataDeletion: PasswordData) => {
    (window as any).savepass.SaveData({...data, password: data.password.filter(item => item.id != dataDeletion.id)})
    refresh()
  }

  if (!confirm) {
    return (
      <><MasterPasswordCheck confirmCheck={() => {setConfirm(true)}} />
      <MasterPasswordSetup /></>
    )
  }

  return (
    <main className='grid grid-cols-10 h-screen'>
        <ManagePassword updateData={updatePasswordData} openChange={() => {setIsAddingPassword(false); setTypeAddingPassword("add"); setUpdatePasswordData(null)}} type={typeAddingPassword} requestPassword={isAddingPassword} data={data} refresh={refresh} />
      <nav className='flex self-center col-span-1 w-full justify-center items-center flex-col my-2 bg-muted-foreground/15 h-fit rounded-md py-2 mx-2 box-content'>
        <KeyRound size={24} color={currentSection == "password" ? '#fff' : '#000'}  onClick={() => {setCurrentSection("password")}} className={'p-1 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "password" ? 'bg-foreground' : '')} />
        <RectangleEllipsis color={currentSection == "opt" ? '#fff' : '#000'} size={24} onClick={() => {setCurrentSection("opt")}} className={'p-1 py-1.5 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "opt" ? 'bg-foreground' : '')} />
        <Settings size={24} color={currentSection == "settings" ? '#fff' : '#000'} onClick={() => {setCurrentSection("settings")}} className={'p-1 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "settings" ? 'bg-foreground' : '')} />
      </nav>
      <Carousel setApi={setCarouselApi} orientation='vertical' className='h-screen col-end-10 col-start-3'>
        <CarouselContent className='max-h-screen'>
          <CarouselItem>
            <div  className='h-screen py-4 flex items-start flex-col'>
              <Button onClick={() => {setIsAddingPassword(true)}} variant="default" className='cursor-pointer my-3 shrink-0'>Add password</Button>
              <div className='flex flex-col flex-1 overflow-y-auto gap-3 min-h-0 items-center w-full'>
                {
                  data?.password && data?.password.length != 0
                  ? data.password.map((item) => {
                    return <PasswordCard key={item.id} requestDelete={RequestPasswordDeletion} requestEdit={requestPasswordEdit} data={{id: item.id, accountid: item.accountid, password: item.password, url: item.url, mail: item.mail}}/>
                  })
                  : <div className='flex justify-center items-center flex-col'>
                    <h3 className='text-xl text-muted-foreground'>No password saved</h3>
                  </div>
                }
              </div>
            </div>
          </CarouselItem>
          <CarouselItem><p className='h-screen text-center'>opt</p></CarouselItem>
          <CarouselItem><p className='h-screen text-center'>settings</p></CarouselItem>
        </CarouselContent>
      </Carousel>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </Router>
  );
}