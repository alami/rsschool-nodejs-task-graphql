import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import validator from 'validator';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify)
  : Promise<void> => {

  fastify.get('/', async function (request, reply)
    : Promise<ProfileEntity[]> {
    return this.db.profiles.findMany()
  });

  fastify.get('/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<ProfileEntity> {
      const { id } = request.params;
      const profile = await this.db.profiles.findOne({key: 'id', equals: id});
      const users = await this.db.users.findMany();
      const checkUser = users.find(user=>user.id === profile?.userId);
      if(profile === null || !validator.isUUID(id) || checkUser === undefined) throw reply.code(404)
      return this.db.profiles.findOne({key: 'id', equals: id}) as Promise<ProfileEntity>;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply)
      : Promise<ProfileEntity> {
      const profile = request.body;
      const check = validator.isUUID(profile.userId) && ['business', 'basic'].includes(profile.memberTypeId)
      if(!check) throw reply.code(400)
      const existProfile = await this.db.profiles.findOne({key: 'userId', equals: profile.userId});
      if (existProfile !== null) throw reply.code(400)
      return this.db.profiles.create(profile);
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
      : Promise<ProfileEntity> {
      const { id } = request.params;
      const profile = await this.db.profiles.findOne({key: 'id', equals: id});
      if(profile === null) throw reply.code(400)
      return this.db.profiles.delete(id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<ProfileEntity> {
      const { id } = request.params;
      const updProfile = request.body;
      const profile = await this.db.profiles.findOne({key: 'id', equals: id});
      if(profile === null) throw reply.code(400)
      return this.db.profiles.change(id, {...profile, ...updProfile})
    }
  );
};

export default plugin;
