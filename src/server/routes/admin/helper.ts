import { z } from "zod";

const baseGetListParamsSchema = z.object({
	pagination: z.object({
		page: z.number().int(),
		perPage: z.number().int(),
	}),
	sort: z.object({
		field: z.string(),
		order: z.enum(["ASC", "DESC"]),
	}),
});

export const getListParamsSchema = baseGetListParamsSchema.transform(
	(params) => ({
		skip: (params.pagination.page - 1) * params.pagination.perPage,
		take: params.pagination.perPage,
		orderBy: {
			[params.sort.field]: params.sort.order === "ASC" ? "asc" : "desc",
		},
	}),
);

export const getListParamsSchemaWithFilter = <T extends z.ZodRawShape>(
	filterSchema: z.ZodObject<T>,
) => {
	return baseGetListParamsSchema
		.extend({ filter: filterSchema })
		.transform((params) => ({
			skip: (params.pagination.page - 1) * params.pagination.perPage,
			take: params.pagination.perPage,
			orderBy: {
				[params.sort.field]: params.sort.order === "ASC" ? "asc" : "desc",
			},
			where: params.filter,
		}));
};

export const getOneParamsSchema = z.object({
	id: z.string(),
});

export const getManyParamsSchema = z.object({
	ids: z.array(z.string()),
});

export const getManyReferenceParamsSchema = z
	.object({
		target: z.string(),
		id: z.string(),
		pagination: z.object({
			page: z.number().int(),
			perPage: z.number().int(),
		}),
		sort: z.object({
			field: z.string(),
			order: z.enum(["ASC", "DESC"]),
		}),
	})
	.transform((params) => {
		return {
			target: params.target,
			id: params.id,
			skip: (params.pagination.page - 1) * params.pagination.perPage,
			take: params.pagination.perPage,
			orderBy: {
				[params.sort.field]: params.sort.order === "ASC" ? "asc" : "desc",
			},
		};
	});

export const createParamsSchema = <T extends z.ZodRawShape>(
	dataSchema: z.ZodObject<T>,
) => {
	return z.object({
		data: dataSchema,
	});
};

export const updateParamsSchema = <T extends z.ZodRawShape>(
	dataSchema: z.ZodObject<T>,
) => {
	return z.object({
		id: z.string(),
		data: dataSchema.partial(),
	});
};

export const updateManyParamsSchema = <T extends z.ZodRawShape>(
	dataSchema: z.ZodObject<T>,
) => {
	return z.object({
		ids: z.array(z.string()),
		data: dataSchema.partial(),
	});
};
