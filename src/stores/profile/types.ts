import { Timestamp } from 'firebase/firestore'

export interface INewProfile {
  id?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface IProfile extends INewProfile {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type TProfiles = Record<string, IProfile>

export interface IState {
  loading: boolean
  list: IProfile[]
  errorCode: string
  errorMsg: string
}

export interface Getters {
  item: () => IProfile
  byId: (state: IState) => TProfiles
  initials: (state: IState) => (profileId: string, limit?: number) => string
}

export interface Actions {
  fetch(): Promise<IProfile[]>
  upsert(payload: INewProfile): Promise<IProfile>
  remove(payload: IProfile): Promise<IProfile>
}
