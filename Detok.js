class TmDetokenizer {
  constructor(tokenizer, syntax, specifications) {
    this.Syntax = syntax;
    this.Source = tokenizer;
    this.Spec = specifications;
  }
}

module.exports = TmDetokenizer;