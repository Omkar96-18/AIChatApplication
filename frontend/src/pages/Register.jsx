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
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
    <div className="w-[400px] rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-md">
      

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Get started with your AI workspace
        </p>
      </div>

    
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Full name
        </label>
        <input
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>


      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Email address
        </label>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>

 
      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>


      <button
        onClick={register}
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>


      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  </div>
);


  
}
