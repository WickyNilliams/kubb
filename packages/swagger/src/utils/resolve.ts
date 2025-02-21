import type { PluginContext, ResolveNameParams } from '@kubb/core'
import type { Resolver } from '@kubb/swagger'
import type { Operation, ResolvePathOptions } from '../types.ts'

type PropsWithOperation = {
  operation: Operation
  /**
   * @default `operation.getOperationId()`
   */
  name?: string
}

type PropsWithoutOperation = {
  operation?: never
  /**
   * @default `operation.getOperationId()`
   */
  name: string
}

export type ResolveProps = (PropsWithOperation | PropsWithoutOperation) & {
  pluginName?: string
  /**
   * @default `operation.getTags()[0]?.name`
   */
  tag?: string
  resolvePath: PluginContext<ResolvePathOptions>['resolvePath']
  resolveName: PluginContext['resolveName']
  type?: ResolveNameParams['type']
}

export function resolve({ operation, name, tag, type, pluginName, resolveName, resolvePath }: ResolveProps): Resolver {
  if (!name && !operation?.getOperationId()) {
    throw new Error('name or operation should be set')
  }

  const resolvedName = name ? name : resolveName({ name: operation?.getOperationId() as string, type, pluginName })

  if (!resolvedName) {
    throw new Error(`Name ${name || operation?.getOperationId()} should be defined`)
  }

  const baseName = `${resolvedName}.ts` as const
  const path = resolvePath({
    baseName,
    pluginName,
    options: { pluginName, type, tag: tag || operation?.getTags()[0]?.name },
  })

  if (!path) {
    throw new Error('Filepath should be defined')
  }

  return {
    name: resolvedName,
    baseName,
    path,
  }
}
