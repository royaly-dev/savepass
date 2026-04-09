import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import MasterPasswordCheck from '@/components/MasterPasswordCheck';
import { Check, Download, KeyRound, Link, RectangleEllipsis, Settings, User } from 'lucide-react';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Data, OptData, PasswordData, syncData, syncDevice } from '@/types/Data';
import { Button } from './components/ui/button';
import PasswordCard from './components/passwordCard';
import ManagePassword from './components/ManagePassword';
import OptCodeCard from './components/OptCodeCard';
import ManageTotp from './components/ManageTOTP';
import { toast } from 'sonner';
import { Service } from 'bonjour-service';
import SyncModal from './components/syncModal';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from './components/ui/combobox';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './components/ui/select';
import RecoverPasswordModal from './components/RecoverPasswordModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function Homepage() {

  const [confirm, setConfirm] = useState<boolean>(false)
  const [currentSection, setCurrentSection] = useState<string>("password")
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [data, setData] = useState<Data>()
  const [isAddingPassword, setIsAddingPassword] = useState<boolean>(false)
  const [isAddingTOTP, setIsAddingTOTP] = useState<boolean>(false)
  const [typeAddingPassword, setTypeAddingPassword] = useState<string>("add")
  const [updatePasswordData, setUpdatePasswordData] = useState<PasswordData | null>(null)
  const [optCode, setOptCode] = useState<OptData[]>()
  const [optCodeLeft, setOptCodeLeft] = useState<number>(0)
  const [SelectValueSearch, setSelectValueSearch] = useState<string>("By WebSite")
  const [SearchValue, setSearchValue] = useState<string>("")
  const [devicePairBox, setDevicePairBox] = useState<{ open: boolean, data: { newdevice: syncData, ip: string } }>({ open: false, data: { ip: "", newdevice: { lastSync: 0, name: "", syncKey: "" } } })

  useEffect(() => {

    const savepass = (window as any).savepass;

    if (!savepass) {
      return
    }

    savepass.onGetOTP((data: { left: number, data: OptData[] }) => {
      setOptCode(data.data)
      setOptCodeLeft(data.left)
      refresh()
      console.log("Ressus : " + data.data)
      console.log("left : " + data.left)
    })

    savepass.syncError(() => {
      toast.error("Error while setup sync with the device")
    })

    savepass.update(() => {
      toast.info("A new update is available !", { duration: 10000, action: <Button size='sm' variant='default' onClick={() => { (window as any).savepass.openLink("https://github.com/royaly-dev/savepass/releases/latest") }} >Download</Button>, icon: <Download size={16} /> })
    })

    savepass.syncRefresh((type: number, name: string) => {
      switch (type) {
        case 1:
          toast.success(`Successfully synced with ${name} !`)
          break;
        case 2:
          toast.success(`Successfully added ${name} !`)
          break
        case 3:
          toast.success(`Successfully removed ${name} from sync devices !`)
          break
        default:
          break;
      }
      refreshOPT()
    })

    savepass.ready_to_pair((data: { newdevice: syncData, ip: string }) => {
      setDevicePairBox({ open: true, data: data })
    })
  }, [])

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    if (currentSection) {
      carouselApi.scrollTo(currentSection == "password" ? 0 : currentSection == "opt" ? 1 : currentSection == "user" ? 2 : 3)
    }

    refreshOPT()
    refresh()
  }, [carouselApi, currentSection])

  useEffect(() => {
    console.log(optCodeLeft)
    const intervalTOTP = setInterval(() => {
      if (optCodeLeft > 0) {
        setOptCodeLeft(prev => { return prev - 1 })
      }
    }, 1000);
    return () => {
      console.log("cleared")
      clearInterval(intervalTOTP)
    }
  }, [optCode])

  const refresh = async () => {
    const data: Data = await (window as any).savepass.GetData()
    setData(data)
    setTypeAddingPassword("add")
    setUpdatePasswordData(null)
  }

  const refreshOPT = async () => {
    const data: { left: number, data: OptData[] } = await (window as any).savepass.genrateOPT()
    setOptCode(data.data)
    setOptCodeLeft(data.left)
    setIsAddingTOTP(false)
    refresh()
  }

  const requestPasswordEdit = (data: PasswordData) => {
    setTypeAddingPassword("modify")
    setIsAddingPassword(true)
    setUpdatePasswordData(data)
  }

  const RequestPasswordDeletion = async (dataDeletion: PasswordData) => {
    if (!data) return
    (window as any).savepass.SaveData({ ...data, password: data.password.map(item => item.id === dataDeletion.id ? { ...item, deleted: true, lastedit: Date.now() } : item) })
    refresh()
  }

  const RequestTotpDeletion = async (dataDeletion: OptData) => {
    if (!data) return
    (window as any).savepass.SaveData({ ...data, opt: data.opt.map(item => item.id === dataDeletion.id ? { ...item, deleted: true } : item) })
    refreshOPT()
  }

  const requestRecover = async (dataRecover: PasswordData) => {
    if (!data) return
    (window as any).savepass.SaveData({ ...data, password: data.password.map(item => item.id === dataRecover.id ? { ...item, deleted: false } : item) });
    refresh()
  }

  const ImportData = async () => {
    const iscanceled: { canceled: boolean } = await (window as any).savepass.ImportData()
    if (iscanceled.canceled) {
      toast.error("Error while trying to import data")
    } else {
      refreshOPT()
      toast.success("Successfuly imported your password and Totp code !")
    }
  }

  const ExportData = async () => {
    const iscanceled: { canceled: boolean } = await (window as any).savepass.ExportData()
    if (iscanceled.canceled) {
      toast.error("Error while trying to export data")
    } else {
      toast.success("Successfuly exported your password and Totp code !")
    }
  }

  if (!confirm) {
    return (
      <div className='h-screen w-screen flex justify-center items-center'>
        <h1 className='text-black text-5xl font-[DM_Sans]'>Loading...</h1>
        <MasterPasswordCheck confirmCheck={() => { setConfirm(true) }} />
        <MasterPasswordSetup />
      </div>
    )
  }

  return (
    <main className='grid grid-cols-10 h-screen'>
      <AlertDialog open={devicePairBox.open} onOpenChange={() => { setDevicePairBox({ ...devicePairBox, open: !devicePairBox.open }) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A new device is waiting to be paired !</AlertDialogTitle>
            <AlertDialogDescription>
              A new device on your device is waiting to be paired, do you want to pair it ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await (window as any).savepass.addSyncDevice(devicePairBox.data) }}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ManagePassword updateData={updatePasswordData} openChange={() => { setIsAddingPassword(false); setTypeAddingPassword("add"); setUpdatePasswordData(null) }} type={typeAddingPassword} requestPassword={isAddingPassword} data={data || { opt: [], password: [] }} refresh={refresh} />
      <ManageTotp data={data || { opt: [], password: [] }} openChange={() => { setIsAddingTOTP(false) }} refresh={refreshOPT} request={isAddingTOTP} />
      <nav className='flex self-center col-span-1 w-full justify-center items-center flex-col my-2 bg-muted-foreground/15 h-fit rounded-md py-2 mx-2 box-content'>
        <KeyRound size={24} color={currentSection == "password" ? '#fff' : '#000'} onClick={() => { setCurrentSection("password") }} className={'p-1 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "password" ? 'bg-foreground' : '')} />
        <RectangleEllipsis color={currentSection == "opt" ? '#fff' : '#000'} size={24} onClick={() => { setCurrentSection("opt") }} className={'p-1 py-1.5 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "opt" ? 'bg-foreground' : '')} />
        <Settings size={24} color={currentSection == "settings" ? '#fff' : '#000'} onClick={() => { setCurrentSection("settings") }} className={'p-1 m-1.5 box-content transition-all duration-300 rounded-sm hover:bg-muted-foreground/35 cursor-pointer ' + (currentSection == "settings" ? 'bg-foreground' : '')} />
      </nav>
      <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }} orientation='vertical' className='h-screen col-end-10 col-start-3'>
        <CarouselContent className='max-h-screen'>
          <CarouselItem>
            <div className='h-screen py-4 flex items-start flex-col'>
              <div className='flex justify-between items-center w-full'>
                <Button onClick={() => { setIsAddingPassword(true) }} variant="default" className='cursor-pointer my-3 shrink-0'>Add password</Button>
                <div className='flex justify-center items-center gap-1'>
                  <Select value={SelectValueSearch} onValueChange={setSelectValueSearch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position='popper'>
                      <SelectGroup>
                        <SelectItem key={'name'} value={'By Mail & User'}>By Mail & user</SelectItem>
                        <SelectItem key={'web'} value={'By WebSite'}>By WebSite</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Input className='w-46' placeholder='Search' value={SearchValue} type='text' onChange={(e) => { setSearchValue(e.target.value) }} />
                </div>
              </div>
              <div style={{ scrollbarWidth: "thin" }} className='flex flex-col flex-1 overflow-y-auto gap-3 min-h-0 items-center w-full'>
                {
                  data?.password && data?.password.filter(item => !item.deleted).length != 0
                    ? data.password.map((item) => {
                      if (SearchValue === "") {
                        return !item.deleted && <PasswordCard key={item.id} requestDelete={RequestPasswordDeletion} requestEdit={requestPasswordEdit} data={item} />
                      } else if (SearchValue !== "" && SelectValueSearch === "By WebSite" && new URL(item.url).hostname.includes(SearchValue)) {
                        return !item.deleted && <PasswordCard key={item.id} requestDelete={RequestPasswordDeletion} requestEdit={requestPasswordEdit} data={item} />
                      } else if (SearchValue !== "" && SelectValueSearch === "By Mail & User" && item.mail.includes(SearchValue)) {
                        return !item.deleted && <PasswordCard key={item.id} requestDelete={RequestPasswordDeletion} requestEdit={requestPasswordEdit} data={item} />
                      }
                    })
                    : <div className='flex justify-center items-center flex-col'>
                      <h3 className='text-xl text-muted-foreground'>No password saved</h3>
                    </div>
                }
              </div>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className='h-screen py-4 flex items-start flex-col'>
              <div className='flex justify-between items-center w-full'>
                <Button onClick={() => { setIsAddingTOTP(true) }} variant="default" className='cursor-pointer my-3 shrink-0'>Add A TOTP code</Button>
                <div className='flex justify-center items-center gap-1'>
                  <Select value={SelectValueSearch} onValueChange={setSelectValueSearch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position='popper'>
                      <SelectGroup>
                        <SelectItem key={'name'} value={'By Mail & User'}>By Mail & user</SelectItem>
                        <SelectItem key={'web'} value={'By WebSite'}>By WebSite</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Input className='w-46' placeholder='Search' value={SearchValue} type='text' onChange={(e) => { setSearchValue(e.target.value) }} />
                </div>
              </div>
              <div style={{ scrollbarWidth: "thin" }} className='flex flex-col flex-1 overflow-y-auto gap-3 min-h-0 items-center w-full'>
                {
                  optCode && optCode.filter(item => !item.deleted).length != 0
                    ? optCode.map((item) => {
                      if (SearchValue === "") {
                        return !item.deleted && <OptCodeCard key={item.id} time={optCodeLeft} data={item} requestDelete={RequestTotpDeletion} />
                      } else if (SearchValue !== "" && SelectValueSearch === "By WebSite" && item.provider.includes(SearchValue)) {
                        return !item.deleted && <OptCodeCard key={item.id} time={optCodeLeft} data={item} requestDelete={RequestTotpDeletion} />
                      } else if (SearchValue !== "" && SelectValueSearch == "By Mail & User" && item.name.includes(SearchValue)) {
                        return !item.deleted && <OptCodeCard key={item.id} time={optCodeLeft} data={item} requestDelete={RequestTotpDeletion} />
                      }
                    })
                    : <div className='flex justify-center items-center flex-col'>
                      <h3 className='text-xl text-muted-foreground'>No TOTP saved</h3>
                    </div>
                }
              </div>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className='h-screen flex justify-center items-center flex-col py-4 w-full'>
              <RecoverPasswordModal data={data?.password || []} requestRecover={requestRecover} />
              <SyncModal ImportData={ImportData} ExportData={ExportData} />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </main >
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