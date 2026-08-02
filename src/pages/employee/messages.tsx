import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ChevronLeft,
  FileSpreadsheet,
  FileText,
  FileType,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageLoader } from "@/components/shared/skeletons"
import {
  conversationKey,
  deleteChatMessage,
  editChatMessage,
  formatFileSize,
  getOrCreateConversation,
  markConversationRead,
  presenceFor,
  sendChatMessage,
  useConversations,
} from "@/lib/messages"
import { cn } from "@/lib/utils"
import { formatDate, timeAgo } from "@/lib/format"
import type { ChatAttachment, ChatAttachmentKind, ChatMessage } from "@/data/types"

const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024

function kindFor(file: File): ChatAttachmentKind {
  const name = file.name.toLowerCase()
  if (file.type.startsWith("image/")) return "image"
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf"
  return "office"
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

function officeIcon(name: string) {
  const n = name.toLowerCase()
  if (n.endsWith(".xls") || n.endsWith(".xlsx") || n.endsWith(".csv")) return FileSpreadsheet
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return FileType
  return FileText
}

function dateLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return formatDate(d, { month: "long", day: "numeric", year: "numeric" })
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const parts: ReactNode[] = []
  let i = 0
  while (i < text.length) {
    const idx = lower.indexOf(q, i)
    if (idx === -1) {
      parts.push(text.slice(i))
      break
    }
    if (idx > i) parts.push(text.slice(i, idx))
    parts.push(
      <mark
        key={idx}
        className="bg-amber-200/70 rounded-[2px] text-inherit dark:bg-amber-400/30"
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    )
    i = idx + q.length
  }
  return parts
}

function AttachmentCard({
  attachment,
  onRemove,
  compact = false,
}: {
  attachment: ChatAttachment
  onRemove?: () => void
  compact?: boolean
}) {
  const Icon = attachment.kind === "office" ? officeIcon(attachment.name) : FileText
  if (attachment.kind === "image" && attachment.dataUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={attachment.dataUrl}
          alt={attachment.name}
          className={cn("w-full rounded-xl object-cover", compact ? "max-h-56" : "max-h-64")}
        />
        <div className="absolute bottom-2 left-2 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {attachment.name} · {formatFileSize(attachment.size)}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove attachment"
            className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-slate-950/60 text-white transition hover:bg-rose-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          attachment.kind === "pdf"
            ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
            : "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{attachment.name}</span>
        <span className="text-muted-foreground text-[11px]">
          {formatFileSize(attachment.size)} ·{" "}
          {attachment.kind === "pdf" ? "PDF document" : "Office document"}
        </span>
      </span>
      {attachment.dataUrl && (
        <a
          href={attachment.dataUrl}
          download={attachment.name}
          className="text-muted-foreground hover:text-primary text-[11px] font-semibold"
        >
          Download
        </a>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
          className="text-muted-foreground hover:text-destructive flex size-6 shrink-0 items-center justify-center rounded-full transition"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

export function MessagesPage() {
  const { user } = useAuth()
  const { employees } = useData()
  const conversations = useConversations()
  const loading = useDelayedLoading(400)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentUserId = user?.id ?? ""
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [newChatQuery, setNewChatQuery] = useState("")
  const [draft, setDraft] = useState("")
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [threadQuery, setThreadQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null
  const otherId = selectedConv
    ? (selectedConv.participantIds.find((p) => p !== currentUserId) ??
      selectedConv.participantIds[0])
    : null
  const other = employees.find((e) => e.id === otherId)

  useEffect(() => {
    const withId = searchParams.get("with")
    if (withId && currentUserId && !conversations.some((c) => c.id === conversationKey(currentUserId, withId))) {
      getOrCreateConversation(currentUserId, withId)
    }
    if (withId && currentUserId) {
      setSelectedId(conversationKey(currentUserId, withId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUserId])

  useEffect(() => {
    if (selectedConv && currentUserId) {
      markConversationRead(selectedConv.id, currentUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.id, currentUserId])

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [selectedConv?.id, selectedConv?.messages.length, threadQuery])

  const conversationItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return conversations
      .filter((c) => c.participantIds.includes(currentUserId))
      .map((c) => {
        const pid = c.participantIds.find((p) => p !== currentUserId) ?? c.participantIds[0]
        const person = employees.find((e) => e.id === pid)
        const last = c.messages[c.messages.length - 1]
        const unread = c.messages.filter((m) => m.senderId !== currentUserId && !m.read).length
        const searchable = c.messages.map((m) => m.text).join(" ").toLowerCase()
        return { c, pid, person, last, unread, searchable }
      })
      .filter((item) => {
        if (!q) return true
        const name = item.person
          ? `${item.person.firstName} ${item.person.lastName}`.toLowerCase()
          : ""
        return name.includes(q) || item.searchable.includes(q)
      })
      .sort((a, b) => {
        const ta = a.last?.time ?? ""
        const tb = b.last?.time ?? ""
        return tb.localeCompare(ta)
      })
  }, [conversations, query, employees, currentUserId])

  const searchableEmployees = useMemo(() => {
    const q = newChatQuery.trim().toLowerCase()
    return employees
      .filter((e) => e.id !== currentUserId)
      .filter((e) => {
        if (!q) return true
        return `${e.firstName} ${e.lastName} ${e.department} ${e.designation}`
          .toLowerCase()
          .includes(q)
      })
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
  }, [employees, newChatQuery, currentUserId])

  const visibleMessages = useMemo(() => {
    if (!selectedConv) return []
    const q = threadQuery.trim().toLowerCase()
    if (!q) return selectedConv.messages
    return selectedConv.messages.filter((m) => m.text.toLowerCase().includes(q))
  }, [selectedConv, threadQuery])

  const openChat = (employeeId: string) => {
    if (!currentUserId) return
    const key = conversationKey(currentUserId, employeeId)
    getOrCreateConversation(currentUserId, employeeId)
    setSelectedId(key)
    setNewChatOpen(false)
    setNewChatQuery("")
  }

  const handlePickAttachment = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error("File too large", {
        description: "Attachments are limited to 8 MB.",
      })
      return
    }
    const kind = kindFor(file)
    let dataUrl: string | null = null
    try {
      if (kind === "image" || kind === "pdf") {
        dataUrl = await readFileAsDataUrl(file)
      }
    } catch {
      dataUrl = null
    }
    setPendingAttachment({
      id: `A-${Date.now()}`,
      name: file.name,
      kind,
      mimeType: file.type,
      size: file.size,
      dataUrl,
    })
  }

  const send = () => {
    if (!selectedConv) return
    const text = draft.trim()
    if (!text && !pendingAttachment) return
    sendChatMessage({
      convId: selectedConv.id,
      senderId: currentUserId,
      text,
      attachment: pendingAttachment,
    })
    setDraft("")
    setPendingAttachment(null)
  }

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id)
    setEditDraft(msg.text)
  }

  const saveEdit = () => {
    if (!selectedConv || !editingId) return
    if (!editDraft.trim()) {
      toast.error("Message cannot be empty")
      return
    }
    editChatMessage(selectedConv.id, editingId, editDraft)
    setEditingId(null)
    setEditDraft("")
  }

  const confirmDelete = () => {
    if (!selectedConv || !deleteTarget) return
    deleteChatMessage(selectedConv.id, deleteTarget.id)
    setDeleteTarget(null)
    toast("Message deleted", { description: "The message was removed." })
  }

  if (loading) return <PageLoader variant="list" />

  const presence = other ? presenceFor(other.id) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs">
            Workplace <span className="text-muted-foreground/50">·</span> Messages
          </p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Messages</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            One-to-one conversations with your colleagues. Share text, images and office
            documents.
          </p>
        </div>
        <Button size="sm" onClick={() => setNewChatOpen(true)}>
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-card lg:h-[calc(100vh-13.5rem)] lg:min-h-[520px]">
        <div className="flex h-full flex-col md:flex-row">
          {/* Conversation list */}
          <div
            className={cn(
              "w-full flex-col border-b md:w-80 md:shrink-0 md:border-r md:border-b-0",
              selectedConv ? "hidden md:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2 border-b p-3">
              <Search className="text-muted-foreground size-4 shrink-0" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people or messages..."
                className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversationItems.length === 0 ? (
                <EmptyState
                  compact
                  icon={MessageSquare}
                  title={query ? "No matches found" : "No conversations yet"}
                  description={
                    query
                      ? "Try a different name or message keyword."
                      : "Start a conversation with a colleague to get going."
                  }
                  action={
                    !query && (
                      <Button size="sm" onClick={() => setNewChatOpen(true)}>
                        <Plus className="size-4" />
                        Start a new chat
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="divide-y">
                  {conversationItems.map(({ c, pid, person, last, unread }) => {
                    const name = person
                      ? `${person.firstName} ${person.lastName}`
                      : pid
                    const active = c.id === selectedId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                          active
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span className="relative shrink-0">
                          <Avatar name={name} size="sm" />
                          <span
                            className={cn(
                              "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card",
                              presenceFor(pid).online ? "bg-emerald-500" : "bg-muted-foreground/40"
                            )}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold">{name}</span>
                            {last && (
                              <span className="text-muted-foreground shrink-0 text-[10px]">
                                {timeAgo(last.time)}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "truncate text-xs",
                                unread > 0
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {last
                                ? `${last.senderId === currentUserId ? "You: " : ""}${last.attachment ? (last.text ? last.text : `📎 ${last.attachment.name}`) : last.text}`
                                : "No messages yet"}
                            </span>
                            {unread > 0 && (
                              <span className="bg-primary flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                                {unread}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Thread */}
          <div
            className={cn(
              "min-w-0 flex-1 flex-col",
              selectedConv ? "flex" : "hidden md:flex"
            )}
          >
            {!selectedConv || !other ? (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Pick a conversation from the list or start a new chat with a colleague."
                  action={
                    <Button size="sm" onClick={() => setNewChatOpen(true)}>
                      <Plus className="size-4" />
                      Start a new chat
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-2.5 border-b px-3.5 py-2.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Avatar
                    name={`${other.firstName} ${other.lastName}`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {other.firstName} {other.lastName}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5 truncate text-[11px]">
                      {presence && (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            presence.online ? "bg-emerald-500" : "bg-muted-foreground/40"
                          )}
                        />
                      )}
                      {presence ? presence.label : "Offline"} · {other.designation}
                    </p>
                  </div>
                  <div className="relative hidden sm:block">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                    <Input
                      value={threadQuery}
                      onChange={(e) => setThreadQuery(e.target.value)}
                      placeholder="Search this conversation"
                      className="h-8 w-56 pl-8 text-xs"
                    />
                  </div>
                </div>

                {/* Messages */}
                <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                  {visibleMessages.length === 0 ? (
                    <EmptyState
                      compact
                      icon={Search}
                      title={threadQuery ? "No matching messages" : "No messages yet"}
                      description={
                        threadQuery
                          ? "Nothing in this conversation matches your search."
                          : "Say hello and start the conversation."
                      }
                    />
                  ) : (
                    (() => {
                      const blocks: { date: string; messages: ChatMessage[] }[] = []
                      for (const m of visibleMessages) {
                        const label = dateLabel(m.time)
                        const last = blocks[blocks.length - 1]
                        if (last && last.date === label) last.messages.push(m)
                        else blocks.push({ date: label, messages: [m] })
                      }
                      return blocks.map((block, bi) => (
                        <div key={bi} className="space-y-3">
                          <div className="flex items-center justify-center">
                            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-[10px] font-semibold">
                              {block.date}
                            </span>
                          </div>
                          {block.messages.map((m) => {
                            const mine = m.senderId === currentUserId
                            const isEditing = editingId === m.id
                            const match =
                              threadQuery.trim() && m.text.toLowerCase().includes(threadQuery.trim().toLowerCase())
                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "group flex w-full",
                                  mine ? "justify-end" : "justify-start"
                                )}
                              >
                                {!mine && (
                                  <Avatar
                                    name={`${other.firstName} ${other.lastName}`}
                                    size="xs"
                                    className="mt-1 mr-2"
                                  />
                                )}
                                <div className={cn("max-w-[82%] sm:max-w-[70%]")}>
                                  {isEditing ? (
                                    <div className="flex items-end gap-2">
                                      <Textarea
                                        value={editDraft}
                                        onChange={(e) => setEditDraft(e.target.value)}
                                        rows={2}
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            saveEdit()
                                          }
                                          if (e.key === "Escape") {
                                            setEditingId(null)
                                            setEditDraft("")
                                          }
                                        }}
                                        className="min-h-14 w-72 max-w-full text-[13px]"
                                      />
                                      <Button size="sm" onClick={saveEdit}>
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingId(null)
                                          setEditDraft("")
                                        }}
                                        aria-label="Cancel edit"
                                      >
                                        <X className="size-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div
                                      className={cn(
                                        "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
                                        mine
                                          ? "bg-primary text-primary-foreground rounded-br-md"
                                          : "bg-muted text-foreground rounded-bl-md",
                                        m.attachment?.kind === "image" && m.attachment.dataUrl
                                          ? "bg-transparent p-1.5 shadow-none"
                                          : ""
                                      )}
                                    >
                                      {m.attachment?.kind === "image" &&
                                      m.attachment.dataUrl ? (
                                        <AttachmentCard attachment={m.attachment} />
                                      ) : null}
                                      {m.attachment &&
                                      m.attachment.kind !== "image" ? (
                                        <AttachmentCard
                                          attachment={m.attachment}
                                          compact
                                        />
                                      ) : null}
                                      {m.text && (
                                        <p className={cn("whitespace-pre-wrap", m.attachment ? "mt-2" : "")}>
                                          {match ? highlight(m.text, threadQuery.trim()) : m.text}
                                        </p>
                                      )}
                                      <div
                                        className={cn(
                                          "mt-1 flex items-center gap-1.5 text-[10px]",
                                          mine ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}
                                      >
                                        <span>{timeAgo(m.time)}</span>
                                        {m.edited && <span>· edited</span>}
                                      </div>
                                    </div>
                                  )}
                                  {mine && !isEditing && (
                                    <div className="mt-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => startEdit(m)}
                                        aria-label="Edit message"
                                        className="text-muted-foreground hover:text-primary size-6"
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setDeleteTarget(m)}
                                        aria-label="Delete message"
                                        className="text-muted-foreground hover:text-destructive size-6"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))
                    })()
                  )}
                </div>

                {/* Composer */}
                <div className="border-t p-3">
                  {pendingAttachment && (
                    <div className="mb-2">
                      <AttachmentCard
                        attachment={pendingAttachment}
                        onRemove={() => setPendingAttachment(null)}
                      />
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={(e) => {
                        handlePickAttachment(e.target.files?.[0])
                        e.target.value = ""
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach a file"
                      className="shrink-0"
                    >
                      <Paperclip className="size-4" />
                    </Button>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                      placeholder={`Message ${other.firstName}...`}
                      rows={1}
                      className="min-h-10 max-h-32 flex-1 resize-none text-sm"
                    />
                    <Button
                      onClick={send}
                      disabled={!draft.trim() && !pendingAttachment}
                      aria-label="Send message"
                      className="shrink-0"
                    >
                      <Send className="size-4" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-1.5 px-1 text-[10px]">
                    Enter to send · Shift+Enter for a new line · Images, PDFs and office documents
                    supported
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New chat dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a new chat</DialogTitle>
            <DialogDescription>
              Search for a colleague to start a one-to-one conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={newChatQuery}
              onChange={(e) => setNewChatQuery(e.target.value)}
              placeholder="Search by name, department or designation..."
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {searchableEmployees.length === 0 ? (
              <EmptyState compact icon={Search} title="No employees found" />
            ) : (
              searchableEmployees.map((e) => {
                const p = presenceFor(e.id)
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => openChat(e.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <span className="relative shrink-0">
                      <Avatar name={`${e.firstName} ${e.lastName}`} size="sm" />
                      <span
                        className={cn(
                          "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card",
                          p.online ? "bg-emerald-500" : "bg-muted-foreground/40"
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {e.firstName} {e.lastName}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {e.designation} · {e.department}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[10px] font-medium">
                      {p.label}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete message?"
        description="This will permanently remove the message from the conversation."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  )
}

