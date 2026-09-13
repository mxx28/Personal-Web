import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
} from "react-router";
import { getSiteContent } from "@/content";
import { AppProviders } from "@/provider/app-providers";
import { siteConfig } from "@/site/config";
import { withBase } from "@/utils/asset";
import type { Route } from "./+types/root";
import "./app.css";

export function links() {
  return [
    { rel: "icon", href: withBase("/icons/favicon.ico"), sizes: "any" },
    { rel: "icon", type: "image/png", href: withBase("/icons/favicon-32.png"), sizes: "32x32" },
    { rel: "apple-touch-icon", href: withBase("/icons/apple-touch-icon.png"), sizes: "180x180" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.defaultLanguage} className="no-scrollbar">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const errorBoundary = getSiteContent(siteConfig.defaultLanguage).ui.errorBoundary;
  let message = errorBoundary.oops;
  let details = errorBoundary.unexpectedDescription;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : errorBoundary.errorTitle;
    details =
      error.status === 404
        ? errorBoundary.notFoundDescription
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
