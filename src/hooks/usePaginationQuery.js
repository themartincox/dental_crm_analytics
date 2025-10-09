import { useSearchParams } from "react-router-dom";

export default function usePaginationQuery(defaults={page:1,pageSize:25,q:'',sortField:'',sortDir:'desc'}) {
  const [params, setParams] = useSearchParams();
  const num = (key, fallback) => {
    const v = parseInt(params.get(key) || fallback, 10);
    return Number.isFinite(v) ? v : fallback;
  };
  const page = num('page', defaults.page);
  const pageSize = num('pageSize', defaults.pageSize);
  const q = params.get('q') || defaults.q;
  const sortField = params.get('sortField') || defaults.sortField;
  const sortDir = params.get('sortDir') || defaults.sortDir;
  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k,v]) => {
      if (v === undefined || v === null || v === '') p.delete(k);
      else p.set(k, String(v));
    });
    setParams(p);
  };
  return { page, pageSize, q, sortField, sortDir, update };
}

