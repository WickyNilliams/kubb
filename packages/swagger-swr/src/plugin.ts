import pathParser from 'node:path'

import { createPlugin, getDependedPlugins, getIndexes, getPathMode, getRelativePath, renderTemplate } from '@kubb/core'
import { pluginName as swaggerPluginName } from '@kubb/swagger'

import { camelCase, camelCaseTransformMerge } from 'change-case'

import { OperationGenerator } from './generators/index.ts'

import type { KubbFile } from '@kubb/core'
import type { PluginOptions as SwaggerPluginOptions } from '@kubb/swagger'
import type { FileMeta, PluginOptions } from './types.ts'

export const pluginName: PluginOptions['name'] = 'swagger-swr' as const

export const definePlugin = createPlugin<PluginOptions>((options) => {
  const { output = 'hooks', groupBy, skipBy = [], transformers = {}, dataReturnType = 'data' } = options
  const template = groupBy?.output ? groupBy.output : `${output}/{{tag}}SWRController`
  let pluginsOptions: [SwaggerPluginOptions]

  return {
    name: pluginName,
    options,
    kind: 'controller',
    validate(plugins) {
      pluginsOptions = getDependedPlugins<[SwaggerPluginOptions]>(plugins, [swaggerPluginName])

      return true
    },
    resolvePath(baseName, directory, options) {
      const root = pathParser.resolve(this.config.root, this.config.output.path)
      const mode = getPathMode(pathParser.resolve(root, output))

      if (mode === 'file') {
        /**
         * when output is a file then we will always append to the same file(output file), see fileManager.addOrAppend
         * Other plugins then need to call addOrAppend instead of just add from the fileManager class
         */
        return pathParser.resolve(root, output)
      }

      if (options?.tag && groupBy?.type === 'tag') {
        const tag = camelCase(options.tag, { delimiter: '', transform: camelCaseTransformMerge })

        return pathParser.resolve(root, renderTemplate(template, { tag }), baseName)
      }

      return pathParser.resolve(root, output, baseName)
    },
    resolveName(name) {
      const resolvedName = camelCase(name, { delimiter: '', stripRegexp: /[^A-Z0-9$]/gi, transform: camelCaseTransformMerge })

      return transformers?.name?.(resolvedName) || resolvedName
    },
    async buildStart() {
      const [swaggerPlugin] = pluginsOptions

      const oas = await swaggerPlugin.api.getOas()

      const clientPath: KubbFile.OptionalPath = options.client ? pathParser.resolve(this.config.root, options.client) : undefined

      const operationGenerator = new OperationGenerator(
        {
          dataReturnType,
          clientImportPath: options.clientImportPath,
          clientPath,
        },
        {
          oas,
          pluginManager: this.pluginManager,
          contentType: swaggerPlugin.api.contentType,
          skipBy,
        },
      )

      const files = await operationGenerator.build()
      await this.addFile(...files)
    },
    async buildEnd() {
      if (this.config.output.write === false) {
        return
      }

      const root = pathParser.resolve(this.config.root, this.config.output.path)

      if (groupBy?.type === 'tag') {
        const filteredFiles = this.fileManager.files.filter(
          (file) => file.meta?.pluginName === pluginName && (file.meta as FileMeta)?.tag,
        ) as KubbFile.File<FileMeta>[]
        const rootFiles = filteredFiles
          .map((file) => {
            const tag = file.meta?.tag && camelCase(file.meta.tag, { delimiter: '', transform: camelCaseTransformMerge })
            const path = getRelativePath(
              pathParser.resolve(this.config.root, this.config.output.path),
              pathParser.resolve(root, renderTemplate(template, { tag })),
            )
            const name = this.resolveName({ name: renderTemplate(groupBy.exportAs || '{{tag}}SWRHooks', { tag }), pluginName })

            if (name) {
              return {
                baseName: 'index.ts' as const,
                path: pathParser.resolve(this.config.root, this.config.output.path, 'index.ts'),
                source: '',
                exports: [{ path, asAlias: true, name }],
                meta: {
                  pluginName,
                },
              }
            }
          })
          .filter(Boolean)

        await this.addFile(...rootFiles)
      }

      const files = await getIndexes(root, { extensions: /\.ts/, exclude: [/schemas/, /json/] })

      if (files) {
        await this.addFile(...files)
      }
    },
  }
})
