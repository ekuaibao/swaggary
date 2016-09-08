import marked from 'marked'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript.min'
import 'prismjs/components/prism-json.min'
import 'prismjs/themes/prism.css'

const formats = {
  json: Prism.languages.json,
  javascript: Prism.languages.javascript
}

marked.setOptions({
  highlight: (code, lang) => {
    const format = formats[lang]
    const html = format ? Prism.highlight(code, format) : code
    return '<code class="language-' + lang + ' code-block">' + html + '</code>'
  }
})

export default (state = [], action) => {
  if (action.type == 'setDoc') {
    action.payload.forEach(r => {
      r.operations.forEach(op => {
        if (op.description) {
          if (/^\s*\|/.test(op.description)) {
            op.description = op.description.replace(/^\s*\|/mg, '')
            op.description = marked(op.description)
          }
        }
      })
    })
    return action.payload
  }
  return state
}
