// app/page.js
import SocketIOClient from './components/SocketIOClient';

export default function Home() {
  return (
    <div>
      <SocketIOClient />
    </div>
  );
}