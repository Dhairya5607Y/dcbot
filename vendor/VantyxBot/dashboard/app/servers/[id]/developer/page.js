"use client";
import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  Code2,
  Database,
  Server,
  Globe,
  Cpu,
  GitBranch,
  Shield,
  Users,
  Heart,
  ExternalLink,
  Zap,
  Package,
  Coffee,
} from "lucide-react";
import { api } from "@/utils/api";

export default function DeveloperPage({ params }) {
  const { id } = use(params);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get("/stats/bot");
        setStats(data);
      } catch (err) {
        console.error("Failed to load bot stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stackItems = [
    {
      icon: Code2,
      label: "Runtime",
      value: "Node.js v22.22.0",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      icon: Globe,
      label: "Framework",
      value: "Next.js 14 (App Router)",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Database,
      label: "Database",
      value: "MongoDB (Mongoose v8)",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Server,
      label: "API Server",
      value: "Express.js v4",
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      icon: GitBranch,
      label: "Discord Library",
      value: "discord.js v14.14.1",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Package,
      label: "Commands Engine",
      value: "ALL-IN-ONE-Bot v11.0",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Cpu,
      label: "Deployment",
      value: "Render.com (Cloud)",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: Shield,
      label: "Auth",
      value: "Discord OAuth2",
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-void text-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar guildId={id} />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              <Code2 className="text-cyan-400" size={32} />
              Developer & Project Info
            </h1>
            <p className="text-gray-400">Stack information, version details, and support resources.</p>
          </div>

          {/* Live Bot Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <StatCard label="Bot Ping" value={loading ? "..." : `${stats?.ping ?? "N/A"}ms`} icon={Zap} color="yellow" />
            <StatCard label="Servers" value={loading ? "..." : (stats?.servers ?? "N/A").toLocaleString()} icon={Globe} color="blue" />
            <StatCard label="Total Users" value={loading ? "..." : (stats?.users ?? "N/A").toLocaleString()} icon={Users} color="green" />
            <StatCard label="Commands" value="400+" icon={Code2} color="purple" />
          </div>

          {/* Tech Stack */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Server size={22} className="text-primary" />
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stackItems.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`card border ${bg} flex items-center gap-4 p-4`}>
                  <div className={`p-2.5 rounded-xl bg-white/5`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
                    <p className="text-white font-medium text-sm truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version & License */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GitBranch size={20} className="text-primary" /> Version Info
              </h3>
              <div className="space-y-3">
                <InfoRow label="Dashboard Version" value="v1.0.0" />
                <InfoRow label="Bot Engine" value="ALL-IN-ONE v11.0" />
                <InfoRow label="License" value="MIT License" />
                <InfoRow label="Original Dashboard" value="VantyxBot by Hadi" />
                <InfoRow label="Commands Source" value="uo1428/ALL-IN-ONE" />
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart size={20} className="text-red-400" /> Support & Community
              </h3>
              <div className="space-y-3">
                <SupportButton
                  href="https://github.com/Uo1428/ALL-IN-ONE-Discord-Bot-"
                  label="Commands Source Code"
                  icon={Code2}
                  color="bg-white/5 hover:bg-white/10"
                />
                <SupportButton
                  href="https://github.com/hadi-4100/VantyxBot"
                  label="Dashboard Source Code"
                  icon={Globe}
                  color="bg-blue-500/10 hover:bg-blue-500/20"
                />
                <SupportButton
                  href="https://render.com"
                  label="Deployment Platform (Render)"
                  icon={Server}
                  color="bg-purple-500/10 hover:bg-purple-500/20"
                />
              </div>
              <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                <Coffee size={18} className="text-yellow-400 shrink-0" />
                <p className="text-yellow-300 text-sm">
                  The dashboard is powered by open-source software. Consider starring the repos!
                </p>
              </div>
            </div>
          </div>

          {/* Environment Variables Info */}
          <div className="card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield size={20} className="text-emerald-400" /> Required Environment Variables
            </h3>
            <p className="text-sm text-gray-400 mb-4">These are set in your Render.com service settings and are never stored in git.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
              {[
                "DISCORD_TOKEN", "CLIENT_ID", "CLIENT_SECRET",
                "MONGO_URI", "DASHBOARD_URL", "API_URL",
                "BOT_PREFIX", "OWNER_IDS", "MAIN_GUILD_ID",
                "LAVALINK_HOST", "LAVALINK_PORT", "LAVALINK_PASSWORD",
                "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "PORT"
              ].map((env) => (
                <div key={env} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-300">{env}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    yellow: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  };
  const iconColors = { yellow: "text-yellow-400", blue: "text-blue-400", green: "text-emerald-400", purple: "text-purple-400" };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-4 flex flex-col gap-2`}>
      <Icon size={20} className={iconColors[color]} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 font-medium uppercase">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}

function SupportButton({ href, label, icon: Icon, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border border-white/10 transition-all ${color} group`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400 group-hover:text-white transition-colors" />
        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
    </a>
  );
}
