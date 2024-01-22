import type {
	CreateResult,
	DataProvider,
	DeleteManyParams,
	DeleteManyResult,
	DeleteParams,
	DeleteResult,
	GetListParams,
	GetListResult,
	GetManyReferenceParams,
	GetManyReferenceResult,
	GetManyResult,
	GetOneParams,
	GetOneResult,
	UpdateManyResult,
	UpdateParams,
	UpdateResult,
} from "react-admin";
import { trpcClient } from "../../trpc";

export const dataProvider: DataProvider = {
	getList: (
		resource: string,
		params: GetListParams,
	): Promise<GetListResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].getList.query(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	getOne: (resource: string, params: GetOneParams): Promise<GetOneResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].getOne.query(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	getMany: (resource: string, params: any): Promise<GetManyResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].getMany.query(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	getManyReference: (
		resource: string,
		params: any,
	): Promise<GetManyReferenceResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].getManyReference.query(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	create: (resource: string, params: any): Promise<CreateResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].create.mutate(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	update: (resource: string, params: UpdateParams): Promise<UpdateResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].update.mutate(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	updateMany: (resource: string, params: any): Promise<UpdateManyResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].updateMany.mutate(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	delete: (resource: string, params: DeleteParams): Promise<DeleteResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].delete.mutate(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},

	deleteMany: (
		resource: string,
		params: DeleteManyParams,
	): Promise<DeleteManyResult> => {
		switch (resource) {
			case "eventGroup":
			case "user":
			case "event":
				return trpcClient.admin[resource].deleteMany.mutate(params);
			default:
				throw new Error(`unknown resource: ${resource}`);
		}
	},
};
