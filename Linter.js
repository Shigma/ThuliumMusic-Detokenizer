const TmDetok = require('./Detok')
const TmError = require('./Error')

class TmLinter {
  constructor(tokenizer, syntax) {
    this.Detok = new TmDetok(tokenizer, syntax)
  }

  detokenize() {
    return this.Detok.detokenize()
  }
}

module.exports = TmLinter

