import { useEffect, useState } from "react"

import { allEmployees } from "@/data/mockData"
import type { ChatAttachment, ChatMessage, Conversation } from "@/data/types"

const STORAGE_KEY = "nexushr-conversations"
const EVENT = "nexushr:messages"

export function conversationKey(a: string, b: string): string {
  return [a, b].sort().join("|")
}

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

function seedConversations(): Conversation[] {
  const me = "E-002"
  const others = allEmployees
    .filter((e) => e.id !== me)
    .sort((a, b) => a.id.localeCompare(b.id))

  const partner = (i: number) => others[i % others.length]?.id ?? "E-001"

  const mk = (
    id: string,
    senderId: string,
    text: string,
    minutes: number,
    read = true
  ): ChatMessage => ({
    id,
    senderId,
    text,
    time: isoMinutesAgo(minutes),
    read,
    edited: false,
    attachment: null,
  })

  const p1 = partner(0)
  const p2 = partner(1)
  const p3 = partner(2)

  const c1: Conversation = {
    id: conversationKey(me, p1),
    participantIds: [me, p1],
    messages: [
      mk("S1", me, "Morning! Have you had a chance to review the updated design system specs?", 95, true),
      mk("S2", p1, "Just finished — the component tokens look great. One note on the button spacing.", 88, true),
      mk("S3", p1, "Can you share the updated design system specs?", 12, false),
    ],
  }

  const c2: Conversation = {
    id: conversationKey(me, p2),
    participantIds: [me, p2],
    messages: [
      mk("S4", p2, "Finance needs your timesheet by Friday.", 50, false),
      mk("S5", me, "On it — I'll submit it before the end of the day.", 40, true),
    ],
  }

  const c3: Conversation = {
    id: conversationKey(me, p3),
    participantIds: [me, p3],
    messages: [
      mk("S6", p3, "Sending you the customer feedback report.", 28 * 60, true),
      mk("S7", me, "Thanks! I'll review it and share my notes.", 27 * 60, true),
      mk("S8", p3, "Great work on the onboarding flow review!", 26 * 60, true),
    ],
  }

  return [c1, c2, c3]
}

export function loadConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : seedConversations()
  } catch {
    return seedConversations()
  }
}

function saveConversations(list: Conversation[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(EVENT))
}

export function getConversation(a: string, b: string): Conversation | undefined {
  return loadConversations().find((c) => c.id === conversationKey(a, b))
}

export function getOrCreateConversation(a: string, b: string): Conversation {
  const key = conversationKey(a, b)
  const list = loadConversations()
  const existing = list.find((c) => c.id === key)
  if (existing) return existing
  const conv: Conversation = { id: key, participantIds: [a, b], messages: [] }
  saveConversations([conv, ...list])
  return conv
}

export function sendChatMessage(input: {
  convId: string
  senderId: string
  text: string
  attachment?: ChatAttachment | null
}) {
  const text = input.text.trim()
  const list = loadConversations()
  const msg: ChatMessage = {
    id: `M-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: input.senderId,
    text,
    time: new Date().toISOString(),
    read: false,
    edited: false,
    attachment: input.attachment ?? null,
  }
  saveConversations(
    list.map((c) =>
      c.id === input.convId ? { ...c, messages: [...c.messages, msg] } : c
    )
  )
}

export function editChatMessage(convId: string, msgId: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  const list = loadConversations()
  saveConversations(
    list.map((c) =>
      c.id !== convId
        ? c
        : {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, text: trimmed, edited: true } : m
            ),
          }
    )
  )
}

export function deleteChatMessage(convId: string, msgId: string) {
  const list = loadConversations()
  saveConversations(
    list.map((c) =>
      c.id !== convId
        ? c
        : { ...c, messages: c.messages.filter((m) => m.id !== msgId) }
    )
  )
}

export function markConversationRead(convId: string, userId: string) {
  const list = loadConversations()
  const conv = list.find((c) => c.id === convId)
  if (!conv) return
  const hasUnread = conv.messages.some((m) => m.senderId !== userId && !m.read)
  if (!hasUnread) return
  saveConversations(
    list.map((c) =>
      c.id !== convId
        ? c
        : {
            ...c,
            messages: c.messages.map((m) =>
              m.senderId !== userId ? { ...m, read: true } : m
            ),
          }
    )
  )
}

export function unreadCountFor(
  conversations: Conversation[],
  userId: string
): number {
  return conversations.reduce(
    (acc, c) =>
      acc + c.messages.filter((m) => m.senderId !== userId && !m.read).length,
    0
  )
}

export function useConversations(): Conversation[] {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations()
  )

  useEffect(() => {
    const refresh = () => setConversations(loadConversations())
    window.addEventListener(EVENT, refresh)
    return () => window.removeEventListener(EVENT, refresh)
  }, [])

  return conversations
}

export interface Presence {
  online: boolean
  label: string
}

export function presenceFor(employeeId: string): Presence {
  let hash = 0
  for (let i = 0; i < employeeId.length; i++) {
    hash = (hash * 31 + employeeId.charCodeAt(i)) >>> 0
  }
  const online = hash % 100 < 72
  if (online) return { online: true, label: "Active now" }
  const minutes = 3 + (hash % 55) + (hash % 7) * 17
  if (minutes < 60) return { online: false, label: `Active ${minutes}m ago` }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return { online: false, label: `Active ${hours}h ago` }
  return { online: false, label: "Offline" }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
