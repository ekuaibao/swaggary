import React from 'react'
import styles from './model.style.css'

function typeNameOf(type) {
  var name = type.id || type.type
  if (type.parent) {
    name += ' inherit from ' + type.parent
  }
  return name
}

export class ModelProp extends React.Component {
  render() {
    const p = this.props.property
    const complex = typeof p.type == 'object'
    const typeName = complex ? typeNameOf(p.type) : p.type
    return (
      <div className={styles.model}>
        <div>
          <span className={styles.name}>{p.name}</span>
          <span className={styles.symbol}>:</span>
          <span className={styles.type}>{typeName}</span>
          <span className={styles.description}
                dangerouslySetInnerHTML={{ __html: (p.optional ? '可选;' : '必填;') + p.description }}/>
        </div>
        {complex ? <ModelClass type={p.type}/> : null}
      </div>
    )
  }
}

export class ModelType extends React.Component {
  render() {
    const type = this.props.type
    return typeof type == 'object' ?
      <ModelClass className={styles.model} type={type}/> :
      <div className={styles.type + ' ' + styles.model}>{type}</div>
  }
}

class ModelClass extends React.Component {
  render() {
    const className = this.props.className
    const type = this.props.type
    switch (type.type) {
      case 'array':
        return (
          <div className={className}>
            <div>
              <span className={styles.symbol}>[</span>
            </div>
            <div className={styles.inner}>
              <ModelType type={type.items}/>
            </div>
            <div>
              <span className={styles.symbol}>]</span>
            </div>
          </div>
        )
      case 'object':
        return (
          <div className={className}>
            <div>
              <span className={styles.symbol}>&#123;</span>
              <span className={styles.description}>{typeNameOf(type)}</span>
            </div>
            <div className={styles.inner}>
              {type.props.map(p =>
                <ModelProp key={p.name} property={p}/>
              )}
            </div>
            <div>
              <span className={styles.symbol}>&#125;</span>
            </div>
          </div>
        )
      case 'ref':
        return (
          <div className={className}>
            <div>
              <span className={styles.symbol}>&#123;...&#125;</span>
              <span className={styles.description}>{type.id}</span>
            </div>
          </div>
        )
      default:
        console.error('invalid type:', type.type)
        break
    }
    return null
  }
}
