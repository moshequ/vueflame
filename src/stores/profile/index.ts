import type { StoreDefinition } from 'pinia'
import { defineStore } from 'pinia'
import { FirebaseError } from '@firebase/util'
import { setError } from './utils/setError'
import type { Actions, IState, Getters, IProfile, TProfiles } from './types'
import { getTimestamps } from '@/stores/utils/getTimestamps'
import { fetchDocs, removeDoc, upsertDoc } from '@/stores/utils/upsertDoc'
import { getInitials } from '@/stores/profile/utils/getInitials'
import { useRoute } from 'vue-router'

const storeName = 'profile'

type TItem = IProfile
type TItems = TProfiles

const useStore: StoreDefinition<typeof storeName, IState, Getters, Actions> = defineStore(
  storeName,
  {
    state() {
      return {
        loading: true,
        list: [],
        errorCode: '',
        errorMsg: ''
      } as IState
    },
    getters: {
      item(): TItem {
        const route = useRoute()

        const itemId = (route.params.profileId as string) || ''

        return this.byId[itemId] || ({} as TItem)
      },
      byId: (state: IState) => {
        return state.list.reduce((acc, item) => ({ ...acc, [item.id]: item }), {} as TItems)
      },
      initials(): (profileId: string) => string {
        return (itemId, limit?: number) =>
          getInitials(this.byId[itemId]?.details?.name || '', limit)
      }
    },
    actions: {
      async fetch() {
        const store = useStore()
        store.loading = true
        setError()

        try {
          store.list = await fetchDocs<TItem>(storeName)
          store.loading = false
          return store.list
        } catch (error: unknown) {
          setError(error as FirebaseError)
          console.error(error)
          store.loading = false
          throw error
        }
      },
      async upsert(payload) {
        const store = useStore()
        store.loading = true
        setError()

        try {
          const ts = getTimestamps(payload)
          const doc = await upsertDoc<TItem>(storeName, { ...payload, ...ts })

          store.list = store.byId[doc.id]
            ? (store.list = store.list.map((item) => (item.id === doc.id ? doc : item)))
            : (store.list = [...store.list, doc])

          store.loading = false
          return doc
        } catch (error: unknown) {
          setError(error as FirebaseError)
          console.error(error)
          store.loading = false
          throw error
        }
      },
      async remove(payload) {
        const store = useStore()
        store.loading = true
        setError()

        try {
          const doc = await removeDoc(storeName, payload)
          store.list = store.list.filter((item) => item.id !== doc.id)
          store.loading = false
          return doc
        } catch (error: unknown) {
          setError(error as FirebaseError)
          console.error(error)
          store.loading = false
          throw error
        }
      }
    }
  }
)

export const useProfileStore = useStore
