"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      richColors
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
        },
      }}
      style={
        {
          "--width": "360px",
          zIndex: 99999,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
