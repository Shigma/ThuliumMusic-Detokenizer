class TmError {
  constructor(messages) {
    this.Errors = []
    this.Messages = messages
  }

  format() {
    this.Errors.map(err => {
      const template = this.Messages[err.name]
      for (const name in this.Args) {
        const arg = this.render(this.Args[name])
        template.replace(new RegExp('${' + name + '}', 'g'), arg)
      }
      return template
    })
  }

  push(...errors) {
    for (const err of errors) {
      if (!err.Args) err.Args = []
      if (!err.Rank) err.Rank = 1
      this.Errors.push(err)
    }
  }
}

TmError.Token = {
  InvalidCommand: 'Token::InvalidCommand',
  FileNotFound: 'Token::FileNotFound'
}

module.exports = TmError
