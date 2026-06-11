/**
 * BusinessContext — resolves and provides the current business_id + business data.
 *
 * Resolution order (NO localStorage fallback — root URL is never a store):
 *  1. Subdomain  e.g. furniture.yoursite.com  → subdomain = "furniture"
 *  2. ?business=<id>  query param  (dev / direct link)
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { getBusiness, getBusinessBySubdomain } from '../api';

const BusinessContext = createContext(null);

function detectSubdomain() {
  const host = window.location.hostname;
  const parts = host.split('.');
  // Valid subdomain: has 2+ parts, first part isn't 'www', 'localhost', or 'superadmin'
  if (parts.length >= 2 && !['www', 'localhost', 'superadmin'].includes(parts[0])) {
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
