"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "../auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        const role = await getUserRole(u.uid);
        setUserRole(role);
        if (role !== "thinktank") {
          router.push("/");
        }
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!db || !user) return;

    const q = query(collection(db, "issues"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(items);
      calculateAnalytics(items);
    });

    return () => unsub();
  }, [user]);

  function calculateAnalytics(issuesData) {
    const total = issuesData.length;
    const byStatus = {};
    const byCategory = {};
    const byLocation = {};
    const resolutionTimes = [];
    const recurringIssues = {};

    issuesData.forEach((issue) => {
      // Status breakdown
      byStatus[issue.status || "open"] = (byStatus[issue.status || "open"] || 0) + 1;

      // Category breakdown
      byCategory[issue.category || "other"] =
        (byCategory[issue.category || "other"] || 0) + 1;

      // Location breakdown
      const loc = issue.location || "Unknown";
      byLocation[loc] = (byLocation[loc] || 1) + 1;

      // Resolution time
      if (issue.response && issue.createdAt) {
        const created = issue.createdAt.toDate
          ? issue.createdAt.toDate()
          : new Date(issue.createdAt);
        const responded = issue.response.respondedAt
          ? new Date(issue.response.respondedAt)
          : new Date();
        const days = Math.floor((responded - created) / (1000 * 60 * 60 * 24));
        resolutionTimes.push(days);
      }

      // Recurring issues (same location + category)
      const key = `${issue.location}_${issue.category}`;
      recurringIssues[key] = (recurringIssues[key] || 0) + 1;
    });

    const avgResolutionTime =
      resolutionTimes.length > 0
        ? Math.round(
            resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
          )
        : 0;

    const resolved = byStatus.resolved || 0;
    const unresolved = byStatus.unresolved || 0;
    const inProgress = byStatus.in_progress || 0;
    const open = byStatus.open || 0;

    setAnalytics({
      total,
      byStatus,
      byCategory,
      byLocation,
      avgResolutionTime,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
      recurringIssues: Object.entries(recurringIssues)
        .filter(([_, count]) => count > 1)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 10),
    });
  }

  async function generateAIReport() {
    if (!analytics || issues.length === 0) {
      alert("No data available for report generation");
      return;
    }

    setGenerating(true);
    try {
      // Note: You'll need to set NEXT_PUBLIC_GEMINI_API_KEY in your .env file
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
        setGenerating(false);
        return;
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze the following civic issue data and generate a comprehensive policy intelligence report:

Total Issues: ${analytics.total}
Resolution Rate: ${analytics.resolutionRate}%
Average Resolution Time: ${analytics.avgResolutionTime} days

Status Breakdown:
${JSON.stringify(analytics.byStatus, null, 2)}

Category Breakdown:
${JSON.stringify(analytics.byCategory, null, 2)}

Top Recurring Issues:
${analytics.recurringIssues.map(([key, count]) => `${key}: ${count} times`).join("\n")}

Generate a report with:
1. Executive Summary
2. Key Findings
3. Top Problem Areas
4. Recommendations for Policy Makers
5. Trends and Patterns`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const report = response.text();

      // Create downloadable report
      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `civic-issue-report-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("Report generated and downloaded!");
    } catch (err) {
      console.error("AI report generation error:", err);
      alert("Failed to generate report: " + err.message);
    } finally {
      setGenerating(false);
    }
  }

  function exportToCSV() {
    if (issues.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Category",
      "Location",
      "Status",
      "Upvotes",
      "Created At",
      "Resolved At",
    ];
    const rows = issues.map((issue) => [
      issue.id,
      issue.title,
      issue.category,
      issue.location,
      issue.status,
      issue.upvotes || 0,
      issue.createdAt
        ? issue.createdAt.toDate
          ? issue.createdAt.toDate().toISOString()
          : new Date(issue.createdAt).toISOString()
        : "",
      issue.response?.respondedAt || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civic-issues-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Policy Analytics Dashboard
            </h1>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={generateAIReport}
                disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate AI Report"}
              </button>
            </div>
          </div>

          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Total Issues
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.total}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Resolution Rate
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.resolutionRate}%
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Avg Resolution Time
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.avgResolutionTime} days
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Recurring Issues
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  {analytics.recurringIssues.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500 mb-8">
              Loading analytics...
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            {analytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Status Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.byStatus).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {analytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.byCategory)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {category.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Recurring Issues */}
          {analytics && analytics.recurringIssues.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Top Recurring Issues
              </h2>
              <div className="space-y-2">
                {analytics.recurringIssues.map(([key, count], idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-red-50 rounded"
                  >
                    <span className="text-sm text-gray-700">{key}</span>
                    <span className="text-sm font-semibold text-red-600">
                      Reported {count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

