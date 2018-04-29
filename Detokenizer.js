class TmDetokenizer {
  constructor(tokenizer, syntax) {
    this.Syntax = syntax;
    this.Source = tokenizer;
    this.Comment = '';
    this.Library = '';
    this.Sections = '';
    this.$init = false;
    this.$detok = false;
  }

  initialize() {
    for (const comment of this.Source.Comment) {
      this.Comment += '//' + comment + '\n';
    }
    if (this.Source.Comment.length > 0) this.Comment += '\n';
    for (const command of this.Source.Library) {
      if (command.Head) this.Library += command.Head + '\n\n';
      switch (command.Type) {
      case 'Function':
      case 'Chord':
        this.Library += command.Code.join('\n');
        break;
      }
    }
    this.$init = true;
  }

  detokenize() {
    this.initialize();
    return this.Comment + this.Library;
  }
}

module.exports = TmDetokenizer;
