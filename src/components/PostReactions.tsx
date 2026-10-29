import React, { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { dateLocale, Language, SITE_TIME_ZONE } from '../i18n/language'
import { enhanceCodeBlocks } from '../utils/codeBlocks'
import { Format, formatSelection } from '../utils/commentEditor'
import { commentToHtml } from '../utils/commentMarkdown'

const MAX_MESSAGE = 2_000

// The Worker sets this readable cookie at sign-in with the public GitHub profile only; the session itself is HttpOnly.
const VIEWER_COOKIE = '__Host-viewer'

const DRAFT_KEY = 'comment-draft'

// A like clicked while signed out is kept across the GitHub sign-in and sent on the way back.
const LIKE_INTENT_KEY = 'like-intent'

interface Author {
  id: number
  login: string
  name: string | null
}

interface PostComment {
  id: number
  body: string
  createdAt: number
  // Missing in a reply cached before edits existed.
  editedAt?: number | null
  author: Author
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
    likeBlocked: 'This account cannot like posts here.',
    signInToLike: 'Sign in with GitHub to like this post.',
    title: 'Comments',
    empty: 'No comments yet.',
    loadFailed: 'The comments did not load. Refresh the page to try again.',
    previewHost: 'Likes and comments work on 1saif.me only, not on preview deploys.',
    message: 'Comment',
    signInPrompt: 'Sign in with GitHub to join the discussion.',
    signIn: 'Sign in with GitHub',
    signInNote: 'GitHub shares only your public profile: your name, username and picture.',
    signedInAs: 'Signed in as',
    signOut: 'Sign out',
    delete: 'Delete',
    confirmDelete: 'Delete this comment? You cannot undo this.',
    edit: 'Edit',
    edited: 'edited',
    editLabel: 'Edit comment',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    edits: 'This comment has reached its limit of 10 edits.',
    editFailed: 'The edit was not saved. Try again.',
    write: 'Write',
    preview: 'Preview',
    previewEmpty: 'Nothing to preview yet.',
    markdown: 'Markdown is supported. Name a code block\'s language after ``` to color it.',
    formatting: 'Formatting',
    tools: { heading: 'Heading', bold: 'Bold', italic: 'Italic', code: 'Code', codeBlock: 'Code block', link: 'Link', list: 'Bulleted list', orderedList: 'Numbered list', quote: 'Quote' },
    post: 'Post comment',
    posting: 'Posting…',
    note: 'Everyone sees your comment with your GitHub name and picture.',
    posted: 'Thanks. Your comment is posted.',
    invalid: 'Write a comment of up to 2,000 characters.',
    rate: 'Too many comments were sent. Wait a minute, then try again.',
    daily: 'You posted 10 comments on this post today. Try again tomorrow.',
    blocked: 'This account cannot comment here.',
    expired: 'Your sign-in has ended. Sign in again to post your comment.',
    signinFailed: 'The GitHub sign-in did not finish. Try again.',
    deleteFailed: 'The comment was not deleted. Try again.',
    failed: 'The comment was not posted. Try again.',
  },
  ar: {
    like: 'أعجبني',
    // Arabic counts: one, two; a number ending in 3 to 10 takes the plural, 11 to 99 the accusative singular, any other the singular.
    likes: (count: number) => count === 1 ? 'إعجاب واحد' : count === 2 ? 'إعجابان' : count % 100 >= 3 && count % 100 <= 10 ? `${count} إعجابات` : count % 100 >= 11 ? `${count} إعجاباً` : `${count} إعجاب`,
    likeFailed: 'لم يُحفظ الإعجاب. حاول مرة أخرى.',
    likeBlocked: 'لا يمكن لهذا الحساب الإعجاب هنا.',
    signInToLike: 'سجّل الدخول عبر GitHub لتُعجب بهذا المقال.',
    title: 'التعليقات',
    empty: 'لا تعليقات بعد.',
    loadFailed: 'تعذّر تحميل التعليقات. حدّث الصفحة وحاول مرة أخرى.',
    previewHost: 'الإعجابات والتعليقات تعمل على 1saif.me فقط، لا على نسخ المعاينة.',
    message: 'التعليق',
    signInPrompt: 'سجّل الدخول عبر GitHub لتشارك في النقاش.',
    signIn: 'تسجيل الدخول عبر GitHub',
    signInNote: 'يشارك GitHub ملفك العام فقط: اسمك واسم المستخدم وصورتك.',
    signedInAs: 'مسجّل الدخول باسم',
    signOut: 'تسجيل الخروج',
    delete: 'حذف',
    confirmDelete: 'أتحذف هذا التعليق؟ لا يمكن التراجع عن ذلك.',
    edit: 'تعديل',
    edited: 'معدَّل',
    editLabel: 'تعديل التعليق',
    save: 'حفظ',
    saving: 'جارٍ الحفظ…',
    cancel: 'إلغاء',
    edits: 'بلغ هذا التعليق حدّ 10 تعديلات.',
    editFailed: 'لم يُحفظ التعديل. حاول مرة أخرى.',
    write: 'كتابة',
    preview: 'معاينة',
    previewEmpty: 'لا شيء للمعاينة بعد.',
    markdown: 'يدعم Markdown. اكتب لغة كتلة الكود بعد ``` لتلوينها.',
    formatting: 'التنسيق',
    tools: { heading: 'عنوان', bold: 'غامق', italic: 'مائل', code: 'كود', codeBlock: 'كتلة كود', link: 'رابط', list: 'قائمة نقطية', orderedList: 'قائمة مرقّمة', quote: 'اقتباس' },
    post: 'نشر التعليق',
    posting: 'جارٍ النشر…',
    note: 'يرى الجميع تعليقك مع اسمك وصورتك على GitHub.',
    posted: 'شكراً. نُشر تعليقك.',
    invalid: 'اكتب تعليقاً حتى 2000 حرف.',
    rate: 'أُرسل عدد كبير من التعليقات. انتظر دقيقة ثم حاول مرة أخرى.',
    daily: 'نشرت 10 تعليقات على هذا المقال اليوم. حاول مرة أخرى غداً.',
    blocked: 'لا يمكن لهذا الحساب التعليق هنا.',
    expired: 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى لنشر تعليقك.',
    signinFailed: 'لم يكتمل تسجيل الدخول عبر GitHub. حاول مرة أخرى.',
    deleteFailed: 'لم يُحذف التعليق. حاول مرة أخرى.',
    failed: 'لم يُنشر التعليق. حاول مرة أخرى.',
  },
}

type Copy = (typeof copy)[Language]

type LikeNote = 'likeFailed' | 'likeBlocked' | 'signInToLike'

type EditStatus = 'saving' | 'invalid' | 'rate' | 'blocked' | 'edits' | 'editFailed'

type Status = 'idle' | 'posting' | 'posted' | 'invalid' | 'rate' | 'daily' | 'blocked' | 'expired' | 'signinFailed' | 'deleteFailed' | 'failed'

// Storage can be blocked (private mode, strict settings); the page then works without it.
function takeItem(key: string): string | null {
  try {
    const value = sessionStorage.getItem(key)

    sessionStorage.removeItem(key)

    return value
  } catch {
    return null
  }
}

function keepItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Without storage the draft or the like is lost; the reader can do it again.
  }
}

// Lucide-style 24px stroke icons for the comment toolbar.
const TOOLS: { format: Format; key?: string; path: string }[] = [
  { format: 'heading', path: 'M6 12h12M6 20V4M18 20V4' },
  { format: 'bold', key: 'b', path: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z' },
  { format: 'italic', key: 'i', path: 'M19 4h-9m4 16H5m10-16L9 20' },
  { format: 'code', key: 'e', path: 'm16 18 6-6-6-6M8 6l-6 6 6 6' },
  { format: 'codeBlock', path: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm5 6-3 3 3 3m4-6 3 3-3 3' },
  { format: 'link', key: 'k', path: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7' },
  { format: 'list', path: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01' },
  { format: 'orderedList', path: 'M10 6h11m-11 6h11m-11 6h11M4 4h1v5m-1 0h2m0 9H4c0-1 2-2 2-3s-1-1.5-2-1' },
  { format: 'quote', path: 'M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z' },
]

// The ID is enough for GitHub's avatar CDN, so the site stores no picture URL.
const avatarUrl = (id: number, size: number) => `https://avatars.githubusercontent.com/u/${id}?s=${size * 2}&v=4`

function readViewer(): Author | null {
  try {
    const value = document.cookie.split('; ').find(item => item.startsWith(`${VIEWER_COOKIE}=`))?.slice(VIEWER_COOKIE.length + 1)

    if (!value) return null

    const bytes = Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0))
    const viewer: Partial<Author> = JSON.parse(new TextDecoder().decode(bytes))

    return typeof viewer.id === 'number' && typeof viewer.login === 'string' ? { id: viewer.id, login: viewer.login, name: viewer.name ?? null } : null
  } catch {
    return null
  }
}

// The Worker clears it on sign-out; this covers an ended session, which the Worker only learns about on the next write.
const forgetViewer = () => { document.cookie = `${VIEWER_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax` }

const GitHubIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>

const likeInit = (liked: boolean, language: Language): RequestInit => ({
  method: liked ? 'PUT' : 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language }),
})

const HeartIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.5 3.7 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" /></svg>

// The Markdown editor of a new comment and of an edit: Write and Preview, the toolbar, and the length.
const CommentEditor: React.FC<{ t: Copy; label: string; value: string; onChange: (value: string) => void; focus?: boolean }> = ({ t, label, value, onChange, focus }) => {
  // A new comment and an edit can be open at once, so each editor has its own IDs.
  const id = useId()
  const [previewing, setPreviewing] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => (previewRef.current && previewing && value ? enhanceCodeBlocks(previewRef.current) : undefined), [previewing, value])
  useEffect(() => {
    if (focus) messageRef.current?.focus()
  }, [focus])

  function applyFormat(format: Format) {
    const area = messageRef.current

    if (!area) return

    const edit = formatSelection(area.value, area.selectionStart, area.selectionEnd, format)

    area.focus()
    area.setSelectionRange(edit.from, edit.to)

    // insertText keeps the browser's undo history and fires the input event; setRangeText is the fallback without it.
    if (!document.execCommand('insertText', false, edit.text)) {
      area.setRangeText(edit.text)
      onChange(area.value)
    }

    area.setSelectionRange(edit.selectionStart, edit.selectionEnd)
  }

  function formatShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    const tool = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && TOOLS.find(item => item.key === event.key.toLowerCase())

    if (!tool) return

    event.preventDefault()
    applyFormat(tool.format)
  }

  return (
    <div className="contact-field">
      <label htmlFor={`${id}message`}>{label}</label>
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
        {/* Hidden, not removed, while previewing, so it keeps its text and undo history. */}
        <textarea ref={messageRef} id={`${id}message`} defaultValue={value} name="message" rows={5} dir="auto" maxLength={MAX_MESSAGE} aria-required="true" aria-describedby={`${id}hint ${id}count`} hidden={previewing} onChange={event => onChange(event.currentTarget.value)} onKeyDown={formatShortcut} />
        {previewing && <div ref={previewRef} className="post-comment-preview post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: value.trim() ? commentToHtml(value) : `<p>${t.previewEmpty}</p>` }} />}
        <div className="comment-editor-foot">
          <span className="post-comment-hint" id={`${id}hint`}>{t.markdown}</span>
          <span className="post-comment-count" id={`${id}count`}>{value.length} / {MAX_MESSAGE}</span>
        </div>
      </div>
    </div>
  )
}

export const PostReactions: React.FC<{ slug: string; language: Language }> = ({ slug, language }) => {
  const t = copy[language]
  const sectionRef = useRef<HTMLElement>(null)
  const liking = useRef(false)
  // undefined until the page has read the cookie, so the prerendered page and a signed-in reader show no sign-in flash.
  const [viewer, setViewer] = useState<Author | null>()
  const [reactions, setReactions] = useState<Reactions>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeNote, setLikeNote] = useState<LikeNote>()
  // Announced only after a click, so loading the count while the visitor still reads the article stays silent.
  const [announcement, setAnnouncement] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [draft, setDraft] = useState('')
  // A new key after each post gives the next comment a fresh editor, back on Write.
  const [posted, setPosted] = useState(0)
  // One comment is edited at a time.
  const [editing, setEditing] = useState<{ id: number; draft: string; status?: EditStatus }>()
  const commentsRef = useRef<HTMLDivElement>(null)

  const draftKey = `${DRAFT_KEY}:${slug}`
  const likeIntentKey = `${LIKE_INTENT_KEY}:${slug}`
  const signInHref = `/api/auth/github?return=${encodeURIComponent(`${language === 'ar' ? '/ar' : ''}/blog/${slug}`)}`

  // Storage and the network run only in the browser, after hydration, so the prerendered page matches.
  useEffect(() => {
    const section = sectionRef.current
    const signedIn = readViewer()
    // A draft saved when the session ended comes back after the new sign-in.
    const saved = signedIn && takeItem(draftKey)

    setViewer(signedIn)

    if (saved) setDraft(saved)

    // A like clicked before a sign-in that did not finish is dropped, so a later sign-in cannot send it.
    if (!signedIn) takeItem(likeIntentKey)

    // The Worker sends a failed sign-in back with ?signin=failed; the address keeps only the post.
    const address = new URL(window.location.href)

    if (address.searchParams.get('signin') === 'failed') {
      setStatus('signinFailed')
      address.searchParams.delete('signin')
      window.history.replaceState(window.history.state, '', address.pathname + address.search + address.hash)
    }

    if (!section) return

    let cancelled = false

    // Fetched once, when the visitor scrolls near the section; a reader who stops early costs nothing.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()

      // A like clicked while signed out is sent now. It is taken only here, so an effect that runs twice cannot drop it.
      const wantsLike = signedIn && takeItem(likeIntentKey) !== null

      // The post reply is cached and the same for everyone, so the viewer's own like comes from its own request.
      const ownLikeRequest: Promise<{ likes?: number; liked?: boolean }> = signedIn
        ? fetch(`/api/posts/${slug}/like`, wantsLike ? likeInit(true, language) : undefined).then(response => {
          if (response.status === 401 && !cancelled) {
            forgetViewer()
            setViewer(null)
          }

          return response.ok ? response.json() : {}
        }, () => ({}))
        : Promise.resolve({})

      Promise.all([fetch(`/api/posts/${slug}`).then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status)))), ownLikeRequest])
        .then(([value, ownLike]: [Reactions, { likes?: number; liked?: boolean }]) => {
          if (cancelled) return

          // The signed-in count is exact; the cached one can be up to 30 s old.
          setReactions({ ...value, likes: ownLike.likes ?? value.likes })
          setLiked(ownLike.liked ?? false)
        }, () => { if (!cancelled) setLoadFailed(true) })
    }, { rootMargin: '600px 0px' })

    observer.observe(section)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [slug, draftKey, likeIntentKey, language])

  // A closed edit puts the comment's HTML back, so its code blocks are enhanced again.
  useEffect(() => (commentsRef.current && reactions?.comments.length ? enhanceCodeBlocks(commentsRef.current) : undefined), [reactions?.comments, editing?.id])

  async function toggleLike() {
    if (!reactions || liking.current) return

    liking.current = true
    const next = !liked
    const before = reactions.likes
    let note: LikeNote | undefined = 'likeFailed'

    // The button answers at once; a failed request puts both the state and the count back.
    setLiked(next)
    setLikeNote(undefined)
    setReactions(current => current && { ...current, likes: Math.max(0, before + (next ? 1 : -1)) })

    try {
      const response = await fetch(`/api/posts/${slug}/like`, likeInit(next, language))

      // An ended session turns the button back into the sign-in link.
      if (response.status === 401) {
        endSession()
        note = 'signInToLike'
      }

      if (!response.ok) throw new Error(String(response.status))

      const result: { likes: number; liked: boolean } = await response.json()

      // A blocked account's like is not stored, so the reply's state differs from the click.
      note = result.liked === next ? undefined : 'likeBlocked'
      setLiked(result.liked)
      setReactions(current => current && { ...current, likes: result.likes })
      setAnnouncement(note ? t[note] : t.likes(result.likes))
    } catch {
      setLiked(!next)
      setAnnouncement(t[note ?? 'likeFailed'])
      setReactions(current => current && { ...current, likes: before })
    } finally {
      setLikeNote(note)
      liking.current = false
    }
  }

  function endSession() {
    forgetViewer()
    setViewer(null)

    if (draft.trim()) keepItem(draftKey, draft)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()

    if (!message || message.length > MAX_MESSAGE) {
      setStatus('invalid')

      return
    }

    setStatus('posting')

    try {
      const response = await fetch(`/api/posts/${slug}/comments`, { method: 'POST', body: new URLSearchParams({ message, language }) })
      const result: PostComment & { error?: string } = await response.json()

      if (response.ok) {
        setDraft('')
        setPosted(count => count + 1)
        setReactions(current => current && { ...current, comments: [...current.comments, result] })
        setStatus('posted')
      } else if (response.status === 401) {
        endSession()
        setStatus('expired')
      } else {
        setStatus(result.error === 'rate' || result.error === 'daily' || result.error === 'blocked' || result.error === 'invalid' ? result.error : 'failed')
      }
    } catch {
      setStatus('failed')
    }
  }

  async function signOut() {
    // The cookies go even when the request fails, so the page never shows a sign-in that no longer works.
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    forgetViewer()
    setViewer(null)
    setLiked(false)
    setStatus('idle')
  }

  async function removeComment(id: number) {
    if (!window.confirm(t.confirmDelete)) return

    try {
      const response = await fetch(`/api/posts/${slug}/comments/${id}`, { method: 'DELETE' })

      if (response.ok) {
        setReactions(current => current && { ...current, comments: current.comments.filter(item => item.id !== id) })
        setEditing(current => current?.id === id ? undefined : current)
        setStatus('idle')
      } else if (response.status === 401) {
        endSession()
        setStatus('expired')
      } else {
        setStatus('deleteFailed')
      }
    } catch {
      setStatus('deleteFailed')
    }
  }

  // Focus goes back to the comment's Edit button, so a keyboard user stays at the comment.
  function closeEdit(from: HTMLElement) {
    from.closest('li')?.querySelector<HTMLButtonElement>('.post-comment-edit')?.focus()
    setEditing(undefined)
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!editing || editing.status === 'saving') return

    const { id } = editing
    const message = editing.draft.trim()

    // An unchanged text is not sent, so it neither marks the comment edited nor spends one of its edits.
    if (message === reactions?.comments.find(item => item.id === id)?.body) {
      closeEdit(form)

      return
    }

    if (!message || message.length > MAX_MESSAGE) {
      setEditing({ ...editing, status: 'invalid' })

      return
    }

    setEditing({ ...editing, status: 'saving' })

    try {
      const response = await fetch(`/api/posts/${slug}/comments/${id}`, { method: 'PATCH', body: new URLSearchParams({ message, language }) })
      const result: PostComment & { error?: string } = await response.json()

      if (response.ok) {
        setReactions(current => current && { ...current, comments: current.comments.map(item => item.id === id ? result : item) })
        closeEdit(form)
      } else if (response.status === 401) {
        endSession()
        setEditing(undefined)
        setStatus('expired')
      } else {
        const failure = result.error === 'rate' || result.error === 'blocked' || result.error === 'invalid' || result.error === 'edits' ? result.error : 'editFailed'

        setEditing(current => current && { ...current, status: failure })
      }
    } catch {
      setEditing(current => current && { ...current, status: 'editFailed' })
    }
  }

  const dateFormat = new Intl.DateTimeFormat(dateLocale(language), { year: 'numeric', month: 'short', day: 'numeric', timeZone: SITE_TIME_ZONE })
  const busy = status === 'posting'
  const statusText = status === 'idle' || busy ? t.note : t[status]
  const tone = status === 'posted' ? 'ok' : status === 'idle' || busy ? undefined : 'error'

  return (
    <section ref={sectionRef} className="post-reactions" aria-labelledby="comments-title"><div>
      <div className="post-like">
        {viewer === null
          ? <a className="post-like-button" href={signInHref} aria-label={t.signInToLike} title={t.signInToLike} onClick={() => keepItem(likeIntentKey, '1')}><HeartIcon />{t.like}</a>
          : <button type="button" className="post-like-button" aria-pressed={liked} disabled={!reactions || !viewer} onClick={() => void toggleLike()}><HeartIcon />{t.like}</button>}
        <span className="post-like-count">{likeNote ? t[likeNote] : reactions ? t.likes(reactions.likes) : ''}</span>
        <span className="sr-only" aria-live="polite">{announcement}</span>
      </div>

      <h2 id="comments-title">{t.title}</h2>
      <div ref={commentsRef} className="post-comments">
        {reactions && (reactions.comments.length
          ? <ol>{reactions.comments.map(item => <li key={item.id}>
            {/* GitHub serves the picture; no-referrer keeps the post address from it. */}
            <img className="post-comment-avatar" src={avatarUrl(item.author.id, 36)} alt="" width={36} height={36} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            <div className="post-comment-main">
              <p className="post-comment-meta">
                <a href={`https://github.com/${item.author.login}`} target="_blank" rel="nofollow ugc noopener noreferrer"><strong dir="auto">{item.author.name ?? item.author.login}</strong></a>
                {/* A login is Latin script; without dir, an Arabic page puts its @ at the end. */}
                {item.author.name && <span className="post-comment-login" dir="ltr">@{item.author.login}</span>}
                <time dateTime={new Date(item.createdAt).toISOString()}>{dateFormat.format(item.createdAt)}</time>
                {item.editedAt ? <span className="post-comment-edited" title={dateFormat.format(item.editedAt)}>{t.edited}<span className="sr-only"> {dateFormat.format(item.editedAt)}</span></span> : null}
                {viewer?.id === item.author.id && <span className="post-comment-actions">
                  <button type="button" className="post-comment-edit" aria-expanded={editing?.id === item.id} onClick={() => setEditing(current => current?.id === item.id ? current : { id: item.id, draft: item.body })}>{t.edit}</button>
                  <button type="button" className="post-comment-delete" onClick={() => void removeComment(item.id)}>{t.delete}</button>
                </span>}
              </p>
              {editing?.id === item.id
                ? <form className="contact-form post-comment-form post-comment-editing" onSubmit={saveEdit} noValidate>
                  <CommentEditor t={t} label={t.editLabel} value={editing.draft} onChange={value => setEditing(current => current && { ...current, draft: value })} focus />
                  <div className="contact-form-footer">
                    <button type="submit" disabled={editing.status === 'saving'}>{editing.status === 'saving' ? t.saving : t.save}</button>
                    <button type="button" className="post-comment-cancel" onClick={event => closeEdit(event.currentTarget)}>{t.cancel}</button>
                    <p className="post-comment-status" role="status" data-tone={editing.status && editing.status !== 'saving' ? 'error' : undefined}>{editing.status && editing.status !== 'saving' ? t[editing.status] : ''}</p>
                  </div>
                </form>
                // commentToHtml escapes the visitor's text before it adds any markup.
                : <div className="post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: commentToHtml(item.body) }} />}
            </div>
          </li>)}</ol>
          : <p className="post-comments-note">{t.empty}</p>)}
        {/* The Worker routes exist only on 1saif.me, so Pages previews always get a 404 here. */}
        {loadFailed && <p className="post-comments-note">{location.hostname.endsWith('.pages.dev') ? t.previewHost : t.loadFailed}</p>}
      </div>

      {viewer === null && <div className="contact-form post-comment-signin">
        <p>{t.signInPrompt}</p>
        <a className="github-signin" href={signInHref}><GitHubIcon />{t.signIn}</a>
        <p className="post-comment-hint">{t.signInNote}</p>
        {(status === 'signinFailed' || status === 'expired') && <p className="post-comment-status" role="status" data-tone="error">{t[status]}</p>}
      </div>}

      {viewer && <form className="contact-form post-comment-form" onSubmit={submit} noValidate>
        <div className="post-comment-viewer">
          <img src={avatarUrl(viewer.id, 24)} alt="" width={24} height={24} referrerPolicy="no-referrer" />
          <span>{t.signedInAs} <strong dir="auto">{viewer.name ?? viewer.login}</strong></span>
          <button type="button" onClick={() => void signOut()}>{t.signOut}</button>
        </div>
        <CommentEditor key={posted} t={t} label={t.message} value={draft} onChange={setDraft} />
        <div className="contact-form-footer">
          <button type="submit" disabled={busy}>{busy ? t.posting : t.post}</button>
          <p className="post-comment-status" role="status" data-tone={tone}>{statusText}</p>
        </div>
      </form>}
    </div></section>
  )
}
