# spec.md: GitHub LOC Analyzer (Accurate Count Edition)

## 1. プロジェクト概要
ユーザーのGitHubリポジトリを解析し、実質的なコード行数（LOC: Lines of Code）を厳密にカウント・可視化するWebアプリケーション。
APIによるバイト数推計ではなく、バックエンドのコンテナ内で各リポジトリを動的にクローンし、`cloc` コマンドを用いて「空行・コメントを除外した純粋なコード行数」を算出する。

## 2. システムアーキテクチャ (Hybrid Cloud Architecture)
エンタープライズ水準のセキュリティとスケーラビリティを担保するため、認証と重いバックエンド処理を分離したアーキテクチャを採用する。

* **Frontend:** Next.js (App Router)
* **Authentication:** NextAuth.js (Auth.js) - GitHub Provider OAuth 2.0
* **Backend:** Next.js API Routes (Route Handlers) + Google Cloud Run (コンテナとしてNext.jsを丸ごとデプロイ)
* **Core Tooling:** `git`, `cloc` (コンテナ内にインストール)

## 3. 処理フロー (Data Flow)

### 3.1. 認証と認可 (Auth Flow)
1. ユーザーがフロントエンド（Next.js）で「Login with GitHub」ボタンをクリック。
2. NextAuth.jsを通じてGitHub OAuth認証を実行し、ユーザーの**アクセストークン**を取得。
3. 取得したアクセストークンはセッション内に保存され、Next.jsのAPI Routes（バックエンド）からサーバーサイドで直接読み取って利用する。

### 3.2. バックエンド解析ロジック (Backend Processing)
Cloud Run上のAPIエンドポイントは以下の処理を行う。

1.  **リポジトリ一覧取得:** 受け取ったアクセストークンを使用し、GitHub API (`/user/repos`) からユーザーのリポジトリ一覧を取得。
2.  **クローン＆解析ループ:** 各リポジトリに対して以下の処理を実行。
    * `git clone --depth 1 <repository_url> temp_dir` を実行（履歴を省き最速でクローン）。
    * `cloc temp_dir --json` を実行し、言語別の厳密な行数データを取得。
    * 解析完了後、一時ディレクトリ (`temp_dir`) を即座に削除（ストレージ逼迫防止）。
3.  **データ集計:** 全リポジトリの解析結果をマージし、JSONとしてフロントエンドへ返却。

### 3.3. UXとパフォーマンスの最適化 (Performance & UX)
* **APIレート制限への対応:** GitHub APIのアクセス制限（Rate Limit）に達した場合、その状態を適切にキャッチし、ユーザーに対してエラーメッセージおよびリセット時刻をわかりやすく画面へ提示する。
* **ローディングステートの管理:** 解析処理は現在エンドポイントで一括同期処理を行っているため、フロントエンド側では独自の `LoadingView` を表示して待機状態を明示する。
* **デモモード (Demo Mode):** GitHub認証なし、または実際の解析を待たずにUIや結果画面を体験可能な「デモモード」を備えており、モックデータ (`DEMO_DATA`) を用いて瞬時にResult Viewを表示する。
* **タイムアウト対策:** Cloud Runのコンテナタイムアウト設定をデフォルトから拡張（例：15分）しておく。

## 4. UI 仕様 (Frontend Requirements)
* **Login View:** 洗練された「Login with GitHub」ボタン、および認証なしで体験できる「デモモードを試す」ボタン。
* **Input View:** （ログイン後またはデモモード時）解析対象のGitHubユーザー名を入力するフォーム。
* **Processing View (`LoadingView`):** 解析中のスピナー表示（「リポジトリを解析中...」などのメッセージ）。
* **Dashboard View (`ResultView`):**
    * 総LOC数、リポジトリ数などのサマリ（ハイライト表示）
    * 言語別の行数割合や詳細（チャートコンポーネントによる可視化）
    * リポジトリ別の行数リスト（降順ソート）

## 5. バックエンド環境構築要件 (Dockerfile Requirements)
Cloud Runへデプロイするための `Dockerfile` には、ベースイメージ（Node.js または Python）に加え、OSレベルのパッケージとして以下を必ずインストールすること。
* `git`
* `cloc`

## 6. 必要な環境変数 (Environment Variables)
**Next.js App (.env.local / Cloud Run Secret Manager):**
* `NEXTAUTH_URL` (アプリケーションのベースURL、例: http://localhost:3000)
* `NEXTAUTH_SECRET` (NextAuthのセッション暗号化用ランダム文字列)
* `GITHUB_ID` (GitHub OAuth Appの Client ID)
* `GITHUB_SECRET` (GitHub OAuth Appの Client Secret)

---