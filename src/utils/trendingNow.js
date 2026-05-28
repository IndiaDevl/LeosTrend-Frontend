export const TRENDING_SECTIONS = [
  { key: "oversized", title: "Oversized" },
  { key: "sweatshirts", title: "Sweatshirts" },
  { key: "hoodies", title: "Hoodies" },
  { key: "zip", title: "Zip Sweatshirts" },
];

const TRENDING_LIMIT = 4;

const normalizeSlot = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > TRENDING_LIMIT) {
    return null;
  }

  return parsed;
};

const sortNewestFirst = (left, right) => {
  const leftTime = new Date(left?.createdAt || left?.updatedAt || 0).getTime();
  const rightTime = new Date(right?.createdAt || right?.updatedAt || 0).getTime();
  return rightTime - leftTime;
};

export const buildTrendingGroups = (products = []) => {
  return TRENDING_SECTIONS.map((section) => {
    const categoryProducts = products
      .filter(
        (product) =>
          String(product?.category || "").trim().toLowerCase() === section.key
      )
      .sort(sortNewestFirst);

    const pinnedProducts = categoryProducts.filter((product) => product?.isTrending);
    const fallbackProducts = categoryProducts.filter((product) => !product?.isTrending);
    const slots = Array(TRENDING_LIMIT).fill(null);
    const overflowPinned = [];

    pinnedProducts.forEach((product) => {
      const slot = normalizeSlot(product?.trendingPosition);
      if (slot && !slots[slot - 1]) {
        slots[slot - 1] = product;
        return;
      }

      overflowPinned.push(product);
    });

    [...overflowPinned, ...fallbackProducts].forEach((product) => {
      const nextEmptyIndex = slots.findIndex((item) => item === null);
      if (nextEmptyIndex === -1) {
        return;
      }

      slots[nextEmptyIndex] = product;
    });

    return {
      ...section,
      items: slots.filter(Boolean),
    };
  });
};