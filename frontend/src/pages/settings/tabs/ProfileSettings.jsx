import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../../services/userSettings.service";

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!name.trim()) return alert("Name required");

    const payload = { name };
    if (password.trim()) payload.password = password;

    await updateMe(payload);
    alert("Profile updated successfully");
    setPassword("");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl mb-4 font-semibold">Profile Settings</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          {name?.[0]?.toUpperCase()}
        </div>

        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {email}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="border p-2 w-full dark:bg-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border p-2 w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            value={email}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            className="border p-2 w-full dark:bg-gray-800"
            type="password"
            placeholder="Leave blank to keep current"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={save}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
