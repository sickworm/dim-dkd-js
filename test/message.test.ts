import { Message, Envelope } from '../src/message'

describe('my-app:isArrayLike', () => {
  test('new Envelope', () => {
    const time = new Date().getTime()
    const envelope = new Envelope('alice', 'bob', time)
    expect(envelope.sender).toBe('alice')
    expect(envelope.receiver).toBe('bob')
    expect(envelope.time).toBe(time)
  })

  test('new Message', () => {
    const time = new Date().getTime()
    const message = new Message({
      sender: 'alice',
      receiver: 'bob',
      time: time
    })
    const envelope = new Envelope('alice', 'bob', time)
    expect(message.envelope).toEqual(envelope)

    expect(message.sender).toBe('alice')
    expect(message.receiver).toBe('bob')
    expect(message.time).toBe(time)
  })

  test('new Message with extra arguments', () => {
    const time = new Date().getTime()
    const message = new Message({
      sender: 'alice',
      receiver: 'bob',
      time: time,
      arg1: 'this is arg1',
      arg2: 101,
      arg3: false
    })
    const envelope = new Envelope('alice', 'bob', time)
    expect(message.envelope).toEqual(envelope)

    expect(message.sender).toBe('alice')
    expect(message.receiver).toBe('bob')
    expect(message.time).toBe(time)
    expect(message.arg1).toBe('this is arg1')
    expect(message.arg2).toBe(101)
    expect(message.arg3).toBe(false)
  })
})