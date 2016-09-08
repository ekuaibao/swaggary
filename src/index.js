import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import Main from './views/main'
import { load } from './action'

const store = createStore(reducer, [], compose(
  applyMiddleware(thunk),
  window.devToolsExtension ? window.devToolsExtension() : f => f
))

window.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.createElement('div')
  rootEl.className = 'root'
  document.body.appendChild(rootEl)
  ReactDOM.render(React.createElement(Main, { store }), rootEl)
})

store.dispatch(load())