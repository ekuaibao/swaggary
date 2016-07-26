import React from 'react'
import { ScrollSpy } from '../components/scroll-spy'
import styles from './nav-list.style.css'

class NavList extends React.Component {
  render() {
    const arr = this.props.resources
    const items = []
    arr.forEach(r => {
      items.push(r.id)
      r.operations.forEach(o => items.push(o.id))
    });
    return (
      <div className={styles.navList}>
        <ScrollSpy selectedClassName={styles.selected} activeClassName={styles.active}>
          {arr.map((r, i) =>
            <div key={i}>
              <a className={styles.title} href={'#' + r.id}>{r.description}</a>
              <div className={styles.subs}>
                {r.operations.map((o, i) =>
                  <a className={styles.subTitle} key={i} href={'#' + o.id}>{o.title}</a>
                )}
              </div>
            </div>
          )}
        </ScrollSpy>
      </div>
    )
  }
}

import { connect } from 'react-redux'

NavList = connect(state => ({ resources: state }))(NavList)

export default NavList