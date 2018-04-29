class TmDetokenizer {
  constructor(tokenizer, syntax) {
    this.Syntax = syntax;
    this.Source = tokenizer;
    this.Comment = '';
    this.Library = '';
    this.Sections = [];
    this.$detok = false;
  }

  detokenize() {
    // Comment
    for (const comment of this.Source.Comment) {
      this.Comment += '//' + comment + '\n';
    }
    if (this.Source.Comment.length > 0) this.Comment += '\n';

    // Library
    for (const command of this.Source.Library) {
      if (command.Head) this.Library += command.Head + '\n\n';
      switch (command.Type) {
      case 'Function':
      case 'Chord':
        this.Library += command.Code.join('\n');
        break;
      }
    }
    if (this.Source.Library.length > 0) {
      this.Library = this.Library.slice(0, -1);
    }

    // Sections
    for (const section of this.Source.Sections) {
      let result = '';
      for (const comment of section.Comment) {
        result += '//' + comment + '\n';
      }
      if (section.Comment.length === 0) result += '\n';
      if (section.Prolog.length > 0) {
        result += this.detokenizeContent(section.Prolog) + '\n\n';
      }
      for (const track of section.Tracks) {
        result += this.detokenizeContent(track.Content) + '\n\n';
      }
      if (section.Epilog.length > 0) {
        result += this.detokenizeContent(section.Epilog) + '\n\n';
      }
      result = result.slice(0, -1);
      this.Sections.push(result);
    }

    this.$detok = true;
    return this.Comment + this.Library + this.Sections.join('\n');
  }

  detokenizeContent(content) {
    let result = '';
    for (const token of content) {
      switch (token.Type) {
      case 'Space':
        result += token.Content;
        break;
      case 'Function': 
        if (token.Alias === -1) {
          result += `${token.Name}(${this.detokenizeArgs(token.Args)})`;
        } else if (token.Alias === 0) {
          result += `(${token.Name}:${this.detokenizeArgs(token.Args)})`;
        } else {
          result += `[Function: ${token.Name}]`;
        }
        break;
      case 'Note':
        result += this.detokenizeNote(token);
        break;
      case 'Subtrack':
        result += '{';
        result += token.Repeat > 0 ? token.Repeat + '*' : '';
        result += this.detokenizeContent(token.Content);
        result += '}';
        break;
      case 'Macrotrack':
        result += '@' + token.Name;
        break;
      case 'BarLine':
        if (token.Skip) {
          result += '\\';
        } else if (token.Overlay) {
          result += '/';
        } else if (token.Order.includes(0)) {
          result += '|';
        } else {
          result += '||||||||||'; //FIXME
        }
        break;
      case 'RepeatBegin': result += '||:'; break;
      case 'RepeatEnd': result += ':||'; break;
      }
    }
    return result;
  }

  detokenizeArgs(args) {
    let result = '';
    for (const arg of args) {
      switch (arg.Type) {
      case 'String':
        result += '"' + arg.Content + '"';
        break;
      case 'Expression':
        result += arg.Content;
        break;
      case 'Subtrack':
        result += '{' + arg.Content + '}';
        break;
      case 'Macrotrack':
        result += '@' + arg.Name;
        break;
      case 'Function':
        result += `${arg.Content.Name}(${this.detokenizeArgs(arg.Content.Args)})`;
        break;
      }
      result += ',';
    }
    if (args.length > 0) result = result.slice(0, -1)
    return result;
  }

  detokenizeNote(note){
    let result = '';
    function detokPitch(pitch) {
      return pitch.Degree + pitch.PitOp + pitch.Chord + pitch.VolOp;
    }
    if (note.Pitches.length > 1) {
      result += '[' + note.Pitches.map(detokPitch).join('') + ']';
    } else {
      result += detokPitch(note.Pitches[0]);
    }
    result += note.PitOp + note.Chord + note.VolOp + note.DurOp + '`'.repeat(note.Stac);
    return result;
  }
}

module.exports = TmDetokenizer;
