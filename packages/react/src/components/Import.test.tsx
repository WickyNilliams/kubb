import { createRoot } from '../client/createRoot.ts'
import { Import } from './Import.tsx'

describe('<Import/>', () => {
  test('render Import with print', () => {
    const Component = () => {
      return <Import name="React" path="react" print />
    }
    const root = createRoot()
    root.render(<Component />)

    expect(root.output).toMatch('import React from "react"')
  })
})
