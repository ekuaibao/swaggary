import React from 'react'
import ReactDOM from 'react-dom'

const components = []
var positions = null

function getComponent(pos) {
  if (components.length == 0)
    return null
  if (!positions) {
    const arr = components.map(c => {
      return {
        component: c,
        top: getTop(ReactDOM.findDOMNode(c))
      }
    })
    arr.sort((a, b) => a.top - b.top)
    positions = arr
  }
  var i = 0
  while (i < positions.length && pos >= positions[i].top) {
    i++
  }
  return positions[Math.max(i - 1, 0)].component
}

function getTop(el) {
  var pos = 0;
  while (el) {
    pos += (el.offsetTop - el.scrollTop + el.clientTop);
    el = el.offsetParent;
  }
  return pos;
}

export class ScrollPosition extends React.Component {
  render() {
    return (<a name={this.props.name}/>)
  }

  componentDidMount() {
    components.push(this)
    positions = null
  }

  componentWillUnmount() {
    const i = components.indexOf(this)
    if (i >= 0) components.splice(i, 1)
    positions = null
  }
}

export class ScrollSpy extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: null }
  }

  render() {
    var arr = this.props.children
    const name = this.state.name
    if (name != null) {
      const { children } = this.renderChildren(arr, name)
      arr = children
    }
    return (
      <div>
        {arr}
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

  componentDidMount() {
    this._onscroll = () => this.onScroll()
    window.addEventListener('scroll', this._onscroll)
    this.onScroll()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._onscroll)
  }

  onScroll() {
    const c = getComponent(document.body.scrollTop)
    this.setState({ name: c ? '#' + c.props.name : null })
  }
}

ScrollSpy.defaultProps = { selectedClassName: 'selected', activeClassName: 'active' }