import {busywait, CheckFn, IBusyWaitResult} from '../..'
// @ts-ignore
import {itParam} from 'mocha-param'
import {expect} from 'chai'

const successMessage = 'success'

interface IParam {
  checkFn: CheckFn<string>;
}

type Done = (error?: any) => void

describe('busywait.js', function() {
  this.timeout(10000)

  const waitTime = 2500
  let waitUntil: number
  let iterationsArray: number[]
  let delaysArray: number[]
  let totalDelaysArray: number[]

  beforeEach(() => {
    iterationsArray = []
    delaysArray = []
    totalDelaysArray = []
    waitUntil = Date.now() + waitTime
  })

  const checkIterationsArray = (iterations: number, delay: number, startDelay: boolean) => {
    expect(iterationsArray.length).to.equal(iterations)
    expect(delaysArray.length).to.equal(iterations)
    expect(totalDelaysArray.length).to.equal(iterations)
    let totalDelay = 0
    for (let i = 0; i < iterations; i++) {
      expect(iterationsArray[i]).to.equal(i + 1)
      expect(delaysArray[i]).to.equal(!startDelay && i === 0 ? 0 : delay)
      totalDelay += delaysArray[i]
      expect(totalDelaysArray[i]).to.be.greaterThanOrEqual(totalDelay - 10)
    }
  }

  const checkIterationsAndDelaysArray = (iterations: number, delays: number[]) => {
    expect(iterationsArray.length).to.equal(iterations)
    expect(delaysArray.length).to.equal(iterations)
    expect(totalDelaysArray.length).to.equal(iterations)
    let totalDelay = 0
    for (let i = 0; i < iterations; i++) {
      expect(iterationsArray[i]).to.equal(i + 1)
      expect(delaysArray[i]).to.equal(delays[i])
      totalDelay += delaysArray[i]
      expect(totalDelaysArray[i]).to.be.greaterThanOrEqual(totalDelay - 10)
    }
  }

  const checkJitterDelaysArray = (delays: number[]) => {
    let totalDelay = 0
    for (let i = 0; i < iterationsArray.length; i++) {
      expect(delaysArray[i]).to.be.lessThan(delays[i] + 1)
      totalDelay += delaysArray[i]
      expect(totalDelaysArray[i]).to.be.greaterThanOrEqual(totalDelay - 10)
    }
  }

  const syncCheck = (iteration: number, delay: number, totalDelay: number): string => {
    iterationsArray.push(iteration)
    delaysArray.push(delay)
    totalDelaysArray.push(totalDelay)
    if (Date.now() > waitUntil) {
      return successMessage
    }
    throw new Error('not the time yet')
  }

  const asyncCheck = (iteration: number, delay: number, totalDelay: number): Promise<string> => {
    iterationsArray.push(iteration)
    delaysArray.push(delay)
    totalDelaysArray.push(totalDelay)
    return new Promise((resolve, reject) => {
      if (Date.now() > waitUntil) {
        return resolve(successMessage)
      }
      return reject()
    })
  }

  const nativeAsyncCheck = async(iteration: number, delay: number, totalDelay: number): Promise<string> => {
    iterationsArray.push(iteration)
    delaysArray.push(delay)
    totalDelaysArray.push(totalDelay)
    if (Date.now() > waitUntil) {
      return successMessage
    }
    throw new Error()
  }

  const params: IParam[] = [
    {checkFn: syncCheck},
    {checkFn: asyncCheck},
    {checkFn: nativeAsyncCheck}
  ]


  const verifyMaxChecksError = (done: Done, param: IParam, value?: number): Promise<void> => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      maxChecks: value || 0
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        err.message.should.equal('maxChecks must be a valid integer greater than 1')
        done()
      })
  }

  const verifySleepTimeError = (done: Done, param: IParam, value?: number): Promise<void> => {
    return busywait(param.checkFn, {
      sleepTime: value || 0,
      maxChecks: 500
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        err.message.should.equal('sleepTime must be a valid integer greater than 1')
        done()
      })
  }

  const verifyCheckFuncError = (done: Done, param: IParam, value: any): Promise<void> => {
    return busywait(value, {
      sleepTime: 500,
      maxChecks: 500
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        err.message.should.equal('checkFn must be a function')
        done()
      })
  }


  const verifyMaxDelayError = (done: Done, param: IParam, value: number): Promise<void> => {
    return busywait(param.checkFn, {
      sleepTime: 100,
      maxDelay: value
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        err.message.should.equal('maxDelay must be a valid integer greater than 1')
        done()
      })
  }

  const verifyMultiplierError = (done: Done, param: IParam, value: number): Promise<void> => {
    return busywait(param.checkFn, {
      sleepTime: 100,
      multiplier: value
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        err.message.should.equal('multiplier must be a valid integer greater than 1')
        done()
      })
  }

  itParam('should complete', params, (param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      maxChecks: 20
    })
      .then((result: IBusyWaitResult<string>) => {
        expect(result.backoff.iterations).to.equal(6)
        expect(result.backoff.time).to.be.greaterThan(waitTime - 100)
        expect(result.backoff.time).to.be.lessThan(waitTime + 100)
        expect(result.result).to.equal(successMessage)
        checkIterationsArray(6, 500, false)
      })
  })

  itParam('should complete with exponential backoff and jitter', params, (param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      multiplier: 2,
      waitFirst: true,
      jitter: 'full'
    })
      .then((result: IBusyWaitResult<string>) => {
        expect(result.result).to.equal(successMessage)
        checkJitterDelaysArray([500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000])
      })
  })

  itParam('should complete with exponential backoff', params, (param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      multiplier: 2
    })
      .then((result: IBusyWaitResult<string>) => {
        expect(result.backoff.iterations).to.equal(4)
        expect(result.backoff.time).to.be.greaterThan(waitTime - 100)
        expect(result.backoff.time).to.be.lessThan(waitTime + 1500)
        expect(result.result).to.equal(successMessage)
        checkIterationsAndDelaysArray(4, [0, 500, 1000, 2000])
      })
  })

  itParam('should complete with exponential backoff and start delay', params, (param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      multiplier: 2,
      waitFirst: true
    })
      .then((result: IBusyWaitResult<string>) => {
        expect(result.backoff.iterations).to.equal(3)
        expect(result.backoff.time).to.be.greaterThan(waitTime - 100)
        expect(result.backoff.time).to.be.lessThan(waitTime + 1500)
        expect(result.result).to.equal(successMessage)
        checkIterationsAndDelaysArray(3, [500, 1000, 2000])
      })
  })

  itParam('should complete with less tries', params, (param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      maxChecks: 20,
      waitFirst: true
    })
      .then((result: IBusyWaitResult<string>) => {
        expect(result.backoff.iterations).to.equal(5)
        expect(result.backoff.time).to.be.greaterThan(waitTime - 100)
        expect(result.backoff.time).to.be.lessThan(waitTime + 100)
        expect(result.result).to.equal(successMessage)
        checkIterationsArray(5, 500, true)
      })
  })

  itParam('should fail on max checks', params, (done: Done, param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      maxChecks: 2
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        checkIterationsArray(2, 500, false)
        err.message.should.equal('Exceeded number of iterations to wait')
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  itParam('should fail on max checks with custom error', params, (done: Done, param: IParam) => {
    return busywait(param.checkFn, {
      sleepTime: 500,
      maxChecks: 2,
      failMsg: 'custom fail'
    })
      .then(() => {
        done('busywait should fail')
      })
      .catch((err) => {
        checkIterationsArray(2, 500, false)
        err.message.should.equal('custom fail')
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  itParam('should fail on no maxChecks', params, (done: Done, param: IParam) => {
    return verifyMaxChecksError(done, param, undefined)
  })

  itParam('should fail on invalid maxChecks', params, (done: Done, param: IParam) => {
    return verifyMaxChecksError(done, param, -5)
  })

  itParam('should fail on no sleepTime', params, (done: Done, param: IParam) => {
    return verifySleepTimeError(done, param, undefined)
  })

  itParam('should fail on invalid sleepTime', params, (done: Done, param: IParam) => {
    return verifySleepTimeError(done, param, -5)
  })

  itParam('should fail on empty checkFn', params, (done: Done, param: IParam) => {
    return verifyCheckFuncError(done, param, undefined)
  })

  itParam('should fail on non function checkFn', params, (done: Done, param: IParam) => {
    return verifyCheckFuncError(done, param, 'str')
  })

  itParam('should fail on NaN multiplier', params, (done: Done, param: IParam) => {
    return verifyMultiplierError(done, param, NaN)
  })

  itParam('should fail on invalid multiplier', params, (done: Done, param: IParam) => {
    return verifyMultiplierError(done, param, 0)
  })

  itParam('should fail on NaN maxDelay', params, (done: Done, param: IParam) => {
    return verifyMaxDelayError(done, param, NaN)
  })

  itParam('should fail on invalid maxDelay', params, (done: Done, param: IParam) => {
    return verifyMaxDelayError(done, param, 0)
  })
})
