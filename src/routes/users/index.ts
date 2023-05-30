import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import validator from 'validator';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify)
  : Promise<void> => {
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
      const { id } = request.params;
      const user = await this.db.users.findOne({key: 'id', equals: id});
      if(user === null || !validator.isUUID(id)) throw reply.code(404)
      return this.db.users.findOne({key: 'id', equals: id}) as Promise<UserEntity>;
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
      const user = await this.db.users.findOne({key: 'id', equals: id});
      if(user === null) throw reply.code(400)
      const users = (await this.db.users.findMany()).filter(user=> user.subscribedToUserIds.includes(id));
      users.forEach(async (user)=>{
        const filtered = user.subscribedToUserIds.filter(el=> el !== id);
        user.subscribedToUserIds = filtered;
        await this.db.users.change(user.id, user);
      });
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
      const userById = await this.db.users.findOne({key: 'id', equals: id});
      const user = await this.db.users.findOne({key: 'id', equals: userId});
      if(userById === null || user === null || !validator.isUUID(userId) || !validator.isUUID(id)) throw reply.code(400)
      user.subscribedToUserIds.push(id)
      return this.db.users.change(userId, user);
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
      const user = await this.db.users.findOne({key: 'id', equals: userId});
      if(user === null || !validator.isUUID(userId) || !user.subscribedToUserIds.includes(id)) throw reply.code(400)
      const arr = user.subscribedToUserIds.filter(el=>el !== id);
      user.subscribedToUserIds = arr;
      return this.db.users.change(userId, user);
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
      const user = await this.db.users.findOne({key: 'id', equals: id});
      if(user === null || !validator.isUUID(id)) throw reply.code(400)
      return this.db.users.change(id, {...user, ...updUserObj});
    }
  );
};

export default plugin;
