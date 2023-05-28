import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import validator from "validator";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply)
    : Promise<ProfileEntity[]> {
    return this.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<ProfileEntity> {
      const { id } = request.params;
      const res = await this.db.posts.findOne({key: 'id', equals: id});
      if(res === null) throw reply.code(404)
      const profile = this.db.profiles.findOne({key: 'id', equals: id}) as Promise<ProfileEntity>;
      return profile;
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
      const valid=validator.isUUID(profile.userId)
        && ['business', 'basic'].includes(profile.memberTypeId)
      if (!valid) throw reply.code(400)
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
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null) throw reply.code(400)
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
      const res = await this.db.profiles.findOne({key:'id',equals:id})
      if (res===null) throw reply.code(400)
      return this.db.profiles.change(id, {...res, ...updProfile})
    }
  );
};

export default plugin;
