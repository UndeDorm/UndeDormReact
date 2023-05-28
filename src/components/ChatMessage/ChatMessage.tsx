import styles from './ChatMessage.module.css';

const ChatMessage = ({
  text,
  uid,
  currentUserId,
}: {
  text: string;
  uid: string;
  currentUserId: string;
}) => {
  const messageClass = uid === currentUserId ? 'sent' : 'received';

  return (
    <div className={styles['chat']}>
      <div className={styles[messageClass] + ' ' + styles['message']}>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
