import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/api";
import { useAuth } from "../context/AuthConext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return alert("Fill all fields");

    try {
      setLoading(true);

      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          user_email_id: email,
          user_password: password,
        }),
      });

      login(data.access_token, data.user_id);
      setSuccess(true);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (e) {
      alert(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg text-center">
        {success ? (
          <>
            <h2 className="text-2xl font-bold text-green-600">
              Login Successful
            </h2>
            <p className="mt-2 text-gray-600">
              Redirecting to chat...
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <div className="space-y-4">
              <input
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-300"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-300"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
