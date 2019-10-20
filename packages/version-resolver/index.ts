import { Resolver } from "./Resolver";

export default async function resolvePkgVersions(dependencies: {
  [key: string]: string;
}) {
  const resolver = new Resolver();
  await resolver.load(dependencies);
  await resolver.hydrate();
  return resolver.getResult();
}
