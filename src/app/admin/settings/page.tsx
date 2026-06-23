"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import { isEmailConfigured } from "@config";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ site_name: "", site_description: "", allow_registration: true, hero_title: "", hero_subtitle: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);
  const fetchSettings = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_site_settings").select("*").limit(1).single();
    if (data) setSettings(data as any);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = getBrowserClient();
    await supabase.from("bookworm_site_settings").upsert(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">Site Settings</h1>
      <div className="card max-w-2xl space-y-4 p-6">
        <div><label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Site Name</label><input className="input" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} /></div>
        <div><label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Site Description</label><textarea className="input" rows={3} value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} /></div>
        <div><label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Hero Title</label><input className="input" value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} /></div>
        <div><label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Hero Subtitle</label><input className="input" value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} /></div>
        <div className="flex items-center gap-2"><input type="checkbox" id="reg" checked={settings.allow_registration} onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })} /><label htmlFor="reg" className="text-sm font-semibold text-text-dark dark:text-white">Allow User Registration</label></div>
        <div className="border-t border-border pt-4 dark:border-gray-700"><h3 className="mb-2 font-bold text-text-dark dark:text-white">SMTP / Email</h3><p className="text-sm text-text">Resend API: {isEmailConfigured ? "✅ Configured" : "❌ Not configured (key invalid)"}</p></div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? "Saving..." : "Save Settings"}</button>
        {saved && <span className="ml-2 text-sm text-green-500">Saved!</span>}
      </div>
    </div>
  );
}
