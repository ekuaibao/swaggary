'use strict'

const EventEmitter = require('events').EventEmitter
const charm = require('charm')
const through = require('through2')

const keyMap = {
  '1b5b41': 'up',
  '1b5b42': 'down',
  '0d': 'enter',
  '1b': 'esc'
}

class Select extends EventEmitter {
  constructor(opts) {
    super()
    this.opts = Object.assign({
      pointer: ' ▸ ',
      pointerColor: 'green',
      input: process.stdin,
      output: process.stdout
    }, opts)
    this.items = opts.options.map(o => {
      return typeof o == 'object' ? {
        selected: false,
        value: o.value,
        text: o.text
      } : {
        selected: false,
        value: o,
        text: o
      }
    })
    this.cursor = 0
    this.items[this.cursor].selected = true
    this.indent = ' '.repeat(this.opts.pointer.length)
    this.charm = charm({
      input: this.filteredInput()
    })
    this.charm.pipe(this.filteredOutput())
    this.charm.on('error', function() {})
    this.charm.position((x, y) => {
      if (x != 1)
        this.charm.write('\n')
      this.charm.cursor(false)
      this.render()
      this.y = y
    })
  }
  filteredInput() {
    const input = this.opts.input
    if (input.setRawMode) {
      input.setRawMode(true)
    }
    return input.pipe(through((buf, _, next) => {
      const key = keyMap[buf.toString('hex')]
      if (key) {
        this.onKeypress(key)
      }
      const ch = buf[0]
      if (ch <= 0x1f // C0
        || ch >= 0x80 && ch <= 0x9f // C1
        || ch == 0x7f // delete
        || ch == 0xa0 || ch == 0xff // Special
      ) {
        next(null, buf)
      } else {
        next()
      }
    }))
  }
  filteredOutput() {
    return this.opts.output
  }
  render() {
    if (this.y) {
      this.charm.position(1, this.y - this.items.length)
    }
    this.items.forEach(item => {
      this.charm
        .erase('line')
        .foreground(this.opts.pointerColor)
        .write(item.selected ? this.opts.pointer : this.indent)
        .display('reset')
        .write(item.text)
        .write('\n')
    })
  }
  scheduleRender() {
    if (!this.renderPending) {
      process.nextTick(() => {
        this.render()
        this.renderPending = false
      })
      this.renderPending = true
    }
  }
  updateCursor(cur) {
    cur = Math.min(this.items.length - 1, Math.max(0, cur))
    if (cur != this.cursor) {
      this.cursor = cur
      this.items = this.items.map((item, idx) => {
        return {
          selected: idx == cur,
          value: item.value,
          text: item.text
        }
      })
      this.scheduleRender()
    }
  }
  onKeypress(key) {
    switch (key) {
      case 'up':
        this.updateCursor(this.cursor - 1)
        break
      case 'down':
        this.updateCursor(this.cursor + 1)
        break
      case 'enter':
        this.close()
        this.emit('select', this.items.find(i => i.selected).value)
        break
      default:
        break
    }
  }
  close() {
    const input = this.opts.input
    if (input.setRawMode) {
      input.setRawMode(false)
    }
    input.end()
    this.charm.cursor(true)
    this.charm.display('reset')
    this.charm.position(1, this.y + this.items.length)
    this.charm.end()
  }
  run() {
    return new Promise(resolve => {
      this.on('select', resolve)
    })
  }
}

module.exports = opts => new Select(opts)
