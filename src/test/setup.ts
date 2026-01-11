import chai = require('chai')
import path = require('path')
import mod = require('module')
import sinonChaiModule = require('sinon-chai')
import chaiAsPromisedModule = require('chai-as-promised')

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

