import type { PageDocument, Service } from "./sanity/types";

export function servicesFromPageSections(page: PageDocument): Service[] {
  const services: Service[] = [];
  for (const index of [1, 2, 3, 4, 5]) {
    const title = page[`section${index}H3` as keyof PageDocument];
    const body = page[`section${index}Text` as keyof PageDocument];
    if (typeof title !== "string" || !title.trim()) continue;
    services.push({
      _id: `${page._id}-service-${index}`,
      title: title.trim(),
      description: typeof body === "string" ? body : undefined,
    });
  }
  return services;
}
