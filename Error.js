class TmLog {
  constructor(messages) {
    this.Errors = []
    this.Warnings = []
    this.Messages = messages
  }

  format () {
    this.Errors.map(err => err.format(this.Messages[err.name]))
  }
}

class TmError {
  constructor(type, pos, args) {
    this.Type = type
    this.Args = args
    this.Pos = Pos
  }

  format(template) {
    for (const name in args) {
      const arg = this.render(args[name])
      template.replace(new RegExp('${' + name + '}', 'g'), arg)
    }
    return template
  }
}

module.exports = { TmError, TmLog }
