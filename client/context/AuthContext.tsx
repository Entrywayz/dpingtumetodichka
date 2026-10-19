"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { clearAccessToken, Get, Post } from "@/lib/server"
import { User, TokenResponse } from "@/interfaces/login"
import { useRouter } from "next/navigation"

export interface LoginCredentials {
  login: string
  password: string
  remember_me?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void> 
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
          : null

      if (!token) {
        setLoading(false)
        return
      }
      try {
        const currentUser = await Get<User>("/auth/me")
        setUser(currentUser)
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogin = async ({ login, password, remember_me = false }: LoginCredentials) => {
    const data = await Post<TokenResponse>("/auth/login", {
      login,
      password,
      remember_me,
    })

    if (remember_me) {
      localStorage.setItem("access_token", data.access_token)
      sessionStorage.removeItem("access_token")
    } else {
      sessionStorage.setItem("access_token", data.access_token)
      localStorage.removeItem("access_token")
    }

    const profile = await Get<User>("/auth/me")
    setUser(profile)
  }

  const logout = () => {
    clearAccessToken()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}