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
    <div className="flex h-auto w-72 flex-col border-r bg-gray-50 p-4 bg-gray-50 py-5 my-2 mx-2 rounded-xl">

      <div className="flex flex-1 flex-col overflow-hidden">
        <h3 className="mb-4 text-lg font-semibold px-2">Chats</h3>
        
        <button
          onClick={newChat}
          className="mb-4 w-full rounded-xl bg-green-600 py-2 text-white hover:bg-green-700 transition-colors flex justify-center items-center uppercase font-[600]"
        >
          <img src="/icons/create-chat-dark.svg" alt="create-chat" className="h-[30px]"/> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 bg-gray-300 rounded-xl py-5 px-2 cursor-pointer">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-xl p-2 text-sm cursor-pointertransition-colors ${
                s.id === activeSessionId
                  ? "bg-blue-400"
                  : "hover:bg-green-200"
              }`}
            >
              <span className="truncate flex-1" onClick={() => loadSession(s.id)}>
                {s.title}
              </span>
              <button 
                onClick={() => deleteSession(s.id)}
                className="ml-2 hover:scale-110 transition-all"
              >
                <img src="/icons/delete.svg" alt="delete_image" className="h-[25px]"/>
              </button>
            </div>
          ))}
        </div>
      </div>

 
      <div className="mt-4 border-t pt-4">
        <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-200">
          <div className="mb-3 text-sm">
            <p className="font-bold text-gray-800 truncate">{userInfo?.user_name || "Guest"}</p>
            <p className="text-xs text-gray-500 truncate">{userInfo?.user_email_id}</p>
          </div>
          
          <button
            onClick={logout}
            className="w-full rounded bg-red-500 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}