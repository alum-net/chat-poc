import { useEffect, useRef, useState } from 'react'
import { createStompClient } from '@/wsClient'

type ChatMessage = {
  id?: string
  conversationId?: string
  clientId?: string
  sender: string
  content: string
  ts?: string
}

type MessagePage = {
  items: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
}

const API = import.meta.env.VITE_API_URL as string

export default function App() {
  const [convId, setConvId] = useState('demo')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const lastTypingRef = useRef(0)

  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null)
  const subRef = useRef<ReturnType<ReturnType<typeof createStompClient>['subscribe']> | null>(null)
  const subTypingRef = useRef<ReturnType<ReturnType<typeof createStompClient>['subscribeTyping']> | null>(null)

  async function loadHistory(beforeId?: string) {
    const params = new URLSearchParams({ limit: '5' })
    if (beforeId) params.set('beforeId', beforeId)
    const res = await fetch(`${API}/api/conversations/${convId}/messages?${params}`)
    if (!res.ok) throw new Error('Failed to fetch history')
    const page = (await res.json()) as MessagePage
    if (beforeId) {
      setMessages(prev => [...page.items, ...prev])
    } else {
      setMessages(page.items)
    }
    setNextCursor(page.nextCursor)
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      await loadHistory()

      const client = createStompClient()
      client.onConnect(() => {
        if (!mounted) return

        subRef.current = client.subscribe(`/topic/conversations/${convId}`, frame => {
          const msg = JSON.parse(frame.body) as ChatMessage
          setMessages(prev => [...prev, msg])
        })

        
        subTypingRef.current = client.subscribeTyping(convId, (users) => {
          setTypingUsers(users);
        });

      })

      client.activate()
      clientRef.current = client
    })()

    return () => {
      mounted = false
      try { subRef.current?.unsubscribe() } catch {}
      try { subTypingRef.current?.unsubscribe() } catch {}
      clientRef.current?.deactivate()
      clientRef.current = null
      subRef.current = null
      subTypingRef.current = null
    }
  }, [convId])

  const send = () => {
    const client = clientRef.current
    if (!client || !client.connected) return
    const payload = {
      clientId: crypto.randomUUID(),
      sender: 'react',
      content: text.trim(),
    }
    if (!payload.content) return
    client.publish(`/app/conversations/${convId}/send`, JSON.stringify(payload))
    setText('')
  }

  const stopTimerRef = useRef<number | undefined>(undefined);

const sendTyping = () => {
  const now = Date.now();
  if (now - lastTypingRef.current < 1000) return; 
  lastTypingRef.current = now;

  clientRef.current?.publishTyping(convId, 'react', true);

  if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
  stopTimerRef.current = window.setTimeout(() => {
    clientRef.current?.publishTyping(convId, 'react', false);
  }, 2000);
};

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Chat POC</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <label>Conversation:&nbsp;</label>
        <input value={convId} onChange={e => setConvId(e.target.value)} />
        <button onClick={() => loadHistory(nextCursor!)} disabled={!nextCursor}>
          Load older
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, height: 360, overflow: 'auto', marginBottom: 8 }}>
        {messages.map(m => (
          <div key={m.id ?? `${m.clientId}-${m.ts}`}>
            <b>{m.sender}:</b> {m.content}{' '}
            <span style={{ fontSize: 12, color: '#666' }}>{m.ts ? new Date(m.ts).toLocaleTimeString() : ''}</span>
          </div>
        ))}
        {!nextCursor && <div style={{ textAlign: 'center', opacity: 0.6, padding: 8 }}>No more messages</div>}
      </div>

  
      {!!typingUsers.length && (
        <div style={{ fontSize: 12, opacity: 0.7, margin: '6px 0' }}>
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing…`
            : `${typingUsers.length} users are typing…`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1 }}
          value={text}
          onChange={e => { setText(e.target.value); sendTyping(); }}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
