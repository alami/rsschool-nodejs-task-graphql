import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

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
      const updUser = this.db.users.change(id, updUserObj)
      return updUser;
    }
  );
};

export default plugin;
