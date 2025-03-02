import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as cheerio from 'cheerio';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const user_id = url.searchParams.get('user_id');

	if (!user_id) {
		return json({ error: 'ユーザーIDが必要です。' }, { status: 400 });
	}
	const { data, error } = await supabase
		.from('articles')
		.select('*')
		.eq('user_id', user_id)
		.order('created_at', { ascending: false });

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json(data);
};

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { url } = await request.json();

	const res = await fetch(url);
	const html = await res.text();
	const $ = cheerio.load(html);

	const title =
		$('meta[property="og:title"]').attr('content') || // 1. OGPタイトル
		$('meta[name="twitter:title"]').attr('content') || // 2. Twitterカードタイトル
		$('meta[name="title"]').attr('content') || // 3. metaタイトル
		$('title').text() || // 4. titleタグ
		url; // 5. フォールバック：URL

	const thumbnail =
		$('meta[property="og:image"]').attr('content') || // 1. OGP画像
		$('meta[name="twitter:image"]').attr('content') || // 2. Twitter Card画像
		$('meta[name="thumbnail"]').attr('content') || // 3. サムネイルメタタグ
		$('link[rel="image_src"]').attr('href') || // 4. image_srcリンク
		$('img').first().attr('src') || // 5. 最初の画像タグ
		'';

	if (!title || !url) {
		return json({ error: '保存に失敗しました。' }, { status: 400 });
	}

	const { data, error } = await supabase
		.from('articles')
		.insert([{ url, title, thumbnail }])
		.select()
		.single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ data, message: '記事を保存しました！' });
};

export const PATCH: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { articleID, isRead }: { articleID: string; isRead: boolean } = await request.json();

	const read_at = isRead ? new Date().toISOString() : null;
	const { error } = await supabase.from('articles').update({ read_at }).eq('id', articleID);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ data: { read_at }, message: '記事を更新しました！' });
};

export const DELETE: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { articleID }: { articleID: string } = await request.json();

	const { error } = await supabase.from('articles').delete().eq('id', articleID);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ message: '記事を削除しました！' });
};
