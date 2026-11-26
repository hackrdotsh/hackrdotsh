"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "resume-pdf-phone";

/**
 * The phone number printed on resume PDFs made in the admin area. It lives
 * in this browser's storage only, so it never reaches the repository, the
 * database or the public resume page.
 */
export function useResumePhone() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setPhone(window.localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const savePhone = (value: string) => {
    setPhone(value);
    if (value.trim()) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return [phone, savePhone] as const;
}
