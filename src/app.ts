import serviceFactory from 'fastify';
import websocketPlugin from '@fastify/websocket';

import { synchronizationHandler } from './handler/synchronization-handler';
import { resolveDependencyContainer } from './dependency-container/dependency-container';
import { documentHandler } from './handler/document-handler';

export const buildFastify = () => {
  const fastify = serviceFactory({ logger: true });
  const dependencyContainer = resolveDependencyContainer();

  fastify.register(websocketPlugin);

  fastify.register(synchronizationHandler, dependencyContainer.userRepository);
  fastify.register(documentHandler, dependencyContainer.documentSyncUseCase);

  return fastify;
};
