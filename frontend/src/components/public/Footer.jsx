import { Phone, Info } from 'lucide-react';

export default function Footer({ company }) {
  return (
    <footer className="mt-16" style={{ backgroundColor: 'var(--color-tertiary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8">

        {/* About */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} style={{ color: 'var(--on-tertiary)', opacity: 0.7 }} />
            <h3 className="font-semibold" style={{ color: 'var(--on-tertiary)' }}>About Us</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--on-tertiary)', opacity: 0.8 }}>
            {company?.about || 'Welcome to our store. We offer quality products at great prices.'}
          </p>
        </div>

        {/* Contact */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} style={{ color: 'var(--on-tertiary)', opacity: 0.7 }} />
            <h3 className="font-semibold" style={{ color: 'var(--on-tertiary)' }}>Contact Us</h3>
          </div>
          {company?.phone ? (
            <a
              href={`tel:${company.phone}`}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--on-tertiary)' }}
            >
              {company.phone}
            </a>
          ) : (
            <p className="text-sm" style={{ color: 'var(--on-tertiary)', opacity: 0.7 }}>
              Contact info not set.
            </p>
          )}
          <p className="text-xs mt-2" style={{ color: 'var(--on-tertiary)', opacity: 0.6 }}>
            Our sales team will reach out after you submit an order.
          </p>
        </div>
      </div>

      <div
        className="border-t py-4 text-center text-xs"
        style={{ borderColor: 'rgba(var(--on-tertiary-rgb, 0 0 0),0.15)', color: 'var(--on-tertiary)', opacity: 0.6 }}
      >
        © {new Date().getFullYear()} {company?.name || 'My Store'}. All rights reserved.
      </div>
    </footer>
  );
}
