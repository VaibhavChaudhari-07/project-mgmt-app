import { useEffect, useState } from "react";
import { getActivity } from "../../../services/activity.service";

export default function ActivitySettings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getActivity();
        setList(res.data || []);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl mb-4 font-semibold">Activity History</h2>

      {loading && <div>Loading...</div>}

      {!loading && list.length === 0 && (
        <div className="text-gray-500">No activity yet.</div>
      )}

      <div className="space-y-3">
        {list.map((a) => (
          <div
            key={a._id}
            className="border rounded p-3 bg-white dark:bg-gray-800"
          >
            <div className="text-sm">
              <b>{a.user?.name || "You"}</b> —{" "}
              {a.action || "performed an action"}
              {a.project?.name && (
                <span className="text-xs text-gray-500 ml-2">
                  (Project: {a.project.name})
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {new Date(a.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
