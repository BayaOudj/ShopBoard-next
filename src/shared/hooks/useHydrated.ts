'use client'
import { useSyncExternalStore } from 'react'
const subscribe = () => () => {}
const browserSnapshot = () => true
const serverSnapshot = () => false
// Per-consumer readiness also covers components streamed after their owner hydrated.
export function useHydrated() {
  return useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot)
}
