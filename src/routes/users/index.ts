import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import validator from "validator";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply)
    : Promise<UserEntity[]> {
    return this.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const {id} = request.params;
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null  || !validator.isUUID(id)) throw reply.code(400)
      const user = this.db.users.findOne({key: 'id', equals: id}) as Promise<UserEntity>
      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const user = request.body;
      return this.db.users.create(user);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const {id} = request.params;
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null) throw reply.code(400)
      return this.db.users.delete(id);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const {id} = request.params;
      const {userId} = request.body;
      const user = await this.db.users.findOne({key: 'id', equals: id}) as UserEntity;
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null || !validator.isUUID(userId)) throw reply.code(400)
      user.subscribedToUserIds.push(userId)
      return this.db.users.change(id, user);
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const {id} = request.params;
      const {userId} = request.body;
      const user = await this.db.users.findOne({key: 'id', equals: id}) as UserEntity;
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null || !validator.isUUID(userId)) throw reply.code(400)
      const arr = user.subscribedToUserIds.filter(el=>el !== userId);
      user.subscribedToUserIds = arr;
      return this.db.users.change(id, user);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<UserEntity> {
      const {id} = request.params;
      const updUserObj = request.body;
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null || !validator.isUUID(id)) throw reply.code(400)
      const updUser = this.db.users.change(id, {...res, ...updUserObj})
      return updUser;
    }
  );
};

export default plugin;
