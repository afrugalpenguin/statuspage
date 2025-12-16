# Embedding Guide

Embed your status page anywhere as a widget.

---

## Basic Embed

Add to any HTML page:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

That's it. The widget handles everything else.

---

## Full Page Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script src="https://your-status-page.com/widget.iife.js"></script>
  <status-widget></status-widget>
</body>
</html>
```

---

## Freshdesk Portal

1. Go to **Admin > Portals > Customize**
2. Click **Edit theme** > **Pages**
3. Add to any page template:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

---

## Zendesk Help Center

1. Go to **Guide Admin > Customize design**
2. Click **Edit code**
3. Add to `footer.hbs` or a custom page:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

---

## WordPress

Add to any page or post using a Custom HTML block:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

Or add to your theme's `footer.php`:

```php
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

---

## React/Vue/Angular

The widget works in any framework:

```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://your-status-page.com/widget.iife.js';
  document.body.appendChild(script);
}, []);

return <status-widget></status-widget>;
```

---

## Styling

The widget uses Shadow DOM so it won't conflict with your site's styles and your site won't affect the widget.

To place it in a specific location, wrap it:

```html
<div style="max-width: 800px; margin: 0 auto;">
  <status-widget></status-widget>
</div>
```

---

## Multiple Widgets

You can embed multiple widgets on the same page - they share the same script:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>

<h2>Production Status</h2>
<status-widget></status-widget>
```

Note: All widgets show the same configuration. For different configs, deploy separate instances.
