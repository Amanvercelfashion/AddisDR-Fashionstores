/**
 * BusinessContext — resolves and provides the current business_id + business data.
 *
 * Resolution order:
 *  1. Path-based:  /store/:subdomain  → calls getBusinessBySubdomain(subdomain)
 *  2. Query param: ?business=<id>     → calls getBusiness(id)
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { getBusiness, getBusinessBySubdomain } from '../api';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businessId, setBusinessId] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolve() {
      setLoading(true);
      setError(null);

      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('business');

      // 1. Path-based: /store/:subdomain
      const storeMatch = path.match(/^\/store\/([^/]+)/);
      const subdomain = storeMatch ? storeMatch[1] : null;

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
