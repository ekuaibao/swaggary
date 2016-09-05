import React from 'react'
import { Provider } from 'react-redux'

import { Scrollable } from '../components/scroll-spy'
import NavList from './nav-list'
import ResourceList from './resource-list'
import  './main.css'
import styles from './main.style.css'

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Scrollable className={styles.scrollable} onScroll={name => this.setState({ name })}>
        <Provider store={this.props.store}>
          <div className={styles.main}>
            <div className={styles.navCol}>
              <div className={styles.nav}>
                <NavList selected={this.state.name}/>
              </div>
            </div>
            <div className={styles.docCol}>
              <ResourceList/>
            </div>
          </div>
        </Provider>
      </Scrollable>
    )
  }
}

export default Main