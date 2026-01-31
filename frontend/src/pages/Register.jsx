import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!name || !email || !password) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);
      await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          user_name: name,
          user_email_id: email,
          user_password: password,
        }),
      });

      navigate("/login");
    } catch (e) {
      alert("Already used email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500">
      <div className="w-[380px] rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          Create Account
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Join us and start your journey
        </p>

        <input
          className="mb-3 w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-5 w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          disabled={loading}
          className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-green-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
