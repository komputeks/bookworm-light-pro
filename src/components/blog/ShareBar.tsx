"use client";

import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp, FaLink } from "react-icons/fa";
import { useState } from "react";

/** Social sharing bar — addthis-style floating share buttons. */
export default function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { icon: FaTwitter, url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, label: "Share on X", color: "hover:bg-black hover:text-white" },
    { icon: FaFacebook, url: `https://facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: "Share on Facebook", color: "hover:bg-blue-600 hover:text-white" },
    { icon: FaLinkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, label: "Share on LinkedIn", color: "hover:bg-blue-700 hover:text-white" },
    { icon: FaWhatsapp, url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, label: "Share on WhatsApp", color: "hover:bg-green-600 hover:text-white" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-text">Share:</span>
      {links.map(({ icon: Icon, url: href, label, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text transition dark:border-gray-600 ${color}`}
        >
          <Icon />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text transition dark:border-gray-600 ${copied ? "bg-green-600 text-white" : "hover:bg-primary hover:text-white"}`}
      >
        <FaLink />
      </button>
      {copied && <span className="text-xs text-green-600">Copied!</span>}
    </div>
  );
}
