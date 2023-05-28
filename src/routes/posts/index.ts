import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import validator from 'validator';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify)
  : Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return this.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<PostEntity> {
      const {id} = request.params;
      const post = await this.db.posts.findOne({key: 'id', equals: id});
      const users = await this.db.users.findMany();
      const checkUser = users.find(user=>user.id === post?.userId);
      if(post === null || !validator.isUUID(id) || checkUser===undefined) throw reply.code(404)
      return this.db.posts.findOne({key: 'id', equals: id}) as Promise<PostEntity>;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply)
      : Promise<PostEntity> {
      const newPost = request.body;
      return this.db.posts.create(newPost);
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
      : Promise<PostEntity> {
      const {id} = request.params;
      const post = await this.db.posts.findOne({key: 'id', equals: id});
      if(post === null) throw reply.code(400)
      return this.db.posts.delete(id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<PostEntity> {
      const {id} = request.params;
      const updPost = request.body;
      const post = await this.db.posts.findOne({key: 'id', equals: id});
      if(post === null) throw reply.code(400)
      return this.db.posts.change(id, {...post, ...updPost});
    }
  );
};


export default plugin;
