"use client";

import { useState, ChangeEvent, InputHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function PasswordInput({
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="auth-input"
        style={{ paddingRight: "42px" }} // space for the icon
        {...props}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {show ? (
          <EyeSlashIcon
            style={{ width: 20, height: 20, color: "#9CA3AF" }}
          />
        ) : (
          <EyeIcon style={{ width: 20, height: 20, color: "#9CA3AF" }} />
        )}
      </button>
    </div>
  );
}