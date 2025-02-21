import { URLPath } from '@kubb/core'
import { OperationGenerator as Generator } from '@kubb/swagger'

import { ClientBuilder } from '../builders/ClientBuilder.tsx'
import { pluginName } from '../plugin.ts'

import type { KubbFile } from '@kubb/core'
import type { HttpMethod, Operation, OperationSchemas } from '@kubb/swagger'
import type { FileMeta, Options as PluginOptions } from '../types.ts'

type Options = {
  clientPath?: PluginOptions['client']
  pathParamsType: PluginOptions['pathParamsType']
  clientImportPath?: PluginOptions['clientImportPath']
  dataReturnType: NonNullable<PluginOptions['dataReturnType']>
}

export class OperationGenerator extends Generator<Options> {
  async all(paths: Record<string, Record<HttpMethod, Operation>>): Promise<KubbFile.File<FileMeta> | null> {
    const { pluginManager, oas } = this.context

    const controllerName = pluginManager.resolveName({ name: 'operations', pluginName })

    if (!controllerName) {
      throw new Error('controllerName should be defined')
    }

    const controllerId = `${controllerName}.ts` as const
    const controllerFilePath = pluginManager.resolvePath({
      baseName: controllerId,
      pluginName,
    })

    if (!controllerFilePath) {
      return null
    }

    const sources: string[] = []

    const groupedByOperationId: Record<string, { path: string; method: HttpMethod }> = {}

    Object.keys(paths).forEach((path) => {
      const methods = paths[path] || []
      Object.keys(methods).forEach((method) => {
        const operation = oas.operation(path, method as HttpMethod)
        if (operation) {
          groupedByOperationId[operation.getOperationId()] = {
            path: new URLPath(path).URL,
            method: method as HttpMethod,
          }
        }
      })
    })

    sources.push(`export const operations = ${JSON.stringify(groupedByOperationId)} as const;`)

    return {
      path: controllerFilePath,
      baseName: controllerId,
      source: sources.join('\n'),
      imports: [],
    }
  }

  async get(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    const { clientPath, clientImportPath, dataReturnType, pathParamsType } = this.options
    const { pluginManager, oas } = this.context

    const clientBuilder = new ClientBuilder(
      {
        dataReturnType,
        clientPath,
        clientImportPath,
        pathParamsType,
      },
      { oas, pluginManager, operation, schemas },
    )
    const file = clientBuilder.render().file

    if (!file) {
      throw new Error('No <File/> being used or File is undefined(see resolvePath/resolveName)')
    }

    return {
      path: file.path,
      baseName: file.baseName,
      source: file.source,
      imports: file.imports,
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }

  async post(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    const { clientPath, clientImportPath, dataReturnType, pathParamsType } = this.options
    const { pluginManager, oas } = this.context

    const clientBuilder = new ClientBuilder(
      {
        dataReturnType,
        clientPath,
        clientImportPath,
        pathParamsType,
      },
      { oas, pluginManager, operation, schemas },
    )
    const file = clientBuilder.render().file

    if (!file) {
      throw new Error('No <File/> being used or File is undefined(see resolvePath/resolveName)')
    }

    return {
      path: file.path,
      baseName: file.baseName,
      source: file.source,
      imports: file.imports,
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }

  async put(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    return this.post(operation, schemas)
  }
  async patch(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    return this.post(operation, schemas)
  }
  async delete(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    return this.post(operation, schemas)
  }
}
