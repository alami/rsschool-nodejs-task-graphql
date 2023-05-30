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
      const res = await this.db.memberTypes.findOne({key: 'id', equals: id});
      if(res === null) reply.callNotFound();
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
      const res = await this.db.memberTypes.findOne({key: 'id', equals: id});
      if(res === null) throw reply.code(400);
      const obj =  {...res, ...updMember}
      Reflect.deleteProperty(obj, 'id');
      return this.db.memberTypes.change(id, obj);
    }
  );
};

export default plugin;
