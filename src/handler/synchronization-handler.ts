import { FastifyInstance, FastifyRequest } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { v4 as uuid } from 'uuid';

import { UserRepository } from '../repository/user-repository';
import { User } from '../types/user';

const getUserId = (request: FastifyRequest): string => {
  const userId = request.headers['x-user-id'];
  if (userId) {
    return userId as string;
  }
  return uuid();
};

export const synchronizationHandler = async (fastify: FastifyInstance, userRepository: UserRepository) => {
  fastify.get('/', { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {
    const userId = getUserId(request);

    let user: User;
    const foundUser = userRepository.getUser(userId);

    if (foundUser !== undefined) {
      user = foundUser;
      user.connection = connection;
    } else {
      user = { id: userId, connection };
      userRepository.createUser(user);
    }

    connection.on('end', () => {
      user.connection = undefined;
    });
  });
};
