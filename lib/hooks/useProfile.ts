'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  getProfile,
  updateProfile,
  Profile,
  ProfileUpdate,
} from '@/lib/services/profile.service'

export function useProfile() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) return

    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      try {
        const data = await getProfile(user.id)
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필 로드 실패')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, isAuthLoading])

  const updateUserProfile = async (updates: ProfileUpdate) => {
    if (!user) throw new Error('사용자가 인증되지 않았습니다')

    try {
      const updated = await updateProfile(user.id, updates)
      setProfile(updated)
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필 업데이트 실패'
      setError(message)
      throw err
    }
  }

  return {
    profile,
    isLoading,
    error,
    updateUserProfile,
  }
}
