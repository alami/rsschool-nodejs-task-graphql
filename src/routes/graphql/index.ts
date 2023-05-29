import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} from "graphql";


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
    async function (request, reply)
    {
      const {mutation, query, variables} = request.body!
      const source = (mutation || query) as string;
      const UsersType = new GraphQLObjectType({
        name: 'Users',
        fields: () => ({
          id: { type: GraphQLID },
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
          subscribedToUserIds: {
            type: new GraphQLList(GraphQLString)
          },
          posts: {
            type: new GraphQLList(PostsType),
            resolve(parent, args) {
              const {id} = parent
              return fastify.db.posts.findMany({key: 'userId', equals: id})
            }
          },
          profiles: {
            type: new GraphQLList(PostsType),
            resolve(parent, args) {
              const {id} = parent
              return fastify.db.profiles.findMany({key: 'userId', equals: id})
            }
          },
        }),
      })
      const PostsType = new GraphQLObjectType({
        name: 'Posts',
        fields: () => ({
          id: { type: GraphQLID },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
          userId: { type: GraphQLString },
        }),
      })
      const MembersType = new GraphQLObjectType({
        name: 'MembersType',
        fields: () => ({
          id: { type: GraphQLID },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
          userId: { type: GraphQLString },
        }),
      })
      const ProfilesType = new GraphQLObjectType({
        name: 'Profiles',
        fields: () => ({
          id: { type: GraphQLID },
          userId: { type: GraphQLString },
          avatar: { type: GraphQLString },
          sex: { type: GraphQLString },
          birthday: { type: GraphQLInt },
          country: { type: GraphQLString },
          street: { type: GraphQLString },
          city: { type: GraphQLString },
          memberTypeId: { type: GraphQLString }
        }),
      })
      const Query = new GraphQLObjectType({
        name: 'query',
        fields: {
          user: {
            type: UsersType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args, contextValue, info) {
              return fastify.db.users.findMany({key: 'id', equals: args.id!})
            },
          },
          users: {
            type: new GraphQLList(UsersType),
            async resolve(parent, args, contextValue, info) {
              console.log('args', args)
              console.log('contextValue', await contextValue.db.users.findMany())
              console.log('info', info.variableValues)
              return fastify.db.users.findMany()
            }
          },
          posts: {
            type: new GraphQLList(PostsType),
            resolve(parent, args) {
              return fastify.db.posts.findMany()
            }
          },
          post: {
            type: PostsType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
              return fastify.db.users.findMany({key: 'id', equals: args.id!})
            },
          },
          profile: {
            type: ProfilesType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
              return fastify.db.profiles.findMany({key: 'id', equals: args.id!})
            }
          },
          profiles: {
            type: new GraphQLList(ProfilesType),
            resolve(parent, args) {
              return fastify.db.profiles.findMany()
            }
          },
          memberType: {
            type: MembersType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
              return fastify.db.memberTypes.findMany({key: 'id', equals: args.id})
            },
          },
          memberTypes: {
            type: new GraphQLList(MembersType),
            resolve(parent, args) {
              return fastify.db.memberTypes.findMany()
            }
          },
        }
      })
      const Mutation = new GraphQLObjectType({
        name: 'mutation',
        fields: {
          createUser: {
            type: UsersType,
            args: {
              firstName: { type: new GraphQLNonNull(GraphQLString) },
              lastName: { type: new GraphQLNonNull(GraphQLString) },
              email: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args, contextValue, info) {
              const newUser = {
                firstName: args.firstName,
                lastName: args.lastName,
                email: args.email
              }
              return fastify.db.users.create(newUser)
            }
          },
          deleteUser: {
            type: UsersType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
              return fastify.db.users.delete(args.id)
            }
          },
          updateUser: {
            type: UsersType,
            args: {
              id: { type: GraphQLID },
              firstName: { type: GraphQLString },
              lastName: { type: GraphQLString },
              email: { type: GraphQLString },
            },
            resolve(parent, args) {
              const updUser = {
                firstName: args.firstName,
                lastName: args.lastName,
                email: args.email
              }
              return fastify.db.users.change(args.id, updUser)
            }
          },
          createPost: {
            type: ProfilesType,
            args: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              content: { type: new GraphQLNonNull(GraphQLString) },
              userId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
              const newPost = {
                title: args.title,
                content: args.content,
                userId: args.userId
              }
              return fastify.db.posts.create(newPost)
            }
          },
          deletePost: {
            type: ProfilesType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
              return fastify.db.posts.delete(args.id)
            }
          },
          updatePost: {
            type: ProfilesType,
            args: {
              id: { type: GraphQLID },
              title: { type: GraphQLString },
              content: { type: GraphQLString },
              userId: { type: GraphQLID },
            },
            resolve(parent, args) {
              const updPost = {
                title: args.title,
                content: args.content,
                userId: args.userId
              }
              return fastify.db.posts.change(args.id, updPost)
            }
          },
          createProfile: {
            type: ProfilesType,
            args: {
              userId: { type: new GraphQLNonNull(GraphQLID) },
              avatar: { type: new GraphQLNonNull(GraphQLString) },
              sex: { type: new GraphQLNonNull(GraphQLString) },
              birthday: { type: new GraphQLNonNull(GraphQLInt) },
              country: { type: new GraphQLNonNull(GraphQLString) },
              street: { type: new GraphQLNonNull(GraphQLString) },
              city: { type: new GraphQLNonNull(GraphQLString) },
              memberTypeId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
              const newProfile = {
                userId: args.userId,
                avatar: args.avatar,
                sex: args.sex,
                birthday: args.birthday,
                country: args.country,
                street: args.street,
                city: args.city,
                memberTypeId: args.memberTypeId
              }
              return fastify.db.profiles.create(newProfile)
            }
          },
          deleteProfile: {
            type: ProfilesType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
              return fastify.db.profiles.delete(args.id)
            }
          },
          updateProfile: {
            type: ProfilesType,
            args: {
              id: { type: GraphQLID },
              userId: { type: GraphQLID },
              avatar: { type: GraphQLString },
              sex: { type: GraphQLString },
              birthday: { type: GraphQLInt },
              country: { type: GraphQLString },
              street: { type: GraphQLString },
              city: { type: GraphQLString },
              memberTypeId: { type: GraphQLString }
            },
            resolve(parent, args) {
              const updProfile = {
                userId: args.userId,
                avatar: args.avatar,
                sex: args.sex,
                birthday: args.birthday,
                country: args.country,
                street: args.street,
                city: args.city,
                memberTypeId: args.memberTypeId
              }
              return fastify.db.profiles.change(args.id, updProfile)
            }
          },

        },
      })
      const schema = new GraphQLSchema({query:Query, mutation: Mutation})
      return graphql({schema, source, variableValues: variables, contextValue: fastify})

    }
  )
};

export default plugin;
