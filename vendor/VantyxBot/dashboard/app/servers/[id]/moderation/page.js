"use client";
import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  MessageSquare,
  Link as LinkIcon,
  UserPlus,
  AlertOctagon,
  Save,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";
import { api } from "@/utils/api";

export default function ModerationPage({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Automod State
  const [automod, setAutomod] = useState({
    antiSpam: { enabled: false, timeoutDuration: 3600000, actions: ["timeout"] },
    antiBadWords: { enabled: false, words: [], timeoutDuration: 3600000, actions: ["timeout"] },
    antiInvites: { enabled: false, timeoutDuration: 3600000, actions: ["timeout"] },
    antiLinks: { enabled: false, timeoutDuration: 3600000, actions: ["timeout"] }
  });

  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    const fetchModSettings = async () => {
      try {
        const { data } = await api.get(`/automod/guild/${id}`);
        if (data) setAutomod(data);
      } catch (err) {
        console.error("Failed to load automod settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModSettings();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/automod/guild/${id}`, automod);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save automod settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const addBadWord = () => {
    if (!newWord.trim()) return;
    setAutomod(prev => ({
      ...prev,
      antiBadWords: {
        ...prev.antiBadWords,
        words: [...new Set([...prev.antiBadWords.words, newWord.trim().toLowerCase()])]
      }
    }));
    setNewWord("");
  };

  const removeBadWord = (wordToRemove) => {
    setAutomod(prev => ({
      ...prev,
      antiBadWords: {
        ...prev.antiBadWords,
        words: prev.antiBadWords.words.filter(w => w !== wordToRemove)
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar guildId={id} />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent">
                <Shield className="text-rose-500" size={32} />
                Moderation & Security
              </h1>
              <p className="text-gray-400">Configure Auto-Mod filters, warnings, and security barriers.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                success ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-dark active:border-b-0 active:translate-y-1'
              }`}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <><CheckCircle2 size={20} /> Saved!</>
              ) : (
                <><Save size={20} /> Save Changes</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            
            {/* Anti-Spam Card */}
            <div className={`card transition-colors duration-300 ${automod.antiSpam.enabled ? 'border-primary/50 bg-primary/5' : 'border-white/10'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${automod.antiSpam.enabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Anti-Spam</h3>
                    <p className="text-sm text-gray-400">Detects and punishes rapid messaging.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={automod.antiSpam.enabled}
                    onChange={(e) => setAutomod({...automod, antiSpam: {...automod.antiSpam, enabled: e.target.checked}})}
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Anti-Links Card */}
            <div className={`card transition-colors duration-300 ${automod.antiLinks.enabled ? 'bg-indigo-500/5 border-indigo-500/50' : 'border-white/10'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${automod.antiLinks.enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                    <LinkIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Anti-Links</h3>
                    <p className="text-sm text-gray-400">Deletes unauthorized external links.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={automod.antiLinks.enabled}
                    onChange={(e) => setAutomod({...automod, antiLinks: {...automod.antiLinks, enabled: e.target.checked}})}
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>

            {/* Anti-Invites Card */}
            <div className={`card transition-colors duration-300 ${automod.antiInvites.enabled ? 'bg-purple-500/5 border-purple-500/50' : 'border-white/10'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${automod.antiInvites.enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Anti-Invites</h3>
                    <p className="text-sm text-gray-400">Blocks links to other Discord servers.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={automod.antiInvites.enabled}
                    onChange={(e) => setAutomod({...automod, antiInvites: {...automod.antiInvites, enabled: e.target.checked}})}
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>

            {/* Anti-BadWords Builder */}
            <div className={`card lg:col-span-2 transition-colors duration-300 ${automod.antiBadWords.enabled ? 'bg-rose-500/5 border-rose-500/50' : 'border-white/10'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${automod.antiBadWords.enabled ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-400'}`}>
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bad Word Filter</h3>
                    <p className="text-sm text-gray-400">Automatically delete messages containing these keywords.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={automod.antiBadWords.enabled}
                    onChange={(e) => setAutomod({...automod, antiBadWords: {...automod.antiBadWords, enabled: e.target.checked}})}
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {automod.antiBadWords.enabled && (
                <div className="animate-fade-in mt-4 pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Type a word to ban..."
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBadWord()}
                    />
                    <button onClick={addBadWord} className="btn bg-white/10 hover:bg-white/20 px-6 rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {automod.antiBadWords.words.map((word) => (
                      <span key={word} className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                        {word}
                        <button onClick={() => removeBadWord(word)} className="hover:text-white transition-colors">
                          <XCircle size={16} />
                        </button>
                      </span>
                    ))}
                    {automod.antiBadWords.words.length === 0 && (
                      <span className="text-gray-500 text-sm italic">No banned words added yet.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
