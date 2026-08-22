"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export function FieldWrapper({
  label,
  htmlFor,
  hint,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {hint && !errors?.length && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      <AnimatePresence initial={false}>
        {errors?.map((err) => (
          <motion.p
            key={err}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-xs font-medium text-red-600"
          >
            {err}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}

const baseInputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 hover:border-slate-400";

export function TextField({
  label,
  name,
  errors,
  hint,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} hint={hint} errors={errors}>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        // Without this, native number inputs default to step=1, which rejects
        // completely normal decimal values (e.g. a 97.4% exam result).
        step={type === "number" ? "any" : undefined}
        className={baseInputClasses}
      />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  name,
  errors,
  hint,
  required,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} hint={hint} errors={errors}>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={baseInputClasses}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  name,
  errors,
  required,
  options,
  placeholder = "Select…",
}: {
  label: string;
  name: string;
  errors?: string[];
  required?: boolean;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} errors={errors}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className={baseInputClasses}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function FileField({
  label,
  name,
  errors,
  hint,
  required,
  disabled,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldWrapper
      label={label}
      htmlFor={name}
      hint={hint ?? "PDF, JPG, or PNG. Max 10MB."}
      errors={errors}
    >
      <input
        id={name}
        name={name}
        type="file"
        required={required}
        disabled={disabled}
        accept="application/pdf,image/jpeg,image/png"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 file:transition-colors hover:border-slate-400 hover:file:bg-brand-100 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </FieldWrapper>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)] sm:p-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
