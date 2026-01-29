import { useState } from "react";
import { api } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../../services/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      socket.connect();
      socket.emit("join", res.data.user._id);

      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow w-80"
      >
        <h2 className="text-xl mb-4 text-black dark:text-white">Login</h2>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded">
          Login
        </button>

        <p className="text-sm text-center mt-3 text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
