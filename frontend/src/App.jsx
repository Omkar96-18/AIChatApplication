import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { ProtectedRoute } from "./context/ProtectedRoute";
import { useAuth } from "./context/AuthConext";
import "./App.css"

export default function App() {
  const { isAuth } = useAuth();

  return (
    <Routes>
   
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuth ? <Navigate to="/" replace /> : <Register />}
      />

 
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />


      <Route
        path="*"
        element={<Navigate to={isAuth ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
