import { useEffect, useRef, useState } from "react";
import Login from "./Login";
import Sidebar from "../components/Sidebar";
import { apiFetch, clearAuth, getToken, getUserId } from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize"

export default function Chat() {
  const [userInfo, setUserInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("assistant");
  const [webSearch, setWebSearch] = useState(false);


  const chatRef = useRef(null);

  const loadUser = async () => {
    const data = await apiFetch(`/users/${getUserId()}`);
    setUserInfo(data);
  };

  const loadSessions = async () => {
    const data = await apiFetch(`/users/${getUserId()}/sessions`);
    setSessions(data);
  };

  const loadMessages = async (id) => {
    // alert(id)
    setActiveSessionId(id);
    const data = await apiFetch(`/users/${getUserId()}/sessions/${id}`);
    setMessages(data);
  };

  const deleteSession = async (id) => {
    await apiFetch(`/users/${getUserId()}/sessions/${id}`, {
      method: "DELETE",
    });


    if (id === activeSessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }

    loadSessions();
  };


  const newChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((m) => [...m, { sender: "user", text: message }]);
    setLoading(true);

    const data = await apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        session_id: activeSessionId,
        user_id: getUserId(),
        role,
        use_web_search: webSearch,
      }),
    });

    setMessages((m) => [
      ...m,
      {
        sender: "ai",
        text: data.response,
        created_at: data.created_at || new Date().toISOString(),
      },
    ]);


    setActiveSessionId(data.session_id);
    loadSessions();

    setMessage("");
    setLoading(false);
  };

  const logout = () => {
    clearAuth();
    window.location.reload();
  };

  useEffect(() => {
    if (getToken()) {
      loadUser();
      loadSessions();
    }
  }, []);

  if (!getToken()) return <Login onSuccess={() => window.location.reload()} />;

  const isFirstMessage = messages.length === 0;

  const [selectedRole, setSelectedRole] = useState("Assistant");

  const roles = [
    {
      name: "Assistant",
      color: "border-blue-500 bg-blue-300 text-blue-800"
    },
    {
      name: "Friend",
      color: "border-yellow-500 bg-yellow-300 text-yellow-800"
    },
    {
      name: "Philosopher",
      color: "border-gray-700 bg-gray-300 text-gray-800"
    },
    {
      name: "Poet",
      color: "border-green-500 bg-green-300 text-green-800"
    },
  ];

  useEffect(() => {
  setRole(selectedRole.toLowerCase());
}, [selectedRole]);



  return (
    <div className="flex h-screen bg-gray-300">
      <Sidebar
        userInfo={userInfo}
        sessions={sessions}
        activeSessionId={activeSessionId}
        loadSession={loadMessages}
        deleteSession={deleteSession}
        newChat={newChat}
        logout={logout}
        role={role}
        setRole={setRole}
        webSearch={webSearch}
        setWebSearch={setWebSearch}
      />

      <div className="flex flex-1 flex-col">
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender}`}>

              <div className="prose prose-invert max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="mb-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-2" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold" {...props} />
                    ),
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
              {m.created_at && (
                <div className={`timestamp ${m.sender}`}>
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-gray-400">AI is thinking…</div>}
        </div>

        {isFirstMessage ? (

          <div className="flex flex-10 flex-col items-center justify-center">
            <div className="py-2">
              <h2 className="text-[50px] uppercase font-semibold">Atharva.AI</h2>
            </div>
            <div className="w-full max-w-xl border rounded p-4 bg-white shadow">
              <div className="mb-3 flex gap-2">

                <div className="flex gap-4">
                  {roles.map((role) => (
                    <div
                      key={role.name}
                      onClick={() => setSelectedRole(role.name)}
                      className={`cursor-pointer px-4 py-2 rounded-full transition-all ${selectedRole === role.name
                        ? `${role.color} border-2`
                        : "border border-gray-300"
                        }`}
                    >
                      {role.name}
                    </div>
                  ))}
                </div>

                <label className="group relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={webSearch}
                    onChange={(e) => setWebSearch(e.target.checked)}
                    className="sr-only peer"
                  />


                  <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500/40 peer-checked:bg-blue-600 transition-all duration-200 ease-in-out">
                  </div>


                  <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:border-transparent group-active:scale-90">
                  </div>

                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    Web Search
                  </span>
                </label>

              </div>

              <div className="flex transition-all duration-300">
                <input
                  className={`flex-1 rounded-l-md border p-2 outline-none transition-colors ${selectedRole
                    ? `border-2 ${roles.find(r => r.name === selectedRole)?.color.replace('bg-', 'border-')}`
                    : "border-gray-300"
                    }`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Start new conversation with ${selectedRole}...`}
                />
                <button
                  onClick={sendMessage}
                  className={`px-6 py-2 rounded-r-md text-white font-medium transition-all active:scale-95 ${selectedRole
                    ? roles.find(r => r.name === selectedRole)?.color
                    : "bg-blue-600"
                    }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (

          <div className="border p-2 rounded-xl my-2 mx-5 bg-gray-100">
            <div className="mb-2 flex gap-2">

              <div className="flex gap-4">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    onClick={() => setSelectedRole(role.name)}
                    className={`cursor-pointer px-4 py-2 rounded-full transition-all ${selectedRole === role.name
                      ? `${role.color} border-2`
                      : "border border-gray-300"
                      }`}
                  >
                    {role.name}
                  </div>
                ))}
              </div>

              <label className="group relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                  className="sr-only peer"
                />


                <div className="w-11 h-6 bg-gray-200 rounded-full  peer-focus:ring-2 peer-focus:ring-blue-500/40  peer-checked:bg-blue-600  transition-all duration-200 ease-in-out">
                </div>

                <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-5 h-5  bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:border-transparent group-active:scale-90">
                </div>

                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Web Search
                </span>
              </label>

            </div>

            <div className="flex transition-all duration-300">
              <input
                className={`flex-1 rounded-l-md border p-2 outline-none transition-colors bg-white ${selectedRole
                  ? `border-2 ${roles.find(r => r.name === selectedRole)?.color.replace('bg-', 'border-')}`
                  : "border-gray-300"
                  }`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Have a Chat with ${selectedRole}...`}
              />
              <button
                onClick={sendMessage}
                className={`px-6 py-2 rounded-r-md text-white font-medium transition-all active:scale-95 ${selectedRole
                  ? roles.find(r => r.name === selectedRole)?.color
                  : "bg-blue-600"
                  }`}
              >
                Send
              </button>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
