"use client";

import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "Unable to send your enquiry.");

      form.reset();
      setStatus("sent");
      setMessage("Thank you. Your enquiry has been sent and we’ll be in touch soon.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your enquiry.");
    }
  }

  return (
    <form aria-describedby="contact-integration-status" className="contact-panel__form" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="contact-name">First Name *</label>
        <input autoComplete="given-name" id="contact-name" maxLength={120} name="name" required type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="contact-last-name">Last Name*</label>
        <input autoComplete="family-name" id="contact-last-name" maxLength={120} name="lastName" required type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">Email*</label>
        <input autoComplete="email" id="contact-email" maxLength={254} name="email" required type="email" />
      </div>
      <div className="form-field">
        <label htmlFor="contact-phone">Your preferred contact number*</label>
        <input autoComplete="tel" id="contact-phone" maxLength={40} name="phone" required type="tel" />
      </div>
      <div aria-hidden="true" className="form-field visually-hidden">
        <label htmlFor="contact-website">Website</label>
        <input autoComplete="off" id="contact-website" name="website" tabIndex={-1} type="text" />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="contact-message">How can we help you?</label>
        <textarea id="contact-message" maxLength={5000} minLength={10} name="message" required rows={5} />
      </div>
      <div className="contact-panel__submit form-field--wide">
        <button disabled={status === "submitting"} type="submit">
          {status === "submitting" ? "Sending…" : "Get in touch!"}
        </button>
        {message ? (
          <p aria-live="polite" className={status === "error" ? "form-status--error" : "form-status--success"} id="contact-integration-status" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
