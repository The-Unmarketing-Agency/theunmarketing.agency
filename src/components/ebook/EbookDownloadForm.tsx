"use client";

import { useState } from "react";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Singapore",
  "India",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "United Arab Emirates",
  "Indonesia",
  "Japan",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Saudi Arabia",
  "South Africa",
  "Spain",
  "Switzerland",
  "Thailand",
  "Other",
];

export function EbookDownloadForm({ pdfUrl }: { pdfUrl: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
    }, 400);
  };

  return (
    <div className="form-block ebook-dl w-form">
      {status === "success" ? (
        <div className="ebook-access w-form-done" style={{ display: "block" }}>
          <a
            className="primary-button w-button"
            href={pdfUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Download Ebook
          </a>
        </div>
      ) : (
        <form
          className="form ebook-dl"
          data-name="Ebook Form"
          id="wf-form-Ebook-Form"
          name="wf-form-Ebook-Form"
          onSubmit={handleSubmit}
        >
          <input
            className="text-field ebook-dl w-input"
            id="First-Name"
            maxLength={256}
            name="First-Name"
            placeholder="First Name"
            required
            type="text"
          />
          <input
            className="text-field w-input"
            id="Last-Name"
            maxLength={256}
            name="Last-Name"
            placeholder="Last Name"
            required
            type="text"
          />
          <input
            className="text-field w-input"
            id="email"
            maxLength={256}
            name="email"
            placeholder="Email"
            required
            style={{ gridColumn: "1 / -1" }}
            type="email"
          />
          <input
            className="text-field w-input"
            id="Company"
            maxLength={256}
            name="Company"
            placeholder="Company"
            required
            type="text"
          />
          <input
            className="text-field w-input"
            id="Job-Title"
            maxLength={256}
            name="Job-Title"
            placeholder="Job Title"
            required
            type="text"
          />
          <select
            className="select-field ebook-form w-select"
            defaultValue=""
            id="Select-Country-Ebook-Page"
            name="Select-Country-Ebook-Page"
            required
          >
            <option disabled value="">
              Select country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <label className="w-checkbox form-checkbox">
            <input
              className="w-checkbox-input form-checkbox"
              id="Checkbox-Ebook-Access"
              name="Checkbox-Ebook-Access"
              required
              type="checkbox"
            />
            <span className="text-label gray subscribe w-form-label">
              I ACKNOWLEDGE THAT SUBMITTING THIS FORM SUBSCRIBES ME TO MARKETING
              COMMUNICATIONS. I UNDERSTAND I CAN UNSUBSCRIBE AT ANY TIME.
            </span>
          </label>
          <input
            className="primary-button ebook-dl w-button"
            disabled={status === "submitting"}
            type="submit"
            value={status === "submitting" ? "Please wait..." : "Access Ebook"}
          />
        </form>
      )}
    </div>
  );
}
