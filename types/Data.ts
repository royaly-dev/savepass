export type Data = { password: { id: string, password: string, url: string, mail: string, deleted: boolean, lastedit: number }[], opt: { id: string, key: string, name: string, provider: string, deleted: boolean }[] }
export type PasswordData = { id: string, password: string, url: string, mail: string, deleted: boolean, lastedit: number }
export type OptData = { id: string, key: string, name: string, provider: string, deleted: boolean }

export type syncDevice = { syncKey: string, data: { syncKey: string, lastSync: number, name: string, public: string }[], lastSync: number, status: boolean, public: string, private: string }
export type syncData = { syncKey: string, lastSync: number, name: string, public: string }