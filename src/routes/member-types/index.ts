import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/',
    async function (request, reply)
      : Promise<MemberTypeEntity[]> {
      return this.db.memberTypes.findMany();
    });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<MemberTypeEntity> {
      const {id} = request.params;
      return this.db.memberTypes.findOne({key: 'id', equals: id}) as Promise<MemberTypeEntity>
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply)
      : Promise<MemberTypeEntity> {
      const {id} = request.params;
      const updMember = request.body;
      return this.db.memberTypes.change(id, updMember);
    }
  );
};

export default plugin;
