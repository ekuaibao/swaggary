import React from 'react'

function find(arr, value) {
  var l = 0, h = arr.length - 1, c
  while (l <= h) {
    c = (l + h) >> 1
    var v = arr[c]
    if (v < value) {
      l = c + 1
    } else if (v > value) {
      h = c - 1
    } else {
      return c
    }
  }
  return Math.min(Math.max(h, 0), arr.length - 1)
}

export class Scrollable extends React.Component {
  constructor(props) {
    super(props)
    this.anchors = []
    this.orders = []
  }

  getChildContext() {
    return { scrollable: this }
  }

  componentWillUnmount() {
    this.unmount = true
  }

  render() {
    return (
      <div className={this.props.className || ''} onScroll={() => this.onScroll()} ref="dom">
        {this.props.children}
      </div>
    )
  }

  onScroll() {
    const root = this.refs.dom
    if (root && this.orders.length) {
      const offsetTop = root.offsetTop
      const arr = this.orders.map(o => o.elem.offsetTop - offsetTop)
      const top = root.scrollTop
      const i = find(arr, top)
      const c = this.orders[i].comp
      const name = c.props.name
      if (this.scrollName != name) {
        this.scrollName = name
        this.props.onScroll(name, c)
      }
    }
  }

  watch(comp) {
    this.anchors.push(comp)
    this.deferCompute()
  }

  unwatch(comp) {
    const i = this.anchors.indexOf(comp)
    if (i >= 0) {
      this.anchors.splice(i, 1)
      this.deferCompute()
    }
  }

  update() {
    this.deferCompute()
  }

  deferCompute() {
    if (!this.pending) {
      this.pending = true
      window.requestAnimationFrame(() => {
        this.pending = false
        if (!this.unmount) {
          if (this.refs.dom) {
            this.recompute()
          } else {
            this.deferCompute()
          }
        }
      })
    }
  }

  recompute() {
    const arr = []
    this.anchors.forEach(a => {
      const el = a.getAnchor()
      if (el) {
        arr.push({
          comp: a,
          elem: el
        })
      }
    })
    arr.sort((a, b)=> 3 - a.elem.compareDocumentPosition(b.elem))
    this.orders = arr
  }
}

Scrollable.childContextTypes = {
  scrollable: React.PropTypes.object
};

export class ScrollPosition extends React.Component {
  render() {
    return (<a name={this.props.name} ref="dom"/>)
  }

  componentDidMount() {
    this.context.scrollable.watch(this)
  }

  componentWillUnmount() {
    this.context.scrollable.unwatch(this)
  }

  componentDidUpdate() {
    this.context.scrollable.update(this)
  }

  getAnchor() {
    return this.refs.dom
  }
}

ScrollPosition.contextTypes = {
  scrollable: React.PropTypes.object
}

export class ScrollSpy extends React.Component {
  render() {
    const { children } = this.renderChildren(this.props.children, this.props.selected)
    return (
      <div>
        {children}
      </div>
    )
  }

  renderChildren(arr, name) {
    var _active = false
    const children = React.Children.map(arr, c => {
      if (!React.isValidElement(c))
        return c
      if (c.props.href == name) {
        _active = true
        return React.cloneElement(c, {
          className: (c.props.className || '') + ' ' + this.props.selectedClassName
        })
      } else {
        const { children, active }= this.renderChildren(c.props.children, name)
        const props = {}
        if (active) {
          _active = true
          props.className = (c.props.className || '') + ' ' + this.props.activeClassName
        }
        return React.cloneElement(c, props, children)
      }
    })
    return { children, active: _active }
  }
}

ScrollSpy.propTypes = {
  selectedClassName: React.PropTypes.string,
  activeClassName: React.PropTypes.string,
  selected: React.PropTypes.string
}

ScrollSpy.defaultProps = {
  selectedClassName: 'selected',
  activeClassName: 'active',
  selected: ''
}