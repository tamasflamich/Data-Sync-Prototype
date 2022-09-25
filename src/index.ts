import process from 'process';
import { buildFastify } from './app';

const start = async () => {
  try {
    const fastify = buildFastify();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
