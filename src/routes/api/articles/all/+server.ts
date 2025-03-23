import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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
