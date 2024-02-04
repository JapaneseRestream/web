/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
	CreateResult,
	DataProvider,
	DeleteManyParams,
	DeleteManyResult,
	DeleteParams,
	DeleteResult,
	GetListParams,
	GetListResult,
	GetManyReferenceResult,
	GetManyResult,
	GetOneParams,
	GetOneResult,
	UpdateManyResult,
	UpdateParams,
	UpdateResult,
} from "react-admin";
import { trpcClient } from "../../trpc";

const filterResource = (resource: string) => {
	switch (resource) {
		case "eventGroup":
		case "user":
		case "event":
		case "run":
			return resource;
		default:
			throw new Error(`unknown resource: ${resource}`);
	}
};

export const dataProvider: DataProvider = {
	getList: (
		resource: string,
		params: GetListParams,
	): Promise<GetListResult> => {
		return trpcClient.admin[filterResource(resource)].getList.query(params);
	},

	getOne: (resource: string, params: GetOneParams): Promise<GetOneResult> => {
		return trpcClient.admin[filterResource(resource)].getOne.query(params);
	},

	getMany: (resource: string, params: any): Promise<GetManyResult> => {
		return trpcClient.admin[filterResource(resource)].getMany.query(params);
	},

	getManyReference: (
		resource: string,
		params: any,
	): Promise<GetManyReferenceResult> => {
		return trpcClient.admin[filterResource(resource)].getManyReference.query(
			params,
		);
	},

	create: (resource: string, params: any): Promise<CreateResult> => {
		return trpcClient.admin[filterResource(resource)].create.mutate(params);
	},

	update: (resource: string, params: UpdateParams): Promise<UpdateResult> => {
		return trpcClient.admin[filterResource(resource)].update.mutate(params);
	},

	updateMany: (resource: string, params: any): Promise<UpdateManyResult> => {
		return trpcClient.admin[filterResource(resource)].updateMany.mutate(params);
	},

	delete: (resource: string, params: DeleteParams): Promise<DeleteResult> => {
		return trpcClient.admin[filterResource(resource)].delete.mutate(params);
	},

	deleteMany: (
		resource: string,
		params: DeleteManyParams,
	): Promise<DeleteManyResult> => {
		return trpcClient.admin[filterResource(resource)].deleteMany.mutate(params);
	},
};
