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
  <div className="flex h-auto w-72 flex-col rounded-2xl border bg-gray-50 p-4 m-2 shadow-sm">

    <div className="flex flex-1 flex-col overflow-hidden">
      <h3 className="mb-4 px-2 text-lg font-semibold tracking-tight text-gray-900">
        Chats
      </h3>

      <button
        onClick={newChat}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-semibold uppercase text-white transition hover:bg-green-600"
      >
        <img
          src="/icons/create-chat-dark.svg"
          alt="create-chat"
          className="h-[26px]"
        />
        New Chat
      </button>

      <div className="flex-1 space-y-1 overflow-y-auto rounded-xl bg-gray-100 px-2 py-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              s.id === activeSessionId
                ? "bg-green-400 text-white"
                : "hover:bg-green-200 text-gray-800 hover:scale-101 transition-all"
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
              <img
                src="/icons/delete.svg"
                alt="delete_image"
                className="h-[20px]"
              />
            </button>
          </div>
        ))}
      </div>
    </div>


    <div className="mt-4 border-t pt-4">
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="mb-3 text-sm">
          <p className="truncate font-medium text-gray-900">
            {userInfo?.user_name || "Guest"}
          </p>
          <p className="truncate text-xs text-gray-500">
            {userInfo?.user_email_id}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full rounded-lg bg-red-600 py-1.5 text-sm font-medium text-white transition hover:bg-red-400"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

}