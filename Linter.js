class TmLinter {
  constructor(tokenizer, syntax) {
    this.Syntax = syntax;
    this.Source = tokenizer;
    this.Comment = '';
    this.Library = '';
    this.Sections = [];
    this.$detok = false;
  }

  static isLinear(command) {
    const linearTypes = ['include', 'end'];
    return linearTypes.includes(command.Type);
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
      if (!TmLinter.isLinear(command)) {
        this.Library += command.Code.join('\n');
      }
    }

    // Sections
    for (const section of this.Source.Sections) {
      let result = '';
      for (const comment of section.Comment) {
        result += '//' + comment + '\n';
      }
      if (section.Comment.length === 0) result += '\n';
      if (section.Prolog.length > 0) {
        result += this.detokContent(section.Prolog) + '\n\n';
      }
      for (const track of section.Tracks) {
        if (track.Instruments.length || track.Name) {
          result += '<'
          if (!track.Play) result += ':'
          if (track.Name) result += track.Name + ':'
          result += track.Instruments.map(inst => {
            return inst.Name + this.detokContent(inst.Spec);
          }).join(',');
          result += '>'
        }
        result += this.detokContent(track.Content) + '\n\n';
      }
      if (section.Epilog.length > 0) {
        result += this.detokContent(section.Epilog) + '\n\n';
      }
      result = result.slice(0, -1);
      this.Sections.push(result);
    }

    this.$detok = true;
    return this.Comment + this.Library + this.Sections.join('\n');
  }

  detokContent(content) {
    let result = '';
    for (const token of content) {
      switch (token.Type) {
      case 'Space':
        result += token.Content;
        break;
      case 'Function': 
        if (token.Alias === -1) {
          result += `${token.Name}(${this.detokArgs(token.Args)})`;
        } else if (token.Alias === 0) {
          result += `(${token.Name}:${this.detokArgs(token.Args)})`;
        } else {
          const alias = this.Syntax.Alias.find(alias => alias.Name === token.Name);
          if (alias.LeftId !== undefined) {
            result += this.detokContent(token.Args[alias.LeftId].Content);
          }
          for (const sub of alias.Syntax) {
            if (sub.Type === '@lit') {
              result += sub.Content;
            } else {
              result += token.Args[sub.Id].Origin;
            }
          }
          if (alias.RightId !== undefined) {
            result += this.detokContent(token.Args[alias.RightId].Content);
          }
        }
        break;
      case 'Note':
        result += this.detokNote(token);
        break;
      case 'Subtrack':
        result += '{';
        if (token.Repeat < -1) result += `${-token.Repeat}*`;
        result += this.detokContent(token.Content);
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
          const order = token.Order.sort((x, y) => x - y);
          result += '\\';
          let i = 0;
          while (i < order.length) {
            let j = i + 1;
            while (j < order.length && order[j] === order[j - 1] + 1) j += 1;
            if (j === i + 1) {
              result += `${order[i]},`;
            } else if (j === i + 2) {
              result += `${order[i]},${order[i] + 1},`;
            } else {
              result += `${order[i]}~${order[j - 1]},`
            }
            i = j;
          }
          if (i) result = result.slice(0, -1);
          result += ':';
        }
        break;
      default:
        result += '[' + token.Type + ']';
        break;
      }
    }
    return result;
  }

  detokArgs(args) {
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
        result += `${arg.Content.Name}(${this.detokArgs(arg.Content.Args)})`;
        break;
      }
      result += ',';
    }
    if (args.length > 0) result = result.slice(0, -1)
    return result;
  }

  detokNote(note){
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

module.exports = TmLinter;
