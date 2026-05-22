export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function parseAdminPagination(
  searchParams: URLSearchParams,
  defaultLimit = DEFAULT_PAGE_SIZE,
): { limit: number; offset: number; page: number } {
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("limit")) || defaultLimit));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const offsetParam = searchParams.get("offset");
  const offset =
    offsetParam !== null && offsetParam !== ""
      ? Math.max(0, Number(offsetParam) || 0)
      : (page - 1) * limit;
  return { limit, offset, page: Math.floor(offset / limit) + 1 };
}

export function paginationMeta(total: number, limit: number, offset: number) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  return { total, limit, offset, page, pageCount };
}
