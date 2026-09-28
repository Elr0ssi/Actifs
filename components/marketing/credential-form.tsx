"use client";

/**
 * Wraps a login/signup form and explicitly tells the browser's password manager to store the
 * credential via the Credential Management API. Next.js Server Actions submit through a JS
 * fetch instead of a plain POST, which makes some browsers (Chrome especially) skip their
 * "save password?" prompt — this makes it happen regardless.
 */
export function CredentialForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        try {
          const form = e.currentTarget;
          const PasswordCredentialCtor = (window as unknown as { PasswordCredential?: new (data: object) => Credential }).PasswordCredential;
          if (PasswordCredentialCtor && navigator.credentials?.store) {
            const fd = new FormData(form);
            const id = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");
            if (id && password) {
              const credential = new PasswordCredentialCtor({ id, password, name: id });
              navigator.credentials.store(credential).catch(() => {});
            }
          }
        } catch {
          // Credential Management API unavailable or blocked — the native form still submits normally.
        }
      }}
    >
      {children}
    </form>
  );
}
