export const dataSourceType = ["GDQ", "ESA", "Oengus"] as const;

export type DataSourceType = (typeof dataSourceType)[number];
