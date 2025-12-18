import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  return (
    <div className="app-root">
      <div className="chat-shell">
        <div className="chat-header">
          <div>
            <div className="chat-header-title">Placement Prep LLM Chatbot</div>
            <div className="chat-header-subtitle">
              Practise DSA, HR and System Design interviews in one place.
            </div>
          </div>
          <div className="stats-pill">
            <span>DSA • Practice</span>
            <span>HR • Behaviour</span>
            <span>System Design</span>
          </div>
        </div>

        <div>
          <ChatBot />
        </div>

        <aside>
          <h3 style={{ fontSize: 14, marginTop: 6 }}>Session Tips</h3>
          <ul style={{ fontSize: 12, color: '#9ca3af', paddingLeft: 18 }}>
            <li>Answer like in a real interview; think aloud.</li>
            <li>After answering, ask “Give me feedback on my answer”.</li>
            <li>Switch modes to cover DSA, HR and System Design daily.</li>
          </ul>
          <h3 style={{ fontSize: 14, marginTop: 16 }}>Suggested Prompts</h3>
          <ul style={{ fontSize: 12, color: '#9ca3af', paddingLeft: 18 }}>
            <li>“Give me an easy array question.”</li>
            <li>“Ask a medium DP question.”</li>
            <li>“Ask 3 rapid-fire HR questions.”</li>
            <li>“Give me a small system design warm-up.”</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default App;
