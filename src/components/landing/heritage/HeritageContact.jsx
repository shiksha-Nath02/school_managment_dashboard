import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';
import enquiryService from '../../../services/enquiryService';

export default function HeritageContact() {
  const { contact, mapEmbed } = getSiteConfig();

  const [form, setForm] = useState({ type: 'student', name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const items = [
    { icon: MapPin, label: 'Address', value: contact.address },
    { icon: Phone, label: 'Phone', value: contact.phone },
    { icon: Mail, label: 'Email', value: contact.email },
    { icon: Clock, label: 'Office Hours', value: contact.hours },
  ];

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await enquiryService.submitPublicEnquiry({
        type: form.type,
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        message: form.message.trim() || undefined,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-surface-bg">
      <div className="max-w-7xl mx-auto">
        <HeritageHeading kicker="Admissions & Enquiries" title="Get in Touch" />

        <div className="grid md:grid-cols-2 gap-10 mt-14">
          {/* Left — contact details + optional map */}
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

            {/* Google Maps embed */}
            {mapEmbed && (
              <div className="rounded-md overflow-hidden border border-gray-200 shadow-soft">
                <div className="bg-brand-700 px-4 py-2 flex items-center gap-2">
                  <MapPin size={14} className="text-gold" />
                  <span className="text-white text-xs font-bold uppercase tracking-wide">Location Map</span>
                </div>
                <iframe
                  src={mapEmbed}
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="School Location"
                />
              </div>
            )}
          </div>

          {/* Right — enquiry form */}
          <div className="bg-white border border-gray-200 rounded-md p-7 shadow-soft animate-fade-up animate-start delay-200">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center text-2xl mb-4">✓</div>
                <h3 className="font-display font-bold text-lg mb-1 text-brand-800">Thank you!</h3>
                <p className="text-sm text-gray-500">Your enquiry has been noted. We'll get back to you soon.</p>
                <button onClick={() => { setStatus('idle'); setForm({ type: 'student', name: '', phone: '', email: '', message: '' }); }}
                  className="mt-6 text-xs font-bold text-brand-600 underline underline-offset-2">
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Enquiry type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Enquiry For</label>
                  <div className="flex gap-3">
                    {['student', 'teacher'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('type', t)}
                        className={`flex-1 py-2 rounded-sm text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                          form.type === t
                            ? 'bg-brand-700 border-brand-700 text-white'
                            : 'border-gray-200 text-gray-500 hover:border-brand-400'
                        }`}
                      >
                        {t === 'student' ? '🎓 Student Admission' : '👩‍🏫 Teacher Application'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea rows={4} value={form.message} onChange={(e) => set('message', e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition resize-none" />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>
                )}

                <button type="submit" disabled={status === 'loading'}
                  className="w-full bg-brand-700 text-white py-3 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-brand-800 transition-all disabled:opacity-60">
                  {status === 'loading' ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
