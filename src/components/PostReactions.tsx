import React, { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { dateLocale, Language, SITE_TIME_ZONE } from '../i18n/language'
import { enhanceCodeBlocks } from '../utils/codeBlocks'
import { continueList, Edit, Format, formatSelection, pasteLink, quoteReply } from '../utils/commentEditor'
import { commentToHtml } from '../utils/commentMarkdown'
import { commentTime } from '../utils/commentTime'

const MAX_MESSAGE = 2_000

// The count shows only in the last characters, where it helps.
const COUNT_FROM = 200

// Saif's GitHub account ID: his comments carry the Author badge. The ID stays when a login changes.
const OWNER_ID = 31359390

// The Worker sets this readable cookie at sign-in with the public GitHub profile only; the session itself is HttpOnly.
const VIEWER_COOKIE = '__Host-viewer'

const DRAFT_KEY = 'comment-draft'

// A like clicked while signed out is kept across the GitHub sign-in and sent on the way back.
const LIKE_INTENT_KEY = 'like-intent'

// A sign-in started from the comment box returns to it, with the cursor in the box.
const COMMENT_INTENT_KEY = 'comment-intent'

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
    empty: 'No comments yet. Start the discussion.',
    loadFailed: 'The comments did not load.',
    retry: 'Try again',
    previewHost: 'Likes and comments work on 1saif.me only, not on preview deploys.',
    message: 'Comment',
    signInPrompt: 'Sign in with GitHub to join the discussion.',
    signIn: 'Sign in with GitHub',
    signInNote: 'GitHub shares only your public profile: your name, username and picture.',
    signedInAs: 'Signed in as',
    signOut: 'Sign out',
    delete: 'Delete',
    confirmDelete: 'Delete this comment for good?',
    author: 'Author',
    edit: 'Edit',
    quote: 'Quote reply',
    unsaved: 'Save or cancel this edit first.',
    edited: 'edited',
    editLabel: 'Edit comment',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    edits: 'This comment has reached its limit of 10 edits.',
    editFailed: 'The edit was not saved. Try again.',
    gone: 'This comment was deleted, so the edit cannot be saved.',
    write: 'Write',
    preview: 'Preview',
    previewEmpty: 'Nothing to preview yet.',
    markdown: (mod: string) => `Markdown is supported. Write a language after \`\`\` to color code. ${mod} Enter sends.`,
    left: (count: number) => `${count} left`,
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
    empty: 'لا تعليقات بعد. ابدأ النقاش.',
    loadFailed: 'تعذّر تحميل التعليقات.',
    retry: 'أعد المحاولة',
    previewHost: 'الإعجابات والتعليقات تعمل على 1saif.me فقط، لا على نسخ المعاينة.',
    message: 'التعليق',
    signInPrompt: 'سجّل الدخول عبر GitHub لتشارك في النقاش.',
    signIn: 'تسجيل الدخول عبر GitHub',
    signInNote: 'يشارك GitHub ملفك العام فقط: اسمك واسم المستخدم وصورتك.',
    signedInAs: 'مسجّل الدخول باسم',
    signOut: 'تسجيل الخروج',
    delete: 'حذف',
    confirmDelete: 'أتحذف هذا التعليق نهائياً؟',
    author: 'الكاتب',
    edit: 'تعديل',
    quote: 'رد مع اقتباس',
    unsaved: 'احفظ هذا التعديل أو ألغِه أولاً.',
    edited: 'معدَّل',
    editLabel: 'تعديل التعليق',
    save: 'حفظ',
    saving: 'جارٍ الحفظ…',
    cancel: 'إلغاء',
    edits: 'بلغ هذا التعليق حدّ 10 تعديلات.',
    editFailed: 'لم يُحفظ التعديل. حاول مرة أخرى.',
    gone: 'حُذف هذا التعليق، فلا يمكن حفظ التعديل.',
    write: 'كتابة',
    preview: 'معاينة',
    previewEmpty: 'لا شيء للمعاينة بعد.',
    markdown: (mod: string) => `يدعم Markdown. اكتب اللغة بعد \`\`\` لتلوين الكود. ${mod} Enter للإرسال.`,
    left: (count: number) => `تبقّى ${count}`,
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

type EditStatus = 'saving' | 'invalid' | 'rate' | 'blocked' | 'edits' | 'editFailed' | 'unsaved' | 'gone'

type Status = 'idle' | 'posting' | 'posted' | 'invalid' | 'rate' | 'daily' | 'blocked' | 'expired' | 'signinFailed' | 'failed'

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

// Storage is per tab, not per post, so sign-out clears the drafts and likes kept for every post.
function forgetKeptItems() {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if ([DRAFT_KEY, LIKE_INTENT_KEY, COMMENT_INTENT_KEY].some(prefix => key.startsWith(`${prefix}:`))) sessionStorage.removeItem(key)
    }
  } catch {
    // Without storage nothing was kept.
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
// busy: while a post or a save is out, the text is locked, so nothing typed then is lost when the editor clears or closes.
const CommentEditor: React.FC<{ t: Copy; label: string; value: string; onChange: (value: string) => void; focus?: boolean; labelHidden?: boolean; busy?: boolean }> = ({ t, label, value, onChange, focus, labelHidden, busy }) => {
  // A new comment and an edit can be open at once, so each editor has its own IDs.
  const id = useId()
  const [previewing, setPreviewing] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => (previewRef.current && previewing && value ? enhanceCodeBlocks(previewRef.current) : undefined), [previewing, value])
  useEffect(() => {
    const area = messageRef.current

    if (!focus || !area) return

    area.focus()
    // The cursor goes after the text, so a quote or a kept draft goes on where it stopped.
    area.setSelectionRange(area.value.length, area.value.length)
  }, [focus])

  function insert(area: HTMLTextAreaElement, edit: Edit) {
    // setRangeText ignores readOnly, so the lock is checked here for every tool, key and paste.
    if (area.readOnly) return

    area.focus()
    area.setSelectionRange(edit.from, edit.to)

    // insertText keeps the browser's undo history and fires the input event; setRangeText is the fallback without it.
    // insertText with no text does not delete in every browser, so an empty edit deletes the range.
    if (!document.execCommand(edit.text ? 'insertText' : 'delete', false, edit.text)) {
      area.setRangeText(edit.text)
      onChange(area.value)
    }

    area.setSelectionRange(edit.selectionStart, edit.selectionEnd)
  }

  function applyFormat(format: Format) {
    const area = messageRef.current

    if (area) insert(area, formatSelection(area.value, area.selectionStart, area.selectionEnd, format))
  }

  function shortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    // An IME (Arabic, Chinese, Japanese) still composing owns the keys; Safari marks its last Enter only with keyCode 229.
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || event.altKey || event.shiftKey) return

    const area = event.currentTarget

    if (!event.metaKey && !event.ctrlKey) {
      const edit = event.key === 'Enter' && area.selectionStart === area.selectionEnd ? continueList(area.value, area.selectionStart) : undefined

      if (edit) {
        event.preventDefault()
        insert(area, edit)
      }

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()

      return
    }

    const tool = TOOLS.find(item => item.key === event.key.toLowerCase())

    if (!tool) return

    event.preventDefault()
    applyFormat(tool.format)
  }

  function paste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const area = event.currentTarget
    const edit = pasteLink(area.value, area.selectionStart, area.selectionEnd, event.clipboardData.getData('text/plain'))

    if (!edit) return

    event.preventDefault()
    insert(area, edit)
  }

  const left = MAX_MESSAGE - value.length
  // The editor renders only in the browser, after the cookie is read, so navigator is always there.
  const mod = /Mac|iP(hone|ad|od)/.test(navigator.platform) ? '⌘' : 'Ctrl'

  return (
    <div className="contact-field">
      <label htmlFor={`${id}message`} className={labelHidden ? 'sr-only' : undefined}>{label}</label>
      <div className="comment-editor">
        <div className="comment-editor-bar">
          <span className="post-comment-tabs">
            <button type="button" aria-pressed={!previewing} onClick={() => setPreviewing(false)}>{t.write}</button>
            <button type="button" aria-pressed={previewing} onClick={() => setPreviewing(true)}>{t.preview}</button>
          </span>
          {!previewing && <span className="comment-toolbar" role="group" aria-label={t.formatting}>
            {TOOLS.map(tool => <button key={tool.format} type="button" className="comment-tool" disabled={busy} aria-label={t.tools[tool.format]} title={tool.key ? `${t.tools[tool.format]} (${mod} ${tool.key.toUpperCase()})` : t.tools[tool.format]} aria-keyshortcuts={tool.key ? `Control+${tool.key.toUpperCase()} Meta+${tool.key.toUpperCase()}` : undefined} onClick={() => applyFormat(tool.format)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={tool.path} /></svg>
            </button>)}
          </span>}
        </div>
        {/* Hidden, not removed, while previewing, so it keeps its text and undo history. */}
        <textarea ref={messageRef} id={`${id}message`} defaultValue={value} name="message" rows={5} dir="auto" maxLength={MAX_MESSAGE} aria-required="true" aria-describedby={`${id}hint ${id}count`} hidden={previewing} readOnly={busy} onChange={event => onChange(event.currentTarget.value)} onKeyDown={shortcut} onPaste={paste} />
        {previewing && <div ref={previewRef} className="post-comment-preview post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: value.trim() ? commentToHtml(value) : `<p>${t.previewEmpty}</p>` }} />}
        <div className="comment-editor-foot">
          <span className="post-comment-hint" id={`${id}hint`}>{t.markdown(mod)}</span>
          {/* Kept empty, not removed, because the textarea names it in aria-describedby. */}
          <span className="post-comment-count" id={`${id}count`} data-tone={left < 50 ? 'error' : undefined}>{left <= COUNT_FROM ? t.left(left) : ''}</span>
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
  // Each Try again loads the list once more; the button stays, disabled, while it runs.
  const [attempt, setAttempt] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeNote, setLikeNote] = useState<LikeNote>()
  // Announced only after a click, so loading the count while the visitor still reads the article stays silent.
  const [announcement, setAnnouncement] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [draft, setDraft] = useState('')
  // A new key gives the new-comment editor a fresh start on Write, with the cursor in it: after a post, a quote
  // reply, or a sign-in started from the comment box. The draft comes back through value.
  const [editorKey, setEditorKey] = useState(0)
  // One comment is edited at a time.
  const [editing, setEditing] = useState<{ id: number; draft: string; status?: EditStatus }>()
  // Delete asks in place, inside the comment, instead of a browser dialog.
  const [confirming, setConfirming] = useState<{ id: number; failed?: boolean }>()
  // The comment just posted or saved, shown with a short highlight.
  const [fresh, setFresh] = useState<number>()
  const commentsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  // The comment whose Delete button takes focus back when its question is dismissed.
  const restoreDelete = useRef<number>()
  const jumped = useRef(false)

  const draftKey = `${DRAFT_KEY}:${slug}`
  const likeIntentKey = `${LIKE_INTENT_KEY}:${slug}`
  const commentIntentKey = `${COMMENT_INTENT_KEY}:${slug}`
  const signInHref = `/api/auth/github?return=${encodeURIComponent(`${language === 'ar' ? '/ar' : ''}/blog/${slug}`)}`

  // Storage and the network run only in the browser, after hydration, so the prerendered page matches.
  useEffect(() => {
    const signedIn = readViewer()
    // A draft saved when the session ended comes back after the new sign-in.
    const saved = signedIn && takeItem(draftKey)

    setViewer(signedIn)

    if (saved) setDraft(saved)

    // A like clicked before a sign-in that did not finish is dropped, so a later sign-in cannot send it.
    if (!signedIn) {
      takeItem(likeIntentKey)
      takeItem(commentIntentKey)
    }

    // The Worker sends a failed sign-in back with ?signin=failed; the address keeps only the post.
    const address = new URL(window.location.href)

    if (address.searchParams.get('signin') === 'failed') {
      setStatus('signinFailed')
      address.searchParams.delete('signin')
      window.history.replaceState(window.history.state, '', address.pathname + address.search + address.hash)
    }
  }, [draftKey, likeIntentKey, commentIntentKey])

  useEffect(() => {
    const section = sectionRef.current

    if (!section) return

    let cancelled = false
    const signedIn = readViewer()

    function load() {
      // A like clicked while signed out is sent now. It is taken only here; a load that runs at once (a #comment- link,
      // Try again) and is cancelled by StrictMode's second run in development drops it.
      const wantsLike = signedIn && takeItem(likeIntentKey) !== null
      const wantsComment = signedIn && takeItem(commentIntentKey) !== null

      // The post reply is cached and the same for everyone, so the viewer's own like comes from its own request.
      const ownLikeRequest: Promise<{ likes?: number; liked?: boolean }> = signedIn
        ? fetch(`/api/posts/${slug}/like`, wantsLike ? likeInit(true, language) : undefined).then(async response => {
          if (response.status === 401) {
            if (!cancelled) {
              forgetViewer()
              setViewer(null)
            }

            return {}
          }

          const own: { likes?: number; liked?: boolean } = response.ok ? await response.json() : {}

          // A like kept over the sign-in that failed or was not stored says so, as the click itself would.
          if (wantsLike && !own.liked && !cancelled) setLikeNote(own.likes === undefined ? 'likeFailed' : 'likeBlocked')

          return own
        }).catch(() => {
          if (wantsLike && !cancelled) setLikeNote('likeFailed')

          return {}
        })
        : Promise.resolve({})

      Promise.all([fetch(`/api/posts/${slug}`).then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status)))), ownLikeRequest])
        .then(([value, ownLike]: [Reactions, { likes?: number; liked?: boolean }]) => {
          if (cancelled) return

          // The signed-in count is exact; the cached one can be up to 30 s old.
          setReactions({ ...value, likes: ownLike.likes ?? value.likes })
          setLiked(ownLike.liked ?? false)
          setLoadFailed(false)

          // Try again leaves with the note, so focus goes to the heading of the list it brought.
          if (attempt) titleRef.current?.focus()
        }, () => { if (!cancelled) setLoadFailed(true) })
        .finally(() => {
          if (cancelled) return

          setRetrying(false)

          // Only once the list is in, so the list does not push the box away after the page scrolled to it.
          if (wantsComment) setEditorKey(key => key + 1)
        })
    }

    // Fetched once, when the visitor scrolls near the section; a reader who stops early costs nothing.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      load()
    }, { rootMargin: '600px 0px' })

    // A link to one comment needs the list now, because the section is far down the page.
    if (attempt || /^#comment-\d+$/.test(location.hash)) load()
    else observer.observe(section)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [slug, likeIntentKey, commentIntentKey, language, attempt])

  // The browser looked for a #comment- target before the list was in, so the page scrolls to it once here.
  // A comment that is gone (deleted, hidden, or not in the newest 200) leaves the reader at the heading.
  useEffect(() => {
    if (!reactions || jumped.current || !/^#comment-\d+$/.test(location.hash)) return

    jumped.current = true

    // A new fragment navigation scrolls below the sticky header and sets :target, which the browser could not set before.
    if (document.getElementById(location.hash.slice(1))) location.replace(location.hash)
    else titleRef.current?.scrollIntoView()
  }, [reactions])

  // The draft survives a reload. It is saved only once the viewer is known: the effect above takes a saved draft
  // first, and a signed-out page must not drop the one kept for the way back from GitHub.
  useEffect(() => {
    if (!viewer) return

    if (draft) keepItem(draftKey, draft)
    else takeItem(draftKey)
  }, [viewer, draft, draftKey])

  // Unlike the new comment, an edit is not kept in the tab, so a changed one must not go with a reload or a closed tab.
  // shortcut: an in-site link changes the page without an unload, so it still drops the edit; guard it in App.tsx if readers lose edits that way.
  const editChanged = editing !== undefined && (editing.status === 'saving' || editing.draft.trim() !== reactions?.comments.find(item => item.id === editing.id)?.body)

  useEffect(() => {
    if (!editChanged) return

    const warn = (event: BeforeUnloadEvent) => event.preventDefault()

    window.addEventListener('beforeunload', warn)

    return () => window.removeEventListener('beforeunload', warn)
  }, [editChanged])

  // A closed edit puts the comment's HTML back, so its code blocks are enhanced again.
  useEffect(() => (commentsRef.current && reactions?.comments.length ? enhanceCodeBlocks(commentsRef.current) : undefined), [reactions?.comments, editing?.id])

  async function toggleLike() {
    if (!reactions || liking.current) return

    liking.current = true
    // Cleared first, so the same message twice in a row is announced twice.
    setAnnouncement('')
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

    // Ctrl/⌘ Enter can arrive while a post is still on its way.
    if (status === 'posting') return

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
        setEditorKey(key => key + 1)
        setFresh(result.id)
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
    // The next account in this tab must not get this reader's text. An ended session keeps it (endSession).
    forgetKeptItems()
    setDraft('')
    forgetViewer()
    setViewer(null)
    setLiked(false)
    setStatus('idle')
  }

  async function removeComment(id: number) {
    try {
      const response = await fetch(`/api/posts/${slug}/comments/${id}`, { method: 'DELETE' })

      // 404: the comment is already gone (deleted in another tab), which is what the reader asked for.
      if (response.ok || response.status === 404) {
        // The focused button goes with the comment, so focus moves to the heading of the list.
        titleRef.current?.focus()
        setConfirming(undefined)
        setReactions(current => current && { ...current, comments: current.comments.filter(item => item.id !== id) })
        setEditing(current => current?.id === id ? undefined : current)
        setStatus('idle')
      } else if (response.status === 401) {
        setConfirming(undefined)
        endSession()
        setStatus('expired')
      } else {
        setConfirming({ id, failed: true })
      }
    } catch {
      setConfirming({ id, failed: true })
    }
  }

  function cancelDelete(id: number) {
    restoreDelete.current = id
    setConfirming(undefined)
  }

  // An open edit with changes stays open, so its text is not lost; an unchanged one gives way. Edit on the open
  // comment closes it, as its aria-expanded says.
  function startEdit(item: PostComment) {
    // A status over 'saving' would turn Save back on and send a second edit.
    if (editing?.status === 'saving') return

    if (editing && editChanged) {
      setEditing({ ...editing, status: 'unsaved' })
      commentsRef.current?.querySelector<HTMLTextAreaElement>('.post-comment-editing textarea')?.focus()

      return
    }

    setEditing(editing?.id === item.id ? undefined : { id: item.id, draft: item.body })
  }

  // The reader's selection inside the comment, or else the whole comment, goes into the new comment as a quote.
  function quote(item: PostComment, button: HTMLElement) {
    const body = button.closest('li')?.querySelector('.post-comment-body')
    const selection = window.getSelection()
    const selected = body && selection && !selection.isCollapsed && body.contains(selection.anchorNode) && body.contains(selection.focusNode) ? selection.toString() : ''
    const quoted = quoteReply(selected || item.body)

    setDraft(current => `${current.trim() ? `${current.trimEnd()}\n\n` : ''}${quoted}\n\n`)
    setEditorKey(key => key + 1)
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
        setFresh(id)
        closeEdit(form)
      } else if (response.status === 401) {
        endSession()
        setEditing(undefined)
        setStatus('expired')
      } else {
        const failure = result.error === 'rate' || result.error === 'blocked' || result.error === 'invalid' || result.error === 'edits' ? result.error : response.status === 404 ? 'gone' : 'editFailed'

        setEditing(current => current && { ...current, status: failure })
      }
    } catch {
      setEditing(current => current && { ...current, status: 'editFailed' })
    }
  }

  const dateFormat = new Intl.DateTimeFormat(dateLocale(language), { year: 'numeric', month: 'short', day: 'numeric', timeZone: SITE_TIME_ZONE })
  // The full time in the reader's own time zone, on hover; the comments render only in the browser.
  const fullDate = new Intl.DateTimeFormat(dateLocale(language), { dateStyle: 'long', timeStyle: 'short' })
  const now = Date.now()
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

      {/* Focusable from script only, so focus has a place to go when a deleted comment takes its button with it. */}
      <h2 id="comments-title" ref={titleRef} tabIndex={-1}>{t.title}{reactions?.comments.length ? <span className="post-comments-count">{reactions.comments.length}</span> : null}</h2>
      <div ref={commentsRef} className="post-comments">
        {reactions && (reactions.comments.length
          // The mark goes when its glow ends, so the next post or save of the same comment glows again.
          ? <ol>{reactions.comments.map(item => <li key={item.id} id={`comment-${item.id}`} className={fresh === item.id ? 'is-fresh' : undefined} onAnimationEnd={event => { if (event.animationName === 'post-comment-fresh') setFresh(undefined) }}>
            {/* GitHub serves the picture; no-referrer keeps the post address from it. */}
            <img className="post-comment-avatar" src={avatarUrl(item.author.id, 36)} alt="" width={36} height={36} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            <div className="post-comment-main">
              <p className="post-comment-meta">
                <a href={`https://github.com/${item.author.login}`} target="_blank" rel="nofollow ugc noopener noreferrer"><strong dir="auto">{item.author.name ?? item.author.login}</strong></a>
                {/* A login is Latin script; without dir, an Arabic page puts its @ at the end. */}
                {item.author.name && <span className="post-comment-login" dir="ltr">@{item.author.login}</span>}
                {item.author.id === OWNER_ID && <span className="post-comment-badge">{t.author}</span>}
                {/* The time links to the comment itself, as on GitHub. */}
                <a className="post-comment-permalink" href={`#comment-${item.id}`}><time dateTime={new Date(item.createdAt).toISOString()} title={fullDate.format(item.createdAt)}>{commentTime(item.createdAt, now, dateLocale(language), dateFormat)}</time></a>
                {item.editedAt ? <span className="post-comment-edited" title={fullDate.format(item.editedAt)}>{t.edited}<span className="sr-only"> {fullDate.format(item.editedAt)}</span></span> : null}
                {viewer && (confirming?.id === item.id
                  // The keys make each state mount its own buttons, so autoFocus runs when the state changes.
                  ? <span key="confirm" className="post-comment-actions" role="group" aria-labelledby={`delete-${item.id}`} onKeyDown={event => { if (event.key === 'Escape') cancelDelete(item.id) }}>
                    <span id={`delete-${item.id}`} className="post-comment-question" data-tone={confirming.failed ? 'error' : undefined} aria-live="polite">{confirming.failed ? t.deleteFailed : t.confirmDelete}</span>
                    {/* The first button takes focus, as in a dialog; Cancel puts it back on Delete. */}
                    <button type="button" className="post-comment-delete" autoFocus onClick={() => void removeComment(item.id)}>{t.delete}</button>
                    <button type="button" className="post-comment-dismiss" onClick={() => cancelDelete(item.id)}>{t.cancel}</button>
                  </span>
                  : <span key="actions" className="post-comment-actions">
                    {/* A comment of code only has no text a quote can carry. */}
                    {quoteReply(item.body) && <button type="button" className="post-comment-quote" onClick={event => quote(item, event.currentTarget)}>{t.quote}</button>}
                    {viewer.id === item.author.id && <>
                      <button type="button" className="post-comment-edit" aria-expanded={editing?.id === item.id} onClick={() => startEdit(item)}>{t.edit}</button>
                      <button type="button" className="post-comment-delete" autoFocus={restoreDelete.current === item.id} onFocus={() => { restoreDelete.current = undefined }} onClick={() => setConfirming({ id: item.id })}>{t.delete}</button>
                    </>}
                  </span>)}
              </p>
              {editing?.id === item.id
                ? <form className="contact-form post-comment-form post-comment-editing" onSubmit={saveEdit} noValidate onKeyDown={event => {
                  // Escape closes an unchanged edit; a changed one stays, so no text is lost by accident.
                  if (event.key === 'Escape' && !event.nativeEvent.isComposing && editing.draft.trim() === item.body) closeEdit(event.currentTarget)
                }}>
                  <CommentEditor t={t} label={t.editLabel} labelHidden value={editing.draft} onChange={value => setEditing(current => current && { ...current, draft: value })} focus busy={editing.status === 'saving'} />
                  <div className="contact-form-footer">
                    <p className="post-comment-status" role="status" data-tone={editing.status && editing.status !== 'saving' ? 'error' : undefined}>{editing.status && editing.status !== 'saving' ? t[editing.status] : ''}</p>
                    {/* One group, so a narrow screen never puts Cancel and Save on separate lines. */}
                    <span className="post-comment-edit-buttons">
                      <button type="button" className="post-comment-cancel" onClick={event => closeEdit(event.currentTarget)}>{t.cancel}</button>
                      <button type="submit" disabled={editing.status === 'saving' || !editing.draft.trim() || editing.draft.trim() === item.body}>{editing.status === 'saving' ? t.saving : t.save}</button>
                    </span>
                  </div>
                </form>
                // commentToHtml escapes the visitor's text before it adds any markup.
                : <div className="post-comment-body article-content" dir="auto" dangerouslySetInnerHTML={{ __html: commentToHtml(item.body) }} />}
            </div>
          </li>)}</ol>
          : <p className="post-comments-note">{t.empty}</p>)}
        {/* The Worker routes exist only on 1saif.me, so Pages previews always get a 404 here. */}
        {loadFailed && (location.hostname.endsWith('.pages.dev')
          ? <p className="post-comments-note">{t.previewHost}</p>
          // aria-disabled, not disabled, so focus stays on the button while it runs and after it fails again.
          : <p className="post-comments-note">{t.loadFailed} <button type="button" className="post-comments-retry" aria-disabled={retrying} onClick={() => {
            if (retrying) return
            setRetrying(true)
            setAttempt(count => count + 1)
          }}>{t.retry}</button></p>)}
      </div>

      {viewer === null && <div className="contact-form post-comment-signin">
        <p>{t.signInPrompt}</p>
        <a className="github-signin" href={signInHref} onClick={() => keepItem(commentIntentKey, '1')}><GitHubIcon />{t.signIn}</a>
        <p className="post-comment-hint">{t.signInNote}</p>
        {(status === 'signinFailed' || status === 'expired') && <p className="post-comment-status" role="status" data-tone="error">{t[status]}</p>}
      </div>}

      {viewer && <form className="contact-form post-comment-form" onSubmit={submit} noValidate>
        <div className="post-comment-viewer">
          <img src={avatarUrl(viewer.id, 24)} alt="" width={24} height={24} referrerPolicy="no-referrer" />
          <span>{t.signedInAs} <strong dir="auto">{viewer.name ?? viewer.login}</strong></span>
          <button type="button" onClick={() => void signOut()}>{t.signOut}</button>
        </div>
        <CommentEditor key={editorKey} t={t} label={t.message} value={draft} onChange={setDraft} focus={editorKey > 0} busy={busy} />
        <div className="contact-form-footer">
          <button type="submit" disabled={busy || !draft.trim()}>{busy ? t.posting : t.post}</button>
          <p className="post-comment-status" role="status" data-tone={tone}>{statusText}</p>
        </div>
      </form>}
    </div></section>
  )
}
