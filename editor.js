document.querySelector('#cogbutton').addEventListener('click', function() {
  document.querySelector('#settingspanel').classList.toggle('show');
});
// also on blur, or on document.body when target isn't in the settingspanel

var lines = [];

function getTextElement(contentelement) {
  if(contentelement.children.length != 1) {
    let text = contentelement.textContent;
    while (contentelement.firstChild) {
      contentelement.removeChild(contentelement.firstChild);
    }
    let textnode = document.createTextNode(text);
    contentelement.appendChild(textnode);
    return textnode;
  } else {
    return contentelement.firstChild;
  }
}

function setSelect(elem1, index1, elem2, index2) {
  var range = document.createRange();
  var sel = window.getSelection();
  range.setStart(getTextElement(elem1), index1);
  if(elem2) {
    range.setEnd(getTextElement(elem2), index2);
  } else {
    range.collapse();
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

var editor = document.querySelector('#editor');
function Line(text, index) {
  this.element = document.createElement('div');
  this.element.classList.add('line');
  this.element.setAttribute('contenteditable', '');
  this.contentelement = document.createElement('div');
  this.contentelement.classList.add('linecontent');
  this.element.appendChild(this.contentelement);
  this.contentelement.appendChild(document.createTextNode(text || ''));
  if(index !== undefined && lines[index]) {
    editor.insertBefore(this.element, lines[index].element);
    lines.splice(index, 0, this);
  } else {
    editor.appendChild(this.element);
    lines.push(this);
  }
  lineCountChanged();
  
  this.setText = function(_text) {
    this.contentelement.textContent = _text;
  }
  this.getText = function() {
    return this.contentelement.textContent;
  }
  this.getNextLine = function() {
    return lines[this.getIndex() + 1];
  }
  this.getPreviousLine = function() {
    return lines[this.getIndex() - 1];
  }
  this.getIndex = function() {
    return lines.indexOf(this);
  }
  this.remove = function() {
    editor.removeChild(this.element);
    lines.splice(this.getIndex(), 1);
    lineCountChanged();
  }
  this.getLength = function() {
    return this.getText().length;
  }
  this.getCaretPos = function() {
    return window.getSelection().anchorOffset;
  }
  
  var self = this;
  
  this.element.addEventListener('keydown', function(e) {
    console.log(e)
    switch (e.code) {
      case 'Backspace': {
        // this logic should be different for selections, esp. multiline
        if(self.getCaretPos() === 0) {
          let prev = self.getPreviousLine();
          if(!prev) {
            e.preventDefault();
            return false;
          }
          let oldprevlength = prev.getLength();
          prev.setText(prev.getText() + self.getText());
          setSelect(prev.contentelement, oldprevlength);
          self.remove();
          e.preventDefault();
          return false;
        } else {
          return true;
        }
      }
      case 'Enter': {
        if(self.getCaretPos() == self.getLength()) {
          let line = new Line('', self.getIndex() + 1);
          setSelect(line.contentelement, 0);
        } else {
          let text = self.getText();
          let caret = self.getCaretPos();
          self.setText(text.substring(0,caret));
          let line = new Line( text.substring(caret) , self.getIndex() + 1);
          setSelect(line.contentelement, 0);
        }
        e.preventDefault();
        return false;
      }
    }
  });
}

var style = document.createElement('style');
document.head.append(style);
function lineCountChanged() {
  // make sure line numbers are all the same width
  if(lines.length) {
    setTimeout(function() {
      style.innerHTML = `.line::before { width: ${lines.length.toString().length + 1}ex; }`;
    });
  }
}

new Line('foo');
new Line('bar');
new Line('baz');
