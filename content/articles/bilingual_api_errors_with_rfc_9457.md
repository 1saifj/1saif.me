---
title: "API Errors in Arabic and English with RFC 9457"
description: How I return errors that a user can read in their own language and a developer can still trace, using Problem Details, a small message catalog and the Accept-Language header.
createdAt: "2025-12-16"
updatedAt: "2025-12-16"
featuredImage: "/articles/rfc9457_errors_feat.jpg"
tags:
  - api
  - backend
  - i18n
  - nodejs
  - typescript
---

You're building an API and everything works fine until an error happens. Then the user sees this:

```json
{ "error": "Something went wrong" }
```

That's not helpful for anyone. The user doesn't know what happened. The developer who has to debug it doesn't know where to look. And the mobile app can't do anything smart with it, because the only thing it gets is a sentence.

I ran into this on a mobile app that serves both Arabic and English users. When validation fails or a session expires, I needed an error that:

1. the user can understand, in their language
2. the developer can trace back to a request
3. has the same shape on every endpoint, so the app handles errors in one place

RFC 9457 already defines a format for this.

## Problem Details

RFC 9457, "Problem Details for HTTP APIs", replaced the older RFC 7807 in 2023. It defines a small JSON object for errors, sent with the content type `application/problem+json`:

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation error",
  "status": 400,
  "detail": "The phone number format is invalid.",
  "instance": "/requests/7f3c9a2e",
  "code": "validation.phone_invalid"
}
```

- `type` is a URI that identifies the kind of problem. It doesn't have to resolve to a page, but it's nice if it does.
- `title` is a short summary of that type. The RFC says it shouldn't change from one occurrence to the next, except for localization. That last part is exactly what I needed.
- `status` repeats the HTTP status code, which helps when the body gets logged without the headers.
- `detail` explains this specific occurrence.
- `instance` identifies this occurrence. The request ID is a good fit here, so a screenshot from a user leads straight to the logs.

Anything else is an extension member. I added `code`, a stable string like `validation.phone_invalid`. The app switches on `code`, never on the text, because the text changes with the language and the code doesn't.

## The message catalog

Every error the API can return has a code and a text for each language. A plain object is enough:

```ts
type Lang = 'en' | 'ar'
type Message = { title: string; detail: string }

const messages: Record<string, Partial<Record<Lang, Message>>> = {
  'validation.phone_invalid': {
    en: { title: 'Validation error', detail: 'The phone number format is invalid.' },
    ar: { title: 'خطأ في البيانات', detail: 'صيغة رقم الهاتف غير صحيحة.' },
  },
  'auth.session_expired': {
    en: { title: 'Session expired', detail: 'Please sign in again.' },
    ar: { title: 'انتهت الجلسة', detail: 'يرجى تسجيل الدخول مرة أخرى.' },
  },
  'server.unexpected': {
    en: { title: 'Unexpected error', detail: 'Something failed on our side. Please try again.' },
  },
}
```

Notice that `server.unexpected` has no Arabic text yet. That's on purpose, to show the fallback below. In a real project, a test that checks every code has both languages saves you from finding out in production.

## Picking the language

The client says what it wants in `Accept-Language`, for example `ar-IQ,ar;q=0.9,en;q=0.8`. You don't need to parse that by hand. Express already does it:

```ts
const lang = (req.acceptsLanguages('en', 'ar') || 'en') as Lang
```

It respects the `q` values and matches `ar-IQ` to `ar`. If the client asks only for languages you don't have, it returns `false` and you use English. The order of the arguments matters too: when the request has no `Accept-Language` header at all, Express returns the first one, so put your default first.

Then the fallback chain for the text itself is: the requested language, then English, then the raw code. The raw code is ugly, but it's still better than an empty message, and it tells you exactly which entry is missing.

```ts
function localize(code: string, lang: Lang): Message & { lang: Lang } {
  const entry = messages[code]
  if (entry?.[lang]) return { ...entry[lang]!, lang }
  if (entry?.en) return { ...entry.en, lang: 'en' }
  return { title: code, detail: code, lang: 'en' }
}
```

## One error type, one handler

Routes throw an `AppError` with a code and a status. They never build the response themselves:

```ts
export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(code)
  }
}

// in a route
if (!isValidPhone(body.phone)) {
  throw new AppError('validation.phone_invalid', 400)
}
```

And one error handler turns it into Problem Details:

```ts
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof AppError ? err : new AppError('server.unexpected', 500)
  if (!(err instanceof AppError)) console.error(err)

  const lang = (req.acceptsLanguages('en', 'ar') || 'en') as Lang
  const text = localize(error.code, lang)

  res
    .status(error.status)
    .type('application/problem+json')
    .set({ 'Content-Language': text.lang, Vary: 'Accept-Language' })
    .json({
      type: `https://api.example.com/errors/${error.code.split('.')[0]}`,
      title: text.title,
      status: error.status,
      detail: text.detail,
      instance: `/requests/${res.locals.requestId}`,
      code: error.code,
      ...error.extra,
    })
})
```

Two headers here are easy to forget. `Content-Language` tells the client which language it actually got, which matters when the fallback kicked in. `Vary: Accept-Language` tells any cache in the middle that the same URL has different bodies for different languages. Without it, a CDN can happily serve the Arabic error to an English user.

Unknown errors get logged with the full stack, but the client only sees `server.unexpected`. You don't want a database error message with table names going out in `detail`.

## Validation errors with more than one field

A form can fail on several fields at once. The RFC lets you add your own members, so I return a list. Here `lang` is picked the same way as in the handler:

```ts
throw new AppError('validation.failed', 400, {
  errors: [
    { field: 'phone', code: 'validation.phone_invalid', detail: localize('validation.phone_invalid', lang).detail },
    { field: 'name', code: 'validation.required', detail: localize('validation.required', lang).detail },
  ],
})
```

The app puts each `detail` under the matching input, and uses the top-level `detail` for a general message.

## On the app side

The app should send `Accept-Language` from the language the user picked inside the app, not the phone's system language. Plenty of people run their phone in English and still want the app in Arabic.

Handling errors then becomes one function, because every error has the same shape. In Dart it looks like this:

```dart
void handleProblem(Map<String, dynamic> problem) {
  switch (problem['code']) {
    case 'auth.session_expired':
      router.go('/login');
      break;
    default:
      showError(problem['detail'] as String? ?? 'Something went wrong');
  }
}
```

The app makes decisions with `code` and shows `detail` to the user. It never compares translated strings.

## Why it's worth it

The difference is noticeable, especially when the app serves people in more than one language. Users get a message they can read. The app gets a stable code it can act on. Logs and monitoring see the same shape on every endpoint, and when someone reports a problem, the request ID in `instance` points you to the right log line.

It also stops every developer from inventing their own error format per endpoint. Every endpoint fails the same way, and the format is documented in the RFC. If you already have clients that read an `error` field, they need one change to read `detail` instead, so plan that with the app release.

If you've handled errors or translations in your APIs differently, I'd like to hear how you approached it.
