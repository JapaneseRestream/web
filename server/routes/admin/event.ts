import { z } from "zod";
import { prisma } from "../../../shared/prisma";
import { adminProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import {
	getListParamsSchema,
	getOneParamsSchema,
	getManyParamsSchema,
	updateParamsSchema,
	updateManyParamsSchema,
	createParamsSchema,
	getManyReferenceParamsSchema,
} from "./helper";
import { dataSourceType } from "../../../shared/constants";

const eventSchema = z.object({
	eventGroupId: z.string(),
	slug: z.string(),
	shortName: z.string(),
	name: z.string(),
	startDate: z.coerce.date(),
	finished: z.boolean(),
	dataSourceType: z.enum(dataSourceType),
	dataSourceId: z.string(),
});

const MODEL = "event";

export const eventRouter = router({
	getList: adminProcedure
		.input(getListParamsSchema)
		.query(async ({ input }) => {
			const [item, count] = await Promise.all([
				prisma[MODEL].findMany(input),
				prisma[MODEL].count(),
			]);
			return { data: item, total: count };
		}),

	getOne: adminProcedure.input(getOneParamsSchema).query(async ({ input }) => {
		const item = await prisma[MODEL].findUnique({
			where: {
				id: input.id,
			},
		});
		if (!item) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}
		return { data: item };
	}),

	getMany: adminProcedure
		.input(getManyParamsSchema)
		.query(async ({ input }) => {
			const items = await prisma[MODEL].findMany({
				where: {
					id: {
						in: input.ids,
					},
				},
			});
			return { data: items };
		}),

	getManyReference: adminProcedure
		.input(getManyReferenceParamsSchema)
		.query(async ({ input }) => {
			if (input.target === "eventGroupId") {
				const [items, count] = await Promise.all([
					prisma[MODEL].findMany({
						where: {
							eventGroupId: input.id,
						},
						skip: input.skip,
						take: input.take,
						orderBy: input.orderBy,
					}),
					prisma[MODEL].count({
						where: {
							eventGroupId: input.id,
						},
					}),
				]);
				return { data: items, total: count };
			}
			throw new TRPCError({ code: "NOT_IMPLEMENTED" });
		}),

	create: adminProcedure
		.input(createParamsSchema(eventSchema))
		.mutation(async ({ input }) => {
			return {
				data: await prisma[MODEL].create({
					data: input.data,
				}),
			};
		}),

	update: adminProcedure
		.input(updateParamsSchema(eventSchema))
		.mutation(async ({ input }) => {
			const item = await prisma[MODEL].update({
				where: {
					id: input.id,
				},
				data: input.data,
			});
			return { data: item };
		}),

	updateMany: adminProcedure
		.input(updateManyParamsSchema(eventSchema))
		.mutation(async ({ input }) => {
			const result = await prisma.$transaction(async (tx) => {
				return Promise.all(
					input.ids.map((id) =>
						tx[MODEL].update({ where: { id }, data: input.data }),
					),
				);
			});
			return { data: result };
		}),

	delete: adminProcedure
		.input(getOneParamsSchema)
		.mutation(async ({ input }) => {
			const item = await prisma[MODEL].delete({
				where: {
					id: input.id,
				},
			});
			return { data: item };
		}),

	deleteMany: adminProcedure
		.input(getManyParamsSchema)
		.mutation(async ({ input }) => {
			const result = await prisma.$transaction(async (tx) => {
				return Promise.all(
					input.ids.map((id) => tx[MODEL].delete({ where: { id } })),
				);
			});
			return { data: result.map((item) => item.id) };
		}),
});
