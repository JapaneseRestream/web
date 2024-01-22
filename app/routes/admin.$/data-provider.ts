import type {
	CreateResult,
	DataProvider,
	DeleteManyParams,
	DeleteManyResult,
	DeleteParams,
	DeleteResult,
	GetListParams,
	GetListResult,
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
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].getList.query(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	getOne: (resource: string, params: GetOneParams): Promise<GetOneResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].getOne.query(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	getMany: (resource: string, params: any): Promise<GetManyResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].getMany.query(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	getManyReference: () => {
		throw new Error("not implemented");
	},

	create: (resource: string, params: any): Promise<CreateResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].create.mutate(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	update: (resource: string, params: UpdateParams): Promise<UpdateResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].update.mutate(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	updateMany: (resource: string, params: any): Promise<UpdateManyResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].updateMany.mutate(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	delete: (resource: string, params: DeleteParams): Promise<DeleteResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].delete.mutate(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},

	deleteMany: (
		resource: string,
		params: DeleteManyParams,
	): Promise<DeleteManyResult> => {
		if (resource === "eventGroup") {
			return trpcClient.admin[resource].deleteMany.mutate(params);
		}
		throw new Error(`unknown resource: ${resource}`);
	},
};
