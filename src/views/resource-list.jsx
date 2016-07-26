import React from 'react'
import Resource from './resource'

class ResourceList extends React.Component {
  render() {
    const resources = this.props.resources
    return (
      <div>
        {resources.map((r, i) =>
          <Resource key={i} resource={r}/>
        )}
      </div>
    )
  }
}

import { connect } from 'react-redux'

ResourceList = connect(state => ({ resources: state }))(ResourceList)

export default ResourceList