"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Left: logo + tagline */}
        <div className="footer-brand">
          {/* Put your logo file in /public/spendhive-logo.png */}
          <div className="footer-logo-wrap">
            <Image
              src="/SpendHive.png"
              alt="SpendHive logo"
              width={32}
              height={32}
              className="footer-logo-image"
            />
            <span className="footer-logo-text">SpendHive</span>
          </div>
          <p className="footer-tagline">
            Smart budgeting & expense tracking made simple.
          </p>
        </div>

        {/* Middle: navigation links */}
        <nav className="footer-nav">
          <h4>Product</h4>
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Right: social icons */}
        <div className="footer-social">
          <h4>Connect</h4>
          <div className="footer-social-icons">
            {/* <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X / Twitter"
            > */}
              {/* X icon */}
              {/* <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18.9 4H21l-4.6 5.3L21.8 20H17l-3.4-5.3L9.5 20H7.4l4.9-5.7L6.2 4h4.9l3.1 4.9L18.9 4z"
                  fill="currentColor"
                />
              </svg>
            </a> */}
            {/* <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6A2.5 2.5 0 012.5 1a2.5 2.5 0 012.48 2.5zM3 8h3v13H3V8zm7 0h2.86v1.77h.04C13.5 8.86 14.88 8 16.83 8 21 8 22 10.72 22 14.43V21H19v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-3V8z"
                  fill="currentColor"
                />
              </svg>
            </a> */}

             <a
              href="https://www.faceboook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 
                    1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 
                    4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 
                    0-1.795.715-1.795 1.764v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.403 
                    24 24 23.403 24 22.676V1.325C24 .597 23.403 0 22.675 0z" fill = "currentColor"/>
              </svg>
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 7.3A4.7 4.7 0 1016.7 12 4.71 4.71 0 0012 7.3zm0 7.7A3 3 0 1115 12a3 3 0 01-3 3zm4.9-7.9a1.1 1.1 0 11-1.1-1.1 1.1 1.1 0 011.1 1.1z"
                  fill="currentColor"
                />
                <path
                  d="M18.4 4.2A4.37 4.37 0 0015.3 3H8.7A4.37 4.37 0 005.6 4.2 4.37 4.37 0 004.2 7.3v6.6a4.37 4.37 0 001.4 3.1 4.37 4.37 0 003.1 1.4h6.6a4.37 4.37 0 003.1-1.4 4.37 4.37 0 001.4-3.1V7.3a4.37 4.37 0 00-1.4-3.1zm-.2 9.7a2.72 2.72 0 01-.8 1.9 2.72 2.72 0 01-1.9.8H8.5a2.72 2.72 0 01-1.9-.8 2.72 2.72 0 01-.8-1.9V7.1a2.72 2.72 0 01.8-1.9 2.72 2.72 0 011.9-.8h7a2.72 2.72 0 011.9.8 2.72 2.72 0 01.8 1.9z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} SpendHive. All rights reserved.</p>
      </div>
    </footer>
  );
}