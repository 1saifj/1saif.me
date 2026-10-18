---
title: How to Cancel HTTP Requests in React using Axios
description: "Stop stale requests when a user clicks quickly between categories. How to cancel Axios requests with AbortController in React, so old responses never overwrite new ones."
createdAt: "2023-01-22"
updatedAt: 2023-03-12
featuredImage: "/articles/http_cancel_feat.jpg"
tags:
  - react
  - axios
  - http-client
---

## Introduction

Axios is a popular HTTP client. It can also cancel a request, which helps in some situations.

## The problem we want to solve

I had a function that gets products by category. The categories are shown in a scrolling pane. When the user clicks a category, the app sends an HTTP request for that category's products and shows the result in the products view.

The problem appears on a slow connection. The user clicks a category, and its request stays pending. Then the user clicks another category, and a second request starts. Both requests are pending at the same time. Each response updates the view when it arrives. If the response for the first category arrives first, the wrong products show until the second response arrives. If it arrives last, the wrong products stay on screen.

Users click around freely, so the app must handle this. Old requests should be cancelled, so that an old response never overwrites the data for a newer click.

## The solution

Axios supports cancellation through the `signal` option. The signal comes from `AbortController`, which is part of the fetch API.

This is the function that gets products:

```js
const getProducts = async (id, scrolling) => {
  const limit = 25
  let url

  if (id === 'ALL') {
    if (preferences?.store?.id === 'ALL' || preferences?.store?.id === undefined) {
      url = `/pos/items?Limit=${limit}&currencyId=${currencyId}&offset=${
        scrolling ? items.length : 0
      }`
    } else {
      url = `/pos/items?Limit=${limit}&currencyId=${currencyId}&storeId=${
        preferences?.store?.id
      }&groupId=${id}&offset=${scrolling ? items.length : 0}`
    }
  }
  let cacheKey = `${url}_${id}`
  if (cache.current[cacheKey]) {
    setLoading(false)
    return setProducts(cache.current[cacheKey])
  } else {
    try {
      const { data } = await axios.get(url)
      if (data) {
        setLoading(false)
        setHasMore(data.length >= 25)
        setProducts(scrolling ? [...items, ...data] : data)
        cache.current[cacheKey] = scrolling ? [...items, ...data] : data
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log(e)
      } else {
        setError(true)
        toast.error(e.message)
        setLoading(false)
      }
    }
  }
}
```

This function runs on every category click. We want each click to cancel the request from the previous click.

First, declare a variable at the top of the module to hold the controller for the request in flight:

```js
let controller = null
```

Then, in `getProducts`, abort the previous controller, create a new one, and pass its signal to Axios. The final function looks like this:

```js
const getProducts = async (id, scrolling) => {
  if (controller) {
    controller.abort()
  }
  controller = new AbortController()
  const limit = 25
  let url

  if (id === 'ALL') {
    if (preferences?.store?.id === 'ALL' || preferences?.store?.id === undefined) {
      url = `/pos/items?Limit=${limit}&currencyId=${currencyId}&offset=${
        scrolling ? items.length : 0
      }`
    } else {
      url = `/pos/items?Limit=${limit}&currencyId=${currencyId}&storeId=${
        preferences?.store?.id
      }&groupId=${id}&offset=${scrolling ? items.length : 0}`
    }
  }
  let cacheKey = `${url}_${id}`
  if (cache.current[cacheKey]) {
    setLoading(false)
    return setProducts(cache.current[cacheKey])
  } else {
    try {
      const { data } = await axios.get(url, { signal: controller.signal })
      if (data) {
        setLoading(false)
        setHasMore(data.length >= 25)
        setProducts(scrolling ? [...items, ...data] : data)
        cache.current[cacheKey] = scrolling ? [...items, ...data] : data
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log(e)
      } else {
        setError(true)
        toast.error(e.message)
        setLoading(false)
      }
    }
  }
}
```

Each new call cancels the request before it. Axios rejects a cancelled request with an error that `axios.isCancel` recognizes, so the catch block only logs it and does not show an error to the user.

A new controller is needed for each call. An aborted controller stays aborted. If you reuse it, every later request is cancelled at once.

![image](https://cdn.hashnode.com/res/hashnode/image/upload/v1655291347326/rDpwetZhe.png?auto=compress,format&format=webp)

This helps in two ways. The backend gets fewer requests that nobody needs, and the products view only shows data for the latest click.

The same approach works for a search box, where only the last query matters.

## References

- [Axios cancellation](https://axios-http.com/docs/cancellation)
