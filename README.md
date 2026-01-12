# wc-router

Web Components専用の宣言的ルーティングライブラリ

## 特徴

- HTMLの階層構造でルーティングを定義
- ネストされたレイアウトのサポート
- `lazy` 属性による遅延ロード
- URLパラメータの自動バインディング

## 基本的な使い方

### ルート定義

`<wc-routes>` 内に `<wc-route>` をネストしてルーティングを定義します。
子ルートのパスは親パスを自動継承します（相対パス方式）。

```html
<wc-routes>
  <template>
    <wc-route path="/">
      <wc-layout layout="main-layout">
        <wc-header slot="header"></wc-header>
        <wc-sidebar slot="sidebar"></wc-sidebar>

        <wc-route path="">
          <wc-main></wc-main>
        </wc-route>

        <wc-route path="dashboard">
          <dashboard-main></dashboard-main>
        </wc-route>
      </wc-layout>
    </wc-route>

    <wc-route path="/admin">
      <wc-layout src="admin-layout.html">
        <admin-header slot="header"></admin-header>
        <admin-sidebar slot="sidebar"></admin-sidebar>

        <wc-route path="">
          <admin-main></admin-main>
        </wc-route>

        <wc-route path="users">
          <admin-users></admin-users>
        </wc-route>

        <wc-route path="users/:id">
          <admin-user data-bind="props"></admin-user>
        </wc-route>
      </wc-layout>
    </wc-route>
  </template>
</wc-routes>

<template id="main-layout">
  <section>
    <slot name="sidebar"></slot>
    <section>
      <slot name="header"></slot>
      <slot></slot>
    <section>
  </section>
</template>
```

```html:admin-latout.html
<h1>admin page</h1>
<section>
  <slot name="sidebar"></slot>
  <section>
    <h1>admin page</h1>
    <slot name="header"></slot>
    <slot></slot>
  <section>
</section>
```

### 属性

#### `<wc-route>`

| 属性 | 説明 |
|------|------|
| `path` | URLパス。親のパスを自動継承。`:param` でパラメータを定義、''で上位のパスを継承 |

#### `<wc-layout>`

| 属性 | 説明 |
|------|------|
| `layout` | HTML内のtemplateタグのID |
| `src` | 外部テンプレートHTMLのURL |
| `enable-shadow-root` | ShadowDOM有効 |
| `disable-shadow-root` | ShadowDOM無効 |

#### `data-bind`

URLパラメータをコンポーネントに渡す方法を指定します。

| 値 | 動作 | 例（`/users/:id` で `id=123` の場合） |
|----|------|--------------------------------------|
| `"props"` | `props` プロパティにオブジェクトとして設定 | `element.props = { id: "123" }` |
| `""` (空文字) | 要素のプロパティに直接設定 | `element.id = "123"` |

複数パラメータ（例: `/users/:userId/posts/:postId`）の場合も、全パラメータがオブジェクトとして渡されます。

```html
<!-- element.props = { userId: "1", postId: "42" } -->
<user-post data-bind="props"></user-post>
```

### レイアウト定義

レイアウトコンポーネントのテンプレートは `<slot>` を使用してコンテンツを配置します。

```html
<template id="main-layout">
  <section><slot name="header"></slot></section>
  <section><slot name="sidebar"></slot></section>
  <section><slot></slot></section>
</template>
```

## URL構造の例

上記の設定で生成されるルート:

| URL | 表示コンポーネント |
|-----|-------------------|
| `/` | `<wc-layout>` + `<wc-main>` |
| `/dashboard` | `<wc-layout>` + `<dashboard-main>` |
| `/admin` | `<admin-layout>` + `<admin-main>` |
| `/admin/users` | `<admin-layout>` + `<admin-users>` |
| `/admin/users/123` | `<admin-layout>` + `<admin-user>` (props.id = "123") |
