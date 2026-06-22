// =============================================================================
// HERITAGE LAYOUT — Contact (details panel + enquiry form)
// =============================================================================

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';

export default function HeritageContact() {
  const { contact } = getSiteConfig();
  const [sent, setSent] = useState(false);

  const items = [
    { icon: MapPin, label: 'Address', value: contact.address },
    { icon: Phone, label: 'Phone', value: contact.phone },
    { icon: Mail, label: 'Email', value: contact.email },
    { icon: Clock, label: 'Office Hours', value: contact.hours },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    // Placeholder: wire this to the backend / email service later.
    setSent(true);
  }

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-surface-bg">
      <div className="max-w-7xl mx-auto">
        <HeritageHeading kicker="Admissions & Enquiries" title="Get in Touch" />

        <div className="grid md:grid-cols-2 gap-10 mt-14">
          {/* Contact details */}
          <div className="space-y-4 animate-fade-up animate-start">
            {items.map((it) => (
              <div key={it.label} className="flex items-start gap-4 bg-white border border-gray-200 rounded-md p-5">
                <div className="w-11 h-11 rounded-sm bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                  <it.icon size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gold mb-0.5">{it.label}</p>
                  <p className="text-sm text-gray-700">{it.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enquiry form */}
          <div className="bg-white border border-gray-200 rounded-md p-7 shadow-soft animate-fade-up animate-start delay-200">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center text-2xl mb-4">
                  ✓
                </div>
                <h3 className="font-display font-bold text-lg mb-1 text-brand-800">Thank you!</h3>
                <p className="text-sm text-gray-500">Your enquiry has been noted. We’ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="Phone number"
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-700 text-white py-3 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-brand-800 transition-all"
                >
                  Send Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
