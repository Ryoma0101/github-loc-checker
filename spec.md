# spec.md: GitHub LOC Analyzer (Accurate Count Edition)

## 1. プロジェクト概要
ユーザーのGitHubリポジトリを解析し、実質的なコード行数（LOC: Lines of Code）を厳密にカウント・可視化するWebアプリケーション。
APIによるバイト数推計ではなく、バックエンドのコンテナ内で各リポジトリを動的にクローンし、`cloc` コマンドを用いて「空行・コメントを除外した純粋なコード行数」を算出する。

## 2. システムアーキテクチャ (Hybrid Cloud Architecture)
エンタープライズ水準のセキュリティとスケーラビリティを担保するため、認証と重いバックエンド処理を分離したアーキテクチャを採用する。

* **Frontend:** Next.js (App Router)
* **Authentication:** Firebase Authentication (GitHub Provider OAuth 2.0)
* **Backend:** Google Cloud Run (コンテナベースのAPIサーバー)
* **Core Tooling:** `git`, `cloc` (バックエンドコンテナ内にインストール)

## 3. 処理フロー (Data Flow)

### 3.1. 認証と認可 (Auth Flow)
1. ユーザーがフロントエンド（Next.js）で「Login with GitHub」ボタンをクリック。
2. Firebase Authを通じてGitHub OAuth認証を実行し、ユーザーの**アクセストークン**を取得。
3. フロントエンドは、取得したアクセストークンをAuthorizationヘッダ（Bearer token）に付与し、Cloud RunのバックエンドAPIへリクエストを送信する。

### 3.2. バックエンド解析ロジック (Backend Processing)
Cloud Run上のAPIエンドポイントは以下の処理を行う。

1.  **リポジトリ一覧取得:** 受け取ったアクセストークンを使用し、GitHub API (`/user/repos`) からユーザーのリポジトリ一覧を取得。
2.  **クローン＆解析ループ:** 各リポジトリに対して以下の処理を実行。
    * `git clone --depth 1 <repository_url> temp_dir` を実行（履歴を省き最速でクローン）。
    * `cloc temp_dir --json` を実行し、言語別の厳密な行数データを取得。
    * 解析完了後、一時ディレクトリ (`temp_dir`) を即座に削除（ストレージ逼迫防止）。
3.  **データ集計:** 全リポジトリの解析結果をマージし、JSONとしてフロントエンドへ返却。

### 3.3. UXとパフォーマンスの最適化 (Performance & UX)
* **非同期ストリーミング (SSE):** リポジトリ数が多い場合、全体の完了を待つとHTTPタイムアウト（通常30秒〜1分）の危険がある。そのため、バックエンドは Server-Sent Events (SSE) または段階的なレスポンスを採用し、「現在 3/30 リポジトリを解析中...」という進捗をフロントエンドへリアルタイムにストリーミングする。
* **タイムアウト対策:** Cloud Runのコンテナタイムアウト設定をデフォルトから拡張（例：15分）しておく。

## 4. UI 仕様 (Frontend Requirements)
* **Login View:** 洗練された「Login with GitHub」ボタン。
* **Processing View:** 解析中のプログレスバーまたはスピナー（SSEによる進捗率表示）。
* **Dashboard View:** * 総LOC数（ハイライト表示）
    * 言語別の行数割合（ドーナツチャート）
    * リポジトリ別の行数リスト（降順ソート可能）

## 5. バックエンド環境構築要件 (Dockerfile Requirements)
Cloud Runへデプロイするための `Dockerfile` には、ベースイメージ（Node.js または Python）に加え、OSレベルのパッケージとして以下を必ずインストールすること。
* `git`
* `cloc`

## 6. 必要な環境変数 (Environment Variables)
**Frontend (.env.local / Vercel):**
* `NEXT_PUBLIC_FIREBASE_API_KEY` 等のFirebase設定一式
* `NEXT_PUBLIC_BACKEND_API_URL` (Cloud RunのエンドポイントURL)

**Firebase Console:**
* GitHub OAuth Appの `Client ID` および `Client Secret`

---