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
} from "./helper";

const eventGroupSchema = z.object({
	slug: z.string(),
	shortName: z.string(),
	name: z.string(),
});

export const eventGroupRouter = router({
	getList: adminProcedure
		.input(getListParamsSchema)
		.query(async ({ input }) => {
			const [item, count] = await Promise.all([
				prisma.eventGroup.findMany(input),
				prisma.eventGroup.count(),
			]);
			return { data: item, total: count };
		}),

	getOne: adminProcedure.input(getOneParamsSchema).query(async ({ input }) => {
		const item = await prisma.eventGroup.findUnique({
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
			const items = await prisma.eventGroup.findMany({
				where: {
					id: {
						in: input.ids,
					},
				},
			});
			return { data: items };
		}),

	getManyReference: adminProcedure.query(() => {
		throw new TRPCError({ code: "NOT_IMPLEMENTED" });
	}),

	create: adminProcedure
		.input(createParamsSchema(eventGroupSchema))
		.mutation(async ({ input }) => {
			const item = await prisma.eventGroup.create({
				data: input.data,
			});
			return { data: item };
		}),

	update: adminProcedure
		.input(updateParamsSchema(eventGroupSchema))
		.mutation(async ({ input }) => {
			const item = await prisma.eventGroup.update({
				where: {
					id: input.id,
				},
				data: input.data,
			});
			return { data: item };
		}),

	updateMany: adminProcedure
		.input(updateManyParamsSchema(eventGroupSchema))
		.mutation(async ({ input }) => {
			const result = await prisma.$transaction(async (tx) => {
				return Promise.all(
					input.ids.map((id) =>
						tx.eventGroup.update({ where: { id }, data: input.data }),
					),
				);
			});
			return { data: result };
		}),

	delete: adminProcedure
		.input(getOneParamsSchema)
		.mutation(async ({ input }) => {
			const item = await prisma.eventGroup.delete({
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
					input.ids.map((id) => tx.eventGroup.delete({ where: { id } })),
				);
			});
			return { data: result.map((item) => item.id) };
		}),
});
