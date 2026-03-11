## 2026-03-08 - Added Security Headers
**Vulnerability:** The application was missing standard HTTP security headers, leaving it potentially vulnerable to clickjacking and MIME-type sniffing.
**Learning:** Added security headers in `next.config.ts` to enforce Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and X-DNS-Prefetch-Control.
**Prevention:** Always include a robust set of security headers in the Next.js configuration to mitigate common web vulnerabilities.
