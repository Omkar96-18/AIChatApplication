import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiFetch, getUserId } from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import "./Chat.css";
import { useAuth } from "../context/AuthConext";

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
  const { logout: authLogout, isAuth } = useAuth();

  const loadUser = async () => {
    const data = await apiFetch(`/users/${getUserId()}`);
    setUserInfo(data);
  };

  const loadSessions = async () => {
    const data = await apiFetch(`/users/${getUserId()}/sessions`);
    setSessions(data);
  };

  const loadMessages = async (id) => {
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

    const userMessage = { sender: "user", text: message };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage("");

    try {
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

      const aiMessage = {
        sender: "ai",
        text: data.response,
        created_at: data.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      setActiveSessionId(data.session_id);
      loadSessions();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "AI service is unavailable. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const logout = () => {
    authLogout();
  };

  useEffect(() => {
    if (isAuth) {
      loadUser();
      loadSessions();
    }
  }, [isAuth]);

  const isFirstMessage = messages.length === 0;

  const [selectedRole, setSelectedRole] = useState("Assistant");

  const roles = [
    {
      name: "Assistant",
      color: "border-blue-500 bg-blue-500 text-white",
    },
    {
      name: "Friend",
      color: "border-yellow-500 bg-yellow-500 text-white",
    },
    {
      name: "Philosopher",
      color: "border-gray-700 bg-gray-700 text-white",
    },
    {
      name: "Poet",
      color: "border-green-500 bg-green-500 text-white",
    },
  ];

  useEffect(() => {
    setRole(selectedRole.toLowerCase());
  }, [selectedRole]);
  
  return (
    <div className="flex h-screen bg-gray-900 text-white">
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

      <div className="flex flex-1 flex-col bg-gray-800">
        <div className="chat-globe" ref={chatRef}>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>
                <div className="prose max-w-none leading-relaxed text-gray-200 p-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-3" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
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
                  <div className={`timestamp ${m.sender} text-xs text-gray-400 mt-1`}>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message ai">
                <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-400 shadow-sm">
                  AI is thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="input-area">
          {isFirstMessage ? (
            <div className="flex flex-10 flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="py-4">
                <h2 className="text-[48px] font-semibold tracking-tight text-white">
                  Atharva<span className="text-gray-400">.AI</span>
                </h2>
              </div>

              <div className="w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-lg">
                <div className="mb-4 flex gap-3 flex-wrap">
                  <div className="flex gap-3 flex-wrap">
                    {roles.map((role) => (
                      <div
                        disabled={loading}
                        key={role.name}
                        onClick={() => setSelectedRole(role.name)}
                        className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                          selectedRole === role.name
                            ? `${role.color}`
                            : "border border-gray-600 bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {role.name}
                      </div>
                    ))}
                  </div>

                  <label className="group relative inline-flex items-center cursor-pointer select-none">
                    <input
                      disabled={loading}
                      type="checkbox"
                      checked={webSearch}
                      onChange={(e) => setWebSearch(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500/40 peer-checked:bg-blue-600 transition-all duration-200 ease-in-out"></div>
                    <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:border-transparent group-active:scale-90"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      Web Search
                    </span>
                  </label>
                </div>

                <div className="flex overflow-hidden rounded-xl border border-gray-600 bg-gray-700">
                  <input
                    disabled={loading}
                    className={`flex-1 bg-transparent px-4 py-3 text-sm outline-none text-white ${
                      selectedRole
                        ? `border-2 ${roles
                            .find((r) => r.name === selectedRole)
                            ?.color.replace("bg-", "border-")}`
                        : "border-gray-500"
                    }`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Start new conversation with ${selectedRole}...`}
                  />
                  <button
                    disabled={loading}
                    onClick={sendMessage}
                    className={`px-6 font-medium text-white transition ${
                      selectedRole
                        ? roles.find((r) => r.name === selectedRole)?.color
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-5 my-3 rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-md">
              <div className="mb-3 flex gap-3 flex-wrap">
                <div className="flex gap-3 flex-wrap">
                  {roles.map((role) => (
                    <div
                      disabled={loading}
                      key={role.name}
                      onClick={() => setSelectedRole(role.name)}
                      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        selectedRole === role.name
                          ? `${role.color}`
                          : "border border-gray-600 bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {role.name}
                    </div>
                  ))}
                </div>

                <label className="group relative inline-flex items-center cursor-pointer select-none">
                  <input
                    disabled={loading}
                    type="checkbox"
                    checked={webSearch}
                    onChange={(e) => setWebSearch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500/40 peer-checked:bg-blue-600 transition-all duration-200 ease-in-out"></div>
                  <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:border-transparent group-active:scale-90"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    Web Search
                  </span>
                </label>
              </div>

              <div className="flex overflow-hidden rounded-xl border border-gray-600 bg-gray-700">
                <input
                  disabled={loading}
                  className={`flex-1 bg-transparent px-4 py-3 text-sm outline-none text-white ${
                    selectedRole
                      ? `border-2 ${roles
                          .find((r) => r.name === selectedRole)
                          ?.color.replace("bg-", "border-")}`
                      : "border-gray-500"
                  }`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Have a chat with ${selectedRole}...`}
                />
                <button
                  disabled={loading}
                  onClick={sendMessage}
                  className={`px-6 font-medium text-white transition ${
                    selectedRole
                      ? roles.find((r) => r.name === selectedRole)?.color
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
