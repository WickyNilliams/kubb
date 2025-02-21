import pathParser from 'node:path'

import fs from 'fs-extra'
import { switcher } from 'js-runtime'

import type { KubbFile } from '../managers/fileManager/types.ts'

function slash(path: string, platform: 'windows' | 'mac' | 'linux' = 'linux') {
  const isWindowsPath = /^\\\\\?\\/.test(path)

  if (['linux', 'mac'].includes(platform) && !isWindowsPath) {
    // linux and mac
    return path.replaceAll(/\\/g, '/').replace('../', '').trimEnd()
  }

  // windows
  return path.replaceAll(/\\/g, '/').replace('../', '').trimEnd()
}

export function getRelativePath(rootDir?: string | null, filePath?: string | null, platform: 'windows' | 'mac' | 'linux' = 'linux'): string {
  if (!rootDir || !filePath) {
    throw new Error(`Root and file should be filled in when retrieving the relativePath, ${rootDir || ''} ${filePath || ''}`)
  }

  const relativePath = pathParser.relative(rootDir, filePath)

  // On Windows, paths are separated with a "\"
  // However, web browsers use "/" no matter the platform
  const path = slash(relativePath, platform)

  if (path.startsWith('../')) {
    return path.replace(pathParser.basename(path), pathParser.basename(path, pathParser.extname(filePath)))
  }

  return `./${path.replace(pathParser.basename(path), pathParser.basename(path, pathParser.extname(filePath)))}`
}

export function getPathMode(path: string | undefined | null): KubbFile.Mode {
  if (!path) {
    return 'directory'
  }
  return pathParser.extname(path) ? 'file' : 'directory'
}

const reader = switcher(
  {
    node: async (path: string) => {
      return fs.readFile(path, { encoding: 'utf8' })
    },
    bun: async (path: string) => {
      const file = Bun.file(path)

      return file.text()
    },
  },
  'node',
)

const syncReader = switcher(
  {
    node: (path: string) => {
      return fs.readFileSync(path, { encoding: 'utf8' })
    },
    bun: () => {
      throw new Error('Bun cannot read sync')
    },
  },
  'node',
)

export async function read(path: string): Promise<string> {
  return reader(path)
}

export function readSync(path: string): string {
  return syncReader(path)
}
