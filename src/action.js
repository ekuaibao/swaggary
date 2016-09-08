import Promise from 'promise-polyfill'
import 'whatwg-fetch'

const primitiveTypes = {
  'string': 1, 'integer': 1, 'boolean': 1, 'Map': 1
}
const url = $swagger_document_url

export function load() {
  return dispatch => {
    return fetch(url)
      .then(resp => resp.json())
      .then(doc => {
        const arr = doc.apis.map(api => {
          const path = doc.basePath + api.path.replace('{format}', 'json')
          return fetch(path)
            .then(resp => resp.json())
            .then(apiDoc => {
              const operations = []
              const models = apiDoc.models
              apiDoc.apis.forEach(a => {
                const apiPath = apiDoc.basePath + a.path
                a.operations.forEach(o => {
                  operations.push({
                    id: o.method + ':' + apiPath,
                    path: apiPath,
                    title: o.summary,
                    description: o.notes,
                    method: o.method,
                    response: o.type == 'void' ? null : makeTopModel(o, models),
                    headerParams: filterParams(o, 'header', models),
                    pathParams: filterParams(o, 'path', models),
                    queryParams: filterParams(o, 'query', models),
                    body: filterParams(o, 'body', models)[0],
                    consumes: o.consumes,
                    produces: o.produces,
                    statusCode: o.responseMessages || []
                  })
                })
              })
              return {
                id: apiDoc.basePath + apiDoc.resourcePath,
                description: api.description,
                operations
              }
            })
        })
        Promise.all(arr).then(resources => {
          dispatch({
            type: 'setDoc',
            payload: resources
          })
        })
      })
  }
}

function filterParams(operation, paramType, models) {
  return operation.parameters ?
    operation.parameters
             .filter(p => p.paramType == paramType)
             .map(p => makeParam(p, models))
    : []
}

function makeParam(p, models) {
  return {
    name: p.name,
    type: makeTopModel(p, models),
    optional: !p.required,
    description: p.description
  }
}

function makeTopModel(o, models) {
  const refs = {}
  const type = makeModel(o, models, refs)
  if (typeof type == 'object') {
    const subTypes = []
    const processed = {}
    var more
    do {
      more = false
      Object.keys(refs).forEach(name => {
        if (name in processed)
          return
        processed[name] = 1
        more = true
        const model = models[name]
        if (model) {
          const arr = model.subTypes
          if (arr) {
            arr.forEach(id => {
              const type = makeNonArrayModel(id, models, refs)
              type.parent = name
              subTypes.push(type)
            })
          }
        }
      })
    } while (more)
    type.subTypes = subTypes
  }
  return type
}

function makeModel(o, models, refs) {
  if (o.type == 'array') {
    return {
      type: 'array',
      items: o.items.type ?
        makeModel(o.items, models, refs) :
        makeModel({ type: o.items.$ref }, models, refs)
    }
  }
  return makeNonArrayModel(o.type, models, refs)
}

function makeNonArrayModel(type, models, refs) {
  if (type in primitiveTypes)
    return type
  if (type in refs)
    return { type: 'ref', id: type }
  refs[type] = 1
  const m = models[type]
  if (!m) {
    return { type: 'object', id: type, props: [] }
  }
  const props = Object.keys(m.properties).map(name => {
    const p = m.properties[name]
    return {
      name,
      description: p.description,
      type: makeModel(p, models, refs),
      optional: !m.required || m.required.indexOf(name) < 0
    }
  })
  return { type: 'object', id: type, props }
}