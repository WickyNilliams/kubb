import { getRelativePath } from '@kubb/core'
import { OperationGenerator as Generator, resolve } from '@kubb/swagger'

import { ZodBuilder } from '../builders/index.ts'
import { pluginName } from '../plugin.ts'

import type { KubbFile } from '@kubb/core'
import type { FileResolver, Operation, OperationSchemas, Resolver } from '@kubb/swagger'
import type { FileMeta } from '../types.ts'

type Options = {
  mode: KubbFile.Mode
}

export class OperationGenerator extends Generator<Options> {
  resolve(operation: Operation): Resolver {
    const { pluginManager } = this.context

    return resolve({
      operation,
      resolveName: pluginManager.resolveName,
      resolvePath: pluginManager.resolvePath,
      pluginName,
    })
  }

  async all(): Promise<KubbFile.File | null> {
    return null
  }

  async get(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    const { mode } = this.options
    const { pluginManager } = this.context

    const zod = this.resolve(operation)

    const fileResolver: FileResolver = (name) => {
      // Used when a react-query type(request, response, params) has an import of a global type
      const root = pluginManager.resolvePath({ baseName: zod.name, pluginName, options: { tag: operation.getTags()[0]?.name } })
      // refs import, will always been created with the SwaggerTS plugin, our global type
      const resolvedTypeId = pluginManager.resolvePath({
        baseName: `${name}.ts`,
        pluginName,
      })

      return getRelativePath(root, resolvedTypeId)
    }

    const source = new ZodBuilder({ fileResolver: mode === 'file' ? undefined : fileResolver, withJSDocs: true, resolveName: pluginManager.resolveName })
      .add(schemas.pathParams)
      .add(schemas.queryParams)
      .add(schemas.headerParams)
      .add(schemas.response)
      .add(schemas.errors)
      .configure()
      .print()

    return {
      path: zod.path,
      baseName: zod.baseName,
      source,
      imports: [
        {
          name: ['z'],
          path: 'zod',
        },
      ],
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }

  async post(operation: Operation, schemas: OperationSchemas): Promise<KubbFile.File<FileMeta> | null> {
    const { mode } = this.options
    const { pluginManager } = this.context

    const zod = this.resolve(operation)

    const fileResolver: FileResolver = (name) => {
      // Used when a react-query type(request, response, params) has an import of a global type
      const root = pluginManager.resolvePath({ baseName: zod.name, pluginName, options: { tag: operation.getTags()[0]?.name } })
      // refs import, will always been created with the SwaggerTS plugin, our global type
      const resolvedTypeId = pluginManager.resolvePath({
        baseName: `${name}.ts`,
        pluginName,
      })

      return getRelativePath(root, resolvedTypeId)
    }

    const source = new ZodBuilder({ fileResolver: mode === 'file' ? undefined : fileResolver, withJSDocs: true, resolveName: pluginManager.resolveName })
      .add(schemas.pathParams)
      .add(schemas.queryParams)
      .add(schemas.headerParams)
      .add(schemas.request)
      .add(schemas.response)
      .add(schemas.errors)
      .configure()
      .print()

    return {
      path: zod.path,
      baseName: zod.baseName,
      source,
      imports: [
        {
          name: ['z'],
          path: 'zod',
        },
      ],
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
