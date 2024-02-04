import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "../../../shared/prisma.server";
import { adminProcedure, router } from "../../trpc";

import {
	getOneParamsSchema,
	getManyParamsSchema,
	updateParamsSchema,
	updateManyParamsSchema,
	createParamsSchema,
	getManyReferenceParamsSchema,
	getListParamsSchema,
} from "./helper";

const userSchema = z.object({
	email: z.string().email(),
});

const MODEL = "user";

export const userRouter = router({
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
		.query(() => {
			throw new TRPCError({ code: "NOT_IMPLEMENTED" });
		}),

	create: adminProcedure
		.input(createParamsSchema(userSchema))
		.mutation(async ({ input }) => {
			return {
				data: await prisma[MODEL].create({
					data: input.data,
				}),
			};
		}),

	update: adminProcedure
		.input(updateParamsSchema(userSchema))
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
		.input(updateManyParamsSchema(userSchema))
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
