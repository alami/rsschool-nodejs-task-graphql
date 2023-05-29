import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {buildSchema, graphql} from "graphql";


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const source = request.body.query!
      const schema = buildSchema(`
                          type Query {
                              profiles: [Profiles]
                              posts: [Posts]
                              users: [Users]
                              memberTypes: [MemberTypes]
                          }
                          `);
      const rootValue = {
        profiles: () => {
          return this.db.profiles.findMany();
        },
        posts: () => {
          return this.db.posts.findMany();
        },
        users: () => {
          return this.db.users.findMany();
        },
        memberTypes: () => {
          return this.db.memberTypes.findMany();
        },
      }
      return graphql({schema, source, rootValue})
    }
  );
};

export default plugin;
