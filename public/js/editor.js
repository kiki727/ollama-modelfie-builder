let editor = null;

function initEditor(initialContent = '') {
  if (editor) {
    editor.setValue(initialContent);
    return editor;
  }

  editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'text/plain',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      'Ctrl-S': function(cm) {
        window.ModelfileApp && window.ModelfileApp.handleSave();
      },
      'Cmd-S': function(cm) {
        window.ModelfileApp && window.ModelfileApp.handleSave();
      }
    }
  });

  if (initialContent) {
    editor.setValue(initialContent);
  }

  return editor;
}

function getEditorContent() {
  return editor ? editor.getValue() : '';
}

function setEditorContent(content) {
  if (editor) {
    editor.setValue(content);
  }
}

function formatModelfile() {
  if (!editor) return;
  
  const content = editor.getValue();
  const lines = content.split('\n');
  const formatted = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      formatted.push('');
      continue;
    }
    
    if (trimmed.startsWith('FROM ') || 
        trimmed.startsWith('SYSTEM ') ||
        trimmed.startsWith('TEMPLATE ') ||
        trimmed.startsWith('PARAMETER ')) {
      formatted.push(trimmed);
    } else if (trimmed === '"""') {
      formatted.push(trimmed);
    } else {
      formatted.push(trimmed);
    }
  }
  
  let result = formatted.join('\n');
  
  const fromMatch = result.match(/^FROM\s+(\S+):(\S+)/m);
  if (fromMatch) {
    result = result.replace(
      /^FROM\s+(\S+):(\S+)/m,
      `FROM $1:$2`
    );
  }
  
  editor.setValue(result);
}

function resetEditor(content) {
  if (editor) {
    editor.setValue(content);
  }
}