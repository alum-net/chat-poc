import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL as string

export function createStompClient() {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (s) => console.log(s),
  })

  const api = {
    activate: () => client.activate(),
    deactivate: () => client.deactivate(),
    onConnect: (fn: () => void) => { client.onConnect = fn },
    subscribe: (destination: string, handler: (msg: IMessage) => void): StompSubscription =>
      client.subscribe(destination, handler),
    publish: (destination: string, body: string) =>
      client.publish({ destination, body }),
    get connected() { return client.connected }
  }

  return api
}
