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

      console.log(data);
      

      login(data.access_token, data.user_id);

      const user = await apiFetch(`/users/${data.user_id}`)

      if (!user || !user.user_id) {
        throw new Error("User not found or not signed in");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (e) {
      alert(e.message || "Login failed");
      console.log(e);
      
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
    <div className="w-full max-w-sm rounded-2xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">

      {success ? (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            Login successful
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Redirecting you to your workspace…
          </p>
        </>
      ) : (
        <>
          <h2 className="mb-1 text-2xl font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Sign in to continue to Atharva.AI
          </p>

          <div className="space-y-4">
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-gray-900 hover:underline"
            >
              Create one
            </Link>
          </p>
        </>
      )}
    </div>
  </div>
);

}
