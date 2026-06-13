/**
 * BusinessContext — resolves and provides the current business_id + business data.
 *
 * Resolution order (NO localStorage fallback — root URL is never a store):
 *  1. Subdomain  e.g. chic.fashionstores-addisdr.vercel.app  → subdomain = "chic"
 *  2. ?business=<id>  query param  (dev / direct link)
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { getBusiness, getBusinessBySubdomain } from '../api';

const BusinessContext = createContext(null);

function detectSubdomain() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return null;
  const parts = host.split('.');
  const isVercel = host.endsWith('.vercel.app');
  // vercel.app domains: main = name.vercel.app (3 parts), subdomain = x.name.vercel.app (4+)
  // Custom domains: main = example.com (2 parts), subdomain = x.example.com (3+)
  const minParts = isVercel ? 4 : 3;
  if (parts.length >= minParts && !['www', 'superadmin'].includes(parts[0])) {
    return parts[0];
  }
  return null;
}

export function BusinessProvider({ children }) {
  const [businessId, setBusinessId] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolve() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('business');
      const subdomain = detectSubdomain();

      try {
        let resolvedId = null;
        let resolvedBusiness = null;

        if (subdomain) {
          resolvedBusiness = await getBusinessBySubdomain(subdomain);
          resolvedId = resolvedBusiness.id;
        } else if (queryId) {
          resolvedId = parseInt(queryId, 10);
          resolvedBusiness = await getBusiness(resolvedId);
        }
        // No localStorage fallback — root URL stays as platform home

        if (resolvedId) {
          setBusinessId(resolvedId);
          setBusiness(resolvedBusiness);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    resolve();
  }, []);

  return (
    <BusinessContext.Provider value={{ businessId, business, loading, error, setBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used inside BusinessProvider');
  return ctx;
}
