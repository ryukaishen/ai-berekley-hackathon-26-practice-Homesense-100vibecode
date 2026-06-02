import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

type BannerProps = {
  children: ReactNode;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

const STORAGE_KEY = "reentry-theme";

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="focus-ring re-btn re-btn-ghost"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    </button>
  );
}

export function DisclaimerBanner({ children }: BannerProps) {
  return (
    <aside
      role="note"
      className="re-disclaimer"
      aria-live="polite"
      aria-label="Important disclaimer"
    >
      <p>{children}</p>
    </aside>
  );
}

export function SurfaceCard({ title, subtitle, children }: CardProps) {
  return (
    <section className="re-card">
      {title ? <h3 className="re-card-title">{title}</h3> : null}
      {subtitle ? <p className="re-card-subtitle">{subtitle}</p> : null}
      <div>{children}</div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="re-page-header">
      <div>
        {eyebrow ? <p className="re-eyebrow">{eyebrow}</p> : null}
        <h1 className="re-heading">{title}</h1>
        {subtitle ? <p className="re-subheading">{subtitle}</p> : null}
      </div>
      {action ? <div className="mt-4 md:mt-0">{action}</div> : null}
    </header>
  );
}

export function Button({ variant = "solid", className, ...props }: ButtonProps) {
  const variantClass = variant === "ghost" ? "re-btn-ghost" : "re-btn-solid";
  return <button className={`focus-ring re-btn ${variantClass} ${className ?? ""}`} {...props} />;
}
