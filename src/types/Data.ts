export type Data = {password: {id: string, password: string, url: string, mail: string, deleted: boolean}[], opt: {id: string, key: string, name: string, provider: string}[]}
export type PasswordData = {id: string, password: string, url: string, mail: string, deleted: boolean}
export type AccountData = {id: string, mail: string}
export type OptData = {id: string, key: string, name: string, provider: string}

export type syncDevice = { syncKey: string, data: { syncKey: string, lastSync: number, name: string }[], lastSync: number, status: boolean }
export type syncData = { syncKey: string, lastSync: number, name: string }
