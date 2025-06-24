// vfrontend/src/lib/api.ts

export const fetchWithFallback = async <T>(
  url: string,
  fallbackData: T,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      ...options,
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.warn(
        `API returned error status ${response.status}, using fallback data`
      );
      return fallbackData;
    }
  } catch (error) {
    console.warn("Error fetching data, using fallback data:", error);
    return fallbackData;
  }
};

export const mockData = {
  categories: [
    { name: "Retreats", _id: "default-retreats" },
    { name: "Kickbacks", _id: "default-kickbacks" },
    { name: "Events", _id: "default-events" },
    { name: "Other", _id: "default-other" },
  ],

  monthlyExpenses: [
    { year: 2025, month: 1, total: 3400 },
    { year: 2025, month: 2, total: 2850 },
    { year: 2025, month: 3, total: 4200 },
    { year: 2025, month: 4, total: 3100 },
    { year: 2025, month: 5, total: 3800 },
  ],

  categoryBreakdown: [
    { category: "Retreats", total: 7200 },
    { category: "Kickbacks", total: 4100 },
    { category: "Events", total: 5500 },
    { category: "Other", total: 1200 },
  ],

  getItemsForCategory: (category: string) => [
    {
      _id: `${category}-item-1`,
      itemName: "Hotel booking",
      quantity: 10,
      costPerUnit: 150,
      totalCost: 1500,
      people: ["Alice", "Bob", "Carol"],
      date: "2025-05-20T00:00:00.000Z",
    },
    {
      _id: `${category}-item-2`,
      itemName: "Catering service",
      quantity: 50,
      costPerUnit: 25,
      totalCost: 1250,
      people: ["Alice", "David"],
      date: "2025-06-15T00:00:00.000Z",
    },
  ],

  getPeopleForCategory: () => ["Alice", "Bob", "Carol", "David"],
};


const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getCategories = async () => {
  const url = `${BASE}/api/categories`;
  return fetchWithFallback(url, mockData.categories);
};

export const postCategory = async (name: string) => {
  const url = `${BASE}/api/categories`;
  const fallback = { _id: `mock-${name}`, name };
  return fetchWithFallback(
    url,
    fallback,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }
  );
};

export const getItems = async (categoryName: string) => {
  const url = `${BASE}/api/categories/${encodeURIComponent(categoryName)}/items`;
  const fallback = mockData.getItemsForCategory(categoryName);
  return fetchWithFallback(url, fallback);
};

export const postNewItem = async (
  categoryName: string,
  itemData: {
    itemName: string;
    quantity: number;
    costPerUnit: number;
    people: string[];
    date: string;
  }
) => {
  const url = `${BASE}/api/categories/${encodeURIComponent(categoryName)}/items`;
  const fallback = {
    _id: `mock-${categoryName}-${Date.now()}`,
    category: categoryName,
    ...itemData,
    totalCost: itemData.quantity * itemData.costPerUnit,
  };
  return fetchWithFallback(
    url,
    fallback,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    }
  );
};

export const getPeople = async (categoryName: string) => {
  const url = `${BASE}/api/categories/${encodeURIComponent(categoryName)}/people`;
  const fallback = mockData.getPeopleForCategory();
  return fetchWithFallback(url, fallback);
};

export const postNewPerson = async (
  categoryName: string,
  personObj: { name: string }
) => {
  const url = `${BASE}/api/categories/${encodeURIComponent(categoryName)}/people`;
  const fallback = [personObj.name];
  return fetchWithFallback(
    url,
    fallback,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personObj),
    }
  );
};

export const getMonthlyExpenses = async () => {
  const url = `${BASE}/api/overview/monthly-expenses`;
  const fallback = mockData.monthlyExpenses;
  return fetchWithFallback(url, fallback);
};

export const getCategoryBreakdown = async () => {
  const url = `${BASE}/api/overview/category-breakdown`;
  const fallback = mockData.categoryBreakdown;
  return fetchWithFallback(url, fallback);
};
