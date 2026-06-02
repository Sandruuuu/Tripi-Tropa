export function getPagination(page = 1, quantity = 10) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeQuantity = Math.max(1, Number(quantity) || 10);
  return {
    skip: (safePage - 1) * safeQuantity,
    take: safeQuantity,
    page: safePage,
    quantity: safeQuantity,
  };
}

export function buildSearchFilter(
  search: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!search?.trim()) return undefined;
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}
