import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Manual initialization to avoid automatic loading conflicts
Prism.manual = true

// Only import core components to avoid dependency conflicts
import 'prismjs/components/prism-core'

// Define all languages manually to avoid extend() dependency issues
const defineLanguages = () => {
  // JavaScript (base for many others)
  Prism.languages.javascript = {
    'comment': [
      {
        pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
        lookbehind: true,
        greedy: true
      },
      {
        pattern: /(^|[^\\:])\/\/.*/,
        lookbehind: true,
        greedy: true
      }
    ],
    'string': [
      {
        pattern: /(["'])(?:(?!\1)[^\\\r\n]|\\(?:\r\n|[\s\S]))*\1/,
        greedy: true
      },
      {
        pattern: /`(?:[^`\\$]|\\[\s\S]|\$(?:\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\{)))*`/,
        greedy: true,
        inside: {
          'interpolation': {
            pattern: /\$\{[^}]+\}/,
            inside: {
              'interpolation-punctuation': {
                pattern: /^\$\{|\}$/,
                alias: 'punctuation'
              }
            }
          }
        }
      }
    ],
    'class-name': [
      {
        pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:prototype|constructor|[a-z])|[[(])/,
        lookbehind: true
      }
    ],
    'keyword': /\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    'boolean': /\b(?:false|true)\b/,
    'function': /\w+(?=\()/,
    'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    'punctuation': /[{}[\];(),.:]/
  }

  // TypeScript
  Prism.languages.typescript = {
    ...Prism.languages.javascript,
    'keyword': /\b(?:abstract|any|as|asserts|async|await|bigint|boolean|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|null|number|object|of|package|private|protected|public|readonly|return|require|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|unique|unknown|var|void|while|with|yield)\b/,
    'builtin': /\b(?:Array|ArrayBuffer|Boolean|DataView|Date|Error|EvalError|Float32Array|Float64Array|Function|Generator|GeneratorFunction|Int8Array|Int16Array|Int32Array|Intl|JSON|Map|Math|Number|Object|Promise|Proxy|RangeError|ReferenceError|Reflect|RegExp|Set|String|Symbol|SyntaxError|TypeError|Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|URIError|WeakMap|WeakSet)\b/,
    'class-name': {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)[\w.\\]+/,
      lookbehind: true,
      inside: {
        'punctuation': /[.\\]/
      }
    }
  }

  // Go
  Prism.languages.go = {
    'comment': [
      {
        pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
        lookbehind: true,
        greedy: true
      },
      {
        pattern: /(^|[^\\:])\/\/.*/,
        lookbehind: true,
        greedy: true
      }
    ],
    'string': {
      pattern: /(^|[^\\])"(?:\\.|[^"\\])*"/,
      lookbehind: true,
      greedy: true
    },
    'keyword': /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
    'boolean': /\b(?:_|true|false|iota|nil)\b/,
    'number': /(?:\b0x[a-f\d]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[-+]?\d+)?)i?/i,
    'operator': /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
    'builtin': /\b(?:bool|byte|complex(?:64|128)|error|float(?:32|64)|rune|string|u?int(?:8|16|32|64)?|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(?:ln)?|real|recover)\b/,
    'punctuation': /[{}[\];(),.:]/
  }

  // JSON
  Prism.languages.json = {
    'property': {
      pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
      greedy: true
    },
    'string': {
      pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
      greedy: true
    },
    'comment': {
      pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
      greedy: true
    },
    'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
    'punctuation': /[{}[\],]/,
    'operator': /:/,
    'boolean': /\b(?:false|true)\b/,
    'null': {
      pattern: /\bnull\b/,
      alias: 'keyword'
    }
  }

  // Python
  Prism.languages.python = {
    'comment': {
      pattern: /(^|[^\\])#.*/,
      lookbehind: true
    },
    'string-interpolation': {
      pattern: /(?:f|rf|fr)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
      greedy: true,
      inside: {
        'interpolation': {
          pattern: /((?:^|[^{])(?:\{\{)*)\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
          lookbehind: true,
          inside: {
            'format-spec': {
              pattern: /(:)[^:(){}]+(?=\}$)/,
              lookbehind: true,
              alias: 'number'
            }
          }
        },
        'string': /[\s\S]+/
      }
    },
    'triple-quoted-string': {
      pattern: /(?:[rub]|rb|br)?("""|''')[\s\S]*?\1/i,
      greedy: true,
      alias: 'string'
    },
    'string': {
      pattern: /(?:[rub]|rb|br)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
      greedy: true
    },
    'function': {
      pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
      lookbehind: true
    },
    'class-name': {
      pattern: /(\bclass\s+)\w+/i,
      lookbehind: true
    },
    'decorator': {
      pattern: /(^[\t ]*)@\w+(?:\.\w+)*/im,
      lookbehind: true,
      alias: ['annotation', 'punctuation'],
      inside: {
        'punctuation': /\./
      }
    },
    'keyword': /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
    'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
    'boolean': /\b(?:False|None|True)\b/,
    'number': /(?:\b(?=\d)|\B(?=\.))(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?j?\b/i,
    'operator': /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    'punctuation': /[{}[\];(),.:]/
  }

  // Bash
  Prism.languages.bash = {
    'shebang': {
      pattern: /^#!\s*\/.*/,
      alias: 'important'
    },
    'comment': {
      pattern: /(^|[^"{\\$])#.*/,
      lookbehind: true
    },
    'function-name': [
      {
        pattern: /(\bfunction\s+)\w+(?=(?:\s*\(?:\s*\))?\s*\{)/,
        lookbehind: true,
        alias: 'function'
      },
      {
        pattern: /\b\w+(?=\s*\(\s*\)\s*\{)/,
        alias: 'function'
      }
    ],
    'for-or-select': {
      pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
      alias: 'variable',
      lookbehind: true
    },
    'assign-left': {
      pattern: /(^|[\s;|&]|[<>]\()\w+(?=\+?=)/,
      inside: {
        'environment': {
          pattern: RegExp('(^|[\\s;|&]|[<>]\\()' + envVars),
          lookbehind: true,
          alias: 'constant'
        }
      },
      alias: 'variable',
      lookbehind: true
    },
    'string': [
             {
         pattern: /((?:^|[^<])<<-?\s*)(\w+?)\s[\s\S]*?(?:\r?\n|\r)\2/,
         lookbehind: true,
         greedy: true
       },
       {
         pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,
         lookbehind: true,
         greedy: true
       },
       {
         pattern: /(["'])(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|(?!\1)[^\\`$])*\1/,
         greedy: true
       }
    ],
    'environment': {
      pattern: RegExp('\\$' + envVars),
      alias: 'constant'
    },
    'variable': /\$(?:\w+|[#?*!@$])/,
    'function': {
      pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|pydf|python|python2|python3|read|readarray|readonly|reboot|rename|renice|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unset|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)(?=$|[)\s;|&])/,
      lookbehind: true
    },
    'keyword': {
      pattern: /(^|[\s;|&]|[<>]\()(?:if|then|else|elif|fi|for|break|continue|while|until|case|esac|in|do|done|function|select|time|until)\b/,
      lookbehind: true
    },
    'boolean': {
      pattern: /(^|[\s;|&]|[<>]\()(?:true|false)(?=$|[)\s;|&])/,
      lookbehind: true
    },
    'file-descriptor': {
      pattern: /\B&\d\b/,
      alias: 'important'
    },
    'operator': {
      pattern: /\d?<>|>\||\+=?|==?|!=?|=~|<<[<-]?|[&\d]?>>|\d?[<>]&?|&[>&]?|\|[&|]?|<=?|>=?/,
      inside: {
        'file-descriptor': {
          pattern: /^\d/,
          alias: 'important'
        }
      }
    },
    'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
    'number': {
      pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
      lookbehind: true
    }
  }

  // Basic fallback for unsupported languages
  Prism.languages.text = {}
  Prism.languages.plain = {}

  // Add aliases
  Prism.languages.js = Prism.languages.javascript
  Prism.languages.ts = Prism.languages.typescript
  Prism.languages.py = Prism.languages.python
  Prism.languages.shell = Prism.languages.bash
  Prism.languages.sh = Prism.languages.bash
}

// Environment variables pattern for bash
const envVars = '(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_SUBSHELL|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)'

// Initialize languages after a short delay
setTimeout(defineLanguages, 50)

// Comprehensive language mapping for common aliases
const languageMap: Record<string, string> = {
  'ts': 'typescript',
  'js': 'javascript',
  'py': 'python',
  'sh': 'bash',
  'shell': 'bash',
  'golang': 'go',
  'html': 'markup',
  'xml': 'markup',
  'svg': 'markup'
}

// Function to safely check if a language is available
const isLanguageAvailable = (language: string): boolean => {
  try {
    const langDef = Prism.languages[language]
    return !!(langDef && typeof langDef === 'object')
  } catch (error) {
    console.warn(`Error checking language availability for: ${language}`, error)
    return false
  }
}

// Function to safely highlight code with robust error handling
export const highlightCode = (code: string, language: string = ''): string => {
  if (!code.trim()) return code

  // Normalize language name
  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase()
  
  // Enhanced safety check with language availability verification
  if (!normalizedLang || !isLanguageAvailable(normalizedLang)) {
    console.warn(`Language '${language}' (normalized: '${normalizedLang}') is not available.`)
    return `<pre class="language-text"><code class="text-slate-300">${escapeHtml(code)}</code></pre>`
  }

  try {
    // Additional safety check before highlighting
    const languageGrammar = Prism.languages[normalizedLang]
    if (!languageGrammar || typeof languageGrammar !== 'object') {
      throw new Error(`Invalid language grammar for: ${normalizedLang}`)
    }

    const highlighted = Prism.highlight(code, languageGrammar, normalizedLang)
    return `<pre class="language-${normalizedLang}"><code class="language-${normalizedLang}">${highlighted}</code></pre>`
  } catch (error) {
    console.warn(`Failed to highlight code for language: ${normalizedLang}`, error)
    console.warn('Falling back to plain text highlighting')
    return `<pre class="language-text"><code class="text-slate-300">${escapeHtml(code)}</code></pre>`
  }
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const getLanguageLabel = (language: string): string => {
  const labels: Record<string, string> = {
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'go': 'Go',
    'json': 'JSON',
    'bash': 'Bash',
    'python': 'Python',
    'text': 'Plain Text'
  }
  
  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase()
  return labels[normalizedLang] || language.toUpperCase()
}

// Debug function to log available languages (useful for development)
export const logAvailableLanguages = (): void => {
  console.log('Available Prism languages:', Object.keys(Prism.languages))
}

// Test function to verify Go language specifically
export const testGoLanguage = (): void => {
  console.log('Testing Go language support...')
  console.log('Go language available:', isLanguageAvailable('go'))
  console.log('Go language object:', Prism.languages.go)
  
  if (Prism.languages.go) {
    console.log('Go language properties:', Object.keys(Prism.languages.go))
  }
  
  // Test a simple Go code snippet
  const testCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
  
  try {
    const result = highlightCode(testCode, 'go')
    console.log('Go highlighting test successful:', result.length > 0)
  } catch (error) {
    console.error('Go highlighting test failed:', error)
  }
}

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testGoLanguage = testGoLanguage;
  (window as any).logAvailableLanguages = logAvailableLanguages
}