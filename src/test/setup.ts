import * as chai from 'chai'
import * as path from 'path'
import * as mod from 'module'
import * as sinonChaiModule from 'sinon-chai'
import * as chaiAsPromisedModule from 'chai-as-promised'

type Mod = {
  _initPaths?: () => void
} & typeof mod

// Helper to extract default export from ESM modules imported via namespace
function getDefault<T>(module: unknown): T {
  const m = module as {default?: T}
  return m.default !== undefined ? m.default : module as T
}

const sinonChai = getDefault<Chai.ChaiPlugin>(sinonChaiModule)
const chaiAsPromised = getDefault<Chai.ChaiPlugin>(chaiAsPromisedModule)

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

// importing files with ../../../../../.. makes my brain hurt
process.env.NODE_PATH = path.join(__dirname, '..') + path.delimiter + (process.env.NODE_PATH || '');
(mod as Mod)._initPaths?.()

