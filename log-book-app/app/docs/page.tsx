"use client";

import { useEffect } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-bundle";

export default function DocsPage() {
  useEffect(() => {
    const ui = SwaggerUIBundle({
      url: "/api/docs",
      dom_id: "#swagger-ui",
      layout: "BaseLayout",
      deepLinking: true,
    });

    return () => {
      if (ui && typeof ui.destroy === "function") {
        ui.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-8" />
      <div id="swagger-ui" className="px-4 pb-10" />
    </div>
  );
}
