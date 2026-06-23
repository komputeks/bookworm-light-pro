"use client";

import { useState } from "react";
import { siteConfig } from "@config";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send an email via the email service.
    setSent(true);
  };

  return (
    <div className="section">
      <div className="container-book">
        <h1 className="mb-6 text-3xl font-bold text-text-dark dark:text-white">Contact Us</h1>
        {sent ? (
          <div className="card p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-primary">Message sent!</h2>
            <p className="text-text">Thanks for reaching out. We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Message</label>
              <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="input" placeholder="Your message" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
