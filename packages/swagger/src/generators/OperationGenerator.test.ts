import { oasParser } from '../parsers/oasParser.ts'
import { OperationGenerator } from './OperationGenerator.ts'

import type { KubbFile, PluginManager } from '@kubb/core'
import type { Operation, Resolver } from '../types.ts'

class DummyOperationGenerator extends OperationGenerator {
  resolve(_operation: Operation): Resolver {
    return {
      baseName: 'baseName.ts',
      path: 'models/baseName/ts/baseName.ts',
      name: 'baseName',
    }
  }

  all(): Promise<KubbFile.File | null> {
    return Promise.resolve(null)
  }

  get(operation: Operation): Promise<KubbFile.File | null> {
    return new Promise((resolve) => {
      const baseName: `${string}.ts` = `${operation.getOperationId()}.ts`
      resolve({ baseName, path: baseName, source: '' })
    })
  }

  post(_operation: Operation): Promise<KubbFile.File | null> {
    return new Promise((resolve) => {
      resolve(null)
    })
  }
  patch(_operation: Operation): Promise<KubbFile.File | null> {
    return new Promise((resolve) => {
      resolve(null)
    })
  }

  put(_operation: Operation): Promise<KubbFile.File | null> {
    return new Promise((resolve) => {
      resolve(null)
    })
  }

  delete(_operation: Operation): Promise<KubbFile.File | null> {
    return new Promise((resolve) => {
      resolve(null)
    })
  }
}

describe('abstract class OperationGenerator', () => {
  test('if pathParams return undefined when there are no params in path', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator({}, { oas, contentType: undefined, pluginManager: undefined as unknown as PluginManager, skipBy: [] })

    expect(og.getSchemas(oas.operation('/pets', 'get')).pathParams).toBeUndefined()
    expect(og.getSchemas(oas.operation('/pets', 'get')).queryParams).toBeDefined()
  })

  test('if skipBy is filtered out for tag', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator(
      {},
      {
        oas,
        skipBy: [
          {
            type: 'tag',
            pattern: 'pets',
          },
        ],
        pluginManager: undefined as unknown as PluginManager,
        contentType: undefined,
      },
    )

    const files = await og.build()

    expect(files).toMatchObject([])
  })

  test('if skipBy is filtered out for operationId', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator(
      {},
      {
        oas,
        skipBy: [
          {
            type: 'operationId',
            pattern: 'listPets',
          },
        ],
        pluginManager: undefined as unknown as PluginManager,
        contentType: undefined,
      },
    )

    const files = await og.build()

    expect(files).toMatchObject([
      {
        baseName: 'showPetById.ts',
        path: 'showPetById.ts',
        source: '',
      },
    ])
  })

  test('if skipBy is filtered out for path', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator(
      {},
      {
        oas,
        skipBy: [
          {
            type: 'path',
            pattern: '/pets/{petId}',
          },
        ],
        pluginManager: undefined as unknown as PluginManager,
        contentType: undefined,
      },
    )

    const files = await og.build()

    expect(files).toMatchObject([
      {
        baseName: 'listPets.ts',
        path: 'listPets.ts',
        source: '',
      },
    ])
  })

  test('if skipBy is filtered out for method', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator(
      {},
      {
        oas,
        skipBy: [
          {
            type: 'method',
            pattern: 'get',
          },
        ],
        pluginManager: undefined as unknown as PluginManager,
        contentType: undefined,
      },
    )

    const files = await og.build()

    expect(files).toMatchObject([])
  })

  test('if skipBy is filtered out for path and operationId', async () => {
    const oas = await oasParser({
      root: './',
      output: { path: 'test', clean: true },
      input: { path: 'packages/swagger/mocks/petStore.yaml' },
    })

    const og = new DummyOperationGenerator(
      {},
      {
        oas,
        skipBy: [
          {
            type: 'path',
            pattern: '/pets/{petId}',
          },
          {
            type: 'operationId',
            pattern: 'listPets',
          },
        ],
        pluginManager: undefined as unknown as PluginManager,
        contentType: undefined,
      },
    )

    const files = await og.build()

    expect(files).toMatchObject([])
  })
})
