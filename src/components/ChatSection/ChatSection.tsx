import {
  child,
  off,
  onValue,
  push,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { realtimeDb } from '../../firebase/firebase';
import { Message } from '../../utils/types';
import ChatMessage from '../ChatMessage/ChatMessage';
import styles from './ChatSection.module.css';

const ChatSection = ({
  requestId,
  currentUserId,
}: {
  requestId: string;
  currentUserId: string;
}) => {
  const dummy = useRef<HTMLSpanElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesRef = ref(realtimeDb, 'messages/' + requestId);

  useEffect(() => {
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      setMessages(
        Object.keys(data ?? {})
          .map((key) => {
            return {
              id: key,
              text: data[key].text,
              senderId: data[key].uid,
              timestamp: data[key].createdAt,
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp)
      );
    });

    return () => {
      off(messagesRef);
    };
  }, [messagesRef]);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const messageData = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: currentUserId,
    };

    const newMessageKey = push(messagesRef).key;

    const updates: any = {};
    updates['/messages/' + requestId + '/' + newMessageKey] = messageData;

    update(ref(realtimeDb), updates)
      .then(() => {
        setFormValue('');
        dummy.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        console.error('Error writing new message to Firebase Database', error);
      });
  };

  return (
    <div className={styles.chat}>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              text={msg.text}
              uid={msg.senderId}
              currentUserId={currentUserId}
            />
          ))}

        <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Send a message..."
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </div>
  );
};

export default ChatSection;
