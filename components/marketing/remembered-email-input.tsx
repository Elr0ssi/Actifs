"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useState } from "react";

const KEY = "actifs:last-email";

export function RememberedEmailInput() {
  const tr = useT();
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      setEmail(localStorage.getItem(KEY) ?? "");
    } catch {}
  }, []);

  return (
    <input
      className="input mt-1.5"
      id="email"
      name="email"
      type="email"
      autoComplete="username email"
      required
      placeholder={tr("toi@exemple.com")}
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        try {
          localStorage.setItem(KEY, e.target.value);
        } catch {}
      }}
    />
  );
}
