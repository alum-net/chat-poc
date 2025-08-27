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

  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null)
  const subRef = useRef<ReturnType<ReturnType<typeof createStompClient>['subscribe']> | null>(null)

  async function loadHistory(beforeId?: string) {
    const params = new URLSearchParams({ limit: '5' })
    if (beforeId) params.set('beforeId', beforeId)
    const res = await fetch(`${API}/api/conversations/${convId}/messages?${params}`)
    const page = (await res.json()) as MessagePage
    if (beforeId) {
      setMessages(prev => [...page.items, ...prev])
    } else {
      setMessages(page.items)
    }
    setNextCursor(page.nextCursor)
  }

  // conectar + suscribirse cuando cambia convId
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
      })
      client.activate()
      clientRef.current = client
    })()

    return () => {
      mounted = false
      try { subRef.current?.unsubscribe() } catch {}
      clientRef.current?.deactivate()
      clientRef.current = null
      subRef.current = null
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

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, height: 360, overflow: 'auto', marginBottom: 12 }}>
        {messages.map(m => (
          <div key={m.id ?? `${m.clientId}-${m.ts}`}>
            <b>{m.sender}:</b> {m.content}{' '}
            <span style={{ fontSize: 12, color: '#666' }}>{m.ts ? new Date(m.ts).toLocaleTimeString() : ''}</span>
          </div>
        ))}
        {!nextCursor && <div style={{ textAlign: 'center', opacity: 0.6, padding: 8 }}>No more messages</div>}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1 }}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
