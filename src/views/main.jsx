import React from 'react'
import { Provider } from 'react-redux'

import NavList from './nav-list'
import ResourceList from './resource-list'
import  './main.css'
import styles from './main.style.css'

class Main extends React.Component {
  render() {
    return (
      <Provider store={this.props.store}>
        <div className={styles.main}>
          <div className={styles.navCol}>
            <div className={styles.nav}>
              <NavList/>
            </div>
          </div>
          <div className={styles.docCol}>
            <ResourceList/>
          </div>
        </div>
      </Provider>
    )
  }
}

export default Main