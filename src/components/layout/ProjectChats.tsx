import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TrashIcon } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import {
  CONVERSATIONS_CHANGED_EVENT,
  announceConversationsChanged,
  deleteConversation,
  listConversations,
} from '@/services/conversationService'
import type { ConversationsChangedDetail } from '@/services/conversationService'
import type { Conversation } from '@/types/research'

interface ProjectChatsProps {
  projectId: string
  /** The chat open on screen, if it belongs to this project. */
  activeConversationId: string | null
  onNavigate: () => void
}

const rowClass = (isActive: boolean) =>
  [
    'group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.78rem] transition-colors',
    isActive
      ? 'bg-ink-100 font-medium text-ink-900'
      : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
  ].join(' ')

/** A project's chats in the sidebar, under its name, most recent first. */
export function ProjectChats({
  projectId,
  activeConversationId,
  onNavigate,
}: ProjectChatsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [deleting, setDeleting] = useState<Conversation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    listConversations(projectId)
      .then(setConversations)
      .catch(() => setConversations([]))
  }, [projectId])

  useEffect(() => {
    load()
    const onChanged = (event: Event) => {
      if ((event as CustomEvent<ConversationsChangedDetail>).detail.projectId === projectId) load()
    }
    window.addEventListener(CONVERSATIONS_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(CONVERSATIONS_CHANGED_EVENT, onChanged)
  }, [projectId, load])

  const open = (search: string) => {
    navigate(`/projects/${projectId}/chat?${search}`)
    onNavigate()
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteConversation(projectId, deleting.id)
      showToast({ title: 'Chat deleted' })
      // The chat page moves off a deleted chat; this list reloads itself.
      announceConversationsChanged({ projectId, deletedId: deleting.id })
    } catch (error) {
      showToast({
        title: 'Could not delete chat',
        description: error instanceof ApiError ? error.message : undefined,
      })
    } finally {
      setIsDeleting(false)
      setDeleting(null)
    }
  }

  return (
    <div className="mb-1 ml-[1.35rem] mt-0.5 space-y-0.5 border-l border-ink-100 pl-2">
      {conversations === null ? (
        <p className="px-2.5 py-1 text-[0.72rem] text-ink-400">Loading chats…</p>
      ) : conversations.length === 0 ? (
        <p className="px-2.5 py-1 text-[0.72rem] text-ink-400">No chats yet</p>
      ) : (
        conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId
          return (
            <div key={conversation.id} className={rowClass(isActive)}>
              <button
                type="button"
                onClick={() => open(`conversation=${encodeURIComponent(conversation.id)}`)}
                title={conversation.title}
                aria-current={isActive ? 'page' : undefined}
                className="min-w-0 flex-1 truncate text-left"
              >
                {conversation.title}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(conversation)}
                aria-label={`Delete chat “${conversation.title}”`}
                title="Delete chat"
                className="shrink-0 rounded p-0.5 text-ink-400 opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </div>
          )
        })
      )}

      <Modal
        open={deleting !== null}
        onClose={() => !isDeleting && setDeleting(null)}
        title="Delete chat?"
        description={deleting ? `“${deleting.title}” and all its messages will be deleted.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
              className="bg-red-600! text-white! hover:bg-red-700!"
            >
              {isDeleting ? 'Deleting…' : 'Delete chat'}
            </Button>
          </>
        }
      >
        <p className="text-[0.85rem] leading-6 text-ink-600">
          Your project's documents are not affected.
        </p>
      </Modal>
    </div>
  )
}
