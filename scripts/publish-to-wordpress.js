const fs = require('fs');
const path = require('path');

/**
 * WordPress REST APIを使用して記事を投稿するスクリプト
 */

// 環境変数から設定を取得
const WORDPRESS_URL = process.env.WORDPRESS_URL; // 例: https://yourblog.com
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

if (!WORDPRESS_URL || !WORDPRESS_USERNAME || !WORDPRESS_APP_PASSWORD) {
  console.error('エラー: 必要な環境変数が設定されていません');
  console.error('WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORDを設定してください');
  process.exit(1);
}

// 投稿する記事のパスを取得
const postFile = process.argv[2];
if (!postFile) {
  console.error('使い方: node publish-to-wordpress.js <記事ファイルのパス>');
  process.exit(1);
}

// 記事ファイルを読み込み
const postPath = path.resolve(postFile);
if (!fs.existsSync(postPath)) {
  console.error(`エラー: ファイルが見つかりません: ${postPath}`);
  process.exit(1);
}

const content = fs.readFileSync(postPath, 'utf-8');

// フロントマター（YAML）を解析
const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const match = content.match(frontmatterRegex);

if (!match) {
  console.error('エラー: フロントマターが見つかりません');
  process.exit(1);
}

const frontmatter = match[1];
const body = match[2];

// フロントマターからメタデータを抽出
const metadata = {};
frontmatter.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split(':');
  if (key && valueParts.length > 0) {
    metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
  }
});

const { title, date, status = 'draft', categories, tags } = metadata;

if (!title) {
  console.error('エラー: タイトルが指定されていません');
  process.exit(1);
}

// WordPress REST APIに投稿
async function publishToWordPress() {
  try {
    const auth = Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_APP_PASSWORD}`).toString('base64');

    const postData = {
      title: title,
      content: body,
      status: status,
      date: date || new Date().toISOString(),
    };

    // カテゴリーとタグがあれば追加
    if (categories) {
      // カテゴリーIDの取得が必要な場合は別途実装
      console.log('カテゴリー:', categories);
    }
    if (tags) {
      // タグの処理
      console.log('タグ:', tags);
    }

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPressへの投稿に失敗しました: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✓ 投稿成功！');
    console.log(`タイトル: ${result.title.rendered}`);
    console.log(`ステータス: ${result.status}`);
    console.log(`URL: ${result.link}`);
    console.log(`投稿ID: ${result.id}`);

    // 投稿済みフラグファイルを作成（同じ記事を二重投稿しないため）
    const publishedFlagPath = postPath + '.published';
    fs.writeFileSync(publishedFlagPath, JSON.stringify({
      postId: result.id,
      publishedAt: new Date().toISOString(),
      url: result.link
    }, null, 2));
    console.log(`✓ 投稿済みフラグを作成: ${publishedFlagPath}`);

  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

publishToWordPress();
