import React from 'react'
import { ScrollPosition } from '../components/scroll-spy'
import { ModelProp, ModelType } from './model'
import styles from './operation.style.css'

class Operation extends React.Component {
  render() {
    const o = this.props.operation
    return (
      <div className={styles.operation + ' ' + styles[o.method]}>
        <ScrollPosition name={o.id}/>
        <div className={styles.title}>{o.title}</div>
        <div className={styles.url}>
          <div className={styles.method}>{o.method}</div>
          <div className={styles.path}>{o.path}</div>
        </div>
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: o.description }}/>
        {o.consumes && this.renderSection('ContentType',
          <ul>
            {o.consumes.map(m => this.renderMediaType(m))}
          </ul>
        )}
        {o.produces && this.renderSection('Accept',
          <ul>
            {o.produces.map(m => this.renderMediaType(m))}
          </ul>
        )}
        {o.headerParams.length ? this.renderSection('Headers', this.renderParams(o.headerParams)) : null}
        {o.pathParams.length ? this.renderSection('Path', this.renderParams(o.pathParams)) : null}
        {o.queryParams.length ? this.renderSection('Query', this.renderParams(o.queryParams)) : null}
        {o.body && this.renderSection('Body',
          <div className={styles.item}>
            <ModelProp property={o.body}/>
            {o.body.type.subTypes && o.body.type.subTypes.map(type =>
              <ModelType key={type.id} type={type}/>
            )}
          </div>
        )}
        {this.renderSection('Status Codes',
          o.statusCode.map((s, i) =>
            <div className={styles.status} key={i}>
              <div className={styles.statusCode}>{s.code}</div>
              <div className={styles.statusMessage}>{s.message}</div>
            </div>
          )
        )}
        {o.response && this.renderSection('Response',
          <div className={styles.item}>
            <ModelType type={o.response}/>
            {o.response.subTypes && o.response.subTypes.map(type =>
              <ModelType key={type.id} type={type}/>
            )}
          </div>
        )}
      </div>
    )
  }

  renderMediaType(m) {
    return <li className={styles.item} key={m}>{m}</li>
  }

  renderSection(name, content) {
    return (
      <div className={styles.section}>
        <div className={styles.subTitle}>{name}</div>
        {content}
      </div>
    )
  }

  renderParams(arr) {
    return (
      <ul>
        {arr.map(p =>
          <li className={styles.item} key={p.name}>
            <ModelProp property={p}/>
            {p.type.subTypes && p.type.subTypes.map(type =>
              <ModelType key={type.id} type={type}/>
            )}
          </li>
        )}
      </ul>
    )
  }
}

export default Operation