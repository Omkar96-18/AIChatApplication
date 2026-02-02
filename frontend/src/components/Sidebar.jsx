export default function Sidebar({
  userInfo,
  sessions,
  activeSessionId,
  loadSession,
  deleteSession,
  newChat,
  logout,
}) {
  return (
    <div
      className="holographic-sidebar"
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <h3 className="mb-4 px-2 text-lg font-semibold tracking-tight text-white">
          Chats
        </h3>

        <div className="flex-1 space-y-1 overflow-y-auto rounded-xl bg-black/20 px-2 py-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                s.id === activeSessionId
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700 text-gray-300 hover:scale-101 transition-all"
              }`}
            >
              <span
                className="flex-1 truncate"
                onClick={() => loadSession(s.id)}
              >
                {s.title}
              </span>

              <button
                onClick={() => deleteSession(s.id)}
                className="ml-2 opacity-70 transition hover:opacity-100 hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-700/50 pt-4">
        <div className="rounded-xl p-3">
          <div className="mb-3 text-sm">
            <p className="truncate font-medium text-white">
              {userInfo?.user_name || "Guest"}
            </p>
            <p className="truncate text-xs text-gray-400">
              {userInfo?.user_email_id}
            </p>
          </div>
        </div>
      </div>
      <div className="floating-action-buttons">
        <button
          onClick={newChat}
          className="fab-new-chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          onClick={logout}
          className="fab-logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}