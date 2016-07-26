import React from 'react'
import { ScrollPosition } from '../components/scroll-spy'
import Operation from './operation'
import styles from './resource.style.css'

class Resource extends React.Component {
  render() {
    const r = this.props.resource
    return (
      <div className="resource">
        <ScrollPosition name={r.id}/>
        <div className={styles.title}>{r.description}</div>
        <div className="operations">
          {r.operations.map((o, i) =>
            <Operation key={i} operation={o}/>
          )}
        </div>
      </div>
    )
  }
}

export default Resource