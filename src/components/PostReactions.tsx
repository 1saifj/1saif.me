import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { dateLocale, Language, SITE_TIME_ZONE } from '../i18n/language'
import { enhanceCodeBlocks } from '../utils/codeBlocks'
import { Format, formatSelection } from '../utils/commentEditor'
import { commentToHtml } from '../utils/commentMarkdown'
import { loadTurnstile } from '../utils/turnstile'

// Public site key of the 1saif-comments Turnstile widget (hostname 1saif.me). Local dev uses Cloudflare's always-pass test key.
const COMMENT_TURNSTILE_SITE_KEY = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAFqPCIgp66hZ-OXd'

const TOKEN_WAIT_MS = 20_000

const MAX_NAME = 60

const MAX_MESSAGE = 2_000

const LIKED_KEY = 'liked-posts'

const VISITOR_KEY = 'visitor-id'

interface PostComment {
  id: number
  name: string
  body: string
  createdAt: number
}

interface Reactions {
  likes: number
  comments: PostComment[]
}

const copy = {
  en: {
    like: 'Like',
    likes: (count: number) => count === 1 ? '1 like' : `${count} likes`,
    likeFailed: 'The like was not saved. Try again.',
    title: 'Comments',
    empty: 'No comments yet.',
    loadFailed: 'The comments did not load. Refresh the page to try again.',
    name: 'Name',
    message: 'Comment',
    write: 'Write',
    preview: 'Preview',
    previewEmpty: 'Nothing to preview yet.',
    markdown: 'Markdown is supported. Name a code block\'s language after ``` to color it.',
    formatting: 'Formatting',
    tools: { bold: 'Bold', italic: 'Italic', code: 'Code', codeBlock: 'Code block', link: 'Link', list: 'Bulleted list', orderedList: 'Numbered list', quote: 'Quote' },
    post: 'Post comment',
    checking: 'Checking…',
    posting: 'Posting…',
    note: 'Your name and comment are shown to everyone.',
    posted: 'Thanks. Your comment is posted.',
    invalid: 'Enter a name on one line, up to 60 characters, and a comment up to 2,000 characters.',
    rate: 'Too many comments were sent. Wait a minute, then try again.',
    challenge: 'The spam check did not pass. Try again.',
    failed: 'The comment was not posted. Try again.',
  },
  ar: {
    like: 'أعجبني',
    // Arabic counts: one, two; a number ending in 3 to 10 takes the plural, any other the singular.
    likes: (count: number) => count === 1 ? 'إعجاب واحد' : count === 2 ? 'إعجابان' : count % 100 >= 3 && count % 100 <= 10 ? `${count} إعجابات` : `${count} إعجاب`,
    likeFailed: 'لم يُحفظ الإعجاب. حاول مرة أخرى.',
    title: 'التعليقات',
    empty: 'لا تعليقات بعد.',
    loadFailed: 'تعذّر تحميل التعليقات. حدّث الصفحة وحاول مرة أخرى.',
    name: 'الاسم',
    message: 'التعليق',
    write: 'كتابة',
    preview: 'معاينة',
    previewEmpty: 'لا شيء للمعاينة بعد.',
    markdown: 'يدعم Markdown. اكتب لغة كتلة الكود بعد ``` لتلوينها.',
    formatting: 'التنسيق',
    tools: { bold: 'غامق', italic: 'مائل', code: 'كود', codeBlock: 'كتلة كود', link: 'رابط', list: 'قائمة نقطية', orderedList: 'قائمة مرقّمة', quote: 'اقتباس' },
    post: 'نشر التعليق',
    checking: 'جارٍ التحقق…',
    posting: 'جارٍ النشر…',
    note: 'يظهر اسمك وتعليقك للجميع.',
    posted: 'شكراً. نُشر تعليقك.',
    invalid: 'أدخل اسماً في سطر واحد حتى 60 حرفاً، وتعليقاً حتى 2000 حرف.',
    rate: 'أُرسل عدد كبير من التعليقات. انتظر دقيقة ثم حاول مرة أخرى.',
    challenge: 'لم ينجح التحقق من البريد المزعج. حاول مرة أخرى.',
    failed: 'لم يُنشر التعليق. حاول مرة أخرى.',
  },
}

type Status = 'idle' | 'checking' | 'posting' | 'posted' | 'invalid' | 'rate' | 'challenge' | 'failed'

// Storage can be blocked or full (private mode, strict settings); the page then works without it.
function likedPosts(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]')

    return Array.isArray(value) ? value.map(String) : []
  } catch {
    return []
  }
}

function rememberLike(slug: string, liked: boolean) {
  try {
    const rest = likedPosts().filter(item => item !== slug)

    localStorage.setItem(LIKED_KEY, JSON.stringify(liked ? [...rest, slug] : rest))
  } catch {
    // Without storage the like still counts; the button just forgets it on the next visit.
  }
}

function visitorId(): string {
  try {
    const stored = localStorage.getItem(VISITOR_KEY)

    if (stored) return stored

    const id = crypto.randomUUID()

    localStorage.setItem(VISITOR_KEY, id)

    return id
  } catch {
    return crypto.randomUUID()
  }
}

// Lucide-style 24px stroke icons for the comment toolbar.
const TOOLS: { format: Format; key?: string; path: string }[] = [
  { format: 'bold', key: 'b', path: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z' },
  { format: 'italic', key: 'i', path: 'M19 4h-9m4 16H5m10-16L9 20' },
  { format: 'code', key: 'e', path: 'm16 18 6-6-6-6M8 6l-6 6 6 6' },
  { format: 'codeBlock', path: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm5 6-3 3 3 3m4-6 3 3-3 3' },
  { format: 'link', key: 'k', path: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7' },
  { format: 'list', path: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01' },
  { format: 'orderedList', path: 'M10 6h11m-11 6h11m-11 6h11M4 4h1v5m-1 0h2m0 9H4c0-1 2-2 2-3s-1-1.5-2-1' },
  { format: 'quote', path: 'M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z' },
]

const HeartIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.5 3.7 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" /></svg>

export const PostReactions: React.FC<{ slug: string; language: Language }> = ({ slug, language }) => {
  const t = copy[language]
  const sectionRef = useRef<HTMLElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string>()
  const startPromise = useRef<Promise<boolean>>()
  const token = useRef<string>()
  const tokenWaiter = useRef<(token: string | undefined) => void>()
  // Set when the widget reports an error, so a submit does not wait 20 s for a token that will not come.
  const challengeFailed = useRef(false)
  const liking = useRef(false)
  const [reactions, setReactions] = useState<Reactions>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeFailed, setLikeFailed] = useState(false)
  // Announced only after a click, so loading the count while the visitor still reads the article stays silent.
  const [announcement, setAnnouncement] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [draft, setDraft] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const commentsRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // Storage and the network run only in the browser, after hydration, so the prerendered page matches.
  useEffect(() => {
    const section = sectionRef.current

    setLiked(likedPosts().includes(slug))

    if (!section) return

    let cancelled = false

    // Fetched once, when the visitor scrolls near the section; a reader who stops early costs nothing.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()

      fetch(`/api/posts/${slug}`)
        .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
        .then((value: Reactions) => { if (!cancelled) setReactions(value) }, () => { if (!cancelled) setLoadFailed(true) })
    }, { rootMargin: '600px 0px' })

    observer.observe(section)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [slug])

  useEffect(() => (commentsRef.current && reactions?.comments.length ? enhanceCodeBlocks(commentsRef.current) : undefined), [reactions?.comments])
  useEffect(() => (previewRef.current && previewing && draft ? enhanceCodeBlocks(previewRef.current) : undefined), [previewing, draft])

  async function toggleLike() {
    if (!reactions || liking.current) return

    liking.current = true
    const next = !liked
    const before = reactions.likes

    // The button answers at once; a failed request puts both the state and the count back.
    setLiked(next)
    setLikeFailed(false)
    setReactions(current => current && { ...current, likes: Math.max(0, before + (next ? 1 : -1)) })

    try {
      const response = await fetch(`/api/posts/${slug}/like`, {
        method: next ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor: visitorId(), language }),
      })

      if (!response.ok) throw new Error(String(response.status))

      const result: { likes: number } = await response.json()

      setReactions(current => current && { ...current, likes: result.likes })
      setAnnouncement(t.likes(result.likes))
      rememberLike(slug, next)
    } catch {
      setLiked(!next)
      setLikeFailed(true)
      setAnnouncement(t.likeFailed)
      setReactions(current => current && { ...current, likes: before })
    } finally {
      liking.current = false
    }
  }

  function settleToken(value: string | undefined) {
    token.current = value
    tokenWaiter.current?.(value)
    tokenWaiter.current = undefined
  }

  function failTurnstile() {
    challengeFailed.current = true
    settleToken(undefined)
  }

  // The challenge starts when the visitor first focuses the form, so readers who never comment never load it.
  function startTurnstile(): Promise<boolean> {
    const container = widgetRef.current

    if (!container) return Promise.resolve(false)

    startPromise.current ??= loadTurnstile()
      .then(() => {
        if (!window.turnstile) return false

        widgetId.current ??= window.turnstile.render(container, {
          sitekey: COMMENT_TURNSTILE_SITE_KEY,
          action: 'comment',
          language,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          size: 'flexible',
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: value => {
            challengeFailed.current = false
            settleToken(value)
          },
          'expired-callback': () => { token.current = undefined },
          'error-callback': failTurnstile,
          'timeout-callback': failTurnstile,
        })

        return true
      })
      .catch(() => false)
      .then(ready => {
        // A failed load must not stick: the next focus or submit tries again.
        if (!ready) startPromise.current = undefined

        return ready
      })

    return startPromise.current
  }

  function waitForToken(): Promise<string | undefined> {
    if (token.current) return Promise.resolve(token.current)

    if (challengeFailed.current) return Promise.resolve(undefined)

    return new Promise(resolve => {
      const timer = window.setTimeout(() => settleToken(undefined), TOKEN_WAIT_MS)

      tokenWaiter.current = value => {
        window.clearTimeout(timer)
        resolve(value)
      }

      void startTurnstile().then(ready => {
        if (!ready) settleToken(undefined)
      })
    })
  }

  function resetTurnstile() {
    token.current = undefined
    challengeFailed.current = false

    // Each token works once, so the next comment needs a new challenge.
    if (widgetId.current) window.turnstile?.reset(widgetId.current)
  }

  function applyFormat(format: Format) {
    const area = messageRef.current

    if (!area) return

    const edit = formatSelection(area.value, area.selectionStart, area.selectionEnd, format)

    area.focus()
    area.setSelectionRange(edit.from, edit.to)

    // insertText keeps the browser's undo history and fires the input event; setRangeText is the fallback without it.
    if (!document.execCommand('insertText', false, edit.text)) {
      area.setRangeText(edit.text)
      setDraft(area.value)
    }

    area.setSelectionRange(edit.selectionStart, edit.selectionEnd)
  }

  function formatShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    const tool = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && TOOLS.find(item => item.key === event.key.toLowerCase())

    if (!tool) return

    event.preventDefault()
    applyFormat(tool.format)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const body = new URLSearchParams([...new FormData(form)].map(([key, value]) => [key, String(value)]))
    const name = (body.get('name') ?? '').trim()
    const message = (body.get('message') ?? '').trim()

    if (!name || name.length > MAX_NAME || /[\r\n]/.test(name) || !message || message.length > MAX_MESSAGE) {
      setStatus('invalid')

      return
    }

    // A visitor can finish the comment before the challenge does; wait for it instead of failing.
    if (!token.current) setStatus('checking')

    const value = await waitForToken()

    if (!value) {
      resetTurnstile()
      setStatus('challenge')

      return
    }

    setStatus('posting')
    body.set('cf-turnstile-response', value)
    body.set('language', language)

    try {
      const response = await fetch(`/api/posts/${slug}/comments`, { method: 'POST', body })
      const result: PostComment & { error?: string } = await response.json()

      if (response.ok) {
        form.reset()
        setDraft('')
        setPreviewing(false)
        setReactions(current => current && { ...current, comments: [...current.comments, result] })
        setStatus('posted')
      } else {
        setStatus(result.error === 'rate' || result.error === 'challenge' || result.error === 'invalid' ? result.error : 'failed')
      }
    } catch {
      setStatus('failed')
    } finally {
      resetTurnstile()
    }
  }

  const dateFormat = new Intl.DateTimeFormat(dateLocale(language), { year: 'numeric', month: 'short', day: 'numeric', timeZone: SITE_TIME_ZONE })
  const busy = status === 'checking' || status === 'posting'
  const statusText = status === 'idle' || status === 'posting' ? t.note : t[status]
  const tone = status === 'posted' ? 'ok' : status === 'idle' || busy ? undefined : 'error'

  return (
    <section ref={sectionRef} className="post-reactions" aria-labelledby="comments-title"><div>
      <div className="post-like">
        <button type="button" className="post-like-button" aria-pressed={liked} disabled={!reactions} onClick={() => void toggleLike()}><HeartIcon />{t.like}</button>
        <span className="post-like-count">{likeFailed ? t.likeFailed : reactions ? t.likes(reactions.likes) : ''}</span>
        <span className="sr-only" aria-live="polite">{announcement}</span>
      </div>

      <h2 id="comments-title">{t.title}</h2>
      <div ref={commentsRef} className="post-comments">
        {reactions && (reactions.comments.length
          ? <ol>{reactions.comments.map(item => <li key={item.id}>
            <p className="post-comment-meta"><strong dir="auto">{item.name}</strong><time dateTime={new Date(item.createdAt).toISOString()}>{dateFormat.format(item.createdAt)}</time></p>
            {/* commentToHtml escapes the visitor's text before it adds any markup. */}
            <div className="post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: commentToHtml(item.body) }} />
          </li>)}</ol>
          : <p className="post-comments-note">{t.empty}</p>)}
        {loadFailed && <p className="post-comments-note">{t.loadFailed}</p>}
      </div>

      <form className="contact-form post-comment-form" onSubmit={submit} onFocus={() => void startTurnstile()} noValidate>
        <div className="contact-field">
          <label htmlFor="comment-name">{t.name}</label>
          <input id="comment-name" name="name" autoComplete="name" dir="auto" maxLength={MAX_NAME} aria-required="true" />
        </div>
        <div className="contact-field">
          <label htmlFor="comment-message">{t.message}</label>
          <div className="comment-editor">
            <div className="comment-editor-bar">
              <span className="post-comment-tabs">
                <button type="button" aria-pressed={!previewing} onClick={() => setPreviewing(false)}>{t.write}</button>
                <button type="button" aria-pressed={previewing} onClick={() => setPreviewing(true)}>{t.preview}</button>
              </span>
              {!previewing && <span className="comment-toolbar" role="group" aria-label={t.formatting}>
                {TOOLS.map(tool => <button key={tool.format} type="button" className="comment-tool" aria-label={t.tools[tool.format]} title={tool.key ? `${t.tools[tool.format]} (Ctrl/⌘ ${tool.key.toUpperCase()})` : t.tools[tool.format]} aria-keyshortcuts={tool.key ? `Control+${tool.key.toUpperCase()} Meta+${tool.key.toUpperCase()}` : undefined} onClick={() => applyFormat(tool.format)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={tool.path} /></svg>
                </button>)}
              </span>}
            </div>
            {/* Hidden, not removed, while previewing, so the form still sends it. */}
            <textarea ref={messageRef} id="comment-message" name="message" rows={5} dir="auto" maxLength={MAX_MESSAGE} aria-required="true" aria-describedby="comment-hint comment-count" hidden={previewing} onChange={event => setDraft(event.currentTarget.value)} onKeyDown={formatShortcut} />
            {previewing && <div ref={previewRef} className="post-comment-preview post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: draft.trim() ? commentToHtml(draft) : `<p>${t.previewEmpty}</p>` }} />}
            <div className="comment-editor-foot">
              <span className="post-comment-hint" id="comment-hint">{t.markdown}</span>
              <span className="post-comment-count" id="comment-count">{draft.length} / {MAX_MESSAGE}</span>
            </div>
          </div>
        </div>
        {/* Hidden from people; bots that fill it get a fake success from the Worker. */}
        <div className="contact-form-trap" aria-hidden="true">
          <input name="leave_empty" tabIndex={-1} autoComplete="off" />
        </div>
        <div ref={widgetRef} className="contact-form-challenge" />
        <div className="contact-form-footer">
          <button type="submit" disabled={busy}>{status === 'checking' ? t.checking : status === 'posting' ? t.posting : t.post}</button>
          <p className="post-comment-status" role="status" data-tone={tone}>{statusText}</p>
        </div>
      </form>
    </div></section>
  )
}
