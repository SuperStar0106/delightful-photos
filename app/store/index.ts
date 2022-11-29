import { atom } from 'recoil'
import { BoxEntity } from '../realmdb/entities'
import { Asset, RecyclerAssetListSection, Library, AssetStory } from '../types'
import * as KeyChain from '../utils/keychain'

export const mediasState = atom<Asset[]>({
  key: 'mediasState',
  default: [],
})
export const singleAssetState = atom<Asset>({
  key: 'singleAssetState',
  default: null,
})
export const recyclerSectionsState = atom<RecyclerAssetListSection[]>({
  key: 'recyclerSectionsState',
  default: null,
})

export const selectedLibraryState = atom<Library>({
  key: 'selectedLibraryState',
  default: null,
})
export const selectedStoryState = atom<AssetStory>({
  key: 'selectedStoryState',
  default: null,
})
export const boxsState = atom<BoxEntity[]>({
  key: 'boxsState',
  default: null,
})
export const dIDCredentials = atom<KeyChain.UserCredentials>({
  key: 'dIDCredentials',
  default: null,
})
